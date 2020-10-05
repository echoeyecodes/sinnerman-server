import axios from 'axios'

function generateOTPMicroservice(email: string) {
    //send verification email here with pubsub
    return new Promise(async (resolve, reject) => {
      await axios.post(
        "http://localhost:3000/api/v1/otp",
        { email },
        {
          headers: {
            x_api_key: "123456789"
          },
        }
      );
      resolve();
    });
  }

  export {generateOTPMicroservice}