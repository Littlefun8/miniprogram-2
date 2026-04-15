Set-Location "D:\miniprogram-2"

$tasks = @(
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/ch2-usecase-overview.mmd"; Out = "docs/thesis_workbench/04-diagrams/ch2-usecase-overview.png" },
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/ch2-activity-post-job.mmd"; Out = "docs/thesis_workbench/04-diagrams/ch2-activity-post-job.png" },
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/ch2-activity-apply-job.mmd"; Out = "docs/thesis_workbench/04-diagrams/ch2-activity-apply-job.png" },
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/ch2-activity-audit-job.mmd"; Out = "docs/thesis_workbench/04-diagrams/ch2-activity-audit-job.png" },
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/ch2-activity-sensitive-unlock.mmd"; Out = "docs/thesis_workbench/04-diagrams/ch2-activity-sensitive-unlock.png" },
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/ch3-architecture-layered.mmd"; Out = "docs/thesis_workbench/04-diagrams/ch3-architecture-layered.png" },
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/ch3-call-sequence-apply-unlock.mmd"; Out = "docs/thesis_workbench/04-diagrams/ch3-call-sequence-apply-unlock.png" },
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/ch4-permission-validation-flow.mmd"; Out = "docs/thesis_workbench/04-diagrams/ch4-permission-validation-flow.png" },
  @{ In = "docs/thesis_workbench/04-diagrams/mermaid/ch4-application-state-transition-detailed.mmd"; Out = "docs/thesis_workbench/04-diagrams/ch4-application-state-transition-detailed.png" },
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



