(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["IdP"] = factory();
	else
		root["IdP"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _provider = __webpack_require__(2);

var _provider2 = _interopRequireDefault(_provider);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _possibleConstructorReturn(self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }return call && ((typeof call === "undefined" ? "undefined" : _typeof(call)) === "object" || typeof call === "function") ? call : self;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : _typeof(superClass)));
  }subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

var IdP = function (_Provider) {
  _inherits(IdP, _Provider);

  function IdP(config) {
    _classCallCheck(this, IdP);

    if (!config && !config.endpoint) throw new TypeError('Missing `endpoint` in config');

    var _this = _possibleConstructorReturn(this, (IdP.__proto__ || Object.getPrototypeOf(IdP)).call(this));

    _this.endpoint = config.endpoint;
    return _this;
  }

  _createClass(IdP, [{
    key: 'accessTokenRequest',
    value: function accessTokenRequest(authKey, _ref) {
      var client_token = _ref.client_token,
          grant_type = _ref.grant_type;

      if (!authKey) throw new TypeError('Incorrect parameter \'authKey\': ' + authKey);
      if (!client_token) throw new TypeError('Incorrect parameters \'client_token\': ' + client_token);
      if (!grant_type) throw new TypeError('Incorrect parameters \'grant_type\': ' + grant_type);

      var uri = this.endpoint + '/auth/' + authKey + '/token';

      return new Request(uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_token: client_token,
          grant_type: grant_type
        })
      });
    }
  }, {
    key: 'refreshAccessTokenRequest',
    value: function refreshAccessTokenRequest(id, refreshToken) {
      if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
      if (!refreshToken) throw new TypeError('Incorrect parameter \'refreshToken\': ' + refreshToken);

      var uri = this.endpoint + '/accounts/' + id + '/refresh';

      return new Request(uri, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + refreshToken
        }
      });
    }
  }, {
    key: 'revokeRefreshTokenRequest',
    value: function revokeRefreshTokenRequest(id, refreshToken) {
      if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
      if (!refreshToken) throw new TypeError('Incorrect parameter \'refreshToken\': ' + refreshToken);

      var uri = this.endpoint + '/accounts/' + id + '/revoke';

      return new Request(uri, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + refreshToken
        }
      });
    }
  }, {
    key: 'linkRequest',
    value: function linkRequest(authKey, _ref2, accessToken) {
      var client_token = _ref2.client_token,
          grant_type = _ref2.grant_type;

      if (!authKey) throw new TypeError('Incorrect parameter \'authKey\': ' + authKey);
      if (!client_token) throw new TypeError('Incorrect parameters \'client_token\': ' + client_token);
      if (!grant_type) throw new TypeError('Incorrect parameters \'grant_type\': ' + grant_type);
      if (!accessToken) throw new TypeError('Incorrect parameter \'accessToken\': ' + accessToken);

      var uri = this.endpoint + '/auth/' + authKey + '/link';

      return new Request(uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify({
          client_token: client_token,
          grant_type: grant_type
        })
      });
    }
  }, {
    key: 'authRequest',
    value: function authRequest(id, accessToken) {
      if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
      if (!accessToken) throw new TypeError('Incorrect parameter \'accessToken\': ' + accessToken);

      var uri = this.endpoint + '/accounts/' + id + '/auth';

      return new Request(uri, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
    }
  }, {
    key: 'unlinkRequest',
    value: function unlinkRequest(id, authKey, accessToken) {
      if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
      if (!authKey) throw new TypeError('Incorrect parameter \'authKey\': ' + authKey);
      if (!accessToken) throw new TypeError('Incorrect parameter \'accessToken\': ' + accessToken);

      var uri = this.endpoint + '/accounts/' + id + '/auth/' + authKey;

      return new Request(uri, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
    }
  }, {
    key: 'accountRequest',
    value: function accountRequest(id, accessToken) {
      if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
      if (!accessToken) throw new TypeError('Incorrect parameter \'accessToken\': ' + accessToken);

      var uri = this.endpoint + '/accounts/' + id;

      return new Request(uri, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
    }
  }, {
    key: 'removeAccountRequest',
    value: function removeAccountRequest(id, accessToken) {
      if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
      if (!accessToken) throw new TypeError('Incorrect parameter \'accessToken\': ' + accessToken);

      var uri = this.endpoint + '/accounts/' + id;

      return new Request(uri, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
    }
  }, {
    key: 'isEnabledRequest',
    value: function isEnabledRequest(id, accessToken) {
      if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
      if (!accessToken) throw new TypeError('Incorrect parameter \'accessToken\': ' + accessToken);

      var uri = this.endpoint + '/accounts/' + id + '/enabled';

      return new Request(uri, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
    }
  }, {
    key: 'enableRequest',
    value: function enableRequest(id, accessToken) {
      if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
      if (!accessToken) throw new TypeError('Incorrect parameter \'accessToken\': ' + accessToken);

      var uri = this.endpoint + '/accounts/' + id + '/enabled';

      return new Request(uri, {
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
    }
  }, {
    key: 'disableRequest',
    value: function disableRequest(id, accessToken) {
      if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
      if (!accessToken) throw new TypeError('Incorrect parameter \'accessToken\': ' + accessToken);

      var uri = this.endpoint + '/accounts/' + id + '/enabled';

      return new Request(uri, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
    }
  }]);

  return IdP;
}(_provider2.default);

exports.default = IdP;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Provider = function () {
  function Provider() {
    _classCallCheck(this, Provider);
  }

  _createClass(Provider, [{
    key: 'accessTokenRequest',
    value: function accessTokenRequest() {
      throw new TypeError('Abstract method `accessTokenRequest` is not implemented');
    }
  }, {
    key: 'refreshAccessTokenRequest',
    value: function refreshAccessTokenRequest() {
      throw new TypeError('Abstract method `refreshAccessTokenRequest` is not implemented');
    }
  }, {
    key: 'revokeRefreshTokenRequest',
    value: function revokeRefreshTokenRequest() {
      throw new TypeError('Abstract method `revokeRefreshTokenRequest` is not implemented');
    }
  }, {
    key: 'linkRequest',
    value: function linkRequest() {
      throw new TypeError('Abstract method `linkRequest` is not implemented');
    }
  }, {
    key: 'authRequest',
    value: function authRequest() {
      throw new TypeError('Abstract method `authRequest` is not implemented');
    }
  }, {
    key: 'unlinkRequest',
    value: function unlinkRequest() {
      throw new TypeError('Abstract method `unlinkRequest` is not implemented');
    }
  }, {
    key: 'accountRequest',
    value: function accountRequest() {
      throw new TypeError('Abstract method `accountRequest` is not implemented');
    }
  }, {
    key: 'removeAccountRequest',
    value: function removeAccountRequest() {
      throw new TypeError('Abstract method `removeAccountRequest` is not implemented');
    }
  }, {
    key: 'isEnabledRequest',
    value: function isEnabledRequest() {
      throw new TypeError('Abstract method `isEnabledRequest` is not implemented');
    }
  }, {
    key: 'enableRequest',
    value: function enableRequest() {
      throw new TypeError('Abstract method `enableRequest` is not implemented');
    }
  }, {
    key: 'disableRequest',
    value: function disableRequest() {
      throw new TypeError('Abstract method `disableRequest` is not implemented');
    }
  }]);

  return Provider;
}();

exports.default = Provider;

/***/ })
/******/ ])["default"];
});