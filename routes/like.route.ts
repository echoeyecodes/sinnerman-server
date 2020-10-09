import express, { Request, Response } from "express";
import { Op } from "sequelize";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import { validateLikeRequest } from "../middlewares/like.middleware";
import Like from "../models/Like";
import LikeController from "../controllers/like.controller";
import generalRequestMiddleware from "../utils/generalRequestValidator";
const router = express.Router();

const like_controller = new LikeController();
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
      res.status(202).send("done");
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
