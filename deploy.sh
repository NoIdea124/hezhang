#!/bin/bash
set -e

echo "========================================="
echo "  合账 (HeZhang) 本地打包脚本"
echo "========================================="
echo "在本地 build 并打包，然后上传到服务器解压即可运行"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

DIST_DIR="dist-deploy"

echo -e "${YELLOW}[1/4] 安装依赖...${NC}"
npm install

echo -e "${YELLOW}[2/4] 构建 web...${NC}"
npm run build -w web

echo -e "${YELLOW}[3/4] 整理部署文件...${NC}"
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# ---- Server（tsx 直接运行源码，不需要编译）----
mkdir -p "$DIST_DIR/server"
cp -r server/src "$DIST_DIR/server/src"
cp server/package.json "$DIST_DIR/server/"
cp server/tsconfig.json "$DIST_DIR/server/"

# ---- Shared 包 ----
cp -r packages "$DIST_DIR/packages"

# ---- Web（Next.js standalone）----
mkdir -p "$DIST_DIR/web/.next"
cp -r web/.next/standalone/web/* "$DIST_DIR/web/"
# standalone 不包含 static 和 public，需手动复制
cp -r web/.next/static "$DIST_DIR/web/.next/static"
cp -r web/public "$DIST_DIR/web/public"

# ---- 根目录配置 ----
cp package.json "$DIST_DIR/"
cp ecosystem.config.cjs "$DIST_DIR/"
cp nginx.conf "$DIST_DIR/"
cp DEPLOY.md "$DIST_DIR/"
cp .env "$DIST_DIR/.env.example"

# standalone 模式下 node_modules 已内嵌，但 server 需要
# 复制 standalone 根目录的 node_modules（包含 shared 等 workspace 依赖）
if [ -d "web/.next/standalone/node_modules" ]; then
  cp -r web/.next/standalone/node_modules "$DIST_DIR/node_modules"
fi

echo -e "${YELLOW}[4/4] 打包为 tar.gz...${NC}"
tar -czf hezhang-deploy.tar.gz -C "$DIST_DIR" .

# 清理临时目录
rm -rf "$DIST_DIR"

SIZE=$(du -sh hezhang-deploy.tar.gz | cut -f1)
echo ""
echo -e "${GREEN}✅ 打包完成！${NC}"
echo "  文件: hezhang-deploy.tar.gz ($SIZE)"
echo ""
echo "========================================="
echo "  服务器部署步骤"
echo "========================================="
echo ""
echo "1. 上传到服务器："
echo "   scp hezhang-deploy.tar.gz user@server:/opt/"
echo ""
echo "2. SSH 到服务器解压："
echo "   ssh user@server"
echo "   mkdir -p /opt/hezhang && cd /opt/hezhang"
echo "   tar -xzf /opt/hezhang-deploy.tar.gz"
echo ""
echo "3. 安装 server 依赖（仅首次或依赖变更时）："
echo "   cd /opt/hezhang/server && npm install --production"
echo ""
echo "4. 配置环境变量："
echo "   cp .env.example .env       # 编辑填入生产配置"
echo "   创建 web/.env.local        # 填入 NEXT_PUBLIC_API_URL 和 NEXT_PUBLIC_WS_URL"
echo ""
echo "5. 启动服务："
echo "   cd /opt/hezhang"
echo "   pm2 start ecosystem.config.cjs"
echo "   pm2 save && pm2 startup"
echo ""
echo "6. 配置 Nginx（参考 nginx.conf）"
