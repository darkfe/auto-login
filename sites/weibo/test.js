/**
 * @file test.js
 * @author darkfe
 * @date 2017/2/27
 */

var Agent = require('../../lib/Agent');
var http = new Agent();
var weibo = require('./weibo');

weibo.isLogin()
.catch(function () {
    var username = '';
    var password = '';
    return weibo.login(username, password);
})
.then(function () {
    console.log('登录成功');

    /*
    http.get('http://m.weibo.cn').then(function (res) {
        var data = res.text.match(/render_data\s*=\s*([\S\s]*?);/);
        return eval('(' + data[1] + ')');
    })
    */
})
.catch(function () {
    console.log('登录失败');
});

