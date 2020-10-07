import Like from "../models/Like";
import GenericController from "./GenericController";

interface LikeParams {
  video_id: string;
  user_id: string;
  id:string,
}

class LikeController extends GenericController<LikeParams, Like> {

    constructor(){
        super(Like)
    }
    
}


export default LikeController 