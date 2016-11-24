# koa-simple-redis

[![Build Status](https://travis-ci.org/vicanso/koa-simple-redis.svg?style=flat-square)](https://travis-ci.org/vicanso/koa-simple-redis)
[![Coverage Status](https://img.shields.io/coveralls/vicanso/koa-simple-redis/master.svg?style=flat)](https://coveralls.io/r/vicanso/koa-simple-redis?branch=master)
[![npm](http://img.shields.io/npm/v/koa-simple-redis.svg?style=flat-square)](https://www.npmjs.org/package/koa-simple-redis)
[![Github Releases](https://img.shields.io/npm/dm/koa-simple-redis.svg?style=flat-square)](https://github.com/vicanso/koa-simple-redis)


Redis storage for koa session middleware/cache, based on [koa-redis](https://github.com/koajs/koa-redis).


## Installation

```
$ npm install koa-simple-redis
``` 

## Examples
  
View the [./examples](examples) directory for working examples. 

## API

### Constructor

- `options` [redis](https://www.npmjs.com/package/redis) options

```js
const Redis = require('koa-simple-redis');
const client = new Redis({
  url: 'redis://127.0.0.1:6379/2',
});
```

### set

- `id` data's id

- `data` data for cache

- `ttl` ttl for data, optional

Set data to the redis or with ttl.

```js
const Redis = require('koa-simple-redis');
const client = new Redis({
  url: 'redis://127.0.0.1:6379/2',
});
client.set('vicanso', {
  a: 1
}).then(() => {
  console.info('success');
});
client.set('jenny', {
  a: 1
}, 10 * 1000).then(() => {
  console.info('success');
});
```

### get

- `id` data's id

Get data from redis.

```js
const Redis = require('koa-simple-redis');
const client = new Redis({
  url: 'redis://127.0.0.1:6379/2',
});
client.set('vicanso', {
  a: 1
}).then(() => {
  return client.get('vicanso')
}).then(data => {
  console.info(data);
  console.info('success');
});

```

### destroy

- `id` data's id

Delete data for redis.

```js
const Redis = require('koa-simple-redis');
const client = new Redis({
  url: 'redis://127.0.0.1:6379/2',
});
client.set('vicanso', {
  a: 1
}).then(() => {
  return client.get('vicanso')
}).then(() => {
  console.info('success');
});

```

### ttl

- `id` data's id

- `ttl` the data's ttl

Get/Set the data's ttl

```js
const Redis = require('koa-simple-redis');
const client = new Redis({
  url: 'redis://127.0.0.1:6379/2',
});
client.set('vicanso', {
  a: 1
}, 10 * 1000).then(() => {
  return client.ttl('vicanso')
}).then((ttl) => {
  console.info('success');
  return client.ttl('vicanso', 30 * 1000);
});
```

### quid

Quit to connect reids.

```js
const Redis = require('koa-simple-redis');
const client = new Redis({
  url: 'redis://127.0.0.1:6379/2',
});
client.quit().then(() => {
  console.info('success');
});
```


## License

MIT