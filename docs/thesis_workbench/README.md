# Thesis Workbench

本目录用于在有限时间内将毕业论文初稿快速推进到可提交版本，并保证任务中断后可由任意 AI 继续。

## 目录说明
- `00-EXECUTION-PLAN.md`: 6 小时执行计划与里程碑。
- `00-PROGRESS-BOARD.md`: 任务看板和实时进度。
- `00-SOURCE-OF-TRUTH.md`: 写作事实基线，避免与代码不一致。
- `00-WRITING-RULES.md`: 写作口径、术语、引用规则。
- `01-THESIS-OUTLINE.md`: 正式稿目录与章节目标。
- `02-prompts/`: 分章节 Prompt 套件，可直接给 GPT/GLM/Claude。
- `03-chapters/`: 分章节正文草稿（可直接合并到模板）。
- `04-diagrams/`: UML/流程图源码（Mermaid + PlantUML）。
- `05-tables/`: 论文可直接引用的表格草稿。
- `06-handover/`: 跨窗口接力与恢复文档。

## 使用顺序（建议）
1. 先看 `00-SOURCE-OF-TRUTH.md` 和 `01-THESIS-OUTLINE.md`。
2. 用 `02-prompts/` 生成或重写各章内容，落到 `03-chapters/`。
3. 用 `04-diagrams/` 生成图片并插入模板。
4. 从 `05-tables/` 复制表格到论文。
5. 每次中断前更新 `00-PROGRESS-BOARD.md` 与 `06-handover/NEXT_ACTIONS.md`。

## 当前策略
- 以系统设计与实现为主线，弱化测试失败细节。
- 图表“够用优先”，先完成必须图，再考虑扩展图。
- 与代码冲突时，优先代码与 `docs/handover-2026-04-14.md`。

