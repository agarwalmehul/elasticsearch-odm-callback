"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ResponseBody = exports.ResponseBody = function ResponseBody(statusCode, message, data) {
  _classCallCheck(this, ResponseBody);

  this.statusCode = statusCode;
  this.message = message;
  this.data = data;
};