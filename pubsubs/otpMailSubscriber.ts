import nodemailer from "nodemailer";
import pubsub from "../utils/pubusbSingleton";

function generateHtml(otp: string) {
  return `<div>
        <h2>Ohhh Sinnerman!</h2>
        <p>Where're you gonna run to. 2 things you need to know before going back to the app. I love Wraith! I live Watson.
        And we are gonna definitely have a "happily ever after" moment someday. Anyway, get 
         right back to the app with this your code. And please, in the name of everything
          nice on this planet... Do not forget this PIN. It costs me money, you know!</p>

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

  const handler = async (message: any) => {
    const data = message.data.toString();
    const payload = JSON.parse(data);
    console.log({ payload });

    //do async work here like sending mail
    try {
      await sendMail(payload.otp, payload.email);
      message.ack();
    } catch (error) {
      console.error("Could not send mail");
    }
  };

  subscription.on("message", handler);
}
