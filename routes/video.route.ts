import express, { Request, Response } from "express";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import axios from "axios";
import {
  validateVideoFields,
  validateVideoRequest,
} from "../middlewares/video.middleware";
import Video from "../models/Video";
import DataUriParser from "datauri/parser";
import fs from "fs";
import path from "path";
import generalRequestMiddleware from "../utils/generalRequestValidator";
import formidable, { Fields, Files } from "formidable";
import cloudinary_config from "../config/cloudinary.config";
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from "cloudinary";
import { uploadNotificationPublisher } from "../pubsubs/publishers";

const parser = new DataUriParser();
const router = express.Router();
cloudinary.config(cloudinary_config);

type ServiceResponse = {
  status: number;
  data: object | null;
};

const fetchUserFromService = (
  user_id: string,
  api_key: string,
  token: string
): Promise<ServiceResponse> => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await axios.get(
        `http://localhost:3000/api/v1/user/${user_id}`,
        {
          headers: {
            x_api_key: api_key,
            token: token,
          },
        }
      );
      if (user.data) {
        resolve({ status: 200, data: user.data });
      }
    } catch (error) {
      //notify with message queue service about service downtime
      console.log(error);

      //don't terminate request
      resolve({ status: 500, data: null });
    }
  });
};

const fetchLikeCountFromService = (
  video_id: string,
  api_key: string,
  token: string
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data, status } = await axios.get(
        `http://localhost:3000/api/v1/like/${video_id}`,
        {
          headers: {
            x_api_key: api_key,
            token: token,
          },
        }
      );
      if (status == 200) {
        resolve(data);
      }
    } catch (error) {
      //notify with message queue service about service downtime

      //don't terminate request
      resolve("0");
    }
  });
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

        const video = Video.build({ title, description, video_url, user_id });
        await Promise.all([
          video.save(),
          uploadNotificationPublisher(
            video.get().id,
            video.get().video_url
          ),
        ]).catch(console.log);

        res.status(200).json(video.get());
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
      const video = await Video.findOne({ where: { id } });
      if (video == null) {
        res.status(404).send("Video not found");
        return;
      }
      Object.assign(payload, { video: video.get() });

      //user route would be a seperate microservice that would be queried from its url
      const api_key: string = req.header("x_api_key")!; //cannot be null
      const token = req.header("token")!; //cannot be null
      const user_id = video.get().user_id;

      const [data, like_count]: [ServiceResponse, string] = await Promise.all([
        fetchUserFromService(user_id, api_key, token),
        fetchLikeCountFromService(id, api_key, token),
      ]);

      Object.assign(payload, { user: data, like_count });
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
    const videos = await Video.findAll({
      offset: parseInt(offset),
      limit: parseInt(limit),
    });
    res.status(200).send(videos);
  } catch (error) {
    res.status(500).send("Could not fetch videos. Please try");
    throw error;
  }
});

export default router;
