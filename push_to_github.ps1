# Push Bullet Master to GitHub
$git = "C:\Users\hp\.gemini\antigravity\scratch\mingit\cmd\git.exe"
if (-not (Test-Path $git)) {
    $git = "git"
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   BULLET MASTER // GITHUB PUSH TOOL" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Check if origin is set
& $git remote -v

Write-Host "`nAttempting git push to origin main..." -ForegroundColor Green
& $git push -u origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nIf the push failed because the repo does not exist yet:" -ForegroundColor Yellow
    Write-Host "1. Create the repository at: https://github.com/new" -ForegroundColor White
    Write-Host "   Repository name: bulletmaster.name (or my-website)" -ForegroundColor White
    Write-Host "2. If prompted for GitHub credentials, authenticate in your browser or paste a GitHub Personal Access Token (PAT)." -ForegroundColor White
    Write-Host "`nTo push using a GitHub Token, run:" -ForegroundColor Cyan
    Write-Host 'git push https://<YOUR_TOKEN>@github.com/Maxverstappen2804/bulletmaster.name.git main' -ForegroundColor Gray
} else {
    Write-Host "`n[SUCCESS] Repository pushed successfully to GitHub!" -ForegroundColor Green
}

Read-Host "`nPress Enter to exit..."
