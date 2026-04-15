# Diagrams Guide

## 已提供源码
- Mermaid：`04-diagrams/mermaid/*.mmd`
- PlantUML：`04-diagrams/plantuml/*.puml`

## 本地已渲染结果（当前仓库）
- `ch2-usecase-overview.png`
- `ch2-activity-post-job.png`
- `ch2-activity-apply-job.png`
- `ch2-activity-audit-job.png`
- `ch2-activity-sensitive-unlock.png`
- `ch3-architecture-layered.png`
- `ch3-call-sequence-apply-unlock.png`
- `system-architecture.png`
- `usecase-overall.png`
- `application-state-machine.png`
- `core-publish-audit-flow.png`
- `er-model.png`

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

## 一键渲染命令（免安装到 package.json）
```powershell
Set-Location "D:\miniprogram-2"
npx -y @mermaid-js/mermaid-cli -i "docs/thesis_workbench/04-diagrams/mermaid/ch2-usecase-overview.mmd" -o "docs/thesis_workbench/04-diagrams/ch2-usecase-overview.png"
npx -y @mermaid-js/mermaid-cli -i "docs/thesis_workbench/04-diagrams/mermaid/ch2-activity-post-job.mmd" -o "docs/thesis_workbench/04-diagrams/ch2-activity-post-job.png"
npx -y @mermaid-js/mermaid-cli -i "docs/thesis_workbench/04-diagrams/mermaid/ch2-activity-apply-job.mmd" -o "docs/thesis_workbench/04-diagrams/ch2-activity-apply-job.png"
npx -y @mermaid-js/mermaid-cli -i "docs/thesis_workbench/04-diagrams/mermaid/ch2-activity-audit-job.mmd" -o "docs/thesis_workbench/04-diagrams/ch2-activity-audit-job.png"
npx -y @mermaid-js/mermaid-cli -i "docs/thesis_workbench/04-diagrams/mermaid/ch2-activity-sensitive-unlock.mmd" -o "docs/thesis_workbench/04-diagrams/ch2-activity-sensitive-unlock.png"
npx -y @mermaid-js/mermaid-cli -i "docs/thesis_workbench/04-diagrams/mermaid/ch3-architecture-layered.mmd" -o "docs/thesis_workbench/04-diagrams/ch3-architecture-layered.png"
npx -y @mermaid-js/mermaid-cli -i "docs/thesis_workbench/04-diagrams/mermaid/ch3-call-sequence-apply-unlock.mmd" -o "docs/thesis_workbench/04-diagrams/ch3-call-sequence-apply-unlock.png"
npx -y @mermaid-js/mermaid-cli -i "docs/thesis_workbench/04-diagrams/mermaid/system-architecture.mmd" -o "docs/thesis_workbench/04-diagrams/system-architecture.png"
npx -y @mermaid-js/mermaid-cli -i "docs/thesis_workbench/04-diagrams/mermaid/usecase-overall.mmd" -o "docs/thesis_workbench/04-diagrams/usecase-overall.png"
npx -y @mermaid-js/mermaid-cli -i "docs/thesis_workbench/04-diagrams/mermaid/application-state-machine.mmd" -o "docs/thesis_workbench/04-diagrams/application-state-machine.png"
npx -y @mermaid-js/mermaid-cli -i "docs/thesis_workbench/04-diagrams/mermaid/core-publish-audit-flow.mmd" -o "docs/thesis_workbench/04-diagrams/core-publish-audit-flow.png"
npx -y @mermaid-js/mermaid-cli -i "docs/thesis_workbench/04-diagrams/mermaid/er-model.mmd" -o "docs/thesis_workbench/04-diagrams/er-model.png"
```

## 如果你本机渲染失败（兜底方案）
1. 保留并提交 `*.mmd` 和 `*.puml` 源码文件。
2. 先用 Mermaid Live Editor 打开 `.mmd`，导出 PNG。
3. PlantUML 图可粘贴到在线 PlantUML 渲染器导出 PNG。
4. 若仍失败，论文先使用表格替代，并在正文注明“图由源码可复现”。

## 论文建议插图优先级
- 必须：架构图、总用例图、状态机图、ER 图。
- 可选：发布审核时序图。
- 若时间不足：可选图用表格替代。




