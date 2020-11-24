import express, { Request, Response } from "express";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import { validateLikeRequest } from "../middlewares/like.middleware";
import VideoTagController from "../controllers/video_tag.controller";
import generalRequestMiddleware from "../utils/generalRequestValidator";
const router = express.Router();

const video_tag_controller = new VideoTagController();

router.post(
  "/:id",
  generalRequestMiddleware,
  async (req: RequestInterface, res: Response) => {

    const tag_id = req.params.id
    const {video_id} = req.body

    try{
        await video_tag_controller.findOrCreate({
            defaults:{
                tag_id,
                video_id
            },
            where:{
                tag_id,
                video_id
            }
        })
        return res.status(200).send("Done")
    }catch(error){
        console.log(error)
        return res.status(500).send(error)
    }
  });


export default router;
