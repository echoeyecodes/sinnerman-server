import Otp from "../models/Otp";
import GenericController from "./GenericController";

interface OtpParams {
  email: string;
  id:string,
  otp:string
}

class OtpController extends GenericController<OtpParams, Otp> {

    constructor(){
        super(Otp)
    }
    
}


export default OtpController 