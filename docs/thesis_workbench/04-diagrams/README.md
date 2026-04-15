# Diagrams Guide

## 已提供源码
- Mermaid：`04-diagrams/mermaid/*.mmd`
- PlantUML：`04-diagrams/plantuml/*.puml`

## 快速出图（推荐）
1. 打开 Mermaid Live Editor 或 draw.io（支持 Mermaid）。
2. 粘贴 `.mmd` 内容。
3. 导出 PNG/SVG 并插入论文。

## 可选本地命令（若本机有 Node 环境）
```powershell
Set-Location "D:\miniprogram-2"
npm install -D @mermaid-js/mermaid-cli
npx mmdc -i docs/thesis_workbench/04-diagrams/mermaid/system-architecture.mmd -o docs/thesis_workbench/04-diagrams/system-architecture.png
npx mmdc -i docs/thesis_workbench/04-diagrams/mermaid/usecase-overall.mmd -o docs/thesis_workbench/04-diagrams/usecase-overall.png
npx mmdc -i docs/thesis_workbench/04-diagrams/mermaid/application-state-machine.mmd -o docs/thesis_workbench/04-diagrams/application-state-machine.png
npx mmdc -i docs/thesis_workbench/04-diagrams/mermaid/er-model.mmd -o docs/thesis_workbench/04-diagrams/er-model.png
```

## 论文建议插图优先级
- 必须：架构图、总用例图、状态机图、ER 图。
- 可选：发布审核时序图。
- 若时间不足：可选图用表格替代。

