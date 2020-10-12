import generateOTP from "../utils/generateOTP";
import pubsub from "../utils/pubusbSingleton";
import OtpController from "../controllers/otp.controller";
const otp_controller = new OtpController();

async function deleteUserIfExist(email: string) {
  const otp = await otp_controller.findOne({ where: { email } });
  console.log({otp})
  if (otp) {
    await otp_controller.destroy({ where: { email } });
  }
  return
}

async function mailPublisher(email: string) {
  const otp = generateOTP();
  console.warn("OTP IS " + otp);

  await deleteUserIfExist(email)
  await otp_controller.create({ email, otp })
  const data = JSON.stringify({ email, otp });

  const buffer = Buffer.from(data);
  try {
    const messageId = await pubsub.topic("create_mail").publish(buffer);
    console.log({ messageId });
  } catch (error) {
    console.log(error);
  }
}

async function uploadNotificationPublisher(
  video_id: string,
  video_url: string
) {
  const thumbnail = video_url
    .split(/\.(?=[^\.]+$)/)
    .shift()
    ?.concat(".jpg");
  const payload = { video_id, thumbnail };

  const buffer = Buffer.from(JSON.stringify(payload));

  try {
    const messageId = await pubsub
      .topic("add_upload_notification")
      .publish(buffer);
    console.log({ messageId });
  } catch (error) {
    console.log(error);
  }
}

export { mailPublisher, uploadNotificationPublisher };
