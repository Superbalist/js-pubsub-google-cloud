'use strict';

let Utils = require('@superbalist/js-pubsub').Utils;
let topics = {};
/**
 * @callback subscriberCallback
 * @param {*} message - The message payload received
 */

/**
 * GoogleCloudPubSubAdapter Class
 *
 * @implements {module:@superbalist/js-pubsub.PubSubAdapterInterface}
 * @example
 * let pubsub = require('@google-cloud/pubsub');
 * let GoogleCloudPubSubAdapter = require('@superbalist/js-pubsub-google-cloud');
 *
 * // create adapter
 * process.env.GOOGLE_APPLICATION_CREDENTIALS = '/usr/src/app/examples/your-gcloud-key.json';
 *
 * let client = pubsub({
 *   projectId: 'your-project-id-here',
 * });
 *
 * let adapter = new GoogleCloudPubSubAdapter(client);
 */
class GoogleCloudPubSubAdapter {
  /**
   * Construct a GoogleCloudPubSubAdapter
   *
   * @param {module:pubsub} client
   * @param {?string} [clientIdentifier=null]
   * @param {boolean} [autoCreateTopics=true]
   * @param {boolean} [autoCreateSubscriptions=true]
   */
  constructor(
    client,
    clientIdentifier = null,
    autoCreateTopics = true,
    autoCreateSubscriptions = true
  ) {
    /**
     * @type {module:pubsub}
     */
    this.client = client;

    /**
     * @type {?string}
     */
    this.clientIdentifier = clientIdentifier;

    /**
     * @type {boolean}
     */
    this.autoCreateTopics = autoCreateTopics;

    /**
     * @type {boolean}
     */
    this.autoCreateSubscriptions = autoCreateSubscriptions;
  }

  /**
   * Return a promise which resolves to a Topic object from the given channel name.
   *
   * If the topic does not exist and the
   * [autoCreateTopics]{@link GoogleCloudPubSubAdapter#autoCreateTopics} property is set to true,
   * the topic will first be created.
   *
   * @param {string} channel
   * @return {Promise<module:pubsub/topic>}
   */
  getTopicForChannel(channel) {
      if (topics[channel]) {
        return Promise.resolve(topics[channel])
      }

      let topic = this.client.topic(channel);
      return topic.get({autoCreate: this.autoCreateTopics}).then((data) => {
        topics[channel] = data[0]
        return data[0]; // topic
      });
  }

  /**
   * Return a promise which resolves to a Subscription object from the given channel name.
   *
   * If the subscription does not exist and the
   * [autoCreateSubscriptions]{@link GoogleCloudPubSubAdapter#autoCreateSubscriptions}
   * property is set to true, the subscription will first be created.
   *
   * @param {string} channel
   * @return {Promise<module:pubsub/subscription>}
   */
  getSubscriptionForChannel(channel) {
    return this.getTopicForChannel(channel).then((topic) => {
      let clientIdentifier = this.clientIdentifier || 'default';
      clientIdentifier += '.' + channel;
      return topic.subscription(clientIdentifier).get(
        {
          autoCreate: this.autoCreateSubscriptions,
        }
      ).then((data) => {
        return data[0]; // subscription
      });
    });
  }

  /**
   * Subscribe a handler to a channel.
   *
   * @param {string} channel
   * @param {subscriberCallback} handler - The callback to run when a message is received
   * @return {Promise<module:pubsub/subscription>}
   * @example
   * adapter.subscribe('my_channel', (message) => {
   *   console.log(message);
   * });
   */
  subscribe(channel, handler) {
    return this.getSubscriptionForChannel(channel).then((subscription) => {
      subscription.on('message', (message) => {
        handler(Utils.unserializeMessagePayload(message.data));
        message.ack();
      });

      return subscription;
    });
  }

  /**
   * Publish a message to a channel.
   *
   * @param {string} channel
   * @param {*} message - The message payload
   * @return {Promise<*>}
   * @example
   * // publish a string
   * adapter.publish('my_channel', 'Hello World');
   *
   * // publish an object
   * adapter.publish('my_channel', {
   *   'id': 1234,
   *   'first_name': 'Matthew',
   * });
   */
  publish(channel, message) {
    return this.getTopicForChannel(channel).then((topic) => {
      return topic.publish(this.makeBuffer(message));
    });
  }

  /**
   * Publish multiple messages to a channel.
   *
   * @param {string} channel
   * @param {*[]} messages
   * @return {Promise<*>}
   * @example
   * let messages = [
   *   'message 1',
   *   'message 2',
   * ];
   * adapter.publishBatch('my_channel', messages);
   */
  publishBatch(channel, messages) {
    let payloads = messages.map((message) => {
      return this.makeBuffer(message);
    });
    return this.getTopicForChannel(channel).then((topic) => {
      return topic.publish(payloads);
    });
  }

  /**
   * Create a buffer from a message payload.
   *
   * @param {*} message
   * @return {Buffer}
   * @example
   * adapter.makeBuffer('Hello World!');
   */
  makeBuffer(message) {
    return new Buffer(Utils.serializeMessagePayload(message));
  }
}

module.exports = GoogleCloudPubSubAdapter;
