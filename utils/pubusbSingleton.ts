import { PubSub } from "@google-cloud/pubsub";

import config from "../pubsub-config.json";

export default (function generatePubSub() {
  const pubsub = new PubSub({projectId: process.env.GOOGLE_CRED_PROJECT_ID, credentials:{private_key: process.env.GOOGLE_CRED_PRIVATE_KEY, client_email: process.env.GOOGLE_CRED_CLIENT_EMAIL}, clientOptions:{clientId: process.env.GOOGLE_CRED_CLIENT_ID, email:process.env.GOOGLE_CRED_CLIENT_EMAIL}});
  return pubsub;
})()