#!/usr/bin/env node
const NodeSSH = require('node-ssh')
const colors = require('colors')
const ssh = new NodeSSH()
let config = {}
try {
  config = require(process.cwd() + '/ssh-config')
} catch (e) {
  console.log('Please create the ssh-config.js file in the project root directory'.red)
  process.exit()
}


const hostConfig = config.hostConfig || {}
const projectUrl = config.git || ''
const fileName = config.fileName || 'dist'
const cwd = config.cwd || '/'
const pathZip = config.pathZip || '/'
const locationRoot = config.locationRoot || ''
const port = config.port || '8080'
const nginxConfLocation = config.nginxConfLocation || '/etc/nginx/conf.d'
if (!projectUrl) {
  console.log('Please create a new git address'.yellow)
  process.exit()
}
if (!locationRoot) {
  console.log('Please create a new locationRoot'.yellow)
  process.exit()
}
const projectName = projectUrl.match(/(?<=\/).+(?=\.git)/)[0]

const conf = `server {
    listen          ${port};
    server_name     localhost;
    location / {
        root    ${locationRoot};
        index   index.html index.htm;
    }
}`

ssh.connect(hostConfig).then(async () => {
  try {
    // 创建打包文件、git运行环境路径
    await ssh.execCommand(`mkdir -vp ${cwd} ${pathZip}`, {cwd: '/'})
    await ssh.execCommand(`rm -rf ${projectName}`, {cwd})
    console.log('start git clone project'.blue)
    const clone = await ssh.execCommand(`git clone --progress ${projectUrl}`, {cwd})
    console.log(clone.stdout)
    console.log(clone.stderr)
    console.log('download code success'.green)
    console.log('start npm install'.blue)
    const installRes = await ssh.execCommand(`cd ${projectName} && npm install`, {cwd})
    console.log(installRes.stdout)
    console.log(installRes.stderr)
    console.log('install success，npm run build'.green)
    ssh.execCommand('npm run build', {cwd: `${cwd}/${projectName}`}).then(async result => {
      console.log(result.stderr)
      console.log(result.stdout)
      console.log('build success'.green)
      // 压缩打包代码
      await ssh.execCommand(`zip -r ${fileName}.zip ${fileName}`, {cwd: `${cwd}/${projectName}`})
      // 复制解压包到存放目录，解压并删除
      await ssh.execCommand(
        `\\cp -f ${cwd}/${projectName}/${fileName}.zip ${pathZip} && unzip -o ${fileName}.zip && rm -rf ${fileName}.zip`,
        {cwd: pathZip})
      // 创建软连接，与nginx地址关联
      await ssh.execCommand(`ln -s ${pathZip}/${fileName} ${locationRoot}`, {cwd: '/'})
      await ssh.execCommand(`rm -rf ${projectName}`, {cwd})
      // 新建配置文件并重启nginx
      await ssh.execCommand(`touch ${projectName}.conf && >${projectName}.conf && echo "${conf}">>${projectName}.conf`, {cwd: nginxConfLocation})
      await ssh.execCommand('systemctl reload nginx')
      console.log('reload nginx'.blue)
      console.log(`project dispose success address: http://${hostConfig.host}:${port}`.green)
      process.exit()
    })
  } catch (e) {
    console.log(e)
  }
})