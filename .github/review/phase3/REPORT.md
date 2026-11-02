# CADLAB 第三阶段变更与验证报告

## 基线与范围

基线：`61dd7e9c8d26229811e4f9670fc6a1f42677abd8`，包含已合并的 PR #2。独立分支：`content/phase3-information`。本变更为 Draft PR 待审内容，未合并、未发布。

本阶段只根据仓库现有资料整理展示与入口，没有做外部事实核实，没有新造人员、论文、项目或新闻。

## 修改内容

### 首页

- 删除教授“尚待添加”、校友“尚待整理”、论文“准备中”和项目“将来添加”等与既有子页相矛盾的占位摘要。
- 3 个 People、5 个 Publications、2 个 Research 卡片标题作为原生详情链接；简介区增加 Contact 入口。
- 不在首页展示未经核实的人员、论文或项目数量；项目入口明确说明原分类与当前状态仍待确认。
- 保留原有简介、研究方向、新闻记录、插画、留白和第二阶段设计。没有新增装饰图片。

### People

- Professor 资料字段不改，补充当前任职、办公室和联系方式待核实提示，并增加同级页面入口。
- Members 的三张卡片原字段完整保留；添加与历史照片区域一致的占位样式，没有伪造人物照片；明确邮箱等联系方式当前有效性待核实。
- Members 内部编辑说明移入维护文档，公开页面不再展示操作记录；本阶段未按该旧说明再次删除、恢复或修改任何人员。
- Alumni 27 张原始卡片按现有毕业年月倒序排列，覆盖 2009–2026 的 13 个年份；同月稳定排序，全部历史记录保留。多学位卡片按现有分组对应的毕业年月排序；未填补缺失的其他学位日期。
- 校友单位、职位仍为原文，并明确历史来源不等于已核实的现任单位。

### Publications

- 五类成果增加共同分类入口和年份导航；全部记录同时可读，点击年份只跳转，不隐藏历史记录。
- 国际和韩国论文原有年份顺序已经倒序；韩国列表增加年份分组。作者、题名、期刊、卷期、页码和日期原文不变。
- Articles 11 条资料由原脚本数组转为静态 HTML，保留逐字段原文，同时存档原始数组。
- 专利与软件版权保留分组及其各自明确日期的倒序；标准按原有版本年份倒序，未推断当前法律或有效状态。
- 71 条成果只明确到年份，保留原同年顺序并进入人工核实清单；不把 No./Vol. 当作月份。
- 没有将学位论文并入期刊列表，没有新增 DOI、论文 URL 或引用次数，也没有未经证据统一改写作者拼写或期刊名称。

### Research

- 两页 29 次展示按精确项目名匹配为 27 个唯一项目。
- 两个 2025.12 计划结束的项目仍各保留在 Ongoing 和 Closed 原页面、原位置；新增冲突提示及相互对照链接。
- 建立唯一项目 ID、每处资助机构/研究期限原文、原页面与位置、状态待核实情况。实际结项日期保持 null，不用计划日期代替。
- 其他原 Closed 记录只保留来源分类，不宣称已取得独立结项证明。最后一条原文缺少资助机构及研究期限，已明确列为待办。

## 原文保留结果

| 范围 | 检查结果 |
|---|---|
| Professor | 原简介卡片和三组履历/研究方向列表 HTML 完全一致 |
| Members | 原 3 张卡片去除新增的纯展示照片占位后，HTML 完全一致 |
| Alumni | 原 27 张卡片 HTML 逐条完全一致；仅按明确毕业年月稳定重排 |
| 国际 / 韩国论文 | 44 / 29 条 li HTML 完全一致，原相对顺序保留 |
| Articles | 原 11 条 title/source/year 逐字段一致；静态列表文本一致 |
| Patents / Standards | 7 / 6 条 article HTML 完全一致；分类和顺序保留 |
| Research | 两页各 2 / 27 条项目 HTML、原顺序和归属完全一致 |
| 图片与统一导航 | 所有原有 JPG/SVG/PNG 不变；15 页页头页脚和 navigation.js 字节一致 |
| 共享 CSS | 第二阶段 styles.css / pages.css 原内容保持为前缀，只追加本阶段局部样式 |
| 首页事实性数据 | about、research、news 与基线逐字段一致 |

原文快照和 SHA-256 位于 [source-records.json](../../maintenance/phase3/source-records.json)。这不是外部真伪认证，而是防止本次整理误改仓库资料的校验。

## 测试结果

系统 Chromium + Playwright 的真实本地浏览器测试，15 页 × 375、430、768、900、1024、1440px，共 **90/90 通过**。900px 及以下启用触屏模拟，视口高度 1000px。

- Logo 加载与比例、汉堡默认状态、四组下拉菜单、aria-expanded、Tab、Enter、Space、方向键进入和 Esc 关闭/焦点恢复通过。
- 逐页比对浏览器渲染的原始记录文本；允许校友重排，不允许记录减少或字段改变。
- 无页面横向溢出、下拉菜单越界或 JavaScript 运行错误。
- 分类入口、年份锚点、27 张校友卡片及年份倒序、首页 10 个详情入口检查通过。
- 补充实点首页全部 10 个详情入口，目标页面正确；跨页 News 锚点和 900↔1024px 重置通过。
- 六个宽度补测最终 Members 提示及年份标题没有被固定页头遮挡；关闭 JavaScript 后 Articles 的 11 条记录和年份导航仍可阅读。
- 静态检查：15 页结构、唯一 ID、587 个本地链接/资源/锚点，原文守护检查、JS 语法、git diff --check，全部通过。

机器结果：[全站浏览器](browser-results.json) · [补充检查](extra-results.json) · [原文与静态检查](static-results.json)。可复现脚本：`tools/check-content.py`、`tools/check-content-browser.cjs`，命令见仓库 README。

测试边界：未使用实体设备、Safari 或 Firefox；Google Maps 外部 iframe 在全站回归中本地替代，未验证外部地图服务。favicon 请求由测试服务器返回 204，不据此宣称补齐了 favicon。所有截图均来自本地基线/分支，不是正式网站已发布证明。

## 前后对比截图

以下截图为同宽度的原始浏览器视口图（高度 1000px）。首页为滚动到 People / Publications / Projects 区域后截图，其他页面为首屏；并非完整页面。全量记录保留通过独立校验验证，不以截图替代。

| 页面 / 位置 / 宽度 | 修改前 | 修改后 |
|---|---|---|
| alumni-1440 | ![修改前](screenshots/alumni-1440-before.png) | ![修改后](screenshots/alumni-1440-after.png) |
| alumni-375 | ![修改前](screenshots/alumni-375-before.png) | ![修改后](screenshots/alumni-375-after.png) |
| articles-1440 | ![修改前](screenshots/articles-1440-before.png) | ![修改后](screenshots/articles-1440-after.png) |
| completed-1440 | ![修改前](screenshots/completed-1440-before.png) | ![修改后](screenshots/completed-1440-after.png) |
| home-entries-1440 | ![修改前](screenshots/home-entries-1440-before.png) | ![修改后](screenshots/home-entries-1440-after.png) |
| home-projects-1440 | ![修改前](screenshots/home-projects-1440-before.png) | ![修改后](screenshots/home-projects-1440-after.png) |
| home-publications-1440 | ![修改前](screenshots/home-publications-1440-before.png) | ![修改后](screenshots/home-publications-1440-after.png) |
| international-1440 | ![修改前](screenshots/international-1440-before.png) | ![修改后](screenshots/international-1440-after.png) |
| korean-1440 | ![修改前](screenshots/korean-1440-before.png) | ![修改后](screenshots/korean-1440-after.png) |
| members-1440 | ![修改前](screenshots/members-1440-before.png) | ![修改后](screenshots/members-1440-after.png) |
| members-375 | ![修改前](screenshots/members-375-before.png) | ![修改后](screenshots/members-375-after.png) |
| ongoing-1440 | ![修改前](screenshots/ongoing-1440-before.png) | ![修改后](screenshots/ongoing-1440-after.png) |
| professor-1440 | ![修改前](screenshots/professor-1440-before.png) | ![修改后](screenshots/professor-1440-after.png) |
| professor-375 | ![修改前](screenshots/professor-375-before.png) | ![修改后](screenshots/professor-375-after.png) |

## 待人工核实清单

请重点审核 [中文核实清单](../../maintenance/phase3/PHASE3-VERIFICATION.md) 及 [维护说明](../../maintenance/phase3/README.md)：

1. Professor 与 Members 的当前身份、任职、办公室及联系方式。
2. Alumni 历史单位、同名跨类别记录、未提供的其他学位日期；不得因版面整理删除旧校友。
3. 两个双重分类项目的真实状态和实际结项日期；其余项目的来源证明；缺失期限/资助机构的项目。
4. 71 条只明确到年份的成果日期精度，以及待核对的卷期、online publication 最终信息、专利登记与标准现状。

## 文件清单

展示层修改：

- `index.html`
- `assets/content.js`、`assets/site.js`、`assets/styles.css`、`assets/pages.css`
- `people/professor.html`、`people/members.html`、`people/alumni.html`
- `publications/international.html`、`publications/korean.html`、`publications/articles.html`、`publications/patents.html`、`publications/standards.html`
- `research/ongoing.html`、`research/completed.html`

维护与验证：

- `README.md`
- `tools/check-content.py`、`tools/check-content-browser.cjs`
- `.github/maintenance/phase3/`：维护说明、人工核实清单、项目登记、成果审计、人员操作记录、校友顺序、原始记录快照和 Articles 源数据。
- `.github/review/phase3/`：本报告、三个机器结果文件及 28 张对比截图。

其余原有页面、图片、历史审核资料、共享导航脚本、布局模板和发布配置未更改；没有删除原有文件。
