"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const otp_route_1 = __importDefault(require("./routes/otp.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const video_route_1 = __importDefault(require("./routes/video.route"));
const comment_route_1 = __importDefault(require("./routes/comment.route"));
const like_route_1 = __importDefault(require("./routes/like.route"));
const view_route_1 = __importDefault(require("./routes/view.route"));
const otpMailSubscriber_1 = __importDefault(require("./pubsubs/otpMailSubscriber"));
const uploadNotificationSubscriber_1 = __importDefault(require("./pubsubs/uploadNotificationSubscriber"));
const auth_middleware_1 = require("./middlewares/auth.middleware");
const generalRequestValidator_1 = __importDefault(require("./utils/generalRequestValidator"));
const app = express_1.default();
const PORT = process.env.PORT || 3000;
app.use(body_parser_1.default.json());
app.use(auth_middleware_1.validateHeaders(), generalRequestValidator_1.default);
app.use("/api/v1/auth", auth_route_1.default);
app.use("/api/v1/otp", otp_route_1.default);
//These are routes requiring token validations
app.use(auth_middleware_1.validateToken(), generalRequestValidator_1.default, auth_middleware_1.validateTokenMiddleware);
app.use("/api/v1/user", user_route_1.default);
app.use("/api/v1/video", video_route_1.default);
app.use("/api/v1/comment", comment_route_1.default);
app.use("/api/v1/like", like_route_1.default);
app.use("/api/v1/view", view_route_1.default);
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
    otpMailSubscriber_1.default();
    uploadNotificationSubscriber_1.default();
});
