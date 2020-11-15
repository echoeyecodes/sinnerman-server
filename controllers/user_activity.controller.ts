import UserActivity from "../models/UserActivity";
import Video_Tags from "../models/Video_Tags";
import GenericController from "./GenericController";

interface UserActivityParams {
  user_id: string;
  last_video_timestamp:number,
  last_playlist_timestamp: number
}

class UserActivityController extends GenericController<UserActivityParams, UserActivity> {

    constructor(){
        super(UserActivity)
    }
    
}


export default UserActivityController 