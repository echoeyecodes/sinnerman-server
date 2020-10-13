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
const nodemailer_1 = __importDefault(require("nodemailer"));
const pubusbSingleton_1 = __importDefault(require("../utils/pubusbSingleton"));
function generateHtml(otp) {
    return `<div>
        <h2>Hello Sinnerman!</h2>
        <p>Let's face it. You have nothing to do, so you are just one lazy sloth looking
         to find something worthwhile. Lucky for you, I exist to make your life meaningful (kiss my feet). Now, get 
         right back to the app with this your code. And please, in the name of everything
          nice in this planet... Do not forget the OTP. It costs me money, you know?... BITCH!</p>

          <h4>${otp}</h4>
          </div>     
    `;
}
function sendMail(otp, email) {
    return __awaiter(this, void 0, void 0, function* () {
        let transporter = nodemailer_1.default.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: "femiobajuluwa@gmail.com",
                pass: process.env.GMAIL_PASSWORD,
            },
        });
        // send mail with defined transport object
        let info = yield transporter.sendMail({
            from: "femiobajuluwa@gmail.com",
            to: email,
            subject: "Hello ✔",
            html: generateHtml(otp),
        });
        console.log("Message sent: %s", info.messageId);
    });
}
function otpMailSubscriber() {
    const subscription = pubusbSingleton_1.default.subscription("user_registered");
    const handler = (message) => __awaiter(this, void 0, void 0, function* () {
        const data = message.data.toString();
        const payload = JSON.parse(data);
        console.log({ payload });
        //do async work here like sending mail
        try {
            yield sendMail(payload.otp, payload.email);
            message.ack();
        }
        catch (error) {
            throw new Error("Could not start subscription");
        }
    });
    subscription.on("message", handler);
}
exports.default = otpMailSubscriber;
