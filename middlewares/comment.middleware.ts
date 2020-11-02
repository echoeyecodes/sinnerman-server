import { NextFunction, Request, Response } from "express";
import { body, param } from "express-validator";


type COMMENT_REQUEST = "add" | "one"
function validateCommentRequest(type : COMMENT_REQUEST){
    switch(type){
        case "add":
            return[
                body("video_id", "Required parameter video_id is missing").exists(),
                body("comment", "Required parameter 'comment' is missing").exists(),
            ]
            case 'one':
                return[
                    param("id", "Required parameter video_id is missing").exists(),
                ]
            default:
                return []
    }
}


export {validateCommentRequest}