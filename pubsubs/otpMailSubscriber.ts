import nodemailer from "nodemailer";
import pubsub from "../utils/pubusbSingleton";

function generateHtml(otp: string) {
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

async function sendMail(otp: string, email: string) {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "femiobajuluwa@gmail.com", // generated ethereal user
      pass: process.env.GMAIL_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "femiobajuluwa@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Hello ✔", // Subject line
    html: generateHtml(otp), // html body
  });

  console.log("Message sent: %s", info.messageId);
}

export default function otpMailSubscriber() {
  const subscription = pubsub.subscription("user_registered");

  const handler = (message: any) => {
    const t = message.data.toString();
    const payload = JSON.parse(t);
    console.log({ payload });
    setTimeout(async () => {
      //do async work here like sending mail
      await sendMail(payload.otp, payload.email);
    }, 5000);
    message.ack();
  };

  subscription.on("message", handler);
}
