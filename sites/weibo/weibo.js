/**
 * @file weibo3.js
 * @author darkfe
 * @date 2017/2/27
 */

var Agent = require('../../lib/Agent');
var http = new Agent();

function isLogin() {

    var params = {
        url: 'http://m.weibo.cn/'
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

function login(username, password) {

    var params = {
        url: 'https://passport.weibo.cn/sso/login',
        headers: {
            Origin: 'https://passport.weibo.cn',
            Referer: 'https://passport.weibo.cn/signin/login?entry=mweibo&res=wel&wm=3349&r=http%3A%2F%2Fm.weibo.cn%2F'
        },
        data: {
            username: username,
            password: password,
            savestate: 1,
            r: 'https://passport.weibo.cn/sso/login',
            ec: 1,
            pagerefer: 'https://passport.weibo.cn/signin/welcome?entry=mweibo&r=http%3A%2F%2Fm.weibo.cn%2F',
            entry: 'mweibo',
            wentry: '',
            loginfrom: '',
            client_id: '',
            code: '',
            qq: '',
            mainpageflag: 1,
            hff: '',
            hfp: ''
        }
    };

    return http
    .post(params.url)
    .set(params.headers)
    .field(params.data)
    .then(function (res) {
        return JSON.parse(res.text);
    })
    .then(function (json) {
        // 20000000 状态码说明登录成功
        if (json.retcode === 20000000) {
            return json;
        };
        throw new Error(json.msg);
    });
};


module.exports = {
    isLogin : isLogin,
    login : login
};