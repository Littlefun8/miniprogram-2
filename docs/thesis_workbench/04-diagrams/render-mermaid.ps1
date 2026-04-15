Set-Location "D:\miniprogram-2"

$tasks = @(
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/system-architecture.mmd"; Out = "docs/thesis_workbench/04-diagrams/system-architecture.png" },
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/usecase-overall.mmd"; Out = "docs/thesis_workbench/04-diagrams/usecase-overall.png" },
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/application-state-machine.mmd"; Out = "docs/thesis_workbench/04-diagrams/application-state-machine.png" },
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/core-publish-audit-flow.mmd"; Out = "docs/thesis_workbench/04-diagrams/core-publish-audit-flow.png" },
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/er-model.mmd"; Out = "docs/thesis_workbench/04-diagrams/er-model.png" }
)

foreach ($task in $tasks) {
  npx -y @mermaid-js/mermaid-cli -i $task.In -o $task.Out
}

Write-Host "Mermaid diagrams rendered."
