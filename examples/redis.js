'use strict';
const Redis = require('..')
const delay = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
};
const client = new Redis({
  url: 'redis://127.0.0.1:6379/2',
});
client.on('error', err => {
  console.error(err);
});
client.on('connect', () => {
  console.info('connect');
});

client.set('vicanso', {
  name: 'tree.xie',
  pwd: '123456',
}).then(() => {
  return client.get('vicanso');
}).then(data => {
  // { name: 'tree.xie', pwd: '123456' }
  console.info(data);
  return client.destroy('vicanso');
}).then(data => {
  console.info(data);
}).catch(err => {
  console.error(err);
});

client.set('jenny', {
  name: 'jenny.ou',
  pwd: '123456',
}, 10 * 1000).then(() => {
  return client.get('jenny');
}).then(data => {
  // { name: 'jenny.ou', pwd: '123456' }
  console.info(data);
  return client.ttl('jenny');
}).then(ttl => {
  // 10
  console.info(ttl);
  return delay(11 * 1000);
}).then(() => {
  return client.get('jenny');
}).then(data => {
  // null
  console.info(data);
}).catch(err => {
  console.error(err);
});