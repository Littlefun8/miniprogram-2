from pathlib import Path

ROOT = Path(r"D:\miniprogram-2\docs\thesis_workbench")
CHAPTERS = ROOT / "03-chapters"
TABLES = ROOT / "05-tables"
DIAGRAMS = ROOT / "04-diagrams"
OUTPUT = ROOT / "THESIS-MASTER-DRAFT.md"

ordered_files = [
    CHAPTERS / "ch00-中文摘要关键词.md",
    CHAPTERS / "ch00-英文题目英文摘要.md",
    CHAPTERS / "ch01-绪论.md",
    CHAPTERS / "ch02-需求分析.md",
    CHAPTERS / "ch03-系统概要设计.md",
    CHAPTERS / "ch04-系统详细设计.md",
    CHAPTERS / "ch05-系统实现.md",
    CHAPTERS / "ch06-系统运行与应用效果.md",
    CHAPTERS / "ch08-参考文献模板.md",
    CHAPTERS / "ch09-致谢模板.md",
]

sections = []
sections.append("# 酱菜内推系统的设计与实现\n")
sections.append(
    "## 图表插入说明\n"
    "- 图 2-1：`04-diagrams/ch2-usecase-overview.png`\n"
    "- 图 2-2：`04-diagrams/ch2-activity-post-job.png`\n"
    "- 图 2-3：`04-diagrams/ch2-activity-apply-job.png`\n"
    "- 图 2-4：`04-diagrams/ch2-activity-audit-job.png`\n"
    "- 图 2-5：`04-diagrams/ch2-activity-sensitive-unlock.png`\n"
    "- 图 3-1：`04-diagrams/ch3-architecture-layered.png`\n"
    "- 图 3-2：`04-diagrams/usecase-overall.png`\n"
    "- 图 3-3：`04-diagrams/ch2-activity-post-job.png`（在正文中重编号使用）\n"
    "- 图 3-4：`04-diagrams/ch2-activity-apply-job.png`（在正文中重编号使用）\n"
    "- 图 3-5：`04-diagrams/ch2-activity-sensitive-unlock.png`（在正文中重编号使用）\n"
    "- 图 3-6：`04-diagrams/ch3-call-sequence-apply-unlock.png`\n"
    "- 图 4-1：`04-diagrams/system-architecture.png`\n"
    "- 图 4-2：`04-diagrams/ch3-call-sequence-apply-unlock.png`（页面状态示意可替换）\n"
    "- 图 4-3：`04-diagrams/usecase-overall.png`（布局示意可替换）\n"
    "- 图 4-4：`04-diagrams/core-publish-audit-flow.png`\n"
    "- 图 5-1：`04-diagrams/ch2-activity-apply-job.png`（在正文中重编号使用）\n"
    "- 图 5-2：`04-diagrams/ch3-call-sequence-apply-unlock.png`（在正文中重编号使用）\n"
    "- 图 5-3：`04-diagrams/ch2-activity-audit-job.png`（在正文中重编号使用）\n"
    "- 图 5-4：`04-diagrams/ch2-activity-sensitive-unlock.png`（在正文中重编号使用）\n"
)
sections.append(
    "## 必做表插入说明\n"
    "- 表 2-1：`05-tables/table-role-function.md`\n"
    "- 表 2-2：`05-tables/table-ch2-module-breakdown.md`\n"
    "- 表 2-3：`05-tables/table-ch2-usecase-spec.md`\n"
    "- 表 2-4：`05-tables/table-nonfunctional-requirements.md`\n"
    "- 表 2-5：`05-tables/table-ch2-requirement-traceability.md`\n"
    "- 表 2-6：`05-tables/table-ch2-iteration-backlog.md`\n"
    "- 表 3-1：`05-tables/table-ch3-architecture-tradeoff.md`\n"
    "- 表 3-2：`05-tables/table-ch3-module-callchain.md`\n"
    "- 表 3-3：`05-tables/table-ch3-interface-samples.md`\n"
    "- 表 4-1：`05-tables/table-cloudfunction-responsibility.md`\n"
    "- 表 4-2：`05-tables/table-db-design.md`\n"
    "- 表 4-3：`05-tables/table-ch4-field-constraints.md`\n"
    "- 表 4-4：`05-tables/table-ch4-state-transition-rules.md`\n"
    "- 表 4-5：`05-tables/table-ch4-error-codes.md`\n"
    "- 表 4-6：`05-tables/table-ch4-security-control-points.md`\n"
    "- 表 4-7：`05-tables/table-ch4-code-evidence-binding-template.md`\n"
)

for file in ordered_files:
    if not file.exists():
        sections.append(f"\n<!-- MISSING: {file.name} -->\n")
        continue
    sections.append("\n---\n")
    sections.append(f"\n<!-- BEGIN {file.name} -->\n")
    sections.append(file.read_text(encoding="utf-8"))
    sections.append(f"\n<!-- END {file.name} -->\n")

# Append embedded table and diagram pointers near the end so the draft is easy to navigate.
sections.append("\n---\n")
sections.append("# 附：图表与表格落点索引\n")
sections.append((DIAGRAMS / "00-figure-caption-index.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-role-function.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-ch2-module-breakdown.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-ch2-usecase-spec.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-nonfunctional-requirements.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-ch2-requirement-traceability.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-ch2-iteration-backlog.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-ch3-architecture-tradeoff.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-ch3-module-callchain.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-ch3-interface-samples.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-cloudfunction-responsibility.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-db-design.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-ch4-field-constraints.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-ch4-state-transition-rules.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-ch4-error-codes.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-ch4-security-control-points.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-ch4-code-evidence-binding-template.md").read_text(encoding="utf-8"))

OUTPUT.write_text("\n".join(sections), encoding="utf-8")
print(f"Wrote {OUTPUT}")



