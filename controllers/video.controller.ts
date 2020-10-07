import { Model,Sequelize, ModelCtor } from "sequelize";
import Video from "../models/Video";
import GenericController from "./GenericController";


interface VideoParams{
    video_url:string,
    title:string,
    description:string,
    user_id: string,
    id:string
}


class VideoController extends GenericController<VideoParams, Video>{

    constructor(){
        super(Video)
    }

}

export default VideoController