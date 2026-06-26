# PDF 智能点读机 & 本地词态内核

一个基于纯前端技术的 **PWA 离线 PDF 智能点读应用**。将 PDF 渲染、OCR 文字识别、本地词典查询、词态还原（词形还原/词干提取）全部集成在浏览器端运行，无需任何后端服务。

---

## 目录

- [核心特性](#核心特性)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [使用指南](#使用指南)
  - [加载 PDF](#加载-pdf)
  - [导入自定义词库](#导入自定义词库)
  - [点读查词](#点读查词)
  - [全屏模式](#全屏模式)
- [词库格式](#词库格式)
- [词态还原规则](#词态还原规则)
- [OCR 工作流程](#ocr-工作流程)
- [虚拟懒加载机制](#虚拟懒加载机制)
- [PWA 离线能力](#pwa-离线能力)
- [平台适配](#平台适配)
- [文件结构](#文件结构)
- [浏览器兼容性](#浏览器兼容性)
- [依赖说明](#依赖说明)
- [许可证](#许可证)

---

## 核心特性

| 特性 | 说明 |
|------|------|
| 智能点读 | 单击/双击 PDF 中的英文单词，自动查询本地词库并弹出翻译浮窗 |
| 本地词态内核 | 内置 20+ 条词形还原规则（时态、复数、比较级、派生词等），即使词库中只有原形也能命中 |
| 离线 OCR | 集成 Tesseract.js，自动识别扫描版 PDF（图片型 PDF）中的英文文字 |
| 虚拟懒加载 | 基于 Intersection Observer 的页面按需渲染，视野外的页面自动释放内存 |
| Retina 高清渲染 | 根据 `devicePixelRatio` 自动适配高分屏，Canvas 以物理像素渲染 |
| 流式词库导入 | 支持超大 JSON 词库文件（数百 MB），采用分块流式读取 + IndexedDB 批量写入，不阻塞 UI |
| PWA 全离线 | Service Worker 缓存策略，安装后可完全离线使用；支持添加到主屏幕 |
| 反色模式 | 一键切换深色阅读模式（Canvas 反色 + 色调旋转） |
| iOS 隐形点读 | 专为 iOS Safari 优化，禁用长按弹出菜单，透明化系统选中蓝条 |
| macOS 浮窗风格 | 词典弹窗采用 macOS 原生风格的毛玻璃动画浮窗 |
| 自适应布局 | 窗口缩放时自动防抖重绘，保持当前阅读位置不丢失 |
| 液态磨砂主题 | 自定义 CSS 变量体系 + 动态模糊背景，统一视觉风格 |

---

## 技术架构

```
浏览器端
├── PDF.js (3.11.174)         → PDF 解析与 Canvas 渲染
├── Tesseract.js (v5)         → 离线 OCR 英文识别
├── IndexedDB                 → 本地词库持久化存储
├── Intersection Observer     → 虚拟懒加载引擎
├── Service Worker            → PWA 离线缓存
├── Web App Manifest          → 添加到主屏幕
├── FileReader + Stream API   → 流式词库导入
├── Caret Range API           → 精确点击定位单词边界
└── CSS Custom Properties     → 液态磨砂主题系统
```

**核心数据流：**

```
用户点击 PDF 文字
    │
    ▼
Caret Range API 精确定位点击位置的单词
    │
    ▼
词态还原引擎 (20+ 条规则，还原复数/时态/派生)
    │
    ▼
IndexedDB 查询原始词形
    │
    ▼
macOS 风格浮窗展示翻译结果
```

**OCR 数据流（扫描版 PDF）：**

```
Canvas 渲染 PDF 页面
    │
    ▼
检测文字层有效字符数 < 5 → 判定为扫描版
    │
    ▼
Canvas → JPEG (via toDataURL)
    │
    ▼
Tesseract.js Worker 离线 OCR
    │
    ▼
像素坐标 → 数学绝对坐标转换 (1.0 scale 基准)
    │
    ▼
存入 OCR 缓存 (Map<pageNum, words[]>)
    │
    ▼
注入 PDF.js textLayer 实现可点击
```

---

## 快速开始

### 方式一：直接打开（推荐）

1. 将项目文件放置在任意静态服务器目录下
2. 通过 HTTP(S) 访问 `index.html`（不支持 `file://` 协议直接打开，Service Worker 需要 HTTP）
3. 点击右上角 **PDF** 按钮加载 PDF 文件
4. （可选）点击 **词库** 按钮导入自定义 JSON 词典

```bash
# 使用 Python 快速启动本地服务器
python3 -m http.server 8080

# 或使用 Node.js
npx serve .

# 或使用 PHP
php -S localhost:8080
```

然后访问 `http://localhost:8080`

### 方式二：安装为 PWA 应用

1. 在 Chrome/Safari 中打开应用
2. Chrome：地址栏右侧会出现安装图标，点击安装
3. Safari (iOS)：点击分享按钮 → "添加到主屏幕"
4. 安装后可在桌面/主屏幕像原生 App 一样打开，完全离线可用

---

## 使用指南

### 加载 PDF

1. 点击右上角 **PDF** 按钮
2. 选择一个或多个 PDF 文件
3. 应用将自动解析文档结构，以虚拟懒加载方式渲染
4. 阅读过程中滚动页面，视野内的页面自动渲染，视野外的页面自动释放

> **性能提示**：对于数百页的大型 PDF，虚拟懒加载机制可确保内存占用保持稳定，不会随页数增长而线性增加。

### 导入自定义词库

1. 点击右上角 **词库** 按钮
2. 选择一个 `.json` 格式的词库文件（格式见下方[词库格式](#词库格式)）
3. 应用将：
   - 清空旧词库
   - 流式解析 JSON 文件（支持超大文件）
   - 显示百分比进度条
   - 将所有词条写入 IndexedDB
4. 导入完成后弹出确认提示，显示已挂载词条总数

> **性能提示**：流式解析引擎内置 iOS Safari 安全阀（单次解析上限 15 万字符），即使在 iOS 设备上导入数百 MB 的词库也不会崩溃。

### 点读查词

1. **单击** PDF 中的任意英文单词
2. 系统通过 `caretRangeFromPoint` API 精确定位点击位置的单词边界
3. 自动进行词态还原后查询本地词库
4. 弹出 macOS 风格浮窗展示：
   - 命中：显示原词 + 中文释义
   - 未命中：提示词库中无该词及其变形
5. 点击浮窗外部或滚动页面自动关闭浮窗

> **词态还原示例**：点击 `running` → 自动还原为 `run` → 命中词库；点击 `happily` → 还原为 `happy` → 命中词库。

### 全屏模式

1. 点击右上角 **⛶ 全屏** 按钮
2. 应用进入浏览器全屏模式
3. 再次点击退出全屏
4. 支持 `ESC` 键退出全屏（浏览器原生行为）

---

## 词库格式

词库文件为标准 JSON 格式，支持以下两种结构：

### 格式一：简单键值对（推荐）

```json
{
  "apple": "苹果",
  "banana": "香蕉",
  "hello": "你好",
  "world": "世界"
}
```

### 格式二：对象格式（含 translation 字段）

```json
{
  "apple": { "translation": "苹果" },
  "banana": { "translation": "香蕉" }
}
```

### 格式三：混合格式

以上两种格式可以混合使用，解析器会自动识别并提取 translation 字段。

### 注意事项

- 词条键（word）**大小写不敏感**，导入时自动转为小写
- 词条长度需 ≥ 1 个字符
- 键名 `word` 和 `translation` 会被自动跳过
- 支持转义字符（`\"`, `\n`, `\uXXXX` 等 Unicode 转义）
- 建议每个词条对应原形（如使用 `run` 而非 `running`），词态还原引擎会自动处理变形

---

## 词态还原规则

内置的词态还原引擎可自动将单词的各种变形还原为原形进行查询：

| 规则 | 示例 |
|------|------|
| `-ly` → 去掉 | `quickly` → `quick` |
| `-ally` → 去掉 | `basically` → `basic` |
| `-ily` → `-y` | `happily` → `happy` |
| `-bly` → `-ble` | `comfortably` → `comfortable` |
| `-ies` → `-y` | `ladies` → `lady` |
| `-ves` → `-f` / `-fe` | `wolves` → `wolf` / `wolfe` |
| `-oes` → 去掉 `-es` | `heroes` → `hero` |
| `-es` → 去掉 `-es` / `-s` | `washes` → `wash` / `washe` |
| `-s` (非 `-ss`) → 去掉 | `books` → `book` |
| `-ied` → `-y` | `studied` → `study` |
| `-ed` → 去掉 + 去重辅音 | `stopped` → `stop` / `stoppe` / `stopp` |
| `-ing` → `-e` / `-ie` / 去重辅音 | `running` → `run` / `runne` / `runn` |
| `-iest` → `-y` | `happiest` → `happy` |
| `-est` → 去掉 | `biggest` → `big` / `bigg` |
| `-ier` → `-y` | `easier` → `easy` |
| `-er` → 去掉 | `runner` → `run` / `runne` |
| `-th` → 去掉 | `warmth` → `warm` |
| `-ity` → `-e` | `creativity` → `create` |
| `-ment` → 去掉 | `development` → `develop` |

> 查询策略：优先精确匹配原词 → 未命中则按上表顺序逐一尝试变形 → 命中即返回。

---

## OCR 工作流程

对于扫描版 PDF（文字层有效字符数 < 5 的页面），系统自动启动离线 OCR：

1. **判定阶段**：渲染文字层后，统计非空字符数，低于阈值则判定为扫描版
2. **缓存检查**：查询 `ocrCache` (内存级 `Map<pageNum, words[]>`)，命中则直接使用，跳过 OCR
3. **引擎初始化**：首次使用时下载 Tesseract.js WASM Core（约 8MB），后续复用
4. **OCR 识别**：将 Canvas 导出为 JPEG（质量 0.85），送入 Tesseract Worker 进行英文识别
5. **坐标转换**：将 Tesseract 返回的像素坐标（Canvas 物理像素）转换为 PDF.js 1.0 scale 的绝对数学坐标
6. **缓存写入**：将绝对坐标存入 `ocrCache`，避免滚动重绘时重复 OCR
7. **文字层注入**：将 OCR 结果构造为 PDF.js textLayer 数据格式，实现可点击点读

> **注意**：OCR 引擎依赖 CDN 加载 Tesseract.js Core（WASM），首次使用需联网下载。下载后由浏览器 HTTP 缓存策略缓存，后续可完全离线运行。

---

## 虚拟懒加载机制

应用采用骨架预生成 + Intersection Observer 的虚拟化方案：

```
初始化
  │
  ├── 1. 读取第一页尺寸，估算所有页面的高度
  ├── 2. 生成所有页面的骨架 DOM（仅 div 外壳，无 Canvas）
  ├── 3. 撑开正确的滚动条高度
  ├── 4. 跳转到目标页（如重新渲染时恢复原位置）
  │
  └── 5. Intersection Observer 监听骨架元素
        │
        ├── 进入视野 (rootMargin: 100%) → renderSinglePage()
        │     ├── 创建高清 Canvas（devicePixelRatio 倍数）
        │     ├── 渲染 PDF 页面
        │     ├── 提取/OCR 文字层
        │     └── 注入 textLayer 可点击层
        │
        └── 离开视野 → 清空容器内容，释放 GPU/内存
```

**内存策略：**
- `rootMargin: '100% 0px 100% 0px'` 表示上下各预留一倍视口高度的缓冲区
- 每次只有 3-5 页同时保持渲染状态（取决于页面尺寸）
- 滚动时自动释放远处页面的 Canvas 和文字层内存

---

## PWA 离线能力

### Service Worker 缓存策略

| 资源类型 | 策略 |
|---------|------|
| 本地核心文件 (index.html, manifest.json) | 安装时预缓存 (Cache-First) |
| 外部 CDN (PDF.js, Tesseract.js) | 安装时静默预缓存，失败不阻塞安装 |
| 运行时请求 (GET) | Network-First，网络失败时回退缓存 |

### 缓存版本管理

- 每次更新 `sw.js` 中的 `C` 变量值（当前为 `v_1782371852253`）即可触发所有已安装客户端的自动更新
- 旧版本缓存在 activate 事件中自动清理

### 离线能力矩阵

| 功能 | 完全离线 | 首次使用需联网 |
|------|---------|--------------|
| PDF 渲染 | 是 | - |
| 文字层点读 | 是 | - |
| 词库查询 | 是 | - |
| OCR 识别 | 是 | 首次下载 WASM Core (~8MB) |
| 词库导入 | 是 | - |

---

## 平台适配

### macOS

- 自动检测并添加 `macos-mode` CSS 类
- 浮窗动画采用 macOS 原生风格（`cubic-bezier(0.2, 0.8, 0.4, 1)`）
- 字体优先使用 SF Pro Display

### iOS (iPhone / iPad)

- 自动检测并添加 `ios-mode` CSS 类
- 禁用 `-webkit-touch-callout`（防止长按弹出系统复制菜单）
- 透明化 `::selection` 背景色（消除 iOS 系统蓝色选中条）
- 流式词库解析内置安全阀（单次处理上限 15 万字符），防止 JavaScriptCore 对超大字符串执行正则时崩溃

### Android / 通用

- PDF 文件选择器强制锁定 `application/pdf` 类型
- 移除 `multiple` 属性，强制系统使用文档选择器而非媒体扫描器

---

## 文件结构

```
pdfreader/
├── index.html        # 主应用文件（HTML + CSS + JS 全部内联，单文件架构）
├── manifest.json     # PWA Web App Manifest（应用名称、图标、全屏模式配置）
├── sw.js             # Service Worker（缓存策略、离线回退）
└── README.md         # 项目文档
```

> **设计理念**：所有代码内联在 `index.html` 单文件中，无构建工具、无框架依赖、无 npm 安装步骤。可直接部署到任意静态文件服务器。

---

## 浏览器兼容性

| 浏览器 | 最小版本 | 备注 |
|--------|---------|------|
| Chrome | 61+ | 全部功能支持 |
| Edge | 79+ | 全部功能支持 |
| Firefox | 60+ | 全部功能支持 |
| Safari (macOS) | 15.4+ | 全部功能支持 |
| Safari (iOS) | 15.4+ | 已适配 iOS 隐形点读模式 |
| Samsung Internet | 8.0+ | 全部功能支持 |

**必需的浏览器 API：**
- `IntersectionObserver` (Chrome 51+, Safari 12.1+)
- `IndexedDB` (Chrome 24+, Safari 10+)
- `Service Worker` (需 HTTPS 或 localhost)
- `document.caretRangeFromPoint` / `document.caretPositionFromPoint` (Chrome/Safari)
- `FileReader` + `Stream API`
- `Canvas.toDataURL`

---

## 依赖说明

所有依赖通过 CDN 引入，无需安装：

| 库 | 版本 | CDN | 用途 |
|----|------|-----|------|
| PDF.js | 3.11.174 | cdnjs | PDF 解析、Canvas 渲染、文字层提取 |
| Tesseract.js | 5.x | jsDelivr | 离线 OCR 英文识别（含 WASM Core） |

---

## 许可证

MIT License

---

## 待优化 / 已知限制

- OCR 目前仅支持**英文**识别，中文 OCR 需要额外加载 `chi_sim` 语言包
- Tesseract.js WASM Core 首次下载约 8MB，在慢速网络下首次 OCR 体验较慢
- 超大 PDF（> 1000 页）的初始骨架生成可能短暂阻塞 UI（约 50-200ms）
- iOS Safari 的 `caretRangeFromPoint` 实现与 Chrome 有细微差异，极少数情况下单词边界判断可能偏差 1-2 个字符
- 词库仅支持精确键值匹配，不支持模糊搜索或正则搜索
