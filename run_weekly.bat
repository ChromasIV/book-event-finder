@echo off
:: Navigate to the script's directory
cd /d "%~dp0"

echo ===================================================
echo [BookBound] Fetching and Updating Book Events Data
echo ===================================================
node scripts/fetch-events.js

echo.
echo [Git] Staging changes...
git add docs/data/events.json

echo.
echo [Git] Committing changes...
:: Only commit if there are differences to avoid empty commits
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Auto-update book events schedule"
    echo.
    echo [Git] Pushing updates to GitHub...
    git push
) else (
    echo No new book event data changes detected. Skipping push.
)

echo.
echo [BookBound] Update completed!
