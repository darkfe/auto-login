/**
 * @file Agent
 * @author darkfe
 * @date 2017/2/27
 */

/*
 参考 https://github.com/visionmedia/superagent/blob/master/lib/node/agent.js
 自行实现一个Agent, 用来处理请求过程中Cookie的存取
 这里用的是file store, 实际可以用redis等内存的store, 性能更好
 */
var logger = require('superagent-logger');

var CookieWrap = require('./CookieWrap');
var FileCookieStore = CookieWrap.FileCookieStore;
var CookieJar = CookieWrap.CookieJar;

var request = require('superagent');
var methods = require('methods');

var path = require('path');
var cookieFileDir = path.resolve(__dirname, '../temp/cookiejar.json');

// 统一user-agent
var commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36'
};

/**
 * Expose `Agent`.
 */

module.exports = Agent;

/**
 * Initialize a new `Agent`.
 *
 * @api public
 */

function Agent(options) {
    if (!(this instanceof Agent)) return new Agent(options);
    if (options) {
        this._ca = options.ca;
        this._key = options.key;
        this._pfx = options.pfx;
        this._cert = options.cert;
    }

    this.jar = new CookieJar(
        new FileCookieStore(cookieFileDir), {looseMode: true}
    );
}

/**
 * Save the cookies in the given `res` to
 * the agent's cookie jar for persistence.
 *
 * @param {Response} res
 * @api private
 */

Agent.prototype._saveCookies = function (res) {
    var cookies = res.headers['set-cookie'];
    if (res.request && res.request.url) {
        this.jar.setCookies(cookies, res.request.url);
    }
};

/**
 * Attach cookies when available to the given `req`.
 *
 * @param {Request} req
 * @api private
 */

Agent.prototype._attachCookies = function (req) {
    var cookies = this.jar.getCookieStringSync(req.url);
    req.cookies = cookies;
};

// generate HTTP verb methods
if (methods.indexOf('del') == -1) {
    // create a copy so we don't cause conflicts with
    // other packages using the methods package and
    // npm 3.x
    methods = methods.slice(0);
    methods.push('del');
}
methods.forEach(function (method) {
    var name = method;
    method = 'del' == method ? 'delete' : method;

    method = method.toUpperCase();
    Agent.prototype[name] = function (url, fn) {
        var req = new request.Request(method, url);
        req.set(commonHeaders);
        req.ca(this._ca);
        req.key(this._key);
        req.pfx(this._pfx);
        req.cert(this._cert);

        req.use(logger);

        req.on('response', this._saveCookies.bind(this));
        req.on('redirect', this._saveCookies.bind(this));
        req.on('redirect', this._attachCookies.bind(this, req));
        this._attachCookies(req);

        fn && req.end(fn);
        return req;
    };
});