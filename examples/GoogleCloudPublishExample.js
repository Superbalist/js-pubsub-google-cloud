'use strict';

let pubsub = require('@google-cloud/pubsub');
let GoogleCloudPubSubAdapter = require('../lib/GoogleCloudPubSubAdapter');

process.env.GOOGLE_APPLICATION_CREDENTIALS = '/usr/src/app/examples/your-gcloud-key.json';

let client = pubsub({
  projectId: 'your-project-id-here',
});

let adapter = new GoogleCloudPubSubAdapter(client);
adapter.publish('my_channel', {first_name: 'Matthew'});
adapter.publish('my_channel', 'Hello World');
