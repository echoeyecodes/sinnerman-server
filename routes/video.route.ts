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
import { uploadNotificationPublisher } from "../pubsubs/publishers";
import VideoController, { VideoParams } from "../controllers/video.controller";
import ViewController from "../controllers/view.controller";
import UserController from "../controllers/user.controller";
import LikeController from "../controllers/like.controller";
import VideoTagController from "../controllers/video_tag.controller";
import TagController, { TagParams } from "../controllers/tag.controller";
import { Op } from "sequelize";
import Pool_singleton from "../utils/pool.singleton";

const like_controller = new LikeController();
const tag_controller = new TagController();
const video_tag_controller = new VideoTagController();
const video_controller = new VideoController();
const user_controller = new UserController();
const view_controller = new ViewController();

const router = express.Router();
cloudinary.config(cloudinary_config);

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

async function fetchVideosAndUsers(id: string, videos: VideoParams[]) {
  const data = await Promise.all(
    videos.map(async (video) => {
      const user = await user_controller.findOne({
        where: {
          id: video.user_id,
        },
      });

      const likes = await like_controller.findAll({
        where: {
          video_id: video.id,
        },
      });
      const views = await view_controller.findAll({
        where: {
          video_id: video.id,
        },
      });
      const has_liked = likes.find((item) => (item.user_id = id));

      const video_payload = Object.assign({}, video, {
        likes: likes.length,
        views: views.length,
        has_liked: has_liked != null || has_liked != undefined,
      });

      const payload = {
        video: video_payload,
        user,
      };

      return payload;
    })
  );
  return data;
}

async function fetchVideosFromTag(id: string, all_tags: TagParams[]) {
  const data = await Promise.all(
    all_tags.map(async (tag) => {
      const tags = await video_tag_controller.findAll({
        where: { tag_id: tag.id },
      });

      const videos = await Promise.all(
        tags.map(async (item) => {
          const videos = await video_controller.findAll({
            where: { id: item.video_id },
            offset: 0,
            limit: 5,
          });

          const related_videos = await fetchVideosAndUsers(id, videos);

          return related_videos;
        })
      );

      return { name: tag.name, id: tag.id, videos: videos.flat() };
      // return videos.flat()
    })
  );

  return data;
}

async function fetchVideosFromSingleTag(
  id: string,
  tag: TagParams,
  limit: number,
  offset: number
) {
  const tags = await video_tag_controller.findAll({
    where: { tag_id: tag.id },
    limit,
    offset,
  });
  const data = await Promise.all(
    tags.map(async (t) => {
      const videos = await video_controller.findAll({
        where: { id: t.video_id },
      });

      const related_videos = await fetchVideosAndUsers(id, videos);

      return related_videos;
    })
  );
  // return videos.flat()

  return data.flat();
}

router.post(
  "/upload",
  validateVideoFields,
  async (req: RequestInterface, res: Response) => {
    const form = new formidable.IncomingForm();
    const user_id = req.id!;

    form.parse(req, async (err, fields: Fields, files: Files) => {
      const transaction = await Pool_singleton.getInstance().transaction();
      try {
        console.log({ fields });
        if (err) {
          console.log({ err });
          return res.status(500).send("Could not load video. Please try again");
        }
        const payload = await uploadVideo(files.video.path);

        const original_url = payload.secure_url;
        const video_url = payload.eager[0].secure_url;
        const { title, description, tags = "" }: VideoParams = <VideoParams>(
          (<unknown>fields)
        );
        const parsed_tags = JSON.parse(tags);
        console.log({ video_url });

        const thumbnail = original_url
          .split(/\.(?=[^\.]+$)/)
          .shift()
          ?.concat(".webp");

        const image = generateThumbnail(thumbnail);

        const video = await video_controller.create(
          {
            title,
            description,
            video_url,
            user_id,
            thumbnail: image,
            original_url,
            duration: payload.duration,
          },
          { transaction }
        );

        const tag_ids: string[] = await Promise.all(
          parsed_tags.map(
            async (tag: string): Promise<string> => {
              const [{ id }] = await tag_controller.findOrCreate({
                where: { name: tag },
                defaults: { name: tag },
                transaction,
              });
              return id;
            }
          )
        );

        if (tag_ids.length > 0) {
          await Promise.all(
            tag_ids.map(
              async (tag) =>
                await video_tag_controller.findOrCreate({
                  where: {
                    [Op.and]: [{ video_id: video.id }, { tag_id: tag }],
                  },
                  defaults: { video_id: video.id, tag_id: tag },
                  transaction,
                })
            )
          );
        }

        //Only send notification when transactions are successful
        transaction.afterCommit(async () => {
          await uploadNotificationPublisher(video.id, image, req.id!);
        });

        await transaction.commit();
        res.status(200).json(video);
      } catch (error) {
        console.log({ error });
        await transaction.rollback();
        return res.status(500).send("An error occured during upload");
      }
    });
  }
);

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
      const likes = await like_controller.findAll({ where: { video_id: id } });
      const views = await view_controller.findAll({ where: { video_id: id } });
      const has_liked = likes.find((item) => (item.user_id = id));

      const video_payload = Object.assign({}, video, {
        likes: likes.length,
        views: views.length,
        has_liked: has_liked != null || undefined,
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

router.get("/", async (req: RequestInterface, res: Response) => {
  type Params = {
    limit: string;
    offset: string;
  };

  const { limit = "20", offset = "0" } = <Params>req.query;

  try {
    const all_videos = await video_controller.findAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const videos = await fetchVideosAndUsers(req.id!, all_videos);

    res.status(200).json(videos);
  } catch (error) {
    res.status(500).send("Could not fetch videos. Please try");
    throw error;
  }
});

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
    });

    const data = await fetchVideosFromTag(req.id!, all_tags);

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
      const tag = await tag_controller.findOne({
        where: { id },
      });

      const data = await fetchVideosFromSingleTag(req.id!, tag!, parseInt(limit), parseInt(offset));

      res.status(200).json(data);
    } catch (error) {
      res.status(500).send("Could not fetch videos. Please try");
      throw error;
    }
  }
);

export { uploadVideo, generateThumbnail, uploadImage };
export default router;
