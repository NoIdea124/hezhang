#!/bin/bash
set -e

echo "========================================="
echo "  合账 (HeZhang) 部署脚本"
echo "========================================="

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 项目目录（默认当前目录）
APP_DIR="${APP_DIR:-$(pwd)}"
cd "$APP_DIR"

echo -e "${YELLOW}[1/5] 拉取最新代码...${NC}"
git pull origin main

echo -e "${YELLOW}[2/5] 安装依赖...${NC}"
npm install --production=false

echo -e "${YELLOW}[3/5] 构建 server...${NC}"
npm run build -w server

echo -e "${YELLOW}[4/5] 构建 web...${NC}"
npm run build -w web

echo -e "${YELLOW}[5/5] 重启服务...${NC}"
pm2 startOrRestart ecosystem.config.cjs --env production
pm2 save

echo ""
echo -e "${GREEN}✅ 部署完成！${NC}"
echo "  Server: http://localhost:3001"
echo "  Web:    http://localhost:3000"
echo ""
echo "常用命令："
echo "  pm2 status          # 查看进程状态"
echo "  pm2 logs            # 查看日志"
echo "  pm2 restart all     # 重启所有服务"
