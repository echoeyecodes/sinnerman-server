import Comment from "../models/Comment";
import GenericController from "./GenericController";


interface CommentParams{
    comment:string,
    id:string,
    createdAt:string,
    updatedAt:string,
    video_id:string,
    user_id:string
}


class CommentController extends GenericController<CommentParams, Comment>{

    constructor(){
        super(Comment)
    }

}

export default CommentController