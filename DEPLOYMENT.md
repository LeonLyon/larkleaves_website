# LarkLeaves 官网部署说明

## 1. 站点概况

- 纯静态 HTML 站点：`index.html` / `products.html` / `about.html` / `contact.html`
- 资源目录：`css/`、`images/`、`js/`
- 托管：Cloudflare（Cloudflare Pages，代理在 Cloudflare 网络后面）
- GitHub 仓库：`LeonLyon/larkleaves_website`（分支 `main`）
- 域名：`larkleaves.com`（主域名，不带 www）+ `www.larkleaves.com`（跳转到主域名）

## 2. 主域名与 SEO 约定（重要）

- **唯一主域名是 `https://larkleaves.com/`（不带 www）**。两个域名同时可访问时必须把
  `www.larkleaves.com` 全部 301 跳转到 `larkleaves.com`，否则搜索引擎会认为两份重复内容。
- 仓库里所有 SEO 指向已统一为不带 www：
  - 4 个 HTML 页面的 `<link rel="canonical">`、Open Graph、JSON-LD
  - `sitemap.xml` 的全部 `<loc>`
  - `robots.txt` 的 `Sitemap:` 行
- **如果以后决定改 www 做主域名**：用编辑器对以上文件里的 `https://larkleaves.com` 全局替换为
  `https://www.larkleaves.com`，并反向配置跳转（`larkleaves.com` → `www.larkleaves.com`）。

## 3. 部署到 Cloudflare Pages

### 方式 A：连接 GitHub 仓库（推荐，push 即自动部署）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages**。
2. 选择 **Connect to Git**，授权并选择 `LeonLyon/larkleaves_website` 仓库。
3. 构建配置：
   - Framework preset：**None**
   - Build command：留空
   - Build output directory：`/`（根目录）
     - 如果界面不接受根目录，可把全部站点文件移入 `public/` 目录，并把输出目录设为 `public`。
4. **Custom domains**：添加 `larkleaves.com` 和 `www.larkleaves.com` 两个自定义域名。
5. 保存后，后续每次 push 到 `main` 会自动构建部署。

### 方式 B：手动上传

1. 在 Pages 项目 → **Upload assets**，把仓库根目录下的内容（`index.html`、`products.html`、
   `about.html`、`contact.html`、`css/`、`images/`、`js/`、`robots.txt`、`sitemap.xml`）整体上传。
2. 不要上传 `.git/`、`.codex/`、`.agents/` 等隐藏目录。
3. 根目录已包含 `404.html`，不存在的路径会返回 404 页面而不是首页（避免"软 404"）。

## 4. www → 主域名 301 跳转（必须配置）

> 注意：Cloudflare Pages 的 `_redirects` 文件**不支持域名级跳转**，因此仓库里没有放
> `_redirects`。请按官方推荐方式在 Cloudflare 后台配置 **Bulk Redirects**。

> 重要前提：**`www.larkleaves.com` 的 DNS 记录必须存在且为 Proxied（橙色云）**，否则
> www 会直接 NXDOMAIN，Chrome/Firefox 报 `DNS_PROBE_FINISHED_NXDOMAIN`，Edge 可能因缓存
> 暂时正常。记录被删后重新添加即可（Cloudflare DNS → Records → Add record）：
> `Type: A`、`Name: www`、`IPv4: 192.0.2.1`、`Proxy status: Proxied`、`TTL: Auto`。

### 4.1 Bulk Redirects（官方推荐）

1. Cloudflare Dashboard → 域名 `larkleaves.com` → **Rules** → **Bulk Redirects**。
2. **Create bulk redirect list**，内容：

   | Source URL          | Target URL              | Status |
   |---------------------|-------------------------|--------|
   | `www.larkleaves.com` | `https://larkleaves.com` | 301    |

   参数（Parameters）勾选：
   - **Preserve query string**（保留查询参数）
   - **Subpath matching**（子路径匹配）
   - **Preserve path suffix**（保留路径后缀）
   - **Include subdomains**（包含子域名，可选）

3. 用该 list 创建 **bulk redirect rule**，部署到该域名。

### 4.2 备选：Single Redirect（Redirect Rule）

Rules → **Redirect Rules** → Create：

- Expression：`(http.host eq "www.larkleaves.com")`
- Action：Dynamic redirect
- URL：`concat("https://larkleaves.com", http.request.uri.path)`
- Status code：**301**

### 4.3 部署后验证

```powershell
curl.exe -I https://www.larkleaves.com/
curl.exe -I https://www.larkleaves.com/products.html
```

期望结果：状态码 `301`，`Location` 指向 `https://larkleaves.com/`（内页对应
`https://larkleaves.com/products.html`）；主域名 `curl.exe -I https://larkleaves.com/` 返回 `200`。

## 5. 上线后检查清单

- [ ] `https://larkleaves.com/` 返回 200，标题为 "LarkLeaves | Ergonomic Office Chairs..."
- [ ] `https://www.larkleaves.com/` 301 跳转到主域名
- [ ] 每个页面 `view-source` 里 `rel="canonical"` 均为不带 www 的地址
- [ ] `https://larkleaves.com/robots.txt` 可访问
- [ ] `https://larkleaves.com/sitemap.xml` 可访问且包含 4 个页面
- [ ] 访问一个不存在的路径（如 `/no-such-page.html`）返回 404（显示 404 页面），而不是 200 首页；
  若仍返回首页 200，需在托管端关闭"未匹配路径回退首页"（SPA fallback）行为

## 6. 搜索引擎收录

1. [Google Search Console](https://search.google.com/search-console) 添加 **Domain 属性**
   `larkleaves.com`（域名属性自动覆盖 www 与 http/https）。
2. 提交 `https://larkleaves.com/sitemap.xml`，用 **URL Inspection** 验证首页收录。
3. [Bing Webmaster Tools](https://www.bing.com/webmasters) 提交同一 sitemap。
4. 确认 www 的 301 生效后再做第 2、3 步，避免把 www 版本提交收录。

## 7. 日常维护约定

- 新增/删除页面后，同步更新 `sitemap.xml` 和导航菜单。
- 新增样式请放进 `css/` 外部文件，不要写大段内联 `<style>`（页面已做瘦身：
  index 92KB→27KB 等）。
- 新图片先压缩再提交（现有部分图片超过 700KB，建议转 WebP）。
- 修改 SEO 文案时保持每个页面只有 1 个 `<h1>`，title/description 每页唯一。
- 仓库中的 `products.html` 已在 JSON-LD 中生成 12 个 `Product` 结构化数据；改价格或新增
  产品时需同步更新页面正文与 JSON-LD。
