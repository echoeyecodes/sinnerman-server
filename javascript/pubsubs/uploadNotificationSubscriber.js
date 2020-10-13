"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pubusbSingleton_1 = __importDefault(require("../utils/pubusbSingleton"));
const UploadNotification_1 = __importDefault(require("../models/UploadNotification"));
const User_1 = __importDefault(require("../models/User"));
function uploadNotificationSubscriber() {
    const subscription = pubusbSingleton_1.default.subscription("video_uploaded");
    const handler = (message) => __awaiter(this, void 0, void 0, function* () {
        const data = message.data.toString();
        const payload = JSON.parse(data);
        console.log({ payload });
        try {
            const users = yield User_1.default.findAll();
            yield Promise.all(users.map((user) => __awaiter(this, void 0, void 0, function* () {
                const new_payload = Object.assign({}, payload, {
                    user_id: user.get().id,
                });
                const notification = UploadNotification_1.default.build(new_payload);
                yield notification.save();
            })));
            message.ack();
        }
        catch (error) {
            throw new Error(error);
        }
    });
    subscription.on("message", handler);
}
exports.default = uploadNotificationSubscriber;
