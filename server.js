/**
 * 商品展示后端服务
 * 提供商品数据 API，前端展示使用
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
// 静态资源位于仓库根目录（与 GitHub Pages 结构保持一致）
app.use(express.static(__dirname));

// 加载商品数据
let products = [];
try {
  const dataPath = path.join(__dirname, 'data', 'products.json');
  products = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  console.log(`[INFO] 已加载 ${products.length} 个商品`);
} catch (err) {
  console.error('[ERROR] 加载商品数据失败:', err.message);
  process.exit(1);
}

// ============ API 路由 ============

// 获取所有商品（支持分类筛选与关键词搜索）
app.get('/api/products', (req, res) => {
  const { category, q } = req.query;
  let result = products;

  if (category && category !== '全部') {
    result = result.filter(p => p.category === category);
  }
  if (q) {
    const kw = String(q).toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(kw) ||
      p.description.toLowerCase().includes(kw)
    );
  }

  res.json({
    success: true,
    count: result.length,
    data: result
  });
});

// 获取所有商品分类
app.get('/api/categories', (req, res) => {
  const categories = [...new Set(products.map(p => p.category))];
  res.json({
    success: true,
    data: ['全部', ...categories]
  });
});

// 获取单个商品详情
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const product = products.find(p => p.id === id);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: '商品不存在'
    });
  }
  res.json({ success: true, data: product });
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', time: new Date().toISOString() });
});

// 所有其他路由回退到首页（支持前端路由）
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务
app.listen(PORT, () => {
  console.log(`[INFO] 商品展示服务已启动`);
  console.log(`[INFO] 本地访问:  http://localhost:${PORT}`);
  console.log(`[INFO] API 文档: http://localhost:${PORT}/api/health`);
});
