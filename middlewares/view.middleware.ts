import {
  body,
  check,
  param,
  query,
  ValidationChain,
  validationResult,
} from "express-validator";


function validateViewRequest(): ValidationChain[] {
  return [
    body("video_id", "video_id must be provided").exists(),
  ];
}

export { validateViewRequest };
