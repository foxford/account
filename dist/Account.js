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

var _createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
    }
  }return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
  };
}();

var _utils = __webpack_require__(1);

var _constants = __webpack_require__(2);

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var Account = function () {
  _createClass(Account, null, [{
    key: 'version',
    get: function get() {
      return "1.0.0";
    }
  }]);

  function Account(config) {
    _classCallCheck(this, Account);

    this.provider = config.provider;
    this.retries = config.retries || _constants.MAX_AJAX_RETRY;
    this.retryDelay = config.retryDelay || _constants.AJAX_RETRY_DELAY;
    this.expiresLeeway = config.expiresLeeway || _constants.EXPIRES_LEEWAY;
    this.myAccountId = config.myAccountId || _constants.MY_ACCOUNT_ID;

    this.id = null;
    this._refreshToken = null;
  }

  /**
   * Get token data
   */

  _createClass(Account, [{
    key: 'signIn',

    /**
     * Get access token
     */
    value: function signIn(config) {
      var _this = this;

      var fetchToken = function fetchToken(authKey, params) {
        if (_this._isTokenExpired) {
          return _this._fetchToken(authKey, params);
        } else {
          return getSavedToken();
        }
      };
      var refreshToken = function refreshToken(params) {
        if (params.id) _this.id = params.id;
        if (params.refresh_token) _this._refreshToken = params.refresh_token;

        var refreshToken = params.refresh_token || _this._tokenData.refresh_token;

        if (_this._isTokenExpired) {
          return _this._fetchRefreshToken(_this.myAccountId, refreshToken);
        } else {
          return getSavedToken();
        }
      };
      var getSavedToken = function getSavedToken() {
        return Promise.resolve(_this._tokenData);
      };

      if (config && config.auth_key && config.params && config.params.client_token && config.params.grant_type) {
        return fetchToken(config.auth_key, config.params);
      } else if (config && config.id) {
        return refreshToken({ id: config.id });
      } else if (config && config.refresh_token) {
        return refreshToken({ refresh_token: config.refresh_token });
      } else {
        return Promise.reject(new TypeError('`config` has incorrect parameters'));
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
        if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'));
        return _this2._fetchRefreshToken(id, _this2._tokenData.refresh_token);
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
        if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'));
        return (0, _utils.fetchRetry)(_this3.provider.revokeTokenRequest(id, _this3._tokenData.refresh_token), _this3.retries, _this3.retryDelay).then(_utils.checkStatus).then(_utils.parseJSON).then(function (data) {
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
        if (!authKey || !params) return Promise.reject(new TypeError('incorrect parameters `authKey` or `params`'));
        return (0, _utils.fetchRetry)(_this4.provider.linkRequest(authKey, params, _this4._tokenData.access_token), _this4.retries, _this4.retryDelay).then(_utils.checkStatus).then(_utils.parseJSON).then(function (data) {
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
        if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'));
        return (0, _utils.fetchRetry)(_this5.provider.authRequest(id, _this5._tokenData.access_token), _this5.retries, _this5.retryDelay).then(_utils.checkStatus).then(_utils.parseJSON).then(function (data) {
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
        if (!id || !authKey) return Promise.reject(new TypeError('incorrect parameter `id` or `authKey`'));
        return (0, _utils.fetchRetry)(_this6.provider.unlinkRequest(id, authKey, _this6._tokenData.access_token), _this6.retries, _this6.retryDelay).then(_utils.checkStatus).then(_utils.parseJSON).then(function (data) {
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
        if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'));
        return (0, _utils.fetchRetry)(_this7.provider.accountRequest(id, _this7._tokenData.access_token), _this7.retries, _this7.retryDelay).then(_utils.checkStatus).then(_utils.parseJSON).then(function (data) {
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
        if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'));
        return (0, _utils.fetchRetry)(_this8.provider.removeAccountRequest(id, _this8._tokenData.access_token), _this8.retries, _this8.retryDelay).then(_utils.checkStatus).then(_utils.parseJSON).then(function (data) {
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
        if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'));
        return (0, _utils.fetchRetry)(_this9.provider.isEnabledRequest(id, _this9._tokenData.access_token), _this9.retries, _this9.retryDelay).then(_utils.checkStatus).then(Promise.resolve()).catch(function (err) {
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
        if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'));
        return (0, _utils.fetchRetry)(_this10.provider.enableRequest(id, _this10._tokenData.access_token), _this10.retries, _this10.retryDelay).then(_utils.checkStatus).then(Promise.resolve()).catch(function (err) {
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
        if (!id) return Promise.reject(new TypeError('incorrect parameter `id`'));
        return (0, _utils.fetchRetry)(_this11.provider.disableRequest(id, _this11._tokenData.access_token), _this11.retries, _this11.retryDelay).then(_utils.checkStatus).then(Promise.resolve()).catch(function (err) {
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
        this._refreshToken = null;
        return Promise.resolve();
      } else {
        return Promise.reject(new ReferenceError('Cannot find `this.id`'));
      }
    }

    /**
     * Save token data
     * @param {*} data 
     */

  }, {
    key: '_saveTokenData',
    value: function _saveTokenData(data) {
      var tokenData = {
        access_token: data.access_token || this._tokenData.access_token,
        refresh_token: data.refresh_token || this._tokenData.refresh_token,
        expires_in: data.expires_in || this._tokenData.expires_in,
        expires_time: Date.now() + data.expires_in * 1000 || this._tokenData.expires_time
      };

      window.localStorage.setItem('account_' + this.id, JSON.stringify(tokenData));
    }

    /**
     * Fetch access token
     */

  }, {
    key: '_fetchToken',
    value: function _fetchToken(authKey, params) {
      var _this12 = this;

      var fetchAccount = function fetchAccount(data) {
        return (0, _utils.fetchRetry)(_this12.provider.accountRequest(_this12.myAccountId, data.access_token), _this12.retries, _this12.retryDelay).then(_utils.checkStatus).then(_utils.parseJSON).then(function (res) {
          _this12.id = res.id;
          _this12._saveTokenData(data);
          return Promise.resolve(data);
        }).catch(function (err) {
          return Promise.reject(err);
        });
      };

      return (0, _utils.fetchRetry)(this.provider.tokenRequest(authKey, params), this.retries, this.retryDelay).then(_utils.checkStatus).then(_utils.parseJSON).then(function (data) {
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

      var saveData = function saveData(data) {
        if (_this13._refreshToken) {
          var newData = Object.create(data);
          newData.refresh_token = _this13._refreshToken;
          _this13._saveTokenData(newData);
        } else {
          _this13._saveTokenData(data);
        }
      };
      var fetchAccount = function fetchAccount(data) {
        return (0, _utils.fetchRetry)(_this13.provider.accountRequest(_this13.myAccountId, data.access_token), _this13.retries, _this13.retryDelay).then(_utils.checkStatus).then(_utils.parseJSON).then(function (res) {
          _this13.id = res.id;
          saveData(data);
          return Promise.resolve(data);
        }).catch(function (err) {
          return Promise.reject(err);
        });
      };

      return (0, _utils.fetchRetry)(this.provider.refreshTokenRequest(id, refreshToken), this.retries, this.retryDelay).then(_utils.checkStatus).then(_utils.parseJSON).then(function (data) {
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
  }, {
    key: '_tokenData',
    get: function get() {
      return JSON.parse(window.localStorage.getItem('account_' + this.id));
    }

    /**
     * Check token expire
     */

  }, {
    key: '_isTokenExpired',
    get: function get() {
      return !this._tokenData || !this._tokenData.expires_time || Date.now() > Number(this._tokenData.expires_time) - this.expiresLeeway;
    }
  }]);

  return Account;
}();

exports.default = Account;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseJSON = parseJSON;
exports.checkStatus = checkStatus;
exports.fetchRetry = fetchRetry;
function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status && response.status >= 200 && response.status < 300) {
    return response;
  } else {
    var error = new Error(response.statusText);

    error.response = response;
    throw error;
  }
}

function fetchRetry(request, retries, retryDelay) {
  return new Promise(function (resolve, reject) {
    var wrappedFetch = function wrappedFetch(n) {
      fetch(request).then(function (response) {
        resolve(response);
      }).catch(function (error) {
        if (n > 1) {
          setTimeout(function () {
            wrappedFetch(--n);
          }, retryDelay);
        } else {
          reject(error);
        }
      });
    };
    wrappedFetch(retries);
  });
}

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var MAX_AJAX_RETRY = exports.MAX_AJAX_RETRY = 3;
var AJAX_RETRY_DELAY = exports.AJAX_RETRY_DELAY = 1000;
var EXPIRES_LEEWAY = exports.EXPIRES_LEEWAY = 1000;
var MY_ACCOUNT_ID = exports.MY_ACCOUNT_ID = 'me';

/***/ })
/******/ ])["default"];
});