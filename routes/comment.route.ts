import express, { Request, Response } from "express";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import { validateCommentRequest } from "../middlewares/comment.middleware";
import Comment from "../models/Comment";
import generalRequestMiddleware from "../utils/generalRequestValidator";
import CommentController from "../controllers/comment.controller";
import UserController from "../controllers/user.controller";
const comment_controller = new CommentController();
const user_controller = new UserController();
const router = express.Router();

router.post(
  "/",
  validateCommentRequest("add"),
  generalRequestMiddleware,
  async (req: RequestInterface, res: Response) => {
    const { comment, video_id, id } = req.body;
    const user_id = req.id;

    try {
      const new_comment = await comment_controller.create({
        id,
        comment,
        video_id,
        user_id,
      });

      const user = await user_controller.findOne({where:{id: new_comment.user_id}})

      res.status(200).json({comment: new_comment, user});
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
      const comments = await comment_controller.findAll({
        offset: parseInt(offset),
        limit: parseInt(limit),
        where: {
          video_id: id,
        },
        order: [
          ["createdAt", "DESC"]
        ]
      });

      const data = await Promise.all(
        comments.map(async (comment) => {
          const user = await user_controller.findOne({
            where: { id: comment.user_id },
          });

          return { comment, user };
        })
      );

      res.status(200).json(data);
      console.log(data);
    } catch (error) {
      console.log(error);
      res.status(400).send("Could not load comments. Please try again");
    }
  }
);

export default router;
