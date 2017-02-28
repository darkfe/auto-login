/**
 * @file baidu.js
 * @author darkfe
 * @date 2017/2/27
 */

var Agent = require('../../lib/Agent');
var http = new Agent();
var url = require('url');
var qs = require('querystring');

var entry = 'https://wappass.baidu.com/passport/?login&tpl=wimn&subpro=wimn&regtype=1&u=https%3A%2F%2Fm.baidu.com/usrprofile%23logined';

function getUid() {
    return http.get(entry).then(function (res) {
        return res.text.match(/name="uid" value="([^"]+)/)[1];
    });
}

function getServerTime() {

    var query = qs.parse(url.parse(entry).query);

    var params = {
        url: "https://wappass.baidu.com/wp/api/security/antireplaytoken?tpl=" + query.tpl + "&v=" + (new Date).getTime(),
    }

    return http.get(params.url).accept('json').then(function (res) {
        return res.body;
    });
}

function encrypt(password){
    // todo
    return password;
}

function login(username, password) {

    var gid = function () {
        return "xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (t) {
            var e = 16 * Math.random() | 0
                , i = "x" == t ? e : 3 & e | 8;
            return i.toString(16)
        }).toUpperCase()
    }();

    var params = {
        url: 'https://wappass.baidu.com/wp/api/login?tt=1488201057879',
        headers: {
            'Origin': 'https://wappass.baidu.com',
            'X-Requested-With': 'XMLHttpRequest',
            'Referer': entry,
        },

        data: {
            'username': username,
            'password': encrypt(password),
            'verifycode': '',
            'vcodestr': '',
            'action': 'login',
            'u': 'https%3A%2F%2Fm.baidu.com%2Fusrprofile%3Fuid%3D1488201039395_134%23logined',
            'tpl': 'wimn',
            'tn': '',
            'pu': '',
            'ssid': '',
            'from': '',
            'bd_page_type': '',
            'uid': '@',
            'type': '',
            'regtype': '',
            'subpro': 'wimn',
            'adapter': '0',
            'skin': 'default_v2',
            'regist_mode': '',
            'login_share_strategy': '',
            'client': '',
            'clientfrom': '',
            'connect': '0',
            'bindToSmsLogin': '',
            'isphone': '0',
            'loginmerge': '1',
            'countrycode': '',
            'mobilenum': 'undefined',
            'servertime': '@',
            'gid': gid,
            'logLoginType': 'wap_loginTouch'
        }
    };

    return getUid()   // 第一次请求
    .then(function (uid) {
        params.data.uid = uid;
    })
    .then(getServerTime) // 第二次请求
    .then(function (json) {
        params.data.servertime = json.time;
    })
    .then(function () {

        // 第三次请求
        return http
        .post(params.url)
        .set(params.headers)
        .field(params.data)
        .then(function (res) {

            // 有BDUSS值就认为是登录成功
            var cookieSet = (res.headers['set-cookie'] || []);
            var loginResult = cookieSet.some(function (cookieItem) {
                return /^BDUSS=\w{10,}/.test(cookieItem);
            });

            if (!loginResult) {
                throw new Error('login fail');
            }
        });
    });
}

function isLogin() {

    var params = {
        url: 'http://i.baidu.com/'
    };

    return http
    .head(params.url)
    // redirects(0) 不允许自动302,
    // 当没有登录时, 从入口进去一定会被定向到登录页
    // 一个head request就可以确认是否需要登录, 代价最小
    .redirects(0)
    .then(function (res) {
        return res.status === 200;
    });
};

module.exports = {
    isLogin: isLogin,
    login: login
};

