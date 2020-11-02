import User from "../models/User";
import GenericController from "./GenericController";

interface UserParams {
  fullname: string;
  password: string;
  username: string;
  email: string;
  is_verified:boolean,
  id:string,
  profile_url:string
}

class UserController extends GenericController<UserParams, User> {

    constructor(){
        super(User)
    }
    
}

export default UserController;
