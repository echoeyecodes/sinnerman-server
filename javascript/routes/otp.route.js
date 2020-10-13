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
const express_1 = __importDefault(require("express"));
const otp_middleware_1 = require("../middlewares/otp.middleware");
const publishers_1 = require("../pubsubs/publishers");
const generalRequestValidator_1 = __importDefault(require("../utils/generalRequestValidator"));
const token_1 = require("../utils/token");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const otp_controller_1 = __importDefault(require("../controllers/otp.controller"));
const user_controller = new user_controller_1.default();
const otp_controller = new otp_controller_1.default();
const router = express_1.default();
router.post("/verify", otp_middleware_1.validateOtpRequest("verify"), generalRequestValidator_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp, email } = req.body;
    const item = yield otp_controller.findOne({ where: { email } });
    if (!item) {
        return res.status(400).send("Invalid OTP or token expired");
    }
    if (otp != item.otp) {
        console.log(item.otp);
        return res.status(400).send("Invalid OTP");
    }
    const user = yield user_controller.findOne({ where: { email } });
    if (user) {
        user_controller.updateOne({ is_verified: true }, { where: { email } });
        const token = token_1.generateToken(user.id);
        yield otp_controller.destroy({ where: { email } });
        return res.status(200).json({ token });
    }
    return res.status(404).send("User not found");
}));
router.post("/", otp_middleware_1.validateOtpRequest("create"), generalRequestValidator_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    //pubsub function for sending the otp
    try {
        yield publishers_1.mailPublisher(email);
    }
    finally {
        return res.status(200).send("ok");
    }
}));
exports.default = router;
