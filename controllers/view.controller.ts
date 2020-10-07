import View from "../models/View";
import GenericController from "./GenericController";

interface ViewParams {
  video_id: string;
  user_id: string;
  id:string,
}

class ViewController extends GenericController<ViewParams, View> {

    constructor(){
        super(View)
    }
    
}


export default ViewController 