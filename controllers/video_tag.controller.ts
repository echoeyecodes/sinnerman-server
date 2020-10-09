import Video_Tags from "../models/Video_Tags";
import GenericController from "./GenericController";

interface VideoTagParams {
  videoId: string;
  tagId:string,
}

class TagController extends GenericController<VideoTagParams, Video_Tags> {

    constructor(){
        super(Video_Tags)
    }
    
}


export default TagController 