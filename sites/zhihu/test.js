/**
 * @file test.js
 * @author darkfe
 * @date 2017/2/27
 */

var Agent = require('../../lib/Agent');
var http = new Agent();
var zhihu = require('./zhihu');

zhihu.isLogin()
.catch(function () {
    var username = '';
    var password = '';
    return zhihu.login(username, password);
})
.then(function () {
    console.log('登录成功');
})
.catch(function (state) {
    console.log('登录失败', state);
});




