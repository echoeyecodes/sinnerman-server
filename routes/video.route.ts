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
import VideoController from "../controllers/video.controller";
import UserController from "../controllers/user.controller";
import LikeController from "../controllers/like.controller";

const like_controller = new LikeController()
const video_controller = new VideoController();
const user_controller = new UserController()

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
      try {
        const payload = await uploadImage(files.video.path);
        const video_url = payload.eager[0].secure_url;
        const { title, description } = fields;
        console.log({ video_url });

        const video = await video_controller.create({
          title,
          description,
          video_url,
          user_id,
        });
        await uploadNotificationPublisher(video.id, video.video_url);

        res.status(200).json(video);
      } catch (error) {
        console.log({ error });
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
      const video = await video_controller.findOneByAttributes({ id });
      if (video == null) {
        res.status(404).send("Video not found");
        return;
      }
      Object.assign(payload, { video: video });

      const user_id = video.user_id

      const user = await user_controller.findOneByAttributes({id: user_id})
      const likes = await like_controller.findAllByFilter({video_id: id})

      Object.assign(payload, {user, like_count:likes.length });
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
    const videos = await video_controller.findAllByPagination({limit: parseInt(limit), offset: parseInt(offset)})
    res.status(200).send(videos);
  } catch (error) {
    res.status(500).send("Could not fetch videos. Please try");
    throw error;
  }
});

export default router;
