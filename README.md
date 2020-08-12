# Dispose-helper

## Your System

centos

## System Tool

```
sudo yum install zip // 系统压缩工具
sudo yum install unzip // 系统解压工具
sudo yum install nginx // 部署静态资源服务器
```

Pull git online code through ssh to connect to the server, implement install and build with one click, and configure nginx to implement automated deployment

```
npm install dispose-helper -D
```

## You need to create an ssh-config.js file in the project root

For more hostConfig configuration, please refer to 
[ssh-node](https://www.npmjs.com/package/node-ssh)

**example**

```javascript
module.exports = {
  hostConfig: {
    host: '192.168.*.*', // 主机地址
    port: '', // 端口 不填默认 80
    username: 'root', // 用户名
    password: '' // 密码
    privateKey: '', // 登录密钥 （密码 密钥二选一)
  },
  fileName: 'docs', // 打包文件名
  cwd: '/web', // 代码拉取运行环境路径
  pathZip: '/web/demo', // 打包文件存放路径
  locationRoot: '/web/demo/vue-test', // nginx loaction root 地址
  port: 8080, //端口
  nginxConfLocation: '/etc/nginx/conf.d' // nginx配置地址
}
```

## After the configuration is complete, in the root directory

```
dispose
```

## You can also add npm script in the package.json file

```json
{
  "scripts": {
    "publish": "dispose"
  }
}
```

```
npm run pusblish
```

