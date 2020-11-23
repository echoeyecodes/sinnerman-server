require('dotenv').config()
import express, { Response } from 'express'
import bodyparser from 'body-parser'
import authRoute from './routes/auth.route'
import otpRoute from './routes/otp.route'
import userRoute from './routes/user.route'
import videoRoute from './routes/video.route'
import commentRoute from './routes/comment.route'
import likeRoute from './routes/like.route'
import viewRoute from './routes/view.route'
import uploadNotificationRoute from './routes/upload_notification.route'
import otpMailSubscriber from './pubsubs/otpMailSubscriber'
import uploadNotificationSubscriber from './pubsubs/uploadNotificationSubscriber'
import { validateHeaders, validateToken, validateTokenMiddleware } from './middlewares/auth.middleware'
import generalRequestMiddleware from './utils/generalRequestValidator'
const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyparser.json())

app.use("/getapp", (_, res: Response) =>{
    res.redirect("https://play.google.com/store/apps/details?id=com.echoeyecodes.sinnerman")
})

app.use("/promotions", (_, res: Response) =>{
    res.redirect("https://wa.link/4kgo0h")
})

app.use("/info", (_, res: Response) =>{
    res.redirect("https://wa.link/fxbvha")
})

app.use(validateHeaders(), generalRequestMiddleware)
app.use("/api/v1/auth", authRoute)
app.use("/api/v1/otp", otpRoute)

//These are routes requiring token validations
app.use(validateToken(), generalRequestMiddleware, validateTokenMiddleware)
app.use("/api/v1/user", userRoute)
app.use("/api/v1/video", videoRoute)
app.use("/api/v1/comment", commentRoute)
app.use("/api/v1/like", likeRoute)
app.use("/api/v1/view", viewRoute)
app.use("/api/v1/upload-notification", uploadNotificationRoute)

app.listen(PORT, () =>{
    console.log(`Server started on port ${PORT}`)
    otpMailSubscriber()
    uploadNotificationSubscriber()
})