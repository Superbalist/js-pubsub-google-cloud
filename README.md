# @superbalist/js-pubsub-google-cloud

A Google Cloud adapter for the [js-pubsub](https://github.com/Superbalist/js-pubsub) package.

[![Author](http://img.shields.io/badge/author-@superbalist-blue.svg?style=flat-square)](https://twitter.com/superbalist)
[![Build Status](https://img.shields.io/travis/Superbalist/js-pubsub-google-cloud/master.svg?style=flat-square)](https://travis-ci.org/Superbalist/js-pubsub-google-cloud)
[![Software License](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@superbalist/js-pubsub-google-cloud.svg)](https://www.npmjs.com/package/@superbalist/js-pubsub-google-cloud)
[![NPM Downloads](https://img.shields.io/npm/dt/@superbalist/js-pubsub-google-cloud.svg)](https://www.npmjs.com/package/@superbalist/js-pubsub-google-cloud)


## Installation

```bash
npm install @superbalist/js-pubsub-google-cloud
```
    
## Usage

```node
"use strict";

let pubsub = require('@google-cloud/pubsub');
let GoogleCloudPubSubAdapter = require('@superbalist/js-pubsub-google-cloud');

process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/your-gcloud-key.json';

let client = pubsub({
  projectId: 'your-project-id-here'
});

let adapter = new GoogleCloudPubSubAdapter(client);

// disable auto topic & subscription creation
adapter.autoCreateTopics = false; // this is true by default
adapter.autoCreateSubscriptions = false; // this is true by default

// set a unique client identifier for the subscriber
adapter.clientIdentifier = 'search_service';

// consume messages
// note: this is a blocking call
adapter.subscribe('my_channel', (message) => {
  console.log(message);
  console.log(typeof message);
});

// publish messages
adapter.publish('my_channel', {first_name: 'Matthew'});
adapter.publish('my_channel', 'Hello World');

// publish multiple messages
let messages = [
  'message 1',
  'message 2',
];
adapter.publishBatch('my_channel', messages);
```

## Examples

The library comes with [examples](examples) for the adapter and a [Dockerfile](Dockerfile) for
running the example scripts.

Run `make up`.

You will start at a `bash` prompt in the `/usr/src/app` directory.

If you need another shell to publish a message to a blocking consumer, you can run `docker-compose run js-pubsub-google-cloud /bin/bash`

To run the examples:
```bash
$ node examples/GoogleCloudConsumerExample.js
$ node examples/GoogleCloudPublishExample.js (in a separate shell)
```
