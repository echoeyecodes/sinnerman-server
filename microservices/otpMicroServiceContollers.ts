import axios from "axios";

async function generateOTPMicroservice(email: string, host:string) {
  try{
    await axios.post(
      `${host}/api/v1/otp`,
      { verification_response: email },
      {
        headers: {
          "x-api-key": process.env.X_API_KEY,
        },
      }
    );
  }finally{
    return
  }
}
export { generateOTPMicroservice };
