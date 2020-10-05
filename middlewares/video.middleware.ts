import { NextFunction, Request, Response } from "express";
import { body, param } from "express-validator";
import RequestInterface from "../CustomInterfaces/RequestInterface";


type VIDEO_REQUEST = 'one' | 'group' | 'add'

function validateVideoRequest(type : VIDEO_REQUEST){
    switch (type){
        case 'one':
            return[
                param('id').exists(),
                param('id', "invalid type for parameter id. id must be UUID").isUUID()
            ]
            case 'add':
                return[
                    body('title', "title is required as a body paramter").exists(),
                    body('description', "description is required as a body paramter").exists(),
                    body('video_url', "video_url is required as a body paramter").exists(),
                ]
            default:
                return []
    }
}


export {validateVideoRequest}