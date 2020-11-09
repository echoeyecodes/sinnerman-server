import express, { Request, Response } from "express";
import { Op } from "sequelize";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import { validateLikeRequest } from "../middlewares/like.middleware";
import Like from "../models/Like";
import LikeController from "../controllers/like.controller";
import ViewController from "../controllers/view.controller";
import UserController from "../controllers/user.controller";
import VideoController from "../controllers/video.controller";
import generalRequestMiddleware from "../utils/generalRequestValidator";
const router = express.Router();

const like_controller = new LikeController();
const video_controller = new VideoController()
const user_controller = new UserController();
const view_controller = new ViewController();

router.post(
  "/",
  validateLikeRequest("add"),
  generalRequestMiddleware,
  async (req: RequestInterface, res: Response) => {
    const { video_id } = req.body;
    const { type } = <{ type: string }>req.query;
    const user_id = req.id;

    try {
      if (parseInt(type) == 0) {
        await like_controller.findOrCreate({
          where: { [Op.and]: [{ user_id }, { video_id }] },
          defaults: { video_id, user_id },
        });
      } else {
        await like_controller.destroy({
          where: { [Op.and]: [{ user_id }, { video_id }] },
        });
      }

      const payload ={}

      const video = await video_controller.findOne({ where: { id: video_id } });

      const user = await user_controller.findOne({ where: { id: user_id } });
      const likes = await like_controller.findAll({ where: { video_id } });
      const views = await view_controller.findAll({ where: { video_id } });
      const has_liked = await like_controller.findOne({ where: { user_id } });

      const video_payload = Object.assign({}, video, {
        likes: likes.length,
        views: views.length,
        has_liked: has_liked != null
      });

      Object.assign(payload, {
        user,
        video: video_payload
      });
      res.status(200).send(payload);
    } catch (error) {
      console.log(error);
      res.status(400).send("Could not like video. Please try again");
    }
  }
);

router.get(
  "/:id",
  validateLikeRequest("find"),
  generalRequestMiddleware,
  async (req: RequestInterface, res: Response) => {
    const { id } = req.params;

    try {
      const likes = await like_controller.findAll({ where: { video_id: id } });
      res.status(200).send(`${likes.length}`);
    } catch (error) {
      res.status(500).send("Could not fetch likes");
      throw error;
    }
  }
);

export default router;
