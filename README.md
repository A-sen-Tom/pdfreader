# PDF 智能点读机 & 本地词态内核

一个专为移动端（iOS / iPadOS / Android）优化的 PWA 离线 PDF 阅读器，内置本地词典和词态还原引擎，支持"哪里不会点哪里"的即时取词翻译。

## 核心特性

- **PDF 智能虚拟懒加载** — 无论 PDF 有多少页，只渲染视野内及缓冲区的页面，自动释放视野外内存，防止移动端 OOM 崩溃
- **触控点读取词** — 单击或双击 PDF 中的英文单词，右侧词典面板即时弹出释义
- **5 级词态还原内核** — 点击衍生词（stopped、dying、surgically、wives 等）时，自动逆向推导原形并返回匹配释义
- **离线 OCR 识别** — 集成 Tesseract.js，对扫描版 PDF 自动提取文字并生成可点击的透明文字层
- **浅色/反色主题联动** — 一键切换暗黑模式，PDF 画布与词典面板同步变色，暗光下自动将深色文字转为高亮黄
- **自由拖拽分栏** — 手指按住垂直分割线拖动，实时调节 PDF 视图与词典面板的宽度比例
- **完全本地化** — 词库存入 IndexedDB，OCR 在本地 Web Worker 运行，绝不上传任何数据
- **PWA 全屏模式** — 添加到主屏幕后以无边框、无地址栏的原生 App 体验运行
- **iOS 无痕点读** — 针对 iOS 深度优化，自动隐藏蓝色选择手柄和弹出菜单
- **Retina 高清渲染** — 根据设备像素比自动放大 Canvas 绘制分辨率

## 技术栈

| 模块         | 技术                                    |
| ------------ | --------------------------------------- |
| PDF 渲染     | PDF.js 3.11 (CDN)                       |
| OCR 引擎     | Tesseract.js v5 (CDN)                   |
| 词典存储     | IndexedDB                               |
| 离线支持     | Service Worker (PWA)                    |
| UI 框架      | 原生 JavaScript，无依赖                 |

## 快速开始

1. 用 Safari (iOS) 或 Chrome (Android) 打开本页面
2. 点击右上角分享 → **添加到主屏幕**，获得全屏 App 体验
3. 从桌面图标打开，点击 ⚙️ → **📥 词库**，导入 `.json` 格式词典文件
4. 点击 **📂 PDF**，选择本地 PDF 文献开始阅读
5. 直接点击文中英文单词即可查词

### 词典文件格式

```json
{
  "word": "example",
  "translation": "n. 例子；范例"
}
```

词库的百度网盘下载链接已内嵌在应用欢迎页面中。

## 浏览器兼容性

- **iOS / iPadOS**: Safari (推荐添加到主屏幕使用)
- **Android**: Chrome、三星浏览器 (推荐 PWA 安装)
- **Desktop**: Chrome、Edge、Firefox (建议使用浏览器插件替代)

## 项目结构

```
├── index.html      # 主应用 (PDF渲染、OCR、词典查询、UI)
├── manifest.json   # PWA 清单
├── sw.js           # Service Worker (离线缓存)
└── README.md
```
