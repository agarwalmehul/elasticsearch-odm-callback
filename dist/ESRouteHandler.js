'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ESRouteHandler = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _ResponseBody = require('./ResponseBody');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ESRouteHandler = exports.ESRouteHandler = function () {
  function ESRouteHandler(Model) {
    _classCallCheck(this, ESRouteHandler);

    this.Model = Model;

    // Method Hard-Binding to allow them to be assigned to
    // other variables and work as expected
    this.createIndex = this.createIndex.bind(this);
    this.removeIndex = this.removeIndex.bind(this);
    this.create = this.create.bind(this);
    this.findById = this.findById.bind(this);
    this.search = this.search.bind(this);
    this.scan = this.scan.bind(this);
    this.remove = this.remove.bind(this);
    this._handleError = this._handleError.bind(this);
  }

  _createClass(ESRouteHandler, [{
    key: 'createIndex',
    value: function createIndex(request, response) {
      var _this = this;

      var Model = this.Model;


      Model.createIndex(function (error) {
        var responseBody = void 0;
        if (_this._handleError(error, response)) {
          return;
        }

        responseBody = new _ResponseBody.ResponseBody(200, 'OK');
        response.statusMessage = responseBody.message;
        response.status(responseBody.statusCode).json(responseBody);
      });
    }
  }, {
    key: 'removeIndex',
    value: function removeIndex(request, response) {
      var _this2 = this;

      var Model = this.Model;


      Model.removeIndex(function (error) {
        var responseBody = void 0;
        if (_this2._handleError(error, response)) {
          return;
        }

        responseBody = new _ResponseBody.ResponseBody(200, 'OK');
        response.statusMessage = responseBody.message;
        response.status(responseBody.statusCode).json(responseBody);
      });
    }
  }, {
    key: 'create',
    value: function create(request, response, next) {
      var _this3 = this;

      if (response.body) {
        return process.nextTick(next);
      }

      var Model = this.Model;
      var body = request.body;


      Model.create(body, function (error, data) {
        var responseBody = void 0;
        if (_this3._handleError(error, response)) {
          return next();
        }

        responseBody = new _ResponseBody.ResponseBody(201, 'OK', data);
        response.body = responseBody;
        next();
      });
    }
  }, {
    key: 'findById',
    value: function findById(request, response, next) {
      var _this4 = this;

      if (response.body) {
        return process.nextTick(next);
      }

      var Model = this.Model;
      var params = request.params;
      var id = params.id;


      Model.findById(id, function (error, data) {
        var responseBody = void 0;
        if (_this4._handleError(error, response)) {
          return next();
        }

        responseBody = new _ResponseBody.ResponseBody(200, 'OK', data);
        response.body = responseBody;
        next();
      });
    }
  }, {
    key: 'search',
    value: function search(request, response, next) {
      var _this5 = this;

      if (response.body) {
        return process.nextTick(next);
      }

      var Model = this.Model;
      var query = request.query;


      Model.search({ match: query }, function (error, data) {
        var responseBody = void 0;
        if (_this5._handleError(error, response)) {
          return next();
        }

        responseBody = new _ResponseBody.ResponseBody(200, 'OK', data);
        response.body = responseBody;
        next();
      });
    }
  }, {
    key: 'scan',
    value: function scan(request, response, next) {
      var _this6 = this;

      if (response.body) {
        return process.nextTick(next);
      }

      var Model = this.Model;


      Model.scan(function (error, data) {
        var responseBody = void 0;
        if (_this6._handleError(error, response)) {
          return next();
        }

        responseBody = new _ResponseBody.ResponseBody(200, 'OK', data);
        response.body = responseBody;
        next();
      });
    }
  }, {
    key: 'remove',
    value: function remove(request, response, next) {
      var _this7 = this;

      if (response.body) {
        return process.nextTick(next);
      }

      var Model = this.Model;
      var params = request.params;
      var id = params.id;


      Model.remove(id, function (error) {
        var responseBody = void 0;
        if (_this7._handleError(error, response)) {
          return next();
        }

        responseBody = new _ResponseBody.ResponseBody(200, 'OK');
        response.body = responseBody;
        next();
      });
    }
  }, {
    key: '_handleError',
    value: function _handleError(error, response) {
      var responseBody = void 0;

      if (error && error.constructor.name === 'ResponseBody') {
        response.body = error;
        return true;
      } else if (error) {
        responseBody = new _ResponseBody.ResponseBody(500, error.toString(), error);
        response.body = responseBody;
        return true;
      }

      return false;
    }
  }]);

  return ESRouteHandler;
}();