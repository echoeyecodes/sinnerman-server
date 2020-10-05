import { PubSub } from "@google-cloud/pubsub";

import config from "../pubsub-config.json";

export default (function generatePubSub() {
  const pubsub = new PubSub({
    credentials: config,
    projectId: config.project_id,
  });
  return pubsub;
})()