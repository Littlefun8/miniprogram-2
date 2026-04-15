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
    CHAPTERS / "ch07-总结与展望.md",
    CHAPTERS / "ch08-参考文献模板.md",
    CHAPTERS / "ch09-致谢模板.md",
]

sections = []
sections.append("# 酱菜内推系统的设计与实现\n")
sections.append(
    "## 图表插入说明\n"
    "- 图 3-1：`04-diagrams/system-architecture.png`\n"
    "- 图 3-2：`04-diagrams/usecase-overall.png`\n"
    "- 图 3-3：`04-diagrams/application-state-machine.png`\n"
    "- 图 4-1：`04-diagrams/core-publish-audit-flow.png`\n"
    "- 图 4-2：`04-diagrams/er-model.png`\n"
)
sections.append(
    "## 必做表插入说明\n"
    "- 表 2-1：`05-tables/table-role-function.md`\n"
    "- 表 2-2：`05-tables/table-nonfunctional-requirements.md`\n"
    "- 表 4-1：`05-tables/table-cloudfunction-responsibility.md`\n"
    "- 表 4-2：`05-tables/table-db-design.md`\n"
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
sections.append((TABLES / "table-nonfunctional-requirements.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-cloudfunction-responsibility.md").read_text(encoding="utf-8"))
sections.append("\n---\n")
sections.append((TABLES / "table-db-design.md").read_text(encoding="utf-8"))

OUTPUT.write_text("\n".join(sections), encoding="utf-8")
print(f"Wrote {OUTPUT}")
