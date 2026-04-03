服务器部署步骤

# 1. 上传
scp hezhang-deploy.tar.gz user@你的服务器IP:/opt/

# 2. 解压
ssh user@你的服务器IP
mkdir -p /opt/hezhang && cd /opt/hezhang
tar -xzf /opt/hezhang-deploy.tar.gz

# 3. 安装 server 依赖（仅首次）
cd /opt/hezhang/server && npm install --production

# 4. 配置环境变量
cp .env.example .env          # 编辑：改 JWT_SECRET、填 DEEPSEEK_API_KEY
# 创建 web/.env.local：
#   NEXT_PUBLIC_API_URL=http://你的域名/api
#   NEXT_PUBLIC_WS_URL=ws://你的域名/ws

# 5. 安装 PM2 并启动
sudo npm install -g pm2
cd /opt/hezhang
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup

# 6. 配置 Nginx
sudo cp nginx.conf /etc/nginx/sites-available/hezhang
# 编辑 server_name 为你的域名/IP
sudo ln -sf /etc/nginx/sites-available/hezhang /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx