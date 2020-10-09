import express, { Request, Response } from "express";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import axios from "axios";
import {
  validateVideoFields,
  validateVideoRequest,
} from "../middlewares/video.middleware";
import Video from "../models/Video";
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
import TagController from "../controllers/tag.controller";
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

async function uploadImage(
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
        const payload = await uploadImage(files.video.path);
        const video_url = payload.eager[0].secure_url;
        const { title, description, tags =''}: VideoParams = <VideoParams>(
          (<unknown>fields)
        );
        const parsed_tags = JSON.parse(tags)
        console.log({ video_url });

        const video = await video_controller.create({
          title,
          description,
          video_url,
          user_id,
        }, {transaction});

        const tag_ids : string[] = await Promise.all(
          parsed_tags.map(
            async (tag:string) : Promise<string> => {
              const [{id}] = await tag_controller.findOrCreate({
                where: {name: tag},
                defaults: { name: tag },
                transaction
              })
              return id
            })
        );
        

        if(tag_ids.length >0){
          await Promise.all(tag_ids.map(async (tag) => await video_tag_controller.findOrCreate({
            where:{
              [Op.and]: [{ videoId:video.id }, { tagId: tag }]
            },
            defaults:{videoId: video.id, tagId: tag},
            transaction
          })))
        }

        //Only send notification when transactions are successful
        transaction.afterCommit(async () =>{
          await uploadNotificationPublisher(video.id, video.video_url);
        })

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
      Object.assign(payload, { video: video });

      const user_id = video.user_id;

      const user = await user_controller.findOne({ where: { id: user_id } });
      const likes = await like_controller.findAll({ where: { video_id: id } });
      const views = await view_controller.findAll({ where: { video_id: id } });

      Object.assign(payload, {
        user,
        like_count: likes.length,
        views: views.length,
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

    const videos = await Promise.all(
      all_videos.map(async (video) => {
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

        const data = { video, user, likes: likes.length, views: views.length };

        return data;
      })
    );

    res.status(200).json(videos);
  } catch (error) {
    res.status(500).send("Could not fetch videos. Please try");
    throw error;
  }
});

export default router;
