# QingStor SDK JS Demo

## 使用方法

### Clone

```bash
git clone
```

### 设置签名服务器

```bash
cd signature_server
npm install
# 修改 server_config.yaml 的值
cp server_config.yaml.example server_config.yaml
npm run server
```

现在我们已经在本地启用了一个 Demo 签名服务器

### 在浏览器端使用 SDK

```bash
cd web_with_signature_server
# 更新 config.js 的值
cp config.js.example config.js
```

通过浏览器访问 `index.html` 并打开开发者工具查看日志。

### 在浏览器端使用 SDK 进行分段上传和下载

```bash
cd web_multipart_with_signature_server
# 更新 config.js 的值
cp config.js.example config.js
```

通过浏览器访问 `index.html` 并打开开发者工具查看日志。
