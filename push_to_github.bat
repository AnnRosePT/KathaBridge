@echo off
echo ========================================================
echo Pushing KathaBridge to https://github.com/AnnRosePT/KathaBridge.git
echo ========================================================

git init
git remote remove origin 2>nul
git remote add origin https://github.com/AnnRosePT/KathaBridge.git
git add .
git commit -m "feat: complete KathaBridge platform with dark intro hero, user persona hub, native Malayalam TTS, karaoke player and scholar workstation"
git branch -M main
git push -u origin main

echo.
echo ========================================================
echo Done! Please check https://github.com/AnnRosePT/KathaBridge
echo ========================================================
pause
