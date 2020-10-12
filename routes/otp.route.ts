import express, { NextFunction, Request, Response } from "express";
import { validateOtpRequest } from "../middlewares/otp.middleware";
import { mailPublisher } from "../pubsubs/publishers";
import generalRequestMiddleware from "../utils/generalRequestValidator";
import { generateToken } from "../utils/token";
import UserController from "../controllers/user.controller";
import OtpController from "../controllers/otp.controller";

const user_controller = new UserController();
const otp_controller = new OtpController();

const router = express();

router.post(
  "/verify",
  validateOtpRequest("verify"),
  generalRequestMiddleware,
  async (req: Request, res: Response) => {
    const { otp, email } = req.body;

    const item = await otp_controller.findOne({ where: { email } });
    if (!item) {
      return res.status(400).send("Invalid OTP or token expired");
    }

    if (otp != item.otp) {
      console.log(item.otp);
      return res.status(400).send("Invalid OTP");
    }

    const user = await user_controller.findOne({ where: { email } });
    if (user) {
      user_controller.updateOne({ is_verified: true }, { where: { email } });
      const token = generateToken(user.id);
      await otp_controller.destroy({ where: {email} });
      return res.status(200).json({ token });
    }
    return res.status(404).send("User not found");
  }
);

router.post(
  "/",
  validateOtpRequest("create"),
  generalRequestMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    //pubsub function for sending the otp

    await mailPublisher(email);

    res.status(200).send("ok");
  }
);

export default router;
