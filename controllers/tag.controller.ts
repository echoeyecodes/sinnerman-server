import Tag from "../models/Tag";
import GenericController from "./GenericController";

interface TagParams {
  video_id: string;
  id:string,
}

class TagController extends GenericController<TagParams, Tag> {

    constructor(){
        super(Tag)
    }
    
}


export default TagController 