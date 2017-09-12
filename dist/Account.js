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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

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
var LEEWAY = 1000;
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

    this.id = null;
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
        throw new Error('Missing item in localStorage');
      }
      try {
        return JSON.parse(item);
      } catch (err) {
        throw new Error('Error occured when parse item from localStorage');
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
        if (_this._isTokenExpired()) {
          return _this._fetchToken(authKey, params);
        } else {
          return Promise.resolve(_this._getTokenData());
        }
      };
      var refreshTokenById = function refreshTokenById(id) {
        _this.id = id;
        if (_this._isTokenExpired()) {
          return _this._fetchRefreshToken(_this.myAccountId, _this._getTokenData().refresh_token);
        } else {
          return Promise.resolve(_this._getTokenData());
        }
      };
      var refreshToken = function refreshToken(_refreshToken) {
        if (_this._isTokenExpired()) {
          return _this._fetchRefreshToken(_this.myAccountId, _refreshToken);
        } else {
          return Promise.resolve(_this._getTokenData());
        }
      };

      if (options && options.auth_key && options.params && options.params.client_token && options.params.grant_type) {
        return fetchToken(options.auth_key, options.params);
      } else if (options && options.id) {
        return refreshTokenById(options.id);
      } else if (options && options.refresh_token) {
        return refreshToken(options.refresh_token);
      } else {
        return Promise.reject(new TypeError('Missing required options: `id` or `refresh_token`, or pair `authKey`, `params`'));
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

        if (!id) return Promise.reject(new TypeError('Incorrect parameter `id`'));
        if (!tokenData && !tokenData.refresh_token) return Promise.reject(new TypeError('Missing `refresh_token` in localStorage'));

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

        if (!id) return Promise.reject(new TypeError('Incorrect parameter `id`'));
        if (!tokenData && !tokenData.refresh_token) return Promise.reject(new TypeError('Missing `refresh_token` in localStorage'));

        return _this3._fetchRetry(function () {
          return _this3.provider.revokeRefreshTokenRequest(id, tokenData.refresh_token);
        }).then(_this3._checkStatus).then(_this3._parseJSON).then(function (data) {
          _this3._saveTokenData(data);
          return Promise.resolve(data);
        }).catch(function (err) {
          return Promise.reject(err);
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

        if (!authKey || !params) return Promise.reject(new TypeError('Incorrect parameters `authKey` or `params`'));
        if (!tokenData && !tokenData.access_token) return Promise.reject(new TypeError('Missing `access_token` in localStorage'));

        return _this4._fetchRetry(function () {
          return _this4.provider.linkRequest(authKey, params, tokenData.access_token);
        }).then(_this4._checkStatus).then(_this4._parseJSON).then(function (data) {
          return Promise.resolve(data);
        }).catch(function (err) {
          return Promise.reject(err);
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

        if (!id) return Promise.reject(new TypeError('Incorrect parameter `id`'));
        if (!tokenData && !tokenData.access_token) return Promise.reject(new TypeError('Missing `access_token` in localStorage'));

        return _this5._fetchRetry(function () {
          return _this5.provider.authRequest(id, tokenData.access_token);
        }).then(_this5._checkStatus).then(_this5._parseJSON).then(function (data) {
          return Promise.resolve(data);
        }).catch(function (err) {
          return Promise.reject(err);
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

        if (!id || !authKey) return Promise.reject(new TypeError('Incorrect parameter `id` or `authKey`'));
        if (!tokenData && !tokenData.access_token) return Promise.reject(new TypeError('Missing `access_token` in localStorage'));

        return _this6._fetchRetry(function () {
          return _this6.provider.unlinkRequest(id, authKey, tokenData.access_token);
        }).then(_this6._checkStatus).then(_this6._parseJSON).then(function (data) {
          return Promise.resolve(data);
        }).catch(function (err) {
          return Promise.reject(err);
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

        if (!id) return Promise.reject(new TypeError('Incorrect parameter `id`'));
        if (!tokenData && !tokenData.access_token) return Promise.reject(new TypeError('Missing `access_token` in localStorage'));

        return _this7._fetchRetry(function () {
          return _this7.provider.accountRequest(id, tokenData.access_token);
        }).then(_this7._checkStatus).then(_this7._parseJSON).then(function (data) {
          return Promise.resolve(data);
        }).catch(function (err) {
          return Promise.reject(err);
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

        if (!id) return Promise.reject(new TypeError('Incorrect parameter `id`'));
        if (!tokenData && !tokenData.access_token) return Promise.reject(new TypeError('Missing `access_token` in localStorage'));

        return _this8._fetchRetry(function () {
          return _this8.provider.removeAccountRequest(id, tokenData.access_token);
        }).then(_this8._checkStatus).then(_this8._parseJSON).then(function (data) {
          _this8.signOut();
          return Promise.resolve(data);
        }).catch(function (err) {
          return Promise.reject(err);
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

        if (!id) return Promise.reject(new TypeError('Incorrect parameter `id`'));
        if (!tokenData && !tokenData.access_token) return Promise.reject(new TypeError('Missing `access_token` in localStorage'));

        return _this9._fetchRetry(function () {
          return _this9.provider.isEnabledRequest(id, tokenData.access_token);
        }).then(_this9._checkStatus).then(Promise.resolve()).catch(function (err) {
          return Promise.reject(err);
        });
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

        if (!id) return Promise.reject(new TypeError('Incorrect parameter `id`'));
        if (!tokenData && !tokenData.access_token) return Promise.reject(new TypeError('Missing `access_token` in localStorage'));

        return _this10._fetchRetry(function () {
          return _this10.provider.enableRequest(id, tokenData.access_token);
        }).then(_this10._checkStatus).then(Promise.resolve()).catch(function (err) {
          return Promise.reject(err);
        });
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

        if (!id) return Promise.reject(new TypeError('Incorrect parameter `id`'));
        if (!tokenData && !tokenData.access_token) return Promise.reject(new TypeError('Missing `access_token` in localStorage'));

        return _this11._fetchRetry(function () {
          return _this11.provider.disableRequest(id, tokenData.access_token);
        }).then(_this11._checkStatus).then(Promise.resolve()).catch(function (err) {
          return Promise.reject(err);
        });
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
        return Promise.reject(new ReferenceError('Missing `this.id` in object'));
      }
    }

    /**
     * Save token data
     * @param {*} data 
     */

  }, {
    key: '_saveTokenData',
    value: function _saveTokenData(data) {
      if (!this.id) throw new TypeError('Missing `id` in object');

      var savedTokenData = this._getTokenData() || {};
      var tokenData = {};

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

      window.localStorage.setItem('account_' + this.id, JSON.stringify(_extends({}, savedTokenData, tokenData)));
    }

    /**
     * Fetch access token
     */

  }, {
    key: '_fetchToken',
    value: function _fetchToken(authKey, params) {
      var _this12 = this;

      if (!authKey || !params) return Promise.reject(new TypeError('Incorrect parameter `authKey` or `params`'));

      var fetchAccount = function fetchAccount(data) {
        return _this12._fetchRetry(function () {
          return _this12.provider.accountRequest(_this12.myAccountId, data.access_token);
        }).then(_this12._checkStatus).then(_this12._parseJSON).then(function (res) {
          _this12.id = res.id;
          _this12._saveTokenData(data);
          return Promise.resolve(data);
        }).catch(function (err) {
          return Promise.reject(err);
        });
      };

      return this._fetchRetry(function () {
        return _this12.provider.accessTokenRequest(authKey, params);
      }).then(this._checkStatus).then(this._parseJSON).then(function (data) {
        if (!_this12.id) {
          return fetchAccount(data);
        } else {
          _this12._saveTokenData(data);
          return Promise.resolve(data);
        }
      }).catch(function (err) {
        return Promise.reject(err);
      });
    }

    /**
     * Fetch refresh token
     */

  }, {
    key: '_fetchRefreshToken',
    value: function _fetchRefreshToken(id, refreshToken) {
      var _this13 = this;

      if (!id || !refreshToken) return Promise.reject(new TypeError('Incorrect parameter `id` or `refreshToken`'));

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
          return Promise.resolve(data);
        }).catch(function (err) {
          return Promise.reject(err);
        });
      };

      return this._fetchRetry(function () {
        return _this13.provider.refreshAccessTokenRequest(id, refreshToken);
      }).then(this._checkStatus).then(this._parseJSON).then(function (data) {
        if (!_this13.id) {
          return fetchAccount(data);
        } else {
          saveData(data);
          return Promise.resolve(data);
        }
      }).catch(function (err) {
        return Promise.reject(err);
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

      if (!requestFn) throw new TypeError('Missing `requestFn`');

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
      if (!response) throw new TypeError('Missing `response`');

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
      if (!response) throw new TypeError('Missing `response`');

      return response.json();
    }
  }]);

  return Account;
}();

exports.default = Account;

/***/ })
/******/ ])["default"];
});