'use strict';

let pubsub = require('@google-cloud/pubsub');
let GoogleCloudPubSubAdapter = require('../lib/GoogleCloudPubSubAdapter');

process.env.GOOGLE_APPLICATION_CREDENTIALS = '/usr/src/app/examples/your-gcloud-key.json';

let client = pubsub({
  projectId: 'your-project-id-here',
});

let adapter = new GoogleCloudPubSubAdapter(client);
adapter.subscribe('my_channel', (message) => {
  console.log(message);
  console.log(typeof message);
});
