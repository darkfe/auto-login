/**
 * @file test.js
 * @author darkfe
 * @date 2017/2/27
 */

var Agent = require('../../lib/Agent');
var http = new Agent();
var baidu = require('./baidu');

baidu.isLogin()
.catch(function () {
    var username = '';
    var password = '';
    return baidu.login(username, password);
})
.then(function () {
    console.log('登录成功');
})
.catch(function () {
    console.log('登录失败');
});




