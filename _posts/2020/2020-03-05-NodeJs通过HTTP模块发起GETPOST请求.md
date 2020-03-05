---
layout: post
title: NodeJs通过HTTP模块发起GET/POST请求
date: 2020-03-05 14:49:00
author: 薛勤
tags: nodejs
---

Node.js 的 http 模块和 https 模块在使用差不多，只是换个名称，本文以 http 模块为例。http 的 get / post 等请求都是以 `http.request()` 方法进行的，所以搞懂该方法就搞懂了 Node.js 的 http 模块。 

`http.request()` 方法有两种形参，区别在于是否添加 url 参数。

- http.request(options[, callback])

- http.request(url\[, options][, callback])

url 可以是字符串或 [URL](http://nodejs.cn/s/5dwq7G) 对象。 如果 `url` 是一个字符串，则会自动使用  url.URL() 解析它。 如果它是一个 [URL](http://nodejs.cn/s/5dwq7G) 对象，则会自动转换为普通的 options 对象。

如果同时指定了 url 和 options，则对象会被合并，其中 options 属性优先。

**官方文档**：[http://nodejs.cn/api/http.html#http_http_request_url_options_callback](http://nodejs.cn/api/http.html#http_http_request_url_options_callback)

## POST

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

const request = http.request(options, (response) => {
    if (response.headers['content-encoding'] === 'gzip') {
        console.log('已解决返回数据使用gzip进行压缩')
        let gzip = zlib.createGunzip();
        response.pipe(gzip);
        response = gzip;
    }
    console.log(`状态码: ${response.statusCode}`);
    console.log(`响应头: ${JSON.stringify(response.headers)}`);
    response.setEncoding('utf8');
    response.on('data', (chunk) => {
        console.log(`响应主体: ${chunk}`);
    });
    response.on('end', () => {
        console.log('响应中已无数据');
    });
});

request.on('error', (e) => {
    console.error(`请求遇到问题: ${e.message}`);
});

// 将数据写入请求主体。
request.write(postData);
request.end();
```

## GET

GET方法除了使用 `http.request()` ，还可以使用 `http.get() `方法。

- http.get(options[, callback])

- http.get(url\[, options][, callback])

由于大多数请求都是没有主体的 GET 请求，因此 Node.js 提供了这个便捷的方法。 这个方法与 http.request() 的唯一区别是它将方法设置为 GET 并自动调用 request.end()。

如果没有添加 response 事件处理函数，则响应将会被完全地丢弃。 如果添加了 response 事件处理函数，则**必须消费完响应对象中的数据**，消费方式包括：每当有 readable 事件时调用 `response.read()`、添加 'data' 事件处理函数、通过调用 `.resume()` 方法。在消费完数据之前，不会触发 end 事件。 此外，在读取数据之前，它将会占用内存，这最终可能导致进程内存不足的错误。

与 request 对象不同，如果响应过早地关闭，则 response 对象不会触发 'error' 事件而是触发 'aborted' 事件。

```js
const http = require('http')
const querystring = require('querystring')

const getData = querystring.stringify({
                                            'time': '2019-03-22 14:54:55',
                                            'page': 2
                                        })

http.get(`http://nodejs.cn/?${getData}`, (response) => {
    if (response.statusCode!==200){
        // 如果不想读取数据一定记得手动消费哦
        response.resume();
        return;
    }
    response.setEncoding('utf8');
    let rawData = '';
    response.on('data', (chunk) => {
        rawData += chunk;
    });
    response.on('end', () => {
        console.log(rawData)
    });
}).on('error', (e) => {
    console.error(`出现错误: ${e.message}`);
});
```

