'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ESClient = undefined;

var _elasticsearch = require('elasticsearch');

var _elasticsearch2 = _interopRequireDefault(_elasticsearch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ESClient = exports.ESClient = function ESClient(CONFIG) {
  var _CONFIG$AUTH = CONFIG.AUTH,
      AUTH = _CONFIG$AUTH === undefined ? {} : _CONFIG$AUTH,
      _CONFIG$ES = CONFIG.ES,
      ES = _CONFIG$ES === undefined ? {} : _CONFIG$ES;
  var _AUTH$ACCESS_KEY_ID = AUTH.ACCESS_KEY_ID,
      ACCESS_KEY_ID = _AUTH$ACCESS_KEY_ID === undefined ? '' : _AUTH$ACCESS_KEY_ID,
      _AUTH$SECRET_ACCESS_K = AUTH.SECRET_ACCESS_KEY,
      SECRET_ACCESS_KEY = _AUTH$SECRET_ACCESS_K === undefined ? '' : _AUTH$SECRET_ACCESS_K;
  var _ES$REGION = ES.REGION,
      REGION = _ES$REGION === undefined ? '' : _ES$REGION,
      _ES$HOST = ES.HOST,
      HOST = _ES$HOST === undefined ? '' : _ES$HOST;

  var ES_CONFIG = {
    service: 'es',
    region: REGION,
    host: HOST,
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY
  };
  return new _elasticsearch2.default.Client(ES_CONFIG);
};