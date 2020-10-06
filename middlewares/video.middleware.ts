import { NextFunction, Request, Response } from "express";
import { body, param } from "express-validator";
import { Fields, Files } from "formidable";
import formidable from "formidable";

type VIDEO_REQUEST = "one" | "group" | "add";

function validateVideoRequest(type: VIDEO_REQUEST) {
  switch (type) {
    case "one":
      return [
        param("id").exists(),
        param("id", "invalid type for parameter id. id must be UUID").isUUID(),
      ];
    case "add":
      return [
        body("title", "title is required as a body paramter").exists(),
        body(
          "description",
          "description is required as a body paramter"
        ).exists(),
        body("video_url", "video_url is required as a body paramter").exists(),
      ];
    default:
      return [];
  }
}

async function validateVideoFields(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields: Fields, files: Files) => {
    const path = files.video.path;
    const { title, description } = <{ title: string; description: string }>(
      fields
    );

    const requiredparams = { title, description, path };

    const missingParams = Object.entries(requiredparams)
      .filter((entry) => [null, undefined, ""].includes(entry[1]))
      .map((entry) => entry[0]);

    if (missingParams.length > 0) {
      res.status(400).send();
      throw new Error("Couldn't find parameters " + missingParams);
    }
  });
  next();
}

export { validateVideoRequest, validateVideoFields };
