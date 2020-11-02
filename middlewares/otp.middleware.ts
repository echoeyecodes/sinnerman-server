import { body } from "express-validator";

type OTP_Request = "verify" | "create"

function validateOtpRequest(type: OTP_Request){
      switch(type){
        case "verify":
          return [
            body("otp", "otp not provided").exists(),
            body("verification_response", "verification_response not provided or is invalid").exists()
          ]
          case "create":
            return [
              body("verification_response", "verification_response not provided or is invalid").exists(),
            ] 
            default:
              return []
      }
}


export { validateOtpRequest };
