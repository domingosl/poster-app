angular.module('poster').service('api', function (
  $q, $http, $timeout, $httpParamSerializerJQLike, $cacheFactory) {

  var me = this;

  var initialized = false;

  var $httpDefaultCache = $cacheFactory.get('$http');

  var devBaseUrl = 'http://127.0.0.1:2288';
  var prodBaseUrl = 'http://54.38.214.47:2288';

  var session;

  var defaults = {
    env: 'developing',
    baseUrl: devBaseUrl,
    preserveUserSession: true,
    localStorageFile: 'ri-api-data',
    language: 'it'
  };


  var apiConfig = {};

  var ApiStorageClass = function () {

    this.save = function (value) {
        localStorage.setItem(apiConfig.localStorageFile, value);
    };

    this.remove = function () {
        localStorage.removeItem(apiConfig.localStorageFile);
    };

    this.get = function () {
        return localStorage.getItem(apiConfig.localStorageFile);
    };

  };

  this.getLastEmail = function () {

    var data = angular.fromJson(apiStorage.get() || "{}");

    if(data && data.user && typeof data.user.email === 'string')
      return data.user.email;
    else
      return "";
  };

  var apiStorage = new ApiStorageClass();

  this.getBaseUrl = function () {
    return apiConfig.baseUrl;
  };

  this.getFullUrl = function (methodName, args, urlParams) {
    var method = methods.find(methodName);
    return this.getBaseUrl() + method.getEndPoint(args, urlParams);
  };

  this.getAuthenticationHeaders = function () {
    return {
      'Authorization': session ? session.token : ""
    };
  };

  var MethodCollection = function () {

    var data = [];

    this.find = function (m) {
      for (var x = 0; x < data.length; x++) {
        if (data[x].name === m)
          return data[x];
      }
      return null;
    };

    this.add = function (name, endPoint, seed) {
      data.push(new MethodClass(name, endPoint, seed));

    };
  };

  var MethodClass = function (name, endPoint, seed) {
    this.name = name;
    this.endPoint = endPoint;
    this.seed = (typeof seed !== 'undefined') ? seed : null;
    this.mapper = {};
  };

  MethodClass.prototype.getEndPoint = function (args, urlParams) {

    var url = this.endPoint.replace(/{(\d+)}/g, function (match, number) {
      return typeof args[number] !== 'undefined'
        ? args[number]
        : match
        ;
    });


    var str = "";
    for (var key in urlParams) {
      if (str !== "") {
        str += "&";
      }
      str += key + "=" + urlParams[key];
    }
    if (str)
      return url + '?' + str;
    else
      return url;

  };

  var methods = new MethodCollection();

  methods.add('login', '/auth/login');
  methods.add('logout', '/auth/logout');
  methods.add('signup', '/auth/signup');
  methods.add('resetPassword', '/auth/reset-password');
  methods.add('changePassword', '/auth/change-password');
  methods.add('getUser', '/users/{0}');
  methods.add('setUser', '/users/{0}');
  methods.add('getJails', '/jails');
  methods.add('getRecipients', '/recipients');
  methods.add('setRecipient', '/recipients');


  var RequestClass = function (method, args) {

    var me = this;
    var onlyLocalError = false;

    this.read = function (urlParams, cache) {
      return new ServerCallPromise(method, args, null, 'GET', urlParams, cache, onlyLocalError, null);
    };

    this.save = function (body, progressHandler) {
      return new ServerCallPromise(method, args, body, 'POST', null, null, onlyLocalError, progressHandler || null);
    };

    this.update = function (body) {
      return new ServerCallPromise(method, args, body, 'PUT', null, null, onlyLocalError, null);
    };

    this.delete = function () {
      return new ServerCallPromise(method, args, null, 'DELETE', null, null, onlyLocalError, null);
    };

    this.onlyLocalError = function () {
      onlyLocalError = true;
      return me;
    }

  };

  var ErrorResponseClass = function () {
    this.code = -1;
    this.validationErrors = {};
    this.validationErrorsFull = {};
    this.handled = false;
    this.message = null;
  };

  var ServerCallPromise = function (_method, _args, _body, verb, _urlParams, cache, onlyLocalError, progressHandler) {
    var method = angular.copy(_method);
    var args = angular.copy(_args);

    var body;
    if(_body && _body.constructor.name === "File") {
      body = _body;
    }
    else if (_body && verb === 'POST') {
      body = angular.copy(_body);
    }
    else {
      body = angular.copy(_body);
    }

    var urlParams = angular.copy(_urlParams);

    var deferred = $q.defer();

    var endPoint = method.getEndPoint(args, urlParams);

    if (body && method.mapper.out)
      body = method.mapper.out(body);

    if (method.seed) {
      debugMsg('Resolving ' + endPoint + ' from seed');

      $timeout(function () {

        if (method.mapper.in)
          deferred.resolve(method.mapper.in(method.seed));
        else
          deferred.resolve(method.seed);

      }, Math.floor((Math.random() * 1000) + 1000));

      return deferred.promise;
    }


    var headers = [];

    //headers['Cache-control'] = 'no-store';
    //headers['Cache-Control'] = 'no-cache';
    //headers['Pragma'] = 'no-cache';
    //headers['Expires'] = '0';


    headers['Content-Language'] = "it-IT";

    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    var data = null;

    if(body){
      data = $httpParamSerializerJQLike(body);
    }

    if (session && session.token)
      headers['x-auth-token'] = session.token;

    var httpOptions = {
      cache: false,
      method: verb,
      data: data,
      url: apiConfig.baseUrl + endPoint,
      headers: headers,
      transformRequest: angular.identity
    };

    if(verb === 'GET' && cacheManager.inCache(httpOptions.url) === 'expired') {
      $httpDefaultCache.remove(httpOptions.url);
      debugMsg('Dropping cache for ' + httpOptions.url);
    }
    else if(verb === 'GET' && cacheManager.inCache(httpOptions.url) === 'cached') {
      httpOptions.cache = true;
      debugMsg('Cache found for ' + httpOptions.url);
    }
    else if(verb === 'GET' && cache) {
      cacheManager.add(httpOptions.url, cache);
      httpOptions.cache = true;
      debugMsg('Caching ' + httpOptions.url);
    }

    if(typeof progressHandler === 'function') {

      httpOptions.uploadEventHandlers = {
        progress: progressHandler
      }
    }

    debugMsg(httpOptions);

    $http(httpOptions)
      .then(
        function success(response) {
          deferred.resolve(response.data.data);
        },
        function error(err) {

          var response = new ErrorResponseClass();
          response.code = err.status;
          response.data = err.data.data || {};
          response.message = err.data.message || "";

          if(typeof apiConfig.errorHandlers[err.status] === 'function' && !onlyLocalError) {
            response.handled = true;
            apiConfig.errorHandlers[err.status](response);
            return deferred.reject(response);
          }
          else
            return deferred.reject(response);
        });


    return deferred.promise;

  };

  this.setSession = function (s) {
    debugMsg("Storing session");
    session = s;
    apiStorage.save(angular.toJson(s));
  };

  var dropSession = function () {
    session = null;
    apiStorage.remove();
  };

  this.session = function () {

    if(session)
      return session;

    var _session = apiStorage.get();

    if(!_session)
      return null;

    try {
      _session = angular.fromJson(_session);

      session = _session;
      return _session;


    }
    catch (e) {
      debugMsg("Malformed session!");
      return null;
    }
  };

  this.logout = function () {
    var deferred = $q.defer();

    me.request('logout').save().then(
      function () {
        deferred.resolve();
      },
      function (err) {
        deferred.reject(err);
      }
    ).finally(dropSession);

    return deferred.promise;
  };

  this.dropSession = function () {
    dropSession();
  };

  this.initialize = function (options) {

    if(typeof options !== 'object')
      options = {};

    if (typeof options.baseUrl === 'undefined' && typeof options.env !== 'undefined' && options.env === 'production') {
      options.baseUrl = prodBaseUrl;
    }

    angular.extend(apiConfig, defaults, options);

    initialized = true;
    debugMsg('I have been initialized with this config', apiConfig);
  };

  this.addSeed = function (methodName, data) {
    var method = methods.find(methodName);

    if (!method) {
      debugMsg('Method ' + methodName + ' is not defined.');
      return false;
    }

    method.seed = data;


  };

  this.request = function () {

    var methodName = arguments[0];

    if (!initialized) {
      debugMsg('You need to initialize the API client first');
      return false;
    }

    var method = methods.find(methodName);

    if (!method) {
      debugMsg('Method ' + methodName + ' is not defined.');
      return false;
    }

    var payload = [];
    for (var x = 1; x < arguments.length; x++) {
      payload.push(arguments[x]);
    }

    return new RequestClass(method, payload);

  };


  this.authenticate = function (email, password) {
    return me.request('login').save({email: email, password: password});
  };

  this.addMapper = function (methodName, mapper) {
    var method = methods.find(methodName);
    if (!method) {
      debugMsg('Method ' + methodName + ' do not exist');
      return false;
    }

    if (typeof mapper.in !== 'function' || typeof mapper.out !== 'function') {
      debugMsg('The mapper object is not defined correctly');
      return false;
    }

    method.mapper = mapper;

  };

  this.clearCache = function () {
    $httpDefaultCache.removeAll();
  };

  var CacheClass = function () {

    var _cachedUrl = [];

    var getCachedIndex = function (url) {
      for (var x = 0; x < _cachedUrl.length; x++) {
        if (_cachedUrl[x].url === url) {
          return x;
        }
      }
      return -1;
    };

    this.clear = function () {
      _cachedUrl = [];
    };

    this.inCache = function (url) {

      var now = new Date().getTime();
      var x = getCachedIndex(url);

      if(x >= 0) {
        if (!_cachedUrl[x].expire || _cachedUrl[x].expire <= now) {
          _cachedUrl.splice(x,1);
          return 'expired';
        }
        return 'cached';
      }
      return null;
    };

    this.add = function (url, time) {

      var now = new Date().getTime();
      var x = getCachedIndex(url);

      if(x >= 0) {
        if(_cachedUrl[x].expire > now)
          return true;

        _cachedUrl[x].expire = now + time * 1000;
        return true;
      }

      _cachedUrl.push({
        url: url,
        expire: now + time * 1000
      });

      return true;
    };
  };

  var cacheManager = new CacheClass();

  this.flushCache = function () {
    cacheManager.clear();
    return true;
  };

  var debugMsg = function (msg, obj) {
    if (apiConfig.env !== 'production') {
      console.log('***', 'GW API CLIENT:', msg, '***');
      if (obj)
        console.log(obj);
    }
  };

});
