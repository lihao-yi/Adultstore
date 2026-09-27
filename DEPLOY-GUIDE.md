# 保姆级部署教学 · 从零到上线

> 适合：从未部署过网站的新手，按顺序操作即可。
> 预计耗时：30-60 分钟（看服务器网速）

---

## 🎯 你将完成的事情

```
本地电脑代码 → GitHub 仓库 → 你的服务器 → 你的域名（HTTPS）
       ↑                                ↓
       └────── 自动部署（push 即更新）←──┘
```

最终效果：浏览器访问 `https://你的域名` 看到毛玻璃商品展示页。

---

## 📋 准备清单

在开始前你需要：

- [ ] 一台云服务器（阿里云/腾讯云/AWS/Vultr 等都可以）
- [ ] 一个域名（已解析到服务器 IP）
- [ ] 服务器的 SSH 登录方式（IP、用户名、密码或私钥）
- [ ] 本地电脑装好 Git（[下载地址](https://git-scm.com/downloads)）
- [ ] 一个 GitHub 账号（[注册地址](https://github.com/signup)）

---

## 第 1 步：注册 GitHub 账号（如已有跳过）

1. 打开 https://github.com/signup
2. 输入邮箱、设置密码、用户名
3. 验证邮箱（GitHub 会发一封邮件，点里面的链接）
4. 登录后看到首页即完成

---

## 第 2 步：在 GitHub 创建空仓库

1. 登录后访问 https://github.com/new
2. 填写：
   - **Repository name**：`product-display`
   - **Description**：可选填"毛玻璃商品展示"
   - 选 **Public**（公开）或 **Private**（私有，推荐）
   - ⚠️ **不要勾** 任何 "Add a README"、"Add .gitignore"、"Choose a license"
3. 点击绿色按钮 **Create repository**
4. 跳转到代码页，复制类似下面的地址：
   ```
   https://github.com/你的用户名/product-display.git
   ```
   先记下来，下一步要用。

---

## 第 3 步：本地配置 Git（仅首次需要）

打开 **PowerShell**（Win+R 输入 `powershell` 回车）：

```powershell
# 配置你的身份（只做一次）
git config --global user.name "你的名字或用户名"
git config --global user.email "你的邮箱@xxx.com"

# 设置默认分支为 main
git config --global init.defaultBranch main
```

验证：
```powershell
git config --global user.name   # 应输出你设置的名字
```

---

## 第 4 步：初始化本地仓库并首次推送

### 4.1 进入项目目录

```powershell
cd D:\web-design-master\projects\product-display
```

### 4.2 初始化 git 仓库

```powershell
git init -b main
```
看到输出 `Initialized empty Git repository in ...` 即成功。

### 4.3 添加并提交代码

```powershell
git add .
git commit -m "Init: 毛玻璃商品展示项目"
```
看到 `4 files changed` 之类的输出即成功。

### 4.4 关联 GitHub 远程仓库

把 `<你的用户名>` 替换成你的 GitHub 用户名：

```powershell
git remote add origin https://github.com/<你的用户名>/product-display.git
```

如果输错了想改：
```powershell
git remote set-url origin https://github.com/<新用户名>/product-display.git
```

### 4.5 首次推送

```powershell
git push -u origin main
```

**首次会弹出 GitHub 登录窗口**：
- 浏览器会自动打开
- 点 **Authorize git-ecosystem** 或类似按钮授权
- 回到 PowerShell 看到 `Linking to GitHub account... succeeded` 即可

看到 `Branch 'main' set up to track 'origin/main'` 即推送成功 ✅

### 4.6 验证

回到浏览器打开你的 GitHub 仓库页面，能看到 8 个文件（含 `server.js`、`data/products.json` 等）即推送成功。

---

## 第 5 步：SSH 登录你的服务器

### 5.1 获取服务器登录信息（在云服务商控制台找）

需要：
- 服务器公网 IP（如 `123.45.67.89`）
- 用户名（Ubuntu 默认 `root` 或 `ubuntu`，CentOS 默认 `root`）
- 密码 或 SSH 私钥

### 5.2 SSH 登录

Windows 用户在 PowerShell 直接：
```bash
ssh root@123.45.67.89
```
首次会提示 `Are you sure you want to continue connecting`，输入 `yes` 回车。
然后输入密码（输入时不显示字符，正常）。

看到提示符变成 `root@xxx:~#` 即登录成功。

---

## 第 6 步：服务器环境准备（一次性）

在 SSH 终端里**逐条**执行：

### 6.1 更新系统

```bash
apt update && apt upgrade -y
```
（CentOS 用户用 `yum update -y`）

### 6.2 安装 Node.js 20

```bash
# 安装 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# 安装 Node.js
apt install -y nodejs

# 验证
node --version   # 应输出 v20.x.x
npm --version    # 应输出 10.x.x
```

### 6.3 安装 PM2（守护进程，崩溃自动重启）

```bash
npm install -g pm2
pm2 --version    # 应输出 5.x.x
```

### 6.4 安装 Git（一般已自带，确认一下）

```bash
git --version    # 应输出 git version 2.x.x
```

### 6.5 安装 Nginx（Web 服务器反代）

```bash
apt install -y nginx
nginx -v         # 应输出 nginx version: nginx/1.x.x
```

### 6.6 安装 Certbot（HTTPS 证书工具）

```bash
apt install -y certbot python3-certbot-nginx
```

---

## 第 7 步：服务器拉取代码并启动

### 7.1 准备目录

```bash
mkdir -p /var/www
cd /var/www
```

### 7.2 克隆代码

如果仓库是 **Public**：
```bash
git clone https://github.com/<你的用户名>/product-display.git
```

如果仓库是 **Private**，需要先配置访问令牌：
1. 在 GitHub 网页：Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
2. 勾选 `repo` 权限，生成后**立即复制**令牌（只显示一次）
3. 克隆时用户名填 GitHub 用户名，密码填令牌：
```bash
git clone https://github.com/<你的用户名>/product-display.git
# Username: 你的用户名
# Password: 粘贴刚才的令牌
```

### 7.3 安装依赖并启动

```bash
cd /var/www/product-display
npm install --production

# 测试启动（前台运行，Ctrl+C 退出）
node server.js
# 看到 "[INFO] 商品展示服务已启动" 即正常，按 Ctrl+C 退出

# 用 PM2 后台守护启动
pm2 start server.js --name product-display

# 保存进程列表（重启服务器后自动恢复）
pm2 save

# 设置 PM2 开机自启（执行后会输出一条命令，复制再执行一次）
pm2 startup
# 例如输出：sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
# 把这条命令复制执行一遍
```

### 7.4 验证服务

```bash
curl http://localhost:3000/api/health
```
应返回：`{"success":true,"status":"ok","time":"..."}` ✅

---

## 第 8 步：配置域名 DNS 解析

到你的**域名服务商后台**（阿里云/腾讯云/Cloudflare 等）：

1. 找到 **DNS 解析** / **Records** 设置
2. 添加一条 **A 记录**：
   - **记录类型**：A
   - **主机记录**：`@`（代表根域名）或 `www`
   - **记录值**：你的服务器 IP（如 `123.45.67.89`）
   - **TTL**：默认即可
3. 保存，等待 1-10 分钟生效

### 验证 DNS 是否生效

本地 PowerShell 执行：
```powershell
ping 你的域名.com
```
看到解析出的 IP 是你的服务器 IP 即生效。

---

## 第 9 步：配置 Nginx 反向代理

### 9.1 创建 Nginx 配置文件

在服务器 SSH 终端执行：

```bash
cat > /etc/nginx/conf.d/product-display.conf << 'EOF'
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
```

**⚠️ 把 `your-domain.com` 改成你的真实域名**（共两处）。

### 9.2 测试并重载 Nginx

```bash
# 测试配置语法
nginx -t
# 应输出: syntax is ok / test is successful

# 重载配置（不会断开连接）
systemctl reload nginx
```

### 9.3 验证访问

本地浏览器访问 `http://你的域名.com`，应看到毛玻璃商品展示页面 ✅

---

## 第 10 步：申请 HTTPS 证书（免费）

```bash
sudo certbot --nginx -d 你的域名.com -d www.你的域名.com
```

交互过程：
1. 输入邮箱（用于证书过期提醒）
2. 同意服务条款：输入 `Y`
3. 是否分享邮箱：输入 `N`
4. 选择要认证的域名：直接回车选全部
5. 是否把 HTTP 自动跳转 HTTPS：选 `2`（Redirect）

看到 `Congratulations! You have successfully enabled HTTPS` 即成功 ✅

现在访问 `https://你的域名.com` 即可看到带锁标志的安全页面。

---

## 第 11 步：配置 GitHub Actions 自动部署

目标：以后每次本地改代码 `git push`，服务器自动拉取并重启。

### 11.1 在服务器生成 SSH 密钥对

```bash
# 在服务器上生成密钥（一路回车，不设密码）
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key -N ""

# 查看公钥
cat ~/.ssh/deploy_key.pub
# 整段复制下来，形如：ssh-ed25519 AAAA... github-actions-deploy

# 把公钥追加到授权文件
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# 查看私钥（待会儿要粘贴到 GitHub）
cat ~/.ssh/deploy_key
# 整段复制下来，包括 -----BEGIN ... -----END ...-----
```

### 11.2 在 GitHub 仓库添加 Secrets

1. 打开你的 GitHub 仓库网页
2. **Settings** → **Secrets and variables** → **Actions**
3. 点 **New repository secret**，逐个添加：

| Name | Value |
|------|-------|
| `SERVER_HOST` | 你的服务器 IP（如 `123.45.67.89`） |
| `SERVER_USER` | SSH 用户名（如 `root`） |
| `SERVER_PORT` | SSH 端口（默认 `22`，如改过填改的） |
| `SSH_PRIVATE_KEY` | 粘贴上一步的私钥**完整内容** |

每个都点 **Add secret** 保存。

### 11.3 推送 workflow 文件

workflow 文件 [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) 已经为你创建好。

本地 PowerShell 执行：
```powershell
cd D:\web-design-master\projects\product-display
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions auto deploy"
git push
```

### 11.4 验证自动部署

1. 打开 GitHub 仓库 → **Actions** 标签页
2. 应看到 "Deploy to Server" 工作流正在运行
3. 等待 30-60 秒，绿色 ✓ 表示成功
4. 红色 × 表示失败，点进去看日志排错

### 11.5 测试整个流程

本地修改任意文件（如改 `data/products.json` 加个商品），然后：
```powershell
git add .
git commit -m "Add new product"
git push
```
1 分钟内访问域名，应看到新商品出现。

---

## 🎉 完成！最终验证清单

- [ ] 浏览器访问 `https://你的域名.com` 显示毛玻璃页面
- [ ] 浏览器地址栏有锁标志（HTTPS）
- [ ] 商品图片正常加载
- [ ] 分类筛选、搜索功能正常
- [ ] 点商品卡片能弹出详情
- [ ] `git push` 后服务器自动更新

---

## 🆘 常见问题排查

### Q1：`git push` 报错 `Authentication failed`

**原因**：GitHub 已不支持密码登录，需用令牌或 SSH。

**解决**：
1. 在 GitHub：Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
2. 勾选 `repo` 全部权限，生成令牌
3. Windows 凭据管理器：控制面板 → 凭据管理器 → Windows 凭据，找到 `git:https://github.com` 删除
4. 重新 `git push`，弹窗时用令牌作密码

### Q2：服务器 `curl localhost:3000` 没反应

```bash
# 看 PM2 进程状态
pm2 status

# 看日志
pm2 logs product-display --lines 50

# 重启
pm2 restart product-display
```

### Q3：浏览器访问域名打不开

排查顺序：
```bash
# 1. 服务器上服务是否起来
curl http://localhost:3000/api/health

# 2. Nginx 是否运行
systemctl status nginx

# 3. Nginx 配置是否正确
nginx -t

# 4. 防火墙是否放行 80/443 端口
# 阿里云/腾讯云在控制台安全组放行 80 和 443
# Ubuntu 系统防火墙：
ufw allow 80
ufw allow 443
```

### Q4：HTTPS 证书申请失败

**常见原因**：
- 域名 DNS 未生效（等几分钟再试）
- 服务器 80 端口没开放（云控制台安全组放行）
- 域名已解析到其他 IP

测试 DNS 是否生效：
```bash
# 在本地 PowerShell
nslookup 你的域名.com
# 应返回你的服务器 IP
```

### Q5：GitHub Actions 部署失败

1. 打开仓库 → **Actions** → 点失败的运行 → 看 **Deploy to Server** 步骤的日志
2. 常见错误：
   - `Permission denied (publickey)`：私钥粘贴不完整或公钥没加到 authorized_keys
   - `Host key verification failed`：在 workflow 的 ssh-action 加 `script_stop: false` 和 `key_path`
   - `git pull` 冲突：服务器上手动改了文件，先 SSH 上去 `git reset --hard` 再重试

### Q6：图片显示不出来

项目用的 AI 图片生成接口可能在你的服务器网络下不通。换成静态图：

1. 把图片下载到 `public/images/` 目录
2. 修改 `data/products.json` 把 `image` 字段改成 `/images/xxx.jpg`
3. 重启服务

### Q7：修改端口（不想用 3000）

```bash
# 编辑环境变量后启动
PORT=8080 pm2 start server.js --name product-display
```
记得同步改 Nginx 配置里的 `proxy_pass http://127.0.0.1:8080;`。

---

## 📞 求助渠道

如果卡住了：
1. 把**报错完整信息**复制下来
2. 把你执行到第几步、看到了什么也描述清楚
3. 把以上信息发给我，我帮你定位问题

部署成功后告诉我，我可以帮你做后续优化（如加商品管理后台、加更多商品分类等）。

---

**祝你一次部署成功！** 🎊
