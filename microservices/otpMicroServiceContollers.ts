import axios from "axios";

async function generateOTPMicroservice(email: string) {
  await axios.post(
    "http://localhost:3000/api/v1/otp",
    { email },
    {
      headers: {
        x_api_key: "123456789",
      },
    }
  );
}
export { generateOTPMicroservice };
