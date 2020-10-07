import express, { Request, Response } from "express";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import { validateCommentRequest } from "../middlewares/comment.middleware";
import Comment from "../models/Comment";
import generalRequestMiddleware from "../utils/generalRequestValidator";
import CommentController from "../controllers/comment.controller";

const comment_controller = new CommentController();
const router = express.Router();

router.post(
  "/",
  validateCommentRequest("add"),
  generalRequestMiddleware,
  async (req: RequestInterface, res: Response) => {
    const { comment, video_id } = req.body;
    const user_id = req.id;

    try {
      const new_comment = await comment_controller.create({
        comment,
        video_id,
        user_id,
      });
      res.status(200).json(new_comment);
      console.log(new_comment);
    } catch (error) {
      console.log(error);
      res.status(400).send("Could not video. Please try again");
    }
  }
);

router.get(
  "/:id",
  validateCommentRequest("one"),
  generalRequestMiddleware,
  async (req: RequestInterface, res: Response) => {
    type Params = {
      limit: string;
      offset: string;
    };
    const { id } = req.params;
    const { limit = "20", offset = "0" } = <Params>req.query;

    try {
      const comments = await comment_controller.findAllByPaginationFilter({
        offset: parseInt(offset),
        limit: parseInt(limit),
        where: {
          video_id: id,
        },
      });

      res.status(200).json(comments);
      console.log(comments);
    } catch (error) {
      console.log(error);
      res.status(400).send("Could not load comments. Please try again");
    }
  }
);

export default router;
