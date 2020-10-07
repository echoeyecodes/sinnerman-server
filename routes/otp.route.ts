import express, { NextFunction, Request, Response } from "express";
import redis from "redis";
import { validateOtpRequest } from "../middlewares/otp.middleware";
import { mailPublisher } from "../pubsubs/publishers";
import { deleteUserCacheByEmail } from "../utils/cacheManager";
import generalRequestMiddleware from "../utils/generalRequestValidator";
import { generateToken } from "../utils/token";
import UserController from '../controllers/user.controller'

const user_controller = new UserController()
const client = redis.createClient();
const router = express();

router.post("/verify", validateOtpRequest('verify'), generalRequestMiddleware, async (req: Request, res: Response) => {
  const { otp, email } = req.body;

  client.hgetall(`${email}`, async (err, result) => {
    if (!result) {
        console.log({result,err})
      return res.status(400).send("NOT FOUND or OTP expired");
    }

    if (otp != result.otp) {
        console.log(result.otp)
      return res.status(400).send("Invalid OTP");
    }

    const user = await user_controller.findOneByAttributes({email})
    if (user) {
      user_controller.updateOneByAttributes({is_verified:true}, {email})
      const token = generateToken(user.id);
      await deleteUserCacheByEmail(email);
      return res.status(200).json({ token });
    }
    return res.status(404).send("User not found");
  });
});

router.post("/", validateOtpRequest('create'), generalRequestMiddleware, async (req: Request, res: Response, next:NextFunction) => {
  const { email } = req.body;
  //pubsub function for sending the otp

  await mailPublisher(email)

  res.status(200).send("ok")
});


export default router;
