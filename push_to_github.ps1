# KathaBridge - Push to GitHub Script
# Repository: https://github.com/AnnRosePT/KathaBridge.git

Write-Host ">>> Initializing KathaBridge Git Repository..." -ForegroundColor Cyan
git init

Write-Host ">>> Configuring Remote origin..." -ForegroundColor Cyan
git remote remove origin 2>$null
git remote add origin https://github.com/AnnRosePT/KathaBridge.git

Write-Host ">>> Staging project files..." -ForegroundColor Cyan
git add .

Write-Host ">>> Committing KathaBridge..." -ForegroundColor Cyan
git commit -m "feat: complete KathaBridge platform with dark intro hero, user persona hub, native Malayalam TTS, karaoke player and scholar workstation"

Write-Host ">>> Setting branch to main..." -ForegroundColor Cyan
git branch -M main

Write-Host ">>> Pushing to GitHub (https://github.com/AnnRosePT/KathaBridge.git)..." -ForegroundColor Green
git push -u origin main

Write-Host ">>> Successfully pushed KathaBridge to GitHub!" -ForegroundColor Green
