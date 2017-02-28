/**
 * @file zhihu.js
 * @author darkfe
 * @date 2017/2/27
 */


var Agent = require('../../lib/Agent');
var http = new Agent();

function getXsrf() {
    var params = {
        url: 'https://www.zhihu.com'
    };

    return http.get(params.url).then(function (res) {
        return res.text.match(/name="_xsrf"\svalue="([^"]+)"/g)[1];
    });
}

function login(username, password) {

    var params = {
        url: 'https://www.zhihu.com/login/email',
        type: 'post',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            Referer: 'https://www.zhihu.com/',
            'X-Xsrftoken': '@'
        },
        data: {
            email: username,
            password: password
        }
    };

    return getXsrf()
    .then(function (xsrfValue) {
        params.headers['X-Xsrftoken'] = xsrfValue;
        params.data._xsrf = xsrfValue;
    }).then(function () {
        return http
        .post(params.url)
        .set(params.headers)
        .field(params.data)
        .accept('json')
    }).then(function(res){
        if(res.body.r !== 0){
            throw new Error(res.body.msg);
        }
        return res.body;
    });
}

function isLogin() {
    var params = {
        url: 'https://www.zhihu.com/noti7/new'
    };
    return http
    .get(params.url)
    // redirects(0) 不允许自动302,
    // 当没有登录时, 从入口进去一定会被定向到登录页
    .redirects(0)
    .then(function (res) {
        return res.status === 200;
    });
}

module.exports = {
    isLogin : isLogin,
    login : login
};


