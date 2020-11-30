import { Model,Sequelize, ModelCtor } from "sequelize";
import Video from "../models/Video";
import GenericController from "./GenericController";
import { UserParams } from "./user.controller";


interface VideoParams{
    video_url:string,
    title:string,
    description:string,
    user_id: string,
    id:string,
    tags?: string,
    thumbnail: string,
    createdAt: string,
    updatedAt:string,
    original_url:string,
    duration:string
}

interface VideoDetails extends VideoParams{
    likes: number,
    views: number,
    has_liked: boolean | number
}

interface NestedVideoQueryParams extends VideoDetails, Omit<UserParams, "id">{
    author_id:string
}

interface FormattedVideoParams{
    video:VideoDetails,
    user: UserParams
}

class VideoController extends GenericController<VideoParams, Video>{

    constructor(){
        super(Video)
    }

}

export {VideoParams, NestedVideoQueryParams,VideoDetails, FormattedVideoParams}
export default VideoController