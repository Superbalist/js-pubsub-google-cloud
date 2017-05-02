"use strict";

var Utils = require('@superbalist/js-pubsub').Utils;

class GoogleCloudPubSubAdapter {
  constructor(client, clientIdentifier = null, autoCreateTopics = true, autoCreateSubscriptions = true) {
    this.client = client;
    this.clientIdentifier = clientIdentifier;
    this.autoCreateTopics = autoCreateTopics;
    this.autoCreateSubscriptions = autoCreateSubscriptions;
  }

  getTopicForChannel(channel) {
    return new Promise((resolve, reject) => {
      this.client.topic(channel).get({autoCreate: this.autoCreateTopics}, (err, topic) => {
        if (err) {
          reject(err);
        } else {
          resolve(topic);
        }
      });
    });
  }

  getSubscriptionForChannel(channel) {
    return new Promise((resolve, reject) => {
      this.getTopicForChannel(channel).then((topic) => {
        let clientIdentifier = this.clientIdentifier || 'default';
        topic.subscription(clientIdentifier).get({autoCreate: this.autoCreateSubscriptions}, (err, subscription) => {
          if (err) {
            reject(err);
          } else {
            resolve(subscription);
          }
        });
      });
    });
  }

  subscribe(channel, handler) {
    this.getSubscriptionForChannel(channel).then((subscription) => {
      subscription.on('message', (message) => {
        handler(Utils.unserializeMessagePayload(message.data));
        message.ack();
      });
    });
  }

  publish(channel, message) {
    this.getTopicForChannel(channel).then(function (topic) {
      topic.publish(message);
    });
  }
}

module.exports = GoogleCloudPubSubAdapter;
