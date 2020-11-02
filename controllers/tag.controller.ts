import Tag from "../models/Tag";
import GenericController from "./GenericController";

interface TagParams {
  name: string;
  id:string,
}

class TagController extends GenericController<TagParams, Tag> {

    constructor(){
        super(Tag)
    }
    
}

export {TagParams}
export default TagController 