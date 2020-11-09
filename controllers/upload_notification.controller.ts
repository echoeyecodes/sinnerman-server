
import UploadNotification from "../models/UploadNotification";
import GenericController from "./GenericController";


interface UploadNotificationParams{
    id:string,
    is_read:boolean,
    user_id:string,
    created_by:string,
    video_id:string,
    thumbnail:string,
    createdAt:string
}


class UploadNotificationController extends GenericController<UploadNotificationParams, UploadNotification>{

    constructor(){
        super(UploadNotification)
    }

}

export default UploadNotificationController