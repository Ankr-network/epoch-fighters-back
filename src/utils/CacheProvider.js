const NodeCache = require( "node-cache" );

class CacheProvider {
  constructor() {
    this.cache = new NodeCache();
  }

  set(key, value) {
    this.cache.set(key, value);
  }

  get(key) {
    this.cache.get(key);
  }
}

module.exports = new CacheProvider();
