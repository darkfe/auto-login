/**
 * @file CookieJar
 * @author darkfe
 * @date 2017/2/27
 */

var tough = require('tough-cookie');
var util = require('util');
var fs = require('fs');
var Cookie = tough.Cookie;

var CookieJar = function () {
    CookieJar.super_.apply(this, arguments);
};

util.inherits(CookieJar, tough.CookieJar);

CookieJar.prototype.setCookies = function (cookies, currentUrl, cb) {
    var cookies = ( cookies || []).map(Cookie.parse);
    var total = cookies.length;
    var count = 0;
    var that = this;
    cookies.forEach(function (cookieItem, index) {
        that.setCookie(cookieItem, currentUrl, {ignoreError: true}, function (err) {
            count += 1;
            if (count === total) {
                cb && cb();
            }
        });
    });
};

var FileCookieStore = function (filePath) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath,'');
    }
    FileCookieStore.super_.apply(this, arguments);
};

util.inherits(FileCookieStore, require("tough-cookie-filestore"));

module.exports = {
    CookieJar: CookieJar,
    FileCookieStore: FileCookieStore
};