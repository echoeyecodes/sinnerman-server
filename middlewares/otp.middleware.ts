import { body } from "express-validator";

type OTP_Request = "verify" | "create"

function validateOtpRequest(type: OTP_Request){
      switch(type){
        case "verify":
          return [
            body("otp", "otp not provided").exists(),
            body("email", "email not provided or is invalid").exists().isEmail()
          ]
          case "create":
            return [
              body("email", "email not provided or is invalid").exists().isEmail(),
            ] 
            default:
              return []
      }
}


export { validateOtpRequest };
