Set-Location "D:\miniprogram-2\docs\thesis_workbench\04-diagrams\plantuml"

# Usage:
# 1) Download plantuml.jar from https://plantuml.com/download
# 2) Place plantuml.jar in this folder
# 3) Ensure Java is installed (java -version)
# 4) Run this script

if (-not (Test-Path ".\plantuml.jar")) {
  Write-Host "plantuml.jar not found. Please place it in the current folder."
  exit 1
}

java -jar .\plantuml.jar .\usecase-overall.puml
java -jar .\plantuml.jar .\sequence-publish-audit.puml

Write-Host "PlantUML diagrams rendered in current folder."
