---
layout: post
title: NodeJs通过HTTP模块发起GET/POST请求
date: 2020-03-05 14:49:00
author: 薛勤
tags: nodejs
---

经常用到，总结一波，具体使用还需要参考官方文档。

## POST

官方文档：[http://nodejs.cn/api/http.html#http_http_request_url_options_callback](http://nodejs.cn/api/http.html#http_http_request_url_options_callback)

```js
const http = require('http')
const querystring = require('querystring')

// 用于将对象转换成query字符串
const postData = querystring.stringify({
                                           'msg': '你好世界',
                                           'date': '2020-3-1'
                                       });
console.log(`postData: ${postData}`)
const options = {
    hostname: 'nodejs.cn',
    port: 80,
    path: '/upload',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    if (res.headers['content-encoding'] === 'gzip') {
        console.log('已解决返回数据使用gzip进行压缩')
        let gzip = zlib.createGunzip();
        res.pipe(gzip);
        res = gzip;
    }
    console.log(`状态码: ${res.statusCode}`);
    console.log(`响应头: ${JSON.stringify(res.headers)}`);
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
        console.log(`响应主体: ${chunk}`);
    });
    res.on('end', () => {
        console.log('响应中已无数据');
    });
});

req.on('error', (e) => {
    console.error(`请求遇到问题: ${e.message}`);
});

// 将数据写入请求主体。
req.write(postData);
req.end();
```

## GET

官方文档：[http://nodejs.cn/api/http.html#http_http_get_url_options_callback](http://nodejs.cn/api/http.html#http_http_get_url_options_callback)

```js
const http = require('http')

http.get('http://nodejs.cn/index.json', (res) => {
    const { statusCode } = res;
    const contentType = res.headers['content-type'];

    let error;
    if (statusCode !== 200) {
        error = new Error('请求失败\n' +
                          `状态码: ${statusCode}`);
    } else if (!/^application\/json/.test(contentType)) {
        error = new Error('无效的 content-type.\n' +
                          `期望的是 application/json 但接收到的是 ${contentType}`);
    }
    if (error) {
        console.error(error.message);
        // 消费响应数据来释放内存。
        res.resume();
        return;
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        try {
            const parsedData = JSON.parse(rawData);
            console.log(parsedData);
        } catch (e) {
            console.error(e.message);
        }
    });
}).on('error', (e) => {
    console.error(`出现错误: ${e.message}`);
});
```

