import { body, check, param, query, ValidationChain, validationResult } from "express-validator";

type LIKE_ACTIONS = 'add' | 'remove' | 'find'

function validateLikeRequest(type: LIKE_ACTIONS) : ValidationChain[]{
    switch(type){
        case 'add':
            return [
                body("video_id", "video_id must be provided").exists(),
                query("type", "Parameter 'type' must be provided").exists(),
                query("type", "Parameter 'type' must be a string").isString(),
                query("type", "Parameter 'type' must be either 0 or 1").isIn(["0", "1"])
            ]
            case 'find':
                return[
                    check('id', "id parameter must be UUID").isUUID()
                ]
            default:
                return []
    }
}


export {validateLikeRequest}