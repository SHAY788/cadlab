# 第三阶段资料维护说明

这些文件是内容核实与回归材料，不是网站运行时数据库，也不应当直接作为“已经核实”的证明。

- [PHASE3-VERIFICATION.md](PHASE3-VERIFICATION.md)：中文人工核实任务，含全部 27 个项目的唯一登记表及日期精度不足的成果清单。
- [project-register.json](project-register.json)：每个项目分配唯一 ID，分别记录每处原页面、位置、资助机构原文和研究期限原文。`actual_completion_date: null` 表示没有可独立核实的实际日期，不代表断言该项目未完成。
- [publication-audit.json](publication-audit.json)：97 条现有成果的原文、源页位置、日期精度和待核实状态；不是作者学术成果总量统计。
- [source-records.json](source-records.json)：冻结的 `61dd7e9` 基线原始卡片/记录 HTML、原文和 SHA-256，用于检查本次没有误改人员、论文、项目。
- [articles-source.json](articles-source.json)：从原 Articles 数组逐字段保存的 11 条原始资料；公开页面已改为无需 JavaScript 的静态列表。
- [alumni-order.json](alumni-order.json)：本次 27 张卡片的毕业年月与显示顺序，用于审核排序；未知的其他学位日期不在此补写。
- [member-editorial-history.md](member-editorial-history.md)：原先混在 Members 公开页面的操作说明，原文移至此处保存。

## 后续更新流程

1. 先在核实清单记录需要变更的字段，保留当前原文和来源页。
2. 向研究室或正式出版/项目/学位来源取得证据，记录来源链接或文档、核实人和核实日期；不能仅凭网页日期、卷期、项目计划或人员姓名推断。
3. 由负责人确认后，再更新相关 HTML 和首页摘要，记录修改理由及证据。
4. 项目确认结项后，再同步其状态、实际结项日期及原页面分布；当前两个重复项目不得在没有证据时自动搬移或删除。
5. 重新运行记录保留检查、全站链接与浏览器检查；新增或纠正事实应形成独立审核变更，不能直接覆盖本阶段冻结基线来掩盖差异。

本次没有对外部来源做事实核实；所有“待核实”仍是待办。GAO XINPU 卡片列有博士毕业年月和硕士论文，但没有提供硕士毕业日期，本阶段没有补写。历史图片、学位论文和所有已收录的校友均保留。
