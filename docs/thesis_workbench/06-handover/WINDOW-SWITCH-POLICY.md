# Window Switch Policy

## 目的
在对话上下文接近容量阈值时，保证新窗口可无缝接力。

## 执行规则
- 当上下文使用量接近 70% 时，启动新窗口续写。
- 切换前必须更新：
  1) `00-PROGRESS-BOARD.md`
  2) `06-handover/NEXT_ACTIONS.md`
  3) `06-handover/HANDOVER-SESSION-XX.md`

## 新窗口首读顺序
1. `README.md`
2. `00-SOURCE-OF-TRUTH.md`
3. `00-PROGRESS-BOARD.md`
4. `NEXT_ACTIONS.md`

## 接力提示词
“请先阅读 docs/thesis_workbench 下 README、事实基线、进度看板和交接文档，然后继续推进未完成任务，不要重做已完成内容。”

