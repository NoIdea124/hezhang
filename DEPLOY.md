# 合账 (HeZhang) 部署指南

## 服务器要求

- Ubuntu 20.04+
- Node.js 18+（推荐 20 LTS）
- 1GB+ RAM
- 开放端口：80（HTTP）、443（HTTPS，可选）

## 一、安装基础软件

```bash
# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx
sudo apt-get install -y nginx

# 验证
node -v && npm -v && pm2 -v && nginx -v
```

## 二、部署项目

### 1. 克隆项目

```bash
cd /opt
sudo git clone https://github.com/NoIdea124/hezhang.git
sudo chown -R $USER:$USER /opt/hezhang
cd /opt/hezhang
```

### 2. 配置环境变量

**Server 环境变量** — 创建 `/opt/hezhang/.env`：

```env
PORT=3001
JWT_SECRET=在这里填一个随机字符串（至少32位）
DEEPSEEK_API_KEY=你的DeepSeek API Key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
DB_PATH=./data/hezhang.db
```

> 生成随机 JWT_SECRET：`openssl rand -hex 32`

**Web 环境变量** — 创建 `/opt/hezhang/web/.env.local`：

```env
NEXT_PUBLIC_API_URL=http://你的域名或IP/api
NEXT_PUBLIC_WS_URL=ws://你的域名或IP/ws
```

> 如果使用 HTTPS，改为 `https://` 和 `wss://`

### 3. 安装依赖并构建

```bash
npm install
npm run build -w server
npm run build -w web
```

### 4. 创建数据目录

```bash
mkdir -p /opt/hezhang/data
```

## 三、配置 Nginx

```bash
# 复制配置文件
sudo cp /opt/hezhang/nginx.conf /etc/nginx/sites-available/hezhang

# 编辑配置，把 server_name 替换为你的域名或 IP
sudo nano /etc/nginx/sites-available/hezhang

# 启用站点
sudo ln -sf /etc/nginx/sites-available/hezhang /etc/nginx/sites-enabled/hezhang
sudo rm -f /etc/nginx/sites-enabled/default

# 测试并重载
sudo nginx -t
sudo systemctl reload nginx
```

## 四、启动服务

```bash
cd /opt/hezhang

# 使用 PM2 启动
pm2 start ecosystem.config.cjs

# 查看状态
pm2 status

# 设置开机自启
pm2 save
pm2 startup
# 运行输出的 sudo 命令
```

## 五、验证

```bash
# 检查服务状态
pm2 status

# 检查后端 API
curl http://localhost:3001/api/health

# 检查前端
curl -I http://localhost:3000

# 检查 Nginx
curl -I http://localhost
```

浏览器访问 `http://你的域名或IP` 应该能看到登录页面。

## 日常维护

### 更新部署

```bash
cd /opt/hezhang
./deploy.sh
```

### 常用 PM2 命令

```bash
pm2 status                 # 查看进程状态
pm2 logs                   # 查看实时日志
pm2 logs hezhang-server    # 只看后端日志
pm2 logs hezhang-web       # 只看前端日志
pm2 restart all            # 重启所有服务
pm2 restart hezhang-server # 重启后端
pm2 monit                  # 实时监控面板
```

### 数据库备份

```bash
cp /opt/hezhang/data/hezhang.db /opt/hezhang/data/hezhang.db.bak
```

## HTTPS 配置（推荐）

使用 Let's Encrypt 免费证书：

```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

配置完成后，记得更新 `web/.env.local`：

```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NEXT_PUBLIC_WS_URL=wss://your-domain.com/ws
```

然后重新构建前端并重启：

```bash
npm run build -w web
pm2 restart hezhang-web
```

## 故障排查

| 问题 | 排查方式 |
|------|----------|
| 502 Bad Gateway | `pm2 status` 检查服务是否运行 |
| API 无响应 | `pm2 logs hezhang-server` 查看错误 |
| 页面空白 | `pm2 logs hezhang-web` 检查 Next.js 日志 |
| WebSocket 断连 | 检查 Nginx 配置中的 `/ws` 部分 |
| 数据库错误 | 检查 `data/` 目录权限，确保可写 |
