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
exports.uploadNotificationPublisher = exports.mailPublisher = void 0;
const generateOTP_1 = __importDefault(require("../utils/generateOTP"));
const pubusbSingleton_1 = __importDefault(require("../utils/pubusbSingleton"));
const otp_controller_1 = __importDefault(require("../controllers/otp.controller"));
const otp_controller = new otp_controller_1.default();
function deleteUserIfExist(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const otp = yield otp_controller.findOne({ where: { email } });
        console.log({ otp });
        if (otp) {
            yield otp_controller.destroy({ where: { email } });
        }
        return;
    });
}
function mailPublisher(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const otp = generateOTP_1.default();
        console.warn("OTP IS " + otp);
        try {
            yield deleteUserIfExist(email);
            yield otp_controller.create({ email, otp });
            const data = JSON.stringify({ email, otp });
            const buffer = Buffer.from(data);
            const messageId = yield pubusbSingleton_1.default.topic("create_mail").publish(buffer);
            console.log({ messageId });
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.mailPublisher = mailPublisher;
function uploadNotificationPublisher(video_id, video_url) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const thumbnail = (_a = video_url
            .split(/\.(?=[^\.]+$)/)
            .shift()) === null || _a === void 0 ? void 0 : _a.concat(".jpg");
        const payload = { video_id, thumbnail };
        const buffer = Buffer.from(JSON.stringify(payload));
        try {
            const messageId = yield pubusbSingleton_1.default
                .topic("add_upload_notification")
                .publish(buffer);
            console.log({ messageId });
        }
        catch (error) {
            console.log(error);
        }
    });
}
exports.uploadNotificationPublisher = uploadNotificationPublisher;
