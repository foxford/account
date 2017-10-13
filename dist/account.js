(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Account"] = factory();
	else
		root["Account"] = factory();
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
/* 0 */
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

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Provider = exports.IdP = undefined;

var _account = __webpack_require__(2);

var _account2 = _interopRequireDefault(_account);

var _idp = __webpack_require__(3);

var _idp2 = _interopRequireDefault(_idp);

var _provider = __webpack_require__(0);

var _provider2 = _interopRequireDefault(_provider);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

exports.IdP = _idp2.default;
exports.Provider = _provider2.default;
exports.default = _account2.default;

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

var MAX_AJAX_RETRY = 3;
var AJAX_RETRY_DELAY = 1000;
var LEEWAY = 3000;
var MY_ACCOUNT_ID = 'me';

var Account = function () {
  _createClass(Account, null, [{
    key: 'version',
    get: function get() {
      return "1.0.0";
    }
  }]);

  function Account(config) {
    _classCallCheck(this, Account);

    if (!config || !config.provider) throw new TypeError('Missing `provider` in config');

    this.provider = config.provider;
    this.retries = config.retries || MAX_AJAX_RETRY;
    this.retryDelay = config.retryDelay || AJAX_RETRY_DELAY;
    this.leeway = config.leeway || LEEWAY;
    this.myAccountId = config.myAccountId || MY_ACCOUNT_ID;
    this.id = config.id || null;
  }

  /**
   * Get token data
   */

  _createClass(Account, [{
    key: '_getTokenData',
    value: function _getTokenData() {
      var item = void 0;
      try {
        item = window.localStorage.getItem('account_' + this.id);
      } catch (err) {
        throw new Error('Missing account id: ' + this.id);
      }
      try {
        return JSON.parse(item);
      } catch (err) {
        throw new Error('Error occured when parse from account data');
      }
    }

    /**
     * Check token expire
     */

  }, {
    key: '_isTokenExpired',
    value: function _isTokenExpired() {
      var tokenData = this._getTokenData();

      return !tokenData || !tokenData.expires_time || Date.now() > Number(tokenData.expires_time) - this.leeway;
    }

    /**
     * Get access token
     */

  }, {
    key: 'signIn',
    value: function signIn(options) {
      var _this = this;

      var fetchToken = function fetchToken(authKey, params) {
        if (_this._isTokenExpired() || !_this.id) {
          return _this._fetchToken(authKey, params);
        } else {
          return Promise.resolve(_this._getTokenData());
        }
      };
      var refreshToken = function refreshToken(_refreshToken) {
        if (_this._isTokenExpired() || !_this.id) {
          return _this._fetchRefreshToken(_this.myAccountId, _refreshToken);
        } else {
          return Promise.resolve(_this._getTokenData());
        }
      };
      var getTokenDataById = function getTokenDataById() {
        if (_this._isTokenExpired()) {
          return _this._fetchRefreshToken(_this.myAccountId, _this._getTokenData().refresh_token);
        } else {
          return Promise.resolve(_this._getTokenData());
        }
      };

      if (options && options.auth_key && options.params && options.params.client_token && options.params.grant_type) {
        return fetchToken(options.auth_key, options.params);
      } else if (options && options.refresh_token) {
        return refreshToken(options.refresh_token);
      } else if (!options && this.id && this._getTokenData()) {
        return getTokenDataById();
      } else {
        return Promise.reject(new TypeError('Missing required options:  pair `authKey`, `params` or `refresh_token` or missing token data'));
      }
    }

    /**
     * Refresh access token
     * @param {*} id 
     */

  }, {
    key: 'refresh',
    value: function refresh(id) {
      var _this2 = this;

      return function (data) {
        var tokenData = _this2._getTokenData();

        if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
        if (!tokenData && !tokenData.refresh_token) throw new TypeError('Missing \'refresh_token\' in account data');

        return _this2._fetchRefreshToken(id, tokenData.refresh_token);
      };
    }

    /**
     * Revoke refresh token
     * @param {*} id 
     */

  }, {
    key: 'revoke',
    value: function revoke(id) {
      var _this3 = this;

      return function (data) {
        var tokenData = _this3._getTokenData();

        if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
        if (!tokenData && !tokenData.refresh_token) throw new TypeError('Missing \'refresh_token\' in account data');

        return _this3._fetchRetry(function () {
          return _this3.provider.revokeRefreshTokenRequest(id, tokenData.refresh_token);
        }).then(_this3._checkStatus).then(_this3._parseJSON).then(function (data) {
          _this3._saveTokenData(data);
          return data;
        });
      };
    }

    /**
     * Link client's accounts
     * @param {*} authKey 
     * @param {*} params
     */

  }, {
    key: 'link',
    value: function link(authKey, params) {
      var _this4 = this;

      return function (data) {
        var tokenData = _this4._getTokenData();

        if (!authKey) throw new TypeError('Incorrect parameters \'authKey\': ' + authKey);
        if (!params) throw new TypeError('Incorrect parameters \'params\': ' + params);
        if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data');

        return _this4._fetchRetry(function () {
          return _this4.provider.linkRequest(authKey, params, tokenData.access_token);
        }).then(_this4._checkStatus).then(_this4._parseJSON).then(function (data) {
          return data;
        });
      };
    }

    /**
     * Get linked accounts
     * @param {*} id 
     */

  }, {
    key: 'auth',
    value: function auth(id) {
      var _this5 = this;

      return function (data) {
        var tokenData = _this5._getTokenData();

        if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
        if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data');

        return _this5._fetchRetry(function () {
          return _this5.provider.authRequest(id, tokenData.access_token);
        }).then(_this5._checkStatus).then(_this5._parseJSON).then(function (data) {
          return data;
        });
      };
    }

    /**
     * Delete account link
     * @param {*} id 
     * @param {*} authKey 
     */

  }, {
    key: 'unlink',
    value: function unlink(id, authKey) {
      var _this6 = this;

      return function (data) {
        var tokenData = _this6._getTokenData();

        if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
        if (!authKey) throw new TypeError('Incorrect parameter \'authKey\': ' + authKey);
        if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data');

        return _this6._fetchRetry(function () {
          return _this6.provider.unlinkRequest(id, authKey, tokenData.access_token);
        }).then(_this6._checkStatus).then(_this6._parseJSON).then(function (data) {
          return data;
        });
      };
    }

    /**
     * Get account info
     * @param {*} id 
     */

  }, {
    key: 'get',
    value: function get(id) {
      var _this7 = this;

      return function (data) {
        var tokenData = _this7._getTokenData();

        if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
        if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data');

        return _this7._fetchRetry(function () {
          return _this7.provider.accountRequest(id, tokenData.access_token);
        }).then(_this7._checkStatus).then(_this7._parseJSON).then(function (data) {
          return data;
        });
      };
    }

    /**
     * Remove account
     */

  }, {
    key: 'remove',
    value: function remove(id) {
      var _this8 = this;

      return function (data) {
        var tokenData = _this8._getTokenData();

        if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
        if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data');

        return _this8._fetchRetry(function () {
          return _this8.provider.removeAccountRequest(id, tokenData.access_token);
        }).then(_this8._checkStatus).then(_this8._parseJSON).then(function (data) {
          _this8.signOut();
          return data;
        });
      };
    }

    /**
     * Check is account enabled
     * @param {*} id 
     */

  }, {
    key: 'isEnabled',
    value: function isEnabled(id) {
      var _this9 = this;

      return function (data) {
        var tokenData = _this9._getTokenData();

        if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
        if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data');

        return _this9._fetchRetry(function () {
          return _this9.provider.isEnabledRequest(id, tokenData.access_token);
        }).then(_this9._checkStatus);
      };
    }

    /**
     * Enable account
     * @param {*} id 
     */

  }, {
    key: 'enable',
    value: function enable(id) {
      var _this10 = this;

      return function (data) {
        var tokenData = _this10._getTokenData();

        if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
        if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data');

        return _this10._fetchRetry(function () {
          return _this10.provider.enableRequest(id, tokenData.access_token);
        }).then(_this10._checkStatus);
      };
    }

    /**
     * Disable account
     * @param {*} id
     */

  }, {
    key: 'disable',
    value: function disable(id) {
      var _this11 = this;

      return function (data) {
        var tokenData = _this11._getTokenData();

        if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
        if (!tokenData && !tokenData.access_token) throw new TypeError('Missing \'access_token\' in account data');

        return _this11._fetchRetry(function () {
          return _this11.provider.disableRequest(id, tokenData.access_token);
        }).then(_this11._checkStatus);
      };
    }

    /**
     * Delete access token
     */

  }, {
    key: 'signOut',
    value: function signOut() {
      if (this.id) {
        window.localStorage.removeItem('account_' + this.id);
        this.id = null;
        return Promise.resolve();
      } else {
        throw new ReferenceError('Missing account id: ' + this.id);
      }
    }

    /**
     * Save token data
     * @param {*} data 
     */

  }, {
    key: '_saveTokenData',
    value: function _saveTokenData(data) {
      if (!this.id) throw new TypeError('Missing account id: ' + this.id);

      var tokenData = this._getTokenData() || {};

      if (data && data.access_token) {
        tokenData.access_token = data.access_token;
      }
      if (data && data.refresh_token) {
        tokenData.refresh_token = data.refresh_token;
      }
      if (data && data.expires_in) {
        tokenData.expires_in = data.expires_in;
        tokenData.expires_time = Date.now() + data.expires_in * 1000;
      }

      window.localStorage.setItem('account_' + this.id, JSON.stringify(tokenData));
    }

    /**
     * Fetch access token
     */

  }, {
    key: '_fetchToken',
    value: function _fetchToken(authKey, params) {
      var _this12 = this;

      if (!authKey) throw new TypeError('Incorrect parameter \'authKey\': ' + authKey);
      if (!params) throw new TypeError('Incorrect parameter \'params\': ' + params);

      var fetchAccount = function fetchAccount(data) {
        return _this12._fetchRetry(function () {
          return _this12.provider.accountRequest(_this12.myAccountId, data.access_token);
        }).then(_this12._checkStatus).then(_this12._parseJSON).then(function (res) {
          _this12.id = res.id;
          _this12._saveTokenData(data);
          return data;
        });
      };

      return this._fetchRetry(function () {
        return _this12.provider.accessTokenRequest(authKey, params);
      }).then(this._checkStatus).then(this._parseJSON).then(function (data) {
        if (!_this12.id) {
          return fetchAccount(data);
        } else {
          _this12._saveTokenData(data);
          return data;
        }
      });
    }

    /**
     * Fetch refresh token
     */

  }, {
    key: '_fetchRefreshToken',
    value: function _fetchRefreshToken(id, refreshToken) {
      var _this13 = this;

      if (!id) throw new TypeError('Incorrect parameter \'id\': ' + id);
      if (!refreshToken) throw new TypeError('Incorrect parameter \'refreshToken\': ' + refreshToken);

      var saveData = function saveData(data) {
        if (!data.refresh_token) {
          var newData = Object.create(data);
          newData.refresh_token = refreshToken;
          _this13._saveTokenData(newData);
        } else {
          _this13._saveTokenData(data);
        }
      };
      var fetchAccount = function fetchAccount(data) {
        return _this13._fetchRetry(function () {
          return _this13.provider.accountRequest(_this13.myAccountId, data.access_token);
        }).then(_this13._checkStatus).then(_this13._parseJSON).then(function (res) {
          _this13.id = res.id;
          saveData(data);
          return data;
        });
      };

      return this._fetchRetry(function () {
        return _this13.provider.refreshAccessTokenRequest(id, refreshToken);
      }).then(this._checkStatus).then(this._parseJSON).then(function (data) {
        if (!_this13.id) {
          return fetchAccount(data);
        } else {
          saveData(data);
          return data;
        }
      });
    }

    /**
     * Fetch with retry logic
     * @param {*} requestFn
     */

  }, {
    key: '_fetchRetry',
    value: function _fetchRetry(requestFn) {
      var _this14 = this;

      if (!requestFn) throw new TypeError('Missing \'requestFn\': ' + requestFn);

      return new Promise(function (resolve, reject) {
        var errors = [];
        var wrappedFetch = function wrappedFetch(n) {
          if (n < 1) {
            reject(errors);
          } else {
            fetch(requestFn()).then(function (response) {
              return resolve(response);
            }).catch(function (error) {
              errors.push(error);
              setTimeout(function () {
                wrappedFetch(--n);
              }, _this14.retryDelay);
            });
          }
        };

        wrappedFetch(_this14.retries);
      });
    }

    /**
     * Check http status and retrurn response or response with error
     * @param {*} response 
     */

  }, {
    key: '_checkStatus',
    value: function _checkStatus(response) {
      if (!response) throw new TypeError('Missing \'response\': ' + response);

      if (response.status && response.status >= 200 && response.status < 300) {
        return response;
      } else {
        var error = new Error(response.statusText);

        error.response = response;
        throw error;
      }
    }

    /**
     * Parse response to JSON
     * @param {*} response 
     */

  }, {
    key: '_parseJSON',
    value: function _parseJSON(response) {
      if (!response) throw new TypeError('Missing \'response\': ' + response);

      return response.json();
    }
  }]);

  return Account;
}();

exports.default = Account;

/***/ }),
/* 3 */
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

var _provider = __webpack_require__(0);

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

/***/ })
/******/ ]);
});