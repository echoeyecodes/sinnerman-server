import express, { Request, Response } from "express";
import User from "../models/User";
import formidable, { Fields, Files } from "formidable";
import cloudinary_config from "../config/cloudinary.config";
import {
  UploadApiErrorResponse,
  UploadApiResponse,
  v2 as cloudinary,
} from "cloudinary";
import Pool_singleton from "../utils/pool.singleton";
import RequestInterface from "../CustomInterfaces/RequestInterface";
const router = express.Router();
import UserController from "../controllers/user.controller";
import { uploadImage } from "./video.route";
import { VideoParams } from "../controllers/video.controller";

const user_controller = new UserController();

router.get("/", async (req: RequestInterface, res: Response) => {
  const id = req.params.id;
  try {
    const user = await user_controller.findOne({ where: { id: req.id } });

    const payload = {};

    Object.assign(payload, user);

    if (user) {
      return res.status(200).json(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).send("An error occured. Please try again");
    throw error;
  }
});

router.post("/upload", async (req: RequestInterface, res: Response) => {
  const form = new formidable.IncomingForm();
  const user_id = req.id!;

  form.parse(req, async (err, fields: Fields, files: Files) => {
    const transaction = await Pool_singleton.getInstance().transaction();
    try {
      console.log({ fields });
      if (err) {
        console.log({ err });
        return res.status(500).send("Could not upload image. Please try again");
      }
      const payload = await uploadImage(files.image.path);

      console.log({payload})
      const original_url = payload.secure_url;
      console.log({ original_url });

      await user_controller.updateOne(
        {
          profile_url: original_url,
        },
        {
          where: {
            id: user_id,
          },
          transaction,
        }
      );

      const updated_user = await user_controller.findOne({
        where: { id: user_id },
      });

      await transaction.commit();
      res.status(200).json(updated_user);
    } catch (error) {
      console.log({ error });
      await transaction.rollback();
      return res.status(500).send("An error occured during upload");
    }
  });
});
export default router;
