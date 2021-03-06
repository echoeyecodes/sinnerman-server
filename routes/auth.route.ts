import express, { Request, Response } from "express";
import RequestInterface from "../CustomInterfaces/RequestInterface";
import { validateAuthRequest, validateEmailExists, validateUsernameExists } from "../middlewares/auth.middleware";
import User from "../models/User";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token";
import verifyPassword from "../utils/verifyPassword";
import generalRequestMiddleware from "../utils/generalRequestValidator";
import generateOTP from "../utils/generateOTP";
import generateID from "../utils/generateID";
import { generateOTPMicroservice } from "../microservices/otpMicroServiceContollers";
import UserController from "../controllers/user.controller";

const user_controller = new UserController()
const router = express.Router();

router.post(
  "/login",
  validateAuthRequest("login"),
  generalRequestMiddleware,
  async (req: RequestInterface, res: Response) => {
    const { username } = req.body;

    try {
      const user = await user_controller.findOne({where:{username}})
      if (!user) {
        res.status(404).send("User not found");
      } else {
        
        const { id, password, is_verified, email } = user;

        const isPasswordCorrect = verifyPassword(req.body.password, password);

        if (!isPasswordCorrect) {
          res.status(400).send("Invalid password");
          return;
        }

        
        const uid = generateID();
        console.log({is_verified})
        if (!is_verified) {
          const host = `${req.protocol}://${req.get('host')}`
          await generateOTPMicroservice(email, host);
          return res.status(202).send(email);
        }

        const token = generateToken(id);
        res.status(200).send(token);
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
  validateEmailExists,
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

      const user = await user_controller.create(payload)
      console.log(user);

      const host = `${req.protocol}://${req.get('host')}`
      await generateOTPMicroservice(email, host);

      
      res.status(200).send(email);
    } catch (error) {
      res.status(500).send("An error occured. Please try again");
      throw error;
    }
  }
);

export default router;