/* eslint strict:0 */

'use strict';

const pkg = require('./package');
const debug = require('debug')(pkg.name);
const EventEmitter = require('events');

const map = new WeakMap();
const redis = require('redis');

class Redis extends EventEmitter {
  constructor(opts) {
    super();
    const options = opts || {};
    let client;
    if (!options.client) {
      debug('init redis new client');
      client = redis.createClient(options);
    } else if (options.duplicate) {
      debug('Duplicating provided client with new options (if provided)');
      const dupClient = options.client;
      delete options.client;
      delete options.duplicate;
      client = dupClient.duplicate(options);
    } else {
      debug('Using provided client');
      client = options.client;
    }
    const data = {
      client,
      connected: client.connected,
    };

    client.on('error', this.emit.bind(this, 'error'));
    client.on('end', this.emit.bind(this, 'end'));
    client.on('end', this.emit.bind(this, 'disconnect'));
    client.on('connect', this.emit.bind(this, 'connect'));
    client.on('reconnecting', this.emit.bind(this, 'reconnecting'));
    client.on('ready', this.emit.bind(this, 'ready'));
    client.on('warning', this.emit.bind(this, 'warning'));

    this.on('connect', () => {
      debug('connected to redis');
      data.connected = client.connected;
    });

    this.on('ready', () => {
      debug('redis ready');
    });

    this.on('end', () => {
      debug('redis end');
      data.connected = client.connected;
    });

    this.on('error', () => {
      debug('redis error');
      data.connected = client.connected;
    });

    this.on('reconnecting', () => {
      debug('redis reconnecting');
      data.connected = client.connected;
    });

    this.on('warning', () => {
      debug('redis warning');
      data.connected = client.connected;
    });

    map.set(this, data);
  }

  get connected() {
    return map.get(this).connected;
  }

  get client() {
    return map.get(this).client;
  }

  get(sid) {
    const client = this.client;
    return new Promise((resolve, reject) => {
      client.get(sid, (err, data) => {
        /* istanbul ignore if */
        if (err) {
          reject(err);
        } else {
          debug('get session: %s', data || 'none');
          if (!data) {
            resolve(data);
            return;
          }
          try {
            resolve(JSON.parse(data.toString()));
          } catch (e) {
            // ignore err
            debug('parse session error: %s', e.message);
            resolve(null);
          }
        }
      });
    });
  }

  set(sid, _sess, _ttl) {
    const ttl = typeof _ttl === 'number' ? Math.ceil(_ttl / 1000) : 0;
    const sess = JSON.stringify(_sess);
    const client = this.client;
    return new Promise((resolve, reject) => {
      const cb = (err, data) => {
        /* istanbul ignore if */
        if (err) {
          reject(err);
        } else {
          debug('SET %s complete', sid);
          resolve(data);
        }
      };
      if (ttl) {
        debug('SETEX %s %s %s', sid, ttl, sess);
        client.setex(sid, ttl, sess, cb);
      } else {
        debug('SET %s %s', sid, sess);
        client.set(sid, sess, cb);
      }
    });
  }

  destroy(sid) {
    const client = this.client;
    return new Promise((resolve, reject) => {
      debug('DEL %s', sid);
      client.del(sid, (err, data) => {
        /* istanbul ignore if */
        if (err) {
          reject(err);
        } else {
          debug('DEL %s complete', sid);
          resolve(data);
        }
      });
    });
  }

  ttl(sid, _ttl) {
    const client = this.client;
    const ttl = typeof _ttl === 'number' ? Math.ceil(_ttl / 1000) : 0;
    return new Promise((resolve, reject) => {
      // has ttl, update the sid ttl
      if (ttl) {
        debug('Set TTL %s %d', sid, ttl);
        client.expire(sid, ttl, (err) => {
          /* istanbul ignore if */
          if (err) {
            reject(err);
          } else {
            debug('Get TTL %s complete', sid);
            resolve();
          }
        });
      } else {
        debug('Get TTL %s', sid);
        client.ttl(sid, (err, data) => {
          /* istanbul ignore if */
          if (err) {
            reject(err);
          } else {
            debug('Get TTL %s complete', sid);
            resolve(data * 1000);
          }
        });
      }
    });
  }

  quit() {
    const client = this.client;
    return new Promise((resolve, reject) => {
      debug('quitting redis client');
      client.quit((err, data) => {
        /* istanbul ignore if */
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  end() {
    return this.quit();
  }
}

module.exports = Redis;
