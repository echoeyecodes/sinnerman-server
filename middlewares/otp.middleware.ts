import { NextFunction, Request, Response } from "express";
import { body, header } from "express-validator";
import jwt from "jsonwebtoken";
import { JWT_KEY } from "../constants/jwt.key";
import RequestInterface from "../CustomInterfaces/RequestInterface";

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
