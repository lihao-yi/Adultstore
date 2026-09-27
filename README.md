# 琉璃商店 · 商品展示

毛玻璃（Glassmorphism）风格的前后端商品展示项目，**仅展示，不涉及在线交易**。

## 项目结构

```
product-display/
├── server.js              ← Express 后端，提供商品 API
├── package.json
├── data/
│   └── products.json      ← 商品数据（12 件综合商品）
└── public/                ← 前端静态资源
    ├── index.html
    ├── css/style.css       ← 毛玻璃风格样式
    └── js/app.js           ← 前端交互逻辑
```

## 本地启动

```bash
cd d:\web-design-master\projects\product-display
npm install
npm start
```

访问 http://localhost:3000 即可查看。

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/products` | 获取全部商品，支持 `?category=` 和 `?q=` 筛选 |
| GET | `/api/products/:id` | 获取单个商品详情 |
| GET | `/api/categories` | 获取所有商品分类 |
| GET | `/api/health` | 健康检查 |

## 部署到服务器（域名 + 服务器）

### 1. 上传代码到服务器

```bash
# 在服务器上
git clone <你的仓库地址> /var/www/product-display
cd /var/www/product-display
npm install --production
```

### 2. 使用 PM2 守护进程

```bash
npm install -g pm2
pm2 start server.js --name product-display
pm2 save
pm2 startup
```

### 3. Nginx 反向代理（推荐）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 静态资源
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # API 接口
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }
}
```

### 4. HTTPS 证书（Let's Encrypt）

```bash
sudo certbot --nginx -d your-domain.com
```

### 5. 环境变量

可通过环境变量调整端口：

```bash
PORT=8080 pm2 start server.js --name product-display
```

## 修改商品数据

编辑 `data/products.json`，重启服务即可生效：

```bash
pm2 restart product-display
```

## 设计说明

- **UI 风格**：Glassmorphism 毛玻璃 + 卡片网格
- **配色**：靛蓝主色 + 琥珀强调色 + 紫粉渐变背景
- **响应式**：桌面 4 列 / 平板 2-3 列 / 手机 1-2 列
- **可访问性**：键盘导航、ARIA 标签、`prefers-reduced-motion` 支持
- **状态完整**：加载骨架屏、空状态、错误提示、悬停反馈

## 技术栈

- 后端：Node.js + Express 4
- 前端：原生 HTML/CSS/JS（无框架依赖）
- 图片：实时 AI 生成接口（可替换为本地静态图）

## 仅展示 · 非交易

本项目不含购物车、下单、支付等任何交易功能，所有"价格"字段仅用于商品信息展示。
