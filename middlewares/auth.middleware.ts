import { NextFunction, Request, Response } from "express";
import { body, header } from "express-validator";
import jwt from "jsonwebtoken";
import { JWT_KEY } from "../constants/jwt.key";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import User from "../models/User";
import UserController from '../controllers/user.controller'

const user_controller = new UserController()

function validateHeaders(){
  return [
    header("x-api-key", "field value x-api-key is required").exists(),
    //this shouldn't be used in production
    //only used to verify the api key is equal to an actual valid value
    header("x-api-key", "Invalid api key").equals(process.env.X_API_KEY!)
  ]
}

function validateToken(){
  return [
    header("token", "field value token is required but not provided").exists()
  ]
}

const validateTokenMiddleware = async (
  req: RequestInterface,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("token")!;
  try {
    const id = jwt.verify(token, JWT_KEY).toString();

    const user = await user_controller.findOne({where:{id}})
    if(!user){
      return res.status(401).send("Unauthorized")
    }
    req.id = id
    next();
  } catch (error) {
    res.status(401).send("Unauthorized")
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
      return res.status(202).send("An account exists with this username")
    }
    next()
}

async function validateEmailExists(req:Request, res: Response, next:NextFunction){
  const {email} = req.body
  const user = await User.findOne({where:{email}})
  if(user){
    return res.status(202).send("An account exists with this email")
  }
  next()
}

export {validateTokenMiddleware, validateToken, validateHeaders, validateAuthRequest,validateEmailExists, validateUsernameExists };
