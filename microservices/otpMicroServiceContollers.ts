import axios from "axios";

async function generateOTPMicroservice(email: string, host:string) {
  await axios.post(
    `${host}/api/v1/otp`,
    { email },
    {
      headers: {
        x_api_key: process.env.X_API_KEY,
      },
    }
  );
  return
}
export { generateOTPMicroservice };
