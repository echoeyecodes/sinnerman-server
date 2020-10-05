import express, { Request, Response } from "express";
import User from "../models/User";
import RequestInterface from "../CustomInterfaces/RequestInterface";
const router = express.Router();

router.get("/:id", async (req: RequestInterface, res: Response) => {

  const id = req.params.id
  try {
    const user = await User.findOne({
      where: {
        id,
      },
      attributes: ["id", "username", "fullname", "profile_url"],
    });
    
    if (user) {
      res.status(200).send(user.get());
    } else {
      res.status(204).send("User not found");
    }
  } catch (error) {
    res.status(500).send("An error occured. Please try again")
    throw error;
  }
});

export default router;
