'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ESModel = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ESClient = require('./ESClient');

var _ResponseBody = require('./ResponseBody');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DEFAULT_SETTING = {
  index: {
    number_of_shards: 5,
    number_of_replicas: 1
  }
};

var ESModel = exports.ESModel = function () {
  function ESModel(CONFIG, Class) {
    _classCallCheck(this, ESModel);

    var _Class$_index = Class._index,
        _index = _Class$_index === undefined ? '' : _Class$_index,
        _Class$_type = Class._type,
        _type = _Class$_type === undefined ? '' : _Class$_type,
        _Class$_settings = Class._settings,
        _settings = _Class$_settings === undefined ? {} : _Class$_settings,
        _Class$_properties = Class._properties,
        _properties = _Class$_properties === undefined ? {} : _Class$_properties;

    this.CONFIG = CONFIG;
    this.Class = Class;
    this.index = _index;
    this.type = _type;
    this.settings = _settings;
    this.properties = _properties;

    // Method Hard-binding
    this.createIndex = this.createIndex.bind(this);
    this.removeIndex = this.removeIndex.bind(this);
    this.create = this.create.bind(this);
    this.createWithIndex = this.createWithIndex.bind(this);
    this.findById = this.findById.bind(this);
    this.search = this.search.bind(this);
    this.scan = this.scan.bind(this);
    this.scroll = this.scroll.bind(this);
    this.update = this.update.bind(this);
    this.remove = this.remove.bind(this);
    this.removeBy = this.removeBy.bind(this);
  }

  _createClass(ESModel, [{
    key: 'createIndex',
    value: function createIndex(callback) {
      var CONFIG = this.CONFIG,
          index = this.index,
          type = this.type,
          settings = this.settings,
          properties = this.properties;

      var Client = new _ESClient.ESClient(CONFIG);
      var body = {
        settings: Object.assign({}, DEFAULT_SETTING, settings),
        mappings: _defineProperty({}, type, { properties: properties })
      };

      Client.indices.create({
        index: index,
        body: body
      }, function (error, response) {
        if (error) {
          var status = error.status,
              displayName = error.displayName,
              message = error.message;

          var responseBody = new _ResponseBody.ResponseBody(status, displayName, message);
          return callback(responseBody);
        }

        callback(null, response);
      });
    }
  }, {
    key: 'removeIndex',
    value: function removeIndex(callback) {
      var CONFIG = this.CONFIG,
          index = this.index;

      var Client = new _ESClient.ESClient(CONFIG);

      Client.indices.delete({
        index: index
      }, function (error, response) {
        if (error) {
          var status = error.status,
              displayName = error.displayName;

          var err = new _ResponseBody.ResponseBody(status, displayName, error);
          return callback(err);
        }

        return callback();
      });
    }
  }, {
    key: 'create',
    value: function create(attrs, callback) {
      var CONFIG = this.CONFIG,
          Class = this.Class,
          index = this.index,
          type = this.type;

      var Client = new _ESClient.ESClient(CONFIG);
      var body = new Class(attrs);
      var id = body.id;


      Client.create({
        index: index,
        type: type,
        id: id,
        body: body
      }, function (error, response) {
        if (error) {
          var status = error.status,
              displayName = error.displayName;

          var responseBody = new _ResponseBody.ResponseBody(status, displayName, error);
          return callback(responseBody);
        }

        return callback(null, body);
      });
    }
  }, {
    key: 'createWithIndex',
    value: function createWithIndex(attrs, options, callback) {
      var CONFIG = this.CONFIG,
          Class = this.Class,
          type = this.type;

      var body = new Class(attrs);
      var id = body.id;
      var getDynamicIndex = options.getDynamicIndex;


      if (typeof getDynamicIndex !== 'function') {
        var err = new _ResponseBody.ResponseBody(500, "Require 'getDynamicIndex()' to Create Document");
        return process.nextTick(function () {
          return callback(err);
        });
      }

      var index = getDynamicIndex(body);
      if (!index) {
        var _err = new _ResponseBody.ResponseBody(500, "Invalid Index Found: '" + index + "'");
        return process.nextTick(function () {
          return callback(_err);
        });
      }

      async.waterfall([
      // Check if Index Exists
      function (next) {
        var Client = new _ESClient.ESClient(CONFIG);
        Client.indices.exists({ index: index }, function (error, indexExists) {
          Client.close();
          next(error, indexExists);
        });
      },

      // Create Index if it does not Exist
      function (indexExists, next) {
        if (!indexExists) {
          return process.nextTick(next);
        }

        var Client = new _ESClient.ESClient(CONFIG);
        Client.indices.create({
          index: index,
          body: body
        }, function (error, response) {
          Client.close();

          if (error) {
            var status = error.status,
                displayName = error.displayName,
                message = error.message;

            var responseBody = new _ResponseBody.ResponseBody(status || 500, displayName, message);
            return next(responseBody);
          }

          next();
        });
      },

      // Create Document
      function (next) {
        var Client = new _ESClient.ESClient(CONFIG);
        Client.create({
          index: index,
          type: type,
          id: id,
          body: body
        }, function (error, response) {
          Client.close();

          if (error) {
            var status = error.status,
                displayName = error.displayName;

            var responseBody = new _ResponseBody.ResponseBody(status, displayName, error);
            return next(responseBody);
          }

          return next(null, body);
        });
      }], callback);
    }
  }, {
    key: 'findById',
    value: function findById(id, callback) {
      var CONFIG = this.CONFIG,
          index = this.index,
          type = this.type;

      var Client = new _ESClient.ESClient(CONFIG);

      Client.get({
        index: index,
        type: type,
        id: id
      }, function (error, response) {
        if (error) {
          var status = error.status,
              displayName = error.displayName;

          var responseBody = new _ResponseBody.ResponseBody(status, displayName, error);
          return callback(responseBody);
        }

        var found = response.found,
            _source = response._source;

        if (!found) {
          _source = null;
        }
        return callback(null, _source);
      });
    }
  }, {
    key: 'search',
    value: function search(body, callback) {
      var CONFIG = this.CONFIG,
          index = this.index;

      var Client = new _ESClient.ESClient(CONFIG);

      Client.search({
        index: index,
        body: body
      }, function (error, response) {
        if (error) {
          var status = error.status,
              displayName = error.displayName;

          var responseBody = new _ResponseBody.ResponseBody(status, displayName, error);
          return callback(responseBody);
        }

        var hits = response.hits.hits;

        hits = hits.sort(function (a, b) {
          return b._score - a._score;
        });
        hits = hits.map(function (hit) {
          var _score = hit._score,
              _source = hit._source;

          return Object.assign({ _score: _score }, _source);
        });
        return callback(null, hits);
      });
    }
  }, {
    key: 'scan',
    value: function scan(callback) {
      var CONFIG = this.CONFIG,
          index = this.index;

      var Client = new _ESClient.ESClient(CONFIG);
      var body = {
        query: {
          match_all: {}
        },
        size: 100
      };

      Client.search({
        index: index,
        body: body
      }, function (error, response) {
        if (error) {
          var status = error.status,
              displayName = error.displayName;

          var responseBody = new _ResponseBody.ResponseBody(status, displayName, error);
          return callback(responseBody);
        }

        var hits = response.hits.hits;

        hits = hits.sort(function (a, b) {
          return b._score - a._score;
        });
        hits = hits.map(function (hit) {
          var _score = hit._score,
              _source = hit._source;

          return Object.assign({ _score: _score }, _source);
        });
        return callback(null, hits);
      });
    }
  }, {
    key: 'scroll',
    value: function scroll(params, callback) {
      var CONFIG = this.CONFIG,
          index = this.index;

      var Client = new _ESClient.ESClient(CONFIG);
      var query = params.query,
          scrollDuration = params.scrollDuration;

      var body = { query: query };
      var allRecords = [];

      var responseHandler = function responseHandler(error, response) {
        if (error) {
          var status = error.status,
              displayName = error.displayName;

          var responseBody = new _ResponseBody.ResponseBody(status, displayName, error);
          return callback(responseBody);
        }

        var _response$hits = response.hits,
            hits = _response$hits === undefined ? {} : _response$hits;

        var allHits = hits.hits || [];

        allHits.forEach(function (hit) {
          return allRecords.push(hit._source);
        });

        if (hits.total === allRecords.length) {
          return callback(null, allRecords);
        }

        Client.scroll({
          scrollId: response._scroll_id,
          scroll: scrollDuration
        }, responseHandler);
      };

      Client.search({
        index: index,
        scroll: scrollDuration,
        body: body
      }, responseHandler);
    }
  }, {
    key: 'update',
    value: function update(attrs, callback) {
      var CONFIG = this.CONFIG,
          index = this.index,
          type = this.type,
          Class = this.Class;

      var Client = new _ESClient.ESClient(CONFIG);
      var doc = new Class(attrs);
      var id = doc.id;

      var body = { doc: doc };

      Client.update({
        index: index,
        type: type,
        id: id,
        body: body
      }, function (error, response) {
        if (error) {
          var status = error.status,
              displayName = error.displayName,
              message = error.message;

          var responseBody = new _ResponseBody.ResponseBody(status, displayName, message);
          return callback(responseBody);
        }

        callback(null, response);
      });
    }
  }, {
    key: 'remove',
    value: function remove(id, callback) {
      var CONFIG = this.CONFIG,
          index = this.index,
          type = this.type;

      var Client = new _ESClient.ESClient(CONFIG);

      Client.delete({
        index: index,
        type: type,
        id: id
      }, function (error, response) {
        if (error) {
          var status = error.status,
              displayName = error.displayName;

          var responseBody = new _ResponseBody.ResponseBody(status, displayName, error);
          return callback(responseBody);
        }

        return callback();
      });
    }
  }, {
    key: 'removeBy',
    value: function removeBy(query, callback) {
      var CONFIG = this.CONFIG,
          index = this.index;

      var Client = new _ESClient.ESClient(CONFIG);
      var body = { query: query };

      Client.deleteByQuery({
        index: index,
        body: body
      }, function (error, response) {
        if (error) {
          var status = error.status,
              displayName = error.displayName,
              message = error.message;

          var responseBody = new _ResponseBody.ResponseBody(status, displayName, message);
          return callback(responseBody);
        }

        callback(null, response);
      });
    }
  }]);

  return ESModel;
}();