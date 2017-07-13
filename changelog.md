# Changelog

## 2.0.3 - 2017-07-13

* Fix double json encoding by passing a buffer when publishing methods with client

## 2.0.2 - 2017-05-19

* Fix incorrect subscription name being created - should have channel prefixed

## 2.0.0 - 2017-05-17

* Bump up @superbalist/js-pubsub to ^2.0.0
* Add new publishBatch method to GoogleCloudPubSubAdapter

## 1.0.2 - 2017-05-15

* Serialize message payload upon publishing

## 1.0.1 - 2017-05-09

* Transpile ES6 -> ES5 at build time

## 1.0.0 - 2017-05-08

* Switch to ESLint & Google Javascript Style Guide
* Add JSDoc documentation
* Add unit tests
* Fix broken module export for GoogleCloudPubSubAdapter
* Change `subscribe` to return a promise
* Change `publish` to return a promise

## 0.0.1 - 2017-05-02

* Initial release
