# Quick Vercel Deployment Script
# Run this in PowerShell from the Server directory

Write-Host "🚀 Vercel Deployment Helper" -ForegroundColor Green
Write-Host ""

# Check if vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "📦 Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
} else {
    Write-Host "✅ Vercel CLI already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Pre-deployment Checklist:" -ForegroundColor Cyan
Write-Host "   1. Have you created a PostgreSQL database? (Neon, Supabase, etc.)"
Write-Host "   2. Do you have your DATABASE_URL ready?"
Write-Host "   3. Have you committed all changes to git?"
Write-Host ""

$continue = Read-Host "Continue with deployment? (y/n)"

if ($continue -ne "y") {
    Write-Host "Deployment cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🏗️ Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Fix errors and try again." -ForegroundColor Red
    exit
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️ IMPORTANT: When prompted, you'll need to add environment variables" -ForegroundColor Yellow
Write-Host "   Copy them from your .env file" -ForegroundColor Yellow
Write-Host ""

vercel --prod

Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Add environment variables in Vercel Dashboard if you haven't"
Write-Host "   2. Run database migrations against production DB"
Write-Host "   3. Test your API endpoints"
Write-Host "   4. Update your frontend to use the new API URL"
Write-Host ""
Write-Host "📚 See DEPLOYMENT.md for detailed instructions" -ForegroundColor Cyan
