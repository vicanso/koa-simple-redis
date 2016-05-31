'use strict';
const redis = require('redis');
const Redis = require('..');
const assert = require('assert');

describe('kog-simple-redis', () => {
  it('should connect and ready with external client and quit ok', done => {
    const store = new Redis();
    store.once('connect', () => {
      assert.equal(store.connected, true);
    });
    store.once('ready', () => {
      store.quit();
    });
    store.once('disconnect', () => {
      assert.equal(store.connected, false);
      done();
    });
  });

  it('should connect and ready with duplicated external client and disconnect ok', done => {
    const store = new Redis({
      client: redis.createClient(),
      duplicate: true,
    });

    store.once('connect', () => {
      assert.equal(store.connected, true);
    });
    store.once('ready', () => {
      store.quit();
    });
    store.once('disconnect', () => {
      assert.equal(store.connected, false);
      done();
    });
  });

  it('should set and delete with db ok', done => {
    const store = new Redis({
      url: 'redis://127.0.0.1:6379/2',
    });
    const key = 'key:db1';
    store.set(key, {
      a: 2,
    }).then(() => {
      return store.get(key);
    }).then(data => {
      assert.equal(data.a, 2);
      return store.destroy(key);
    }).then((data) => {
      return store.get(key);
    }).then(data => {
      assert.equal(data, null);
      return store.quit();
    }).then(() => {
      done();
    }).catch(done);
  });

  it('should set with ttl ok', done => {
    const store = new Redis();
    const key = 'key:ttl';
    const oneDay = 24 * 3600;
    store.set(key, {
      a: 1,
    }, oneDay * 1000).then(() => {
      return store.get(key);
    }).then(data => {
      assert.equal(data.a, 1);
      return store.ttl(key);
    }).then(ttl => {
      assert.equal(ttl, oneDay);
      return store.quit();
    }).then(() => {
      done();
    }).catch(done);
  });

  it('should not throw error with bad JSON', done => {
    const store = new Redis();
    const key = 'key:badKey';
    store.client.set(key, '{I will cause an error!}', err => {
      if (err) {
        return done(err);
      }
      store.get(key).then(data => {
        assert.equal(data, null);
        return store.quit();
      }).then(() => {
        done();
      }).catch(done);
    });
  });

  it('should set without ttl ok', done => {
    const store = new Redis();
    const key = 'key:nottl';
    store.set(key, {
      a: 1,
    }).then(() => {
      return store.get(key);
    }).then(data => {
      assert.equal(data.a, 1);
      return store.quit();
    }).then(() => {
      done();
    }).catch(done);
  });

  it('should destroy ok', done => {
    const store = new Redis();
    const keyList = ['key:nottl', 'key:ttl', 'key:badKey'];
    const fns = keyList.map(key => {
      return store.destroy(key).then(() => {
        return store.get(key);
      }).then(data => {
        assert.equal(data, null);
      });
    });
    Promise.all(fns).then(() => {
      return store.quit();
    }).then(() => {
      done();
    }).catch(done);
  });

  it('should expire after 1s', done => {
    const store = new Redis();
    const key = 'key:ttl2';
    return store.set(key, {
      a: 1,
      b: 2,
    }, 1000).then(() => {
      return store.get(key)
    }).then(data => {
      assert.equal(data.a, 1);
      assert.equal(data.b, 2);
      return new Promise((resolve, reject) => {
        setTimeout(resolve, 1200);
      });
    }).then(() => {
      return store.get(key);
    }).then(data => {
      assert.equal(data, null);
      return store.end();
    }).then(() => {
      done();
    }).catch(done);
  });
});
