'use strict';

let chai = require('chai');
let expect = chai.expect;
let should = chai.should;
let chaiAsPromised = require('chai-as-promised');
let sinon = require('sinon');
let pubsub = require('@google-cloud/pubsub');
let GoogleCloudPubSubAdapter = require('../src/GoogleCloudPubSubAdapter');

chai.use(chaiAsPromised);
chai.should();

describe('GoogleCloudPubSubAdapter', () => {
  describe('construct instance', () => {
    it('should set the client property', () => {
      let client = sinon.createStubInstance(pubsub);
      let adapter = new GoogleCloudPubSubAdapter(client);
      expect(adapter.client).to.equal(client);
    });

    it('should set the clientIdentifier property', () => {
      let client = sinon.createStubInstance(pubsub);
      let adapter = new GoogleCloudPubSubAdapter(client, 'search-service');
      expect(adapter.clientIdentifier).to.equal('search-service');
    });

    it('should set the clientIdentifier property to a default value of null if not given', () => {
      let client = sinon.createStubInstance(pubsub);
      let adapter = new GoogleCloudPubSubAdapter(client);
      expect(adapter.clientIdentifier).to.be.null;
    });

    it('should set the autoCreateTopics property', () => {
      let client = sinon.createStubInstance(pubsub);
      let adapter = new GoogleCloudPubSubAdapter(client, 'search-service', false);
      expect(adapter.autoCreateTopics).to.be.false;
    });

    it('should set the autoCreateTopics property to a default value of true if not given', () => {
      let client = sinon.createStubInstance(pubsub);
      let adapter = new GoogleCloudPubSubAdapter(client);
      expect(adapter.autoCreateTopics).to.be.true;
    });

    it('should set the autoCreateSubscriptions property', () => {
      let client = sinon.createStubInstance(pubsub);
      let adapter = new GoogleCloudPubSubAdapter(client, 'search-service', false, false);
      expect(adapter.autoCreateSubscriptions).to.be.false;
    });

    it('should set the autoCreateSubscriptions property to a default value of true if not given', () => {
      let client = sinon.createStubInstance(pubsub);
      let adapter = new GoogleCloudPubSubAdapter(client);
      expect(adapter.autoCreateSubscriptions).to.be.true;
    });
  });

  describe('getTopicForChannel', () => {
    it('should return a promise', () => {
      let topic = sinon.createStubInstance(pubsub.Topic);
      topic.get = sinon.stub()
        .returns(new Promise((resolve, reject) => {}));

      let client = sinon.createStubInstance(pubsub);
      client.topic = sinon.stub()
        .returns(topic);

      let adapter = new GoogleCloudPubSubAdapter(client);
      let promise = adapter.getTopicForChannel('my_channel');

      expect(promise).to.be.a('promise');
    });

    it('should pass the channel name to the client.topic call', () => {
      let topic = sinon.createStubInstance(pubsub.Topic);
      topic.get = sinon.stub()
        .returns(new Promise((resolve, reject) => {}));

      let client = sinon.createStubInstance(pubsub);
      client.topic = sinon.stub()
        .returns(topic);

      let adapter = new GoogleCloudPubSubAdapter(client);
      adapter.getTopicForChannel('my_channel');

      sinon.assert.calledOnce(client.topic);
      sinon.assert.calledWith(client.topic, 'my_channel');
    });

    it('should pass the autoCreateTopics property to the topic.get call', () => {
      let topic = sinon.createStubInstance(pubsub.Topic);
      topic.get = sinon.stub()
        .returns(new Promise((resolve, reject) => {}));

      let client = sinon.createStubInstance(pubsub);
      client.topic = sinon.stub()
        .returns(topic);

      let adapter = new GoogleCloudPubSubAdapter(client, null, false);
      adapter.getTopicForChannel('my_channel');

      sinon.assert.calledOnce(topic.get);
      sinon.assert.calledWith(topic.get, {autoCreate: false});
    });

    it('should resolve a promise to a pubsub/topic on success', () => {
      let resolvedTopic = sinon.createStubInstance(pubsub.Topic);

      let topic = sinon.createStubInstance(pubsub.Topic);
      topic.get = sinon.stub()
        .returns(new Promise((resolve, reject) => resolve([resolvedTopic])));

      let client = sinon.createStubInstance(pubsub);
      client.topic = sinon.stub()
        .returns(topic);

      let adapter = new GoogleCloudPubSubAdapter(client);

      return adapter.getTopicForChannel('my_channel')
        .should.eventually.equal(resolvedTopic);
    });
  });

  describe('getSubscriptionForChannel', () => {
    it('should return a promise', () => {
      let subscription = sinon.createStubInstance(pubsub.Subscription);
      subscription.get = sinon.stub()
        .returns(new Promise((resolve, reject) => {}));

      let resolvedTopic = sinon.createStubInstance(pubsub.Topic);
      resolvedTopic.subscription = sinon.stub()
        .returns(subscription);

      let topic = sinon.createStubInstance(pubsub.Topic);
      topic.get = sinon.stub()
        .returns(new Promise((resolve, reject) => resolve([resolvedTopic]))
      );
      topic.subscription = sinon.stub()
        .returns(subscription);

      let client = sinon.createStubInstance(pubsub);
      client.topic = sinon.stub()
        .returns(topic);

      let adapter = new GoogleCloudPubSubAdapter(client);
      let promise = adapter.getSubscriptionForChannel('my_channel');

      expect(promise).to.be.a('promise');
    });

    it('should pass the clientIdentifier to the topic.subscription call', () => {
      let subscription = sinon.createStubInstance(pubsub.Subscription);
      subscription.get = sinon.stub()
        .returns(new Promise((resolve, reject) => resolve([null])));

      let resolvedTopic = sinon.createStubInstance(pubsub.Topic);
      resolvedTopic.subscription = sinon.stub()
        .returns(subscription);

      let topic = sinon.createStubInstance(pubsub.Topic);
      topic.get = sinon.stub()
        .returns(new Promise((resolve, reject) => resolve([resolvedTopic])));
      topic.subscription = sinon.stub()
        .returns(subscription);

      let client = sinon.createStubInstance(pubsub);
      client.topic = sinon.stub()
        .returns(topic);

      let adapter = new GoogleCloudPubSubAdapter(client, 'search');

      return adapter.getSubscriptionForChannel('my_channel').then(() => {
        sinon.assert.calledOnce(resolvedTopic.subscription);
        sinon.assert.calledWith(resolvedTopic.subscription, 'search');
      });
    });

    it('should pass a default clientIdentifier of "default" to the topic.subscription call when a clientIdentifier is not set', () => {
      let subscription = sinon.createStubInstance(pubsub.Subscription);
      subscription.get = sinon.stub()
        .returns(new Promise((resolve, reject) => resolve([null])));

      let resolvedTopic = sinon.createStubInstance(pubsub.Topic);
      resolvedTopic.subscription = sinon.stub()
        .returns(subscription);

      let topic = sinon.createStubInstance(pubsub.Topic);
      topic.get = sinon.stub()
        .returns(new Promise((resolve, reject) => resolve([resolvedTopic])));
      topic.subscription = sinon.stub()
        .returns(subscription);

      let client = sinon.createStubInstance(pubsub);
      client.topic = sinon.stub()
        .returns(topic);

      let adapter = new GoogleCloudPubSubAdapter(client);

      return adapter.getSubscriptionForChannel('my_channel').then(() => {
        sinon.assert.calledOnce(resolvedTopic.subscription);
        sinon.assert.calledWith(resolvedTopic.subscription, 'default');
      });
    });

    it('should resolve a promise to a pubsub/subscription on success', () => {
      let resolvedSubscription = sinon.createStubInstance(pubsub.Subscription);

      let subscription = sinon.createStubInstance(pubsub.Subscription);
      subscription.get = sinon.stub()
        .returns(new Promise((resolve, reject) => {
          resolve([resolvedSubscription]);
        }));

      let resolvedTopic = sinon.createStubInstance(pubsub.Topic);
      resolvedTopic.subscription = sinon.stub()
        .returns(subscription);

      let topic = sinon.createStubInstance(pubsub.Topic);
      topic.get = sinon.stub()
        .returns(new Promise((resolve, reject) => resolve([resolvedTopic])));
      topic.subscription = sinon.stub()
        .returns(subscription);

      let client = sinon.createStubInstance(pubsub);
      client.topic = sinon.stub()
        .returns(topic);

      let adapter = new GoogleCloudPubSubAdapter(client);

      return adapter.getSubscriptionForChannel('my_channel')
        .should.eventually.equal(resolvedSubscription);
    });
  });

  describe('subscribe', () => {
    it('should subscribe to messages on the subscription', () => {
      let resolvedSubscription = sinon.createStubInstance(pubsub.Subscription);
      resolvedSubscription.on = sinon.stub();

      let subscription = sinon.createStubInstance(pubsub.Subscription);
      subscription.get = sinon.stub()
        .returns(new Promise((resolve, reject) => {
          resolve([resolvedSubscription]);
        }));

      let resolvedTopic = sinon.createStubInstance(pubsub.Topic);
      resolvedTopic.subscription = sinon.stub()
        .returns(subscription);

      let topic = sinon.createStubInstance(pubsub.Topic);
      topic.get = sinon.stub()
        .returns(new Promise((resolve, reject) => resolve([resolvedTopic])));
      topic.subscription = sinon.stub()
        .returns(subscription);

      let client = sinon.createStubInstance(pubsub);
      client.topic = sinon.stub()
        .returns(topic);

      let adapter = new GoogleCloudPubSubAdapter(client);

      let handler = sinon.spy();

      return adapter.subscribe('my_channel', handler).then(() => {
        sinon.assert.calledOnce(resolvedSubscription.on);
        sinon.assert.calledWith(resolvedSubscription.on, 'message');
      });
    });

    it('should pass the message to the handler when a message is received', () => {
      let resolvedSubscription = sinon.createStubInstance(pubsub.Subscription);
      resolvedSubscription.on = sinon.stub();

      let subscription = sinon.createStubInstance(pubsub.Subscription);
      subscription.get = sinon.stub()
        .returns(new Promise((resolve, reject) => {
          resolve([resolvedSubscription]);
        }));

      let resolvedTopic = sinon.createStubInstance(pubsub.Topic);
      resolvedTopic.subscription = sinon.stub()
        .returns(subscription);

      let topic = sinon.createStubInstance(pubsub.Topic);
      topic.get = sinon.stub()
        .returns(new Promise((resolve, reject) => resolve([resolvedTopic])));
      topic.subscription = sinon.stub()
        .returns(subscription);

      let client = sinon.createStubInstance(pubsub);
      client.topic = sinon.stub()
        .returns(topic);

      let adapter = new GoogleCloudPubSubAdapter(client);

      let handler = sinon.spy();

      return adapter.subscribe('my_channel', handler).then(() => {
        resolvedSubscription.on.yield({
          data: 'Hello World!',
          ack: () => {},
        });

        sinon.assert.calledOnce(handler);
        sinon.assert.calledWith(handler, 'Hello World!');
      });
    });

    it('should pass an unserialized message to the handler when a message is received', () => {
      let resolvedSubscription = sinon.createStubInstance(pubsub.Subscription);
      resolvedSubscription.on = sinon.stub();

      let subscription = sinon.createStubInstance(pubsub.Subscription);
      subscription.get = sinon.stub()
        .returns(new Promise((resolve, reject) => {
          resolve([resolvedSubscription]);
        }));

      let resolvedTopic = sinon.createStubInstance(pubsub.Topic);
      resolvedTopic.subscription = sinon.stub()
        .returns(subscription);

      let topic = sinon.createStubInstance(pubsub.Topic);
      topic.get = sinon.stub()
        .returns(new Promise((resolve, reject) => resolve([resolvedTopic])));
      topic.subscription = sinon.stub()
        .returns(subscription);

      let client = sinon.createStubInstance(pubsub);
      client.topic = sinon.stub()
        .returns(topic);

      let adapter = new GoogleCloudPubSubAdapter(client);

      let handler = sinon.spy();

      return adapter.subscribe('my_channel', handler).then(() => {
        resolvedSubscription.on.yield({
          data: 'Hello World!',
          ack: () => {},
        });
        resolvedSubscription.on.yield({
          data: '{"hello":"world"}',
          ack: () => {},
        });

        sinon.assert.calledTwice(handler);

        sinon.assert.calledWith(handler, 'Hello World!');
        sinon.assert.calledWith(handler, {hello: 'world'});
      });
    });

    it('should ack the message after the message is passed to the handler', () => {
      let resolvedSubscription = sinon.createStubInstance(pubsub.Subscription);
      resolvedSubscription.on = sinon.stub();

      let subscription = sinon.createStubInstance(pubsub.Subscription);
      subscription.get = sinon.stub()
        .returns(new Promise((resolve, reject) => {
          resolve([resolvedSubscription]);
        }));

      let resolvedTopic = sinon.createStubInstance(pubsub.Topic);
      resolvedTopic.subscription = sinon.stub()
        .returns(subscription);

      let topic = sinon.createStubInstance(pubsub.Topic);
      topic.get = sinon.stub()
        .returns(new Promise((resolve, reject) => resolve([resolvedTopic])));
      topic.subscription = sinon.stub()
        .returns(subscription);

      let client = sinon.createStubInstance(pubsub);
      client.topic = sinon.stub()
        .returns(topic);

      let adapter = new GoogleCloudPubSubAdapter(client);

      let handler = sinon.spy();

      return adapter.subscribe('my_channel', handler).then(() => {
        let message = {
          data: 'Hello World!',
          ack: sinon.spy(),
        };
        resolvedSubscription.on.yield(message);

        sinon.assert.calledOnce(handler);
        sinon.assert.calledWith(handler, 'Hello World!');

        sinon.assert.calledOnce(message.ack);
      });
    });
  });

  describe('publish', () => {
    it('should publish the message to a topic', () => {
      let resolvedTopic = sinon.createStubInstance(pubsub.Topic);
      resolvedTopic.publish = sinon.stub();

      let topic = sinon.createStubInstance(pubsub.Topic);
      topic.get = sinon.stub()
        .returns(new Promise((resolve, reject) => resolve([resolvedTopic])));

      let client = sinon.createStubInstance(pubsub);
      client.topic = sinon.stub()
        .returns(topic);

      let adapter = new GoogleCloudPubSubAdapter(client);

      let promises = [];

      promises.push(adapter.publish('my_channel', 'Hello World!'));
      promises.push(adapter.publish('my_channel', '{"hello":"world"}'));

      return Promise.all(promises).then(() => {
        sinon.assert.calledTwice(resolvedTopic.publish);
        sinon.assert.calledWith(resolvedTopic.publish, 'Hello World!');
        sinon.assert.calledWith(resolvedTopic.publish, '{"hello":"world"}');
      });
    });
  });
});
