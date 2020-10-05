require('dotenv').config()
import express from 'express'
import bodyparser from 'body-parser'
import authRoute from './routes/auth.route'
import otpRoute from './routes/otp.route'
import userRoute from './routes/user.route'
import videoRoute from './routes/video.route'
import commentRoute from './routes/comment.route'
import likeRoute from './routes/like.route'
import otpMailSubscriber from './pubsubs/otpMailSubscriber'
import { validateHeaders, validateToken, validateTokenMiddleware } from './middlewares/auth.middleware'
import generalRequestMiddleware from './utils/generalRequestValidator'
const app = express()
const PORT = process.env.PORT || 3000

app.use(bodyparser.json())
app.use(validateHeaders(), generalRequestMiddleware)
app.use("/api/v1/auth", authRoute)
app.use("/api/v1/otp", otpRoute)

//These are routes requiring token validations
app.use(validateToken(), generalRequestMiddleware, validateTokenMiddleware)
app.use("/api/v1/user", userRoute)
app.use("/api/v1/video", videoRoute)
app.use("/api/v1/comment", commentRoute)
app.use("/api/v1/like", likeRoute)

app.listen(PORT, () =>{
    console.log(`Server started on port ${PORT}`)
    otpMailSubscriber()
})