# Git Checkpoints

## 建议提交节奏
- Commit 1: 搭建 workbench 目录与管理文档。
- Commit 2: 章节草稿 + Prompt 套件。
- Commit 3: 图表源码 + 表格草稿 + 交接文档。

## 建议提交信息
- `docs(thesis): initialize thesis workbench and execution board`
- `docs(thesis): add chapter drafts and prompt toolkit`
- `docs(thesis): add diagrams tables and handover continuity docs`

## 只提交本次文件
使用路径级 add，避免误提交无关改动：
```powershell
Set-Location "D:\miniprogram-2"
git add docs/thesis_workbench
git commit -m "docs(thesis): initialize structured thesis workbench"
```

