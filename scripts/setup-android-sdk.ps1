# Minimal Android SDK kurulumu (APK derleme için)
$ErrorActionPreference = "Stop"

$sdkRoot = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$cmdlineRoot = Join-Path $sdkRoot "cmdline-tools"
$latestDir = Join-Path $cmdlineRoot "latest"
$zipPath = Join-Path $env:TEMP "android-cmdline-tools.zip"
$zipUrl = "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip"

Write-Host "-> Android SDK: $sdkRoot"
New-Item -ItemType Directory -Force -Path $latestDir | Out-Null

if (-not (Test-Path (Join-Path $latestDir "bin\sdkmanager.bat"))) {
  Write-Host "-> Command-line tools downloading..."
  Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
  $extractTemp = Join-Path $env:TEMP "android-cmdline-tools"
  if (Test-Path $extractTemp) { Remove-Item $extractTemp -Recurse -Force }
  Expand-Archive -Path $zipPath -DestinationPath $extractTemp -Force
  Copy-Item -Path (Join-Path $extractTemp "cmdline-tools\*") -Destination $latestDir -Recurse -Force
  Remove-Item $extractTemp -Recurse -Force
  Remove-Item $zipPath -Force
}

$env:ANDROID_HOME = $sdkRoot
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.11.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$sdkRoot\platform-tools;$latestDir\bin;" + $env:Path

Write-Host "-> Installing SDK packages..."
$packages = @(
  "platform-tools",
  "platforms;android-35",
  "build-tools;35.0.0"
)
foreach ($pkg in $packages) {
  Write-Host "  - $pkg"
  cmd /c "echo y | sdkmanager.bat `"$pkg`""
}

$localProps = Join-Path $PSScriptRoot "..\android\local.properties"
"sdk.dir=$($sdkRoot -replace '\\','/')" | Set-Content -Path $localProps -Encoding ASCII
Write-Host "-> Wrote local.properties: $localProps"
Write-Host "Android SDK ready"
