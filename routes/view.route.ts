import express, { Request, Response } from "express";
import { Op } from "sequelize";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import ViewController from "../controllers/view.controller";
import generalRequestMiddleware from "../utils/generalRequestValidator";
import { validateViewRequest } from "../middlewares/view.middleware";
const router = express.Router();

const view_controller = new ViewController();
router.post(
  "/",
  validateViewRequest(),
  generalRequestMiddleware,
  async (req: RequestInterface, res: Response) => {
    const { video_id } = req.body;
    const user_id = req.id;

    try {
      await view_controller.findOrCreate({
        where: { [Op.and]: [{ user_id }, { video_id }] },
        defaults: { video_id, user_id },
      });
      res.status(202).send("done");
    } catch (error) {
      console.log(error);
      res.status(400).send("An error occured");
    }
  }
);

router.get(
  "/:id",
  validateViewRequest(),
  generalRequestMiddleware,
  async (req: RequestInterface, res: Response) => {
    const { id } = req.params;

    try {
      const likes = await view_controller.findAll({ where: { video_id: id } });
      res.status(200).send(`${likes.length}`);
    } catch (error) {
      res.status(500).send("error");
      throw error;
    }
  }
);

export default router;
