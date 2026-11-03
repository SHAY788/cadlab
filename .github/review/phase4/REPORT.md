# CADLAB 第四阶段视觉验收

验收日期：2026-11-03（韩国时间）。对象：Draft PR #4，`design/phase4-visual-ux`，页面代码提交 `1d4651f19ad6aa77ecc052977e1b4a55997d06fd`。本轮只补验收脚本、截图和报告，未更改网站页面、样式、脚本及业务数据。

## 结果

使用本机已安装的 Google Chrome，通过 Playwright 启动真实 Chromium 浏览器内核进行无头回归。覆盖全部 15 个 HTML 页面，视口宽度为 360、375、390、430、768、900、1024、1440、1920px，高度 900px，共 135 项页面/宽度检查通过。机器结果见 [results.json](results.json)。

- 首页 About、Research、People、Publications、Projects 五处编号标签均不存在，对应标题、正文和内容卡片保留。
- News、Our Heritage 完整区块及 News 渲染容器均不存在；Projects 是首页最后一个 section。
- 全站导航无 News、Archive 入口。桌面导航、手机菜单、四组子菜单、Enter/方向键/Escape、展开状态与菜单边界检查通过。
- 无横向溢出、损坏图片、页面 JS 异常、console error 或本地资源 HTTP 错误。
- Projects 与页脚边界贴合（几何间距小于 2px），保留原有 section 内边距；没有删除区块遗留的空白容器。桌面两张项目卡片沿用原三列栅格，右侧一列留空属于既有布局，不是删除区块造成的回归。
- `archive/index.html` 保留，可直接访问，Return to Home 和页脚链接正常。短内容页使用既有贴底页脚，中间留白为视口填充。
- 全站收集的 105 个唯一站内 URL/锚点逐一在浏览器访问并验证目标存在；不包含 mailto/tel 及外站服务可用性检查。

## 数据与页面回归

以 PR 基线 `b450917` 为比较对象，14 个内页的 `<main>` 内容逐字一致（仅归一化 Windows 换行）。`assets/content.js` 和 `.github/maintenance/phase3/` 数据无差异。

浏览器实际渲染数量：Members 5、Alumni 27；Publications 44 国际论文 + 29 韩国论文 + 11 Articles + 7 专利/软件版权 + 6 标准 = 97；Projects 1 ongoing + 26 closed = 27。本轮未改动这些记录。

## 截图

已人工查看首页桌面/手机、菜单、底部与 Archive 关键截图。另附所有内页 375px 和 1440px 完整长截图，供逐页复核。

| 场景 | 手机 | 桌面 |
| --- | --- | --- |
| 首页完整内容 | [375px](home-full-375.png)、[390px](home-full-390.png) | [1440px](home-full-1440.png) |
| 首页首屏 | [375px](home-top-375.png) | [1440px](home-top-1440.png) |
| Projects → 页脚 | [375px](home-footer-375.png) | [1440px](home-footer-1440.png) |
| 展开手机导航 | [375px](menu-375.png)、[390px](menu-390.png) | — |
| Archive 独立页 | [375px](archive-index-375.png) | [1440px](archive-index-1440.png) |

## 复现与边界

运行 `node tools/check-phase4-content.cjs` 验证正文与源数据未改动。安装 Playwright 后运行 `node tools/check-phase4.cjs` 进行浏览器检查。可通过 `PLAYWRIGHT_MODULE` 指定模块路径、`CHROME_PATH` 指定已有 Chrome 可执行文件。脚本仅启动临时 loopback 静态服务器，不部署、不发布。

外部请求被本地响应隔离，Contact 地图显示测试占位，未验证 Google Maps 在线可用性。手机覆盖是浏览器视口与触摸模拟，未在实体手机、Safari 或 Firefox 上运行。

首轮测试中，同页锚点跳转不产生新响应，脚本误将空 response 当作失败；已修正为允许同文档跳转并继续检查锚点。完整长截图改为从页面顶部拍摄，以免固定页头出现在长图中段。这两项均为验收工具修正，无网站修复项。

本次仅更新原 PR #4 分支；保持 Draft，不合并、不发布。
