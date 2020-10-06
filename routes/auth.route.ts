import express, { Request, Response } from "express";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import { validateAuthRequest, validateUsernameExists } from "../middlewares/auth.middleware";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token";
import verifyPassword from "../utils/verifyPassword";
import generalRequestMiddleware from "../utils/generalRequestValidator";
import generateOTP from "../utils/generateOTP";
import generateID from "../utils/generateID";
import { generateOTPMicroservice } from "../microservices/otpMicroServiceContollers";
const router = express.Router();

router.post(
  "/login",
  validateAuthRequest("login"),
  generalRequestMiddleware,
  async (req: RequestInterface, res: Response) => {
    const { username } = req.body;

    try {
      const user = await User.findOne({
        where: { username },
        attributes: ["id", "username", "password", "email", "is_verified"],
      });
      if (!user) {
        res.status(404).send("User not found");
      } else {
        const { id, password, is_verified, email } = user.get();

        const isPasswordCorrect = verifyPassword(req.body.password, password);
        if (!isPasswordCorrect) {
          res.status(400).send("Invalid password");
          return;
        }
        const uid = generateID();
        console.log({is_verified})
        if (!is_verified) {
          await generateOTPMicroservice(email);
          return res.status(202).send({ uid });
        }

        const token = generateToken(id);
        res.status(200).json({ token });
      }
    } catch (error) {
      res.status(500).send("Couldn't process request. Please try again");
      throw error;
    }
  }
);

router.post(
  "/signup",
  validateAuthRequest("signup"),
  generalRequestMiddleware,
  validateUsernameExists,
  async (req: Request, res: Response) => {
    const { fullname, email, password, username } = req.body;
    try {
      const salt = bcrypt.genSaltSync();
      const hashedPassword = await bcrypt.hash(password, salt);

      const otp = generateOTP();
      const payload = {
        fullname,
        email,
        password: hashedPassword,
        username,
      };
      console.log("OTP IS " + otp);

      //send verification email here with pubsub

      const user = User.build(payload);
      await user.save();
      console.log(user.toJSON());

      await generateOTPMicroservice(email);

      res.status(200).send("ok");
    } catch (error) {
      res.status(500).send("An error occured. Please try again");
      throw error;
    }
  }
);

export default router;