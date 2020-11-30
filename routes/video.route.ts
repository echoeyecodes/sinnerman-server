import express, { Request, Response } from "express";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import axios from "axios";
import {
  validateVideoFields,
  validateVideoRequest,
} from "../middlewares/video.middleware";
import generalRequestMiddleware from "../utils/generalRequestValidator";
import formidable, { Fields, Files } from "formidable";
import cloudinary_config from "../config/cloudinary.config";
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from "cloudinary";
import moment from "moment";
import { uploadNotificationPublisher } from "../pubsubs/publishers";
import VideoController, { FormattedVideoParams, NestedVideoQueryParams, VideoDetails, VideoParams } from "../controllers/video.controller";
import ViewController from "../controllers/view.controller";
import UserController, { UserParams } from "../controllers/user.controller";
import LikeController from "../controllers/like.controller";
import UserActivityController from "../controllers/user_activity.controller";
import VideoTagController from "../controllers/video_tag.controller";
import TagController, { TagParams } from "../controllers/tag.controller";
import { Op } from "sequelize";
import Pool_singleton from "../utils/pool.singleton";
import { QueryTypes } from "sequelize";
import Video from "../models/Video";
import { fetchUserFromVideo } from "./user.route";

const like_controller = new LikeController();
const tag_controller = new TagController();
const video_tag_controller = new VideoTagController();
const video_controller = new VideoController();
const user_activity_controller = new UserActivityController();
const user_controller = new UserController();
const view_controller = new ViewController();

const router = express.Router();
cloudinary.config(cloudinary_config);

type query_params = {
  last_video_timestamp: number;
  last_explore_timestamp: number;
};

type cache_params = {
  id: string;
  data: query_params;
}[];

const cache: cache_params = [];

type ServiceResponse = {
  status: number;
  data: object | null;
};

router.post(
  "/",
  validateVideoRequest("add"),
  generalRequestMiddleware,
  async (req: RequestInterface, res: Response) => {}
);

async function uploadVideo(
  path: string
): Promise<UploadApiResponse | UploadApiErrorResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_large(
      path,
      {
        folder: "videos",
        resource_type: "video",
        eager: [{ streaming_profile: "4k", format: "m3u8" }],
        eager_async: true,
        image_metadata: true,
      },
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    );
  });
}

async function uploadImage(
  path: string
): Promise<UploadApiResponse | UploadApiErrorResponse> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      path,
      {
        folder: "images",
        transformation: [
          {
            width: 600,
          },
        ],
      },
      (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(result);
      }
    );
  });
}

function generateThumbnail(path: string) {
  const params = "b_auto,c_pad,h_720,w_1280";
  const base_url = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/`;

  const suffix = path.split(base_url).pop();
  const image = `${base_url}${params}/${suffix}`;

  return image;
}

async function getVideoViews(video_id: string) {
  return await view_controller.getCount({
    where: { video_id },
  });
}

async function getVideoUser(user_id: string) {
  return await user_controller.findOne({
    where: {
      id: user_id,
    },
  });
}

async function getVideoLikes(video_id: string) {
  return await like_controller.getCount({
    where: { video_id  },
  });
}

async function hasUserLiked(user_id: string, video_id: string) {
  return await like_controller.findOne({
    where: { user_id: user_id, video_id },
  });
}

async function fetchVideoData(id: string, video: VideoParams) {
      const user = await getVideoUser(video.user_id)

      const newVideo = video

      const likes = await getVideoLikes(video.id);
      const views = await getVideoViews(video.id);
      const has_liked = await hasUserLiked(id, video.id);

      const video_payload = Object.assign({}, newVideo, {
        likes,
        views,
        has_liked: has_liked != null,
      });

      const payload = {
        video: video_payload,
        user,
      };

      return payload;
}

// router.post(
//   "/upload",
//   validateVideoFields,
//   async (req: RequestInterface, res: Response) => {
//     const form = new formidable.IncomingForm();
//     const user_id = req.id!;

//     form.parse(req, async (err, fields: Fields, files: Files) => {
//       const transaction = await Pool_singleton.getInstance().transaction();
//       try {
//         console.log({ fields });
//         if (err) {
//           console.log({ err });
//           return res.status(500).send("Could not load video. Please try again");
//         }
//         const payload = await uploadVideo(files.video.path);

//         const original_url = payload.secure_url;
//         const video_url = payload.eager[0].secure_url;
//         const { title, description, tags = "" }: VideoParams = <VideoParams>(
//           (<unknown>fields)
//         );
//         const parsed_tags = JSON.parse(tags);
//         console.log({ video_url });

//         const thumbnail = original_url
//           .split(/\.(?=[^\.]+$)/)
//           .shift()
//           ?.concat(".webp");

//         const image = generateThumbnail(thumbnail);

//         const video = await video_controller.create(
//           {
//             title,
//             description,
//             video_url,
//             user_id,
//             thumbnail: image,
//             original_url,
//             duration: payload.duration,
//           },
//           { transaction }
//         );

//         const tag_ids: string[] = await Promise.all(
//           parsed_tags.map(
//             async (tag: string): Promise<string> => {
//               const [{ id }] = await tag_controller.findOrCreate({
//                 where: { name: tag },
//                 defaults: { name: tag },
//                 transaction,
//               });
//               return id;
//             }
//           )
//         );

//         if (tag_ids.length > 0) {
//           await Promise.all(
//             tag_ids.map(
//               async (tag) =>
//                 await video_tag_controller.findOrCreate({
//                   where: {
//                     [Op.and]: [{ video_id: video.id }, { tag_id: tag }],
//                   },
//                   defaults: { video_id: video.id, tag_id: tag },
//                   transaction,
//                 })
//             )
//           );
//         }

//         //Only send notification when transactions are successful
//         transaction.afterCommit(async () => {
//           await uploadNotificationPublisher(video.id, image, req.id!);
//         });

//         await transaction.commit();
//         res.status(200).json(video);
//       } catch (error) {
//         console.log({ error });
//         await transaction.rollback();
//         return res.status(500).send("An error occured during upload");
//       }
//     });
//   }
// );

router.get(
  "/:id",
  validateVideoRequest("one"),
  generalRequestMiddleware,
  async (req: RequestInterface, res: Response) => {
    const { id } = req.params;
    const payload = {};

    try {
      const video = await video_controller.findOne({ where: { id } });
      if (video == null) {
        res.status(404).send("Video not found");
        return;
      }
      const user_id = video.user_id;

      await view_controller.findOrCreate({
        where: { [Op.and]: [{ user_id: req.id! }, { video_id: video.id }] },
        defaults: { video_id: video.id, user_id: req.id! },
      });

      const user = await user_controller.findOne({ where: { id: user_id } });
      const likes = await getVideoLikes(id)
      const views = await getVideoViews(id)
      const has_liked = await hasUserLiked(req.id!, id)

      const video_payload = Object.assign({}, video, {
        likes: likes,
        views: views,
        has_liked: has_liked != null,
      });

      Object.assign(payload, {
        user,
        video: video_payload,
      });
      res.status(200).send(payload);
    } catch (error) {
      res.status(500).send("Could not get video. Please try again");
      throw error;
    }
  }
);


router.get(
  "/activity/:context",
  async (req: RequestInterface, res: Response) => {
    type Params = {
      limit: string;
      offset: string;
    };

    const { limit = "20", offset = "0" } = <Params>req.query;

    try {
      switch (req.params.context) {
        case "likes":
          const all_liked_videos = await fetchUserVideoActivity(req.id!, "likes", parseInt(limit), parseInt(offset))
          return res.status(200).json(all_liked_videos);

        case "history":
          const all_video_history = await fetchUserVideoActivity(req.id!, "views", parseInt(limit), parseInt(offset));
          return res.status(200).json(all_video_history);

        default:
          return res.json([]);
      }
    } catch (error) {
      // res.status(500).send(error);
      res.status(500).send("Could not fetch videos. Please try");
      throw error;
    }
  }
);

router.get("/explore/tags", async (req: RequestInterface, res: Response) => {
  type Params = {
    limit: string;
    offset: string;
  };

  const { limit = "5", offset = "0" } = <Params>req.query;

  try {
    const all_tags = await tag_controller.findAll({
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
    });

    const data = await Promise.all(all_tags.reverse().map( async (item) =>{
      const videos = await fetchVideosByTag(req.id!, item.id, (req.version) ? 10 : 4, 0)
      return {
        id: item.id,
        name: item.name,
        videos
      }
    }))

    res.status(200).json(data);
  } catch (error) {
    res.status(500).send("Could not fetch videos. Please try");
    throw error;
  }
});

router.get(
  "/explore/tags/:id",
  validateVideoRequest("one"),
  generalRequestMiddleware,
  async (req: RequestInterface, res: Response) => {
    type Params = {
      limit: string;
      offset: string;
    };

    const { id } = req.params;

    const { limit = "5", offset = "0" } = <Params>req.query;

    try {
      const data = await fetchVideosByTag(req.id!, id, parseInt(limit), parseInt(offset))
      return res.status(200).json(data)
    } catch (error) {
      res.status(500).send("Could not fetch videos. Please try");
      throw error;
    }
  }
);


function getVideoDetails(payload: NestedVideoQueryParams[]){
    return payload.map((item) =>{
      const user: UserParams = {
        fullname: item.fullname,
        profile_url: item.profile_url,
        username: item.username,
        id: item.author_id,
        email: item.email,
        is_verified: item.is_verified,
        password: "",
        updatedAt: item.createdAt,
        createdAt: item.createdAt
      }

      const video : VideoDetails ={
        id: item.id,
        description: item.description,
        duration: item.duration,
        likes: item.likes,
        views: item.views,
        createdAt: item.createdAt,
        updatedAt: item.createdAt,
        has_liked: (item.has_liked > 0),
        original_url: item.original_url,
        title: item.title,
        thumbnail: item.thumbnail,
        user_id: item.user_id,
        video_url: item.video_url,
        tags: "",
      }

      return {user, video}
    })
}
router.get("/", async (req: RequestInterface, res: Response) => {
  type Params = {
    limit: string;
    offset: string;
  };

  const { limit = "20", offset = "0" } = <Params>req.query;
  let now = moment().unix();

  const user = await user_activity_controller.findOrCreate({
    where: {
      user_id: req.id,
    },
    defaults: {
      user_id: req.id,
    },
  });

  if (offset == "0") {
    await user_activity_controller.updateOne(
      {
        last_video_timestamp: now,
      },
      {
        where: {
          user_id: req.id,
        },
      }
    );
  } else {
    now = user[0].last_video_timestamp;
  }

  const order = `(CAST(extract(epoch from videos."createdAt") as integer) - ${now}) % 181`;

  let query;
  if (req.version) {
    query = `SELECT videos.*, users.id AS author_id, fullname, username, profile_url,email,is_verified, (SELECT COUNT(views.*) AS views FROM views WHERE videos.id=views.video_id), (SELECT COUNT(likes.*) AS likes FROM likes WHERE likes.video_id=videos.id), (SELECT COUNT(*) AS has_liked FROM likes WHERE video_id=videos.id AND user_id ='${req.id}') FROM videos INNER JOIN users ON videos.user_id=users.id ORDER BY ${order} OFFSET ${offset} LIMIT ${limit};`;
  } else {
    query = `SELECT videos.*, users.id AS author_id, fullname, username, profile_url,email,is_verified, (SELECT COUNT(views.*) AS views FROM views WHERE videos.id=views.video_id), (SELECT COUNT(likes.*) AS likes FROM likes WHERE likes.video_id=videos.id), (SELECT COUNT(*) AS has_liked FROM likes WHERE video_id=videos.id AND user_id ='${req.id}') FROM videos INNER JOIN users ON videos.user_id=users.id WHERE duration <> 'ad' ORDER BY ${order} OFFSET ${offset} LIMIT ${limit};`;
  }

  try {
    const all_videos = <NestedVideoQueryParams[]> (<unknown> await Pool_singleton.getInstance().query(query, {
        type: QueryTypes.SELECT,
        raw: true,
      }))

    // const data = await Promise.all(all_videos.map(async(item) => {
    //   const user = await user_controller.findOne({where:{id: item.user_id}})
    //   return {
    //     video: item,
    //     user
    //   }
    // }))

    const data : FormattedVideoParams[] = getVideoDetails(all_videos)

    res.status(200).json(data);
  } catch (error) {
    // res.status(500).send(error);
    res.status(500).send("Could not fetch videos. Please try");
    throw error;
  }
});

async function createTags() {
  const tags = [
    "NEWLY UPLOADED",
    "MOST VIEWED",
    "TOP LIKED",
    "GAMES",
    "MOVIES",
    "TV",
  ];

  tags.forEach(async (tag) => {
    await tag_controller.findOrCreate({
      where: { name: tag },
      defaults: { name: tag },
    });
  });
}

async function fetchVideosByDate(
  id: string,
  limit: number,
  offset: number
) {

  const query = `SELECT videos.*, users.id AS author_id, fullname, username, profile_url,email,is_verified, (SELECT COUNT(views.*) AS views FROM views WHERE videos.id=views.video_id), (SELECT COUNT(likes.*) AS likes FROM likes WHERE likes.video_id=videos.id), (SELECT COUNT(*) AS has_liked FROM likes WHERE video_id=videos.id AND user_id ='${id}') FROM videos INNER JOIN users ON videos.user_id=users.id WHERE duration <> 'ad' GROUP BY videos.id,users.id ORDER BY "createdAt" DESC OFFSET ${offset} LIMIT ${limit};`

  const all_videos = <NestedVideoQueryParams[]>(
    (<unknown>await Pool_singleton.getInstance().query(query, {
      type: QueryTypes.SELECT,
      raw: true,
    })))

  const data = getVideoDetails(all_videos)
  // return videos.flat()

  return data
}

async function fetchVideosByLikes(
  id: string,
  limit: number,
  offset: number
) {

  const query = `SELECT COUNT(video_id) AS realcount, videos.*, users.id AS author_id, fullname, username, profile_url,email,is_verified, (SELECT COUNT(views.*) AS views FROM views WHERE videos.id=views.video_id), (SELECT COUNT(likes.*) AS likes FROM likes WHERE likes.video_id=videos.id), (SELECT COUNT(*) AS has_liked FROM likes WHERE video_id=videos.id AND user_id ='${id}') FROM videos INNER JOIN users ON videos.user_id=users.id LEFT JOIN likes ON videos.id=video_id GROUP BY videos.id,video_id,users.id ORDER BY realcount DESC OFFSET ${offset} LIMIT ${limit};`

    const all_videos = <NestedVideoQueryParams[]>(
      (<unknown>await Pool_singleton.getInstance().query(query, {
        type: QueryTypes.SELECT,
        raw: true,
      })))

    const data = getVideoDetails(all_videos)
  // return videos.flat()

  return data
}


async function fetchUserVideoActivity(
  id: string,
  activity:string,
  limit: number,
  offset: number
) {

  const query = `SELECT COUNT(video_id) AS realcount, videos.*, users.id AS author_id, fullname, username, profile_url,email,is_verified, (SELECT COUNT(views.*) AS views FROM views WHERE videos.id=views.video_id), (SELECT COUNT(likes.*) AS likes FROM likes WHERE likes.video_id=videos.id), (SELECT COUNT(*) AS has_liked FROM likes WHERE video_id=videos.id AND user_id ='${id}') FROM videos INNER JOIN users ON videos.user_id=users.id INNER JOIN ${activity} ON ${activity}.video_id=videos.id AND ${activity}.user_id='${id}' GROUP BY videos.title, videos.id, users.id ORDER BY "createdAt" DESC OFFSET ${offset} LIMIT ${limit};`

    const all_videos = <NestedVideoQueryParams[]>(
      (<unknown>await Pool_singleton.getInstance().query(query, {
        type: QueryTypes.SELECT,
        model: Video,
        raw: true,
      })))

  const data = getVideoDetails(all_videos)
  // return videos.flat()

  return data
}


async function fetchVideosByViews(
  id: string,
  limit: number,
  offset: number
) {

  const query = `SELECT COUNT(video_id) AS realcount, videos.*, users.id AS author_id, fullname, username, profile_url,email,is_verified, (SELECT COUNT(views.*) AS views FROM views WHERE videos.id=views.video_id), (SELECT COUNT(likes.*) AS likes FROM likes WHERE likes.video_id=videos.id), (SELECT COUNT(*) AS has_liked FROM likes WHERE video_id=videos.id AND user_id ='${id}') FROM videos INNER JOIN users ON videos.user_id=users.id LEFT JOIN views ON videos.id=video_id GROUP BY videos.id,video_id, users.id ORDER BY realcount DESC OFFSET ${offset} LIMIT ${limit};`

    const all_videos = <NestedVideoQueryParams[]>(
      (<unknown>await Pool_singleton.getInstance().query(query, {
        type: QueryTypes.SELECT,
        raw: true,
      })))

  const data = getVideoDetails(all_videos)

  return data
}


async function fetchVideosByCategory(
  id: string,
  tag_id:string,
  limit: number,
  offset: number
) {

  const query = `SELECT COUNT(video_id) AS realcount, videos.*, users.id AS author_id, fullname, username, profile_url,email,is_verified, (SELECT COUNT(views.*) AS views FROM views WHERE videos.id=views.video_id), (SELECT COUNT(likes.*) AS likes FROM likes WHERE likes.video_id=videos.id), (SELECT COUNT(*) AS has_liked FROM likes WHERE videos.id=video_id AND user_id ='${id}') FROM videos INNER JOIN users ON videos.user_id=users.id INNER JOIN video_tags ON videos.id=video_id WHERE videos.id=video_id AND tag_id='${tag_id}' GROUP BY videos.title, videos.id, users.id ORDER BY "createdAt" DESC OFFSET ${offset} LIMIT ${limit};`

  const all_videos = <NestedVideoQueryParams[]>(
    (<unknown>await Pool_singleton.getInstance().query(query, {
      type: QueryTypes.SELECT,
      model: Video,
      raw: true,
    })))

  const data = getVideoDetails(all_videos)
  // return videos.flat()

  return data
}

async function fetchVideosByTag(user_id:string, tag_id:string, limit:number, offset:number) {

  const tag = await tag_controller.findOne({
    where: { id: tag_id },
  });

  switch(tag?.name){
    case "NEWLY UPLOADED":
      const dataByDate = await fetchVideosByDate(user_id, limit, offset)
      return dataByDate
    
    case "MOST VIEWED":
    const dataByViews = await fetchVideosByViews(user_id,limit, offset)
    return dataByViews

    case "TOP LIKED":
    const dataByLikes = await fetchVideosByLikes(user_id,limit, offset)
    return dataByLikes

    case "GAMES":
    case "MOVIES":
    case "TV":
    const dataByCategory = await fetchVideosByCategory(user_id,tag.id,limit, offset)
    return dataByCategory

    default:
      return []
  }
}
router.post(
  "/upload",
  validateVideoFields,
  async (req: RequestInterface, res: Response) => {
    const {
      title,
      description,
      video_url,
      thumbnail,
      original_url,
      duration,
    } = req.body;

    try {
      const video = await video_controller.create({
        title,
        description,
        video_url,
        thumbnail,
        original_url,
        duration,
        user_id: req.id,
      });

      await uploadNotificationPublisher(video.id, thumbnail, req.id!);
      res.status(200).send("Uploaded");
    } catch (exception) {
      res.status(500).send(exception);
    }
  }
);

router.post(
  "/upload/ad",
  validateVideoFields,
  async (req: RequestInterface, res: Response) => {
    const { title, description, video_url, thumbnail, user_id } = req.body;

    try {
     await video_controller.create({
        title,
        description,
        video_url,
        thumbnail,
        original_url: "",
        duration: "ad",
        user_id,
      });
      res.status(200).send("Ad Uploaded");
    } catch (exception) {
      res.status(500).send("An error occured");
    }
  }
);


async function updateVideoTags(){
  const video1 = await video_controller.updateOne({
    category:"movies"
  }, {
    where:{
      id: "26e15e24-c507-44fb-944e-e3bd8b0401a0"
    }
  })

  const video2 = await video_controller.updateOne({
    category:"tvshow"
  }, {
    where:{
      id: "602131e4-5293-4b58-9756-6460e5ad6542"
    }
  })

  const video3 = await video_controller.updateOne({
    category:"movies"
  }, {
    where:{
      id: "cd63de52-587e-4339-b332-1773c96941b6"
    }
  })
}

export { uploadVideo, generateThumbnail, uploadImage };
export default router;
