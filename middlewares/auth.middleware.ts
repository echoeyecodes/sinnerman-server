import { NextFunction, Request, Response } from "express";
import { body, header } from "express-validator";
import jwt from "jsonwebtoken";
import { JWT_KEY } from "../constants/jwt.key";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import User from "../models/User";


function validateHeaders(){
  return [
    header("x_api_key", "field value x_api_key is required").exists(),
    //this shouldn't be used in production
    //only used to verify the api key is equal to an actual valid value
    header("x_api_key", "Invalid api key").equals("123456789")
  ]
}

function validateToken(){
  return [
    header("token", "field value token is required but not provided").exists()
  ]
}

const validateTokenMiddleware = (
  req: RequestInterface,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("token")!;
  try {
    const id = jwt.verify(token, JWT_KEY).toString();
    req.id = id
    next();
  } catch (error) {
    throw error("Invalid token")
  }
};


type AuthRequest = "login" | "signup"

function validateAuthRequest(type: AuthRequest){
      switch(type){
        case "login":
          return [
            body("username", "username not provided").exists(),
            body("password", "password not provided").exists()
          ]
          case "signup":
            return [
              body("username", "username not provided").exists(),
              body("password", "password not provided").exists(),
              body("email", "email not provided or is invalid").exists().isEmail(),
              body("fullname", "fullname not provided").exists(),
            ] 
            default:
              return []
      }
}

async function validateUsernameExists(req:Request, res: Response, next:NextFunction){
    const {username} = req.body
    const user = await User.findOne({where:{username}})
    if(user){
      return res.send(true)
    }
    next()
}

export {validateTokenMiddleware, validateToken, validateHeaders, validateAuthRequest, validateUsernameExists };
