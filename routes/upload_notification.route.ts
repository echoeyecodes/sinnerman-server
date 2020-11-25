import express, { Response } from "express";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import UploadNotificationController from "../controllers/upload_notification.controller";
import UserController from "../controllers/user.controller";
import VideoController from "../controllers/video.controller";
const router = express.Router();

const upload_notification_controller = new UploadNotificationController();
const user_controller = new UserController();
const video_controller = new VideoController();

router.get("/", async (req: RequestInterface, res: Response) => {
  type Params = {
    limit: string;
    offset: string;
  };

  const { limit = "20", offset = "0" } = <Params>req.query;

  try {
    const notifications = await upload_notification_controller.findAll({
      where: { user_id: req.id },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [
        ["createdAt", "DESC"]
      ]
    });

    const data = await Promise.all(notifications.map(async(item) =>{
        const video = await video_controller.findOne({where:{id: item.video_id}})
        const user = await user_controller.findOne({where:{id: video?.user_id}})

        const title = video?.title
        const thumbnail = item.thumbnail
        const timestamp = item.createdAt
        const video_id = `${video?.id}`
        const is_read = item.is_read
        const profile_url = `${user?.profile_url}`

        const name = user?.fullname

        const message = `${name} uploaded: ${title}`

        return {
            id:item.id,
            video_id,
            message,
            timestamp,
            thumbnail: video?.thumbnail,
            profile_url,
            is_read
        }
    }))

    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).send("error");
    throw error;
  }
});

export default router;
