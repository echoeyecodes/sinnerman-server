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
const auth_middleware_1 = require("../middlewares/auth.middleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const token_1 = require("../utils/token");
const verifyPassword_1 = __importDefault(require("../utils/verifyPassword"));
const generalRequestValidator_1 = __importDefault(require("../utils/generalRequestValidator"));
const generateOTP_1 = __importDefault(require("../utils/generateOTP"));
const generateID_1 = __importDefault(require("../utils/generateID"));
const otpMicroServiceContollers_1 = require("../microservices/otpMicroServiceContollers");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const user_controller = new user_controller_1.default();
const router = express_1.default.Router();
router.post("/login", auth_middleware_1.validateAuthRequest("login"), generalRequestValidator_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    try {
        const user = yield user_controller.findOne({ where: { username } });
        if (!user) {
            res.status(404).send("User not found");
        }
        else {
            const { id, password, is_verified, email } = user;
            const isPasswordCorrect = verifyPassword_1.default(req.body.password, password);
            if (!isPasswordCorrect) {
                res.status(400).send("Invalid password");
                return;
            }
            const uid = generateID_1.default();
            console.log({ is_verified });
            if (!is_verified) {
                const host = `${req.protocol}://${req.get('host')}`;
                yield otpMicroServiceContollers_1.generateOTPMicroservice(email, host);
                return res.status(202).send({ uid });
            }
            const token = token_1.generateToken(id);
            res.status(200).json({ token });
        }
    }
    catch (error) {
        res.status(500).send("Couldn't process request. Please try again");
        throw error;
    }
}));
router.post("/signup", auth_middleware_1.validateAuthRequest("signup"), generalRequestValidator_1.default, auth_middleware_1.validateUsernameExists, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullname, email, password, username } = req.body;
    try {
        const salt = bcryptjs_1.default.genSaltSync();
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const otp = generateOTP_1.default();
        const payload = {
            fullname,
            email,
            password: hashedPassword,
            username,
        };
        console.log("OTP IS " + otp);
        //send verification email here with pubsub
        const user = yield user_controller.create(payload);
        console.log(user);
        const host = `${req.protocol}://${req.get('host')}`;
        yield otpMicroServiceContollers_1.generateOTPMicroservice(email, host);
        res.status(200).send("ok");
    }
    catch (error) {
        res.status(500).send("An error occured. Please try again");
        throw error;
    }
}));
exports.default = router;
