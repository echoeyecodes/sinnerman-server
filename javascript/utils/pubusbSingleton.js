"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pubsub_1 = require("@google-cloud/pubsub");
exports.default = (function generatePubSub() {
    const pubsub = new pubsub_1.PubSub();
    return pubsub;
})();
