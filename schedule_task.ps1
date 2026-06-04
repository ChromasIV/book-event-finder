# Define the task details
$TaskName = "BookBoundEventFinder"
$BatchPath = Join-Path $PSScriptRoot "run_weekly.bat"

Write-Host "Scheduling weekly task to run: $BatchPath" -ForegroundColor Cyan

# Create the weekly scheduled task in Windows Task Scheduler
# Scheduled to run every Monday (/d MON) at 9:00 AM (/st 09:00)
# /f overrides the task if it already exists
schtasks /create /tn $TaskName /tr "`"$BatchPath`"" /sc weekly /d MON /st 09:00 /f

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Scheduled task '$TaskName' registered successfully!" -ForegroundColor Green
    Write-Host "The script will run automatically every Monday at 9:00 AM, updating events.json and pushing to GitHub." -ForegroundColor Green
} else {
    Write-Error "Failed to register scheduled task. Please make sure you are running this PowerShell window as Administrator."
}
