# Emergency Pool Recovery Script
# Run this when pool is exhausted

Write-Host "🚨 EMERGENCY POOL RECOVERY SCRIPT" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red
Write-Host ""

# Configuration
$SERVER_URL = "http://localhost:3000"  # เปลี่ยนเป็น URL ของ server จริง
$DATABASE = "DPM_HELP68_FLOOD"

Write-Host "1. Checking current health status..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$SERVER_URL/api/health" -Method Get
    Write-Host "   Status: $($health.status)" -ForegroundColor $(if($health.status -eq "critical"){"Red"}else{"Green"})
    Write-Host "   Pending Requests: $($health.poolStats.pendingRequests)" -ForegroundColor Red
    Write-Host "   Available Connections: $($health.poolStats.availableConnections)" -ForegroundColor Yellow
} catch {
    Write-Host "   ❌ Cannot connect to server!" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2. Clearing all cache to reduce load..." -ForegroundColor Yellow
try {
    $clearResult = Invoke-RestMethod -Uri "$SERVER_URL/api/cache/clear?type=all" -Method Post
    Write-Host "   ✅ Cache cleared: $($clearResult.cleared.count) entries" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Failed to clear cache: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "3. Restarting pool for $DATABASE..." -ForegroundColor Yellow
try {
    $restartResult = Invoke-RestMethod -Uri "$SERVER_URL/api/pool/restart?database=$DATABASE" -Method Post
    Write-Host "   ✅ Pool restarted successfully" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to restart pool: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Waiting 5 seconds for recovery..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "5. Checking health again..." -ForegroundColor Yellow
try {
    $health2 = Invoke-RestMethod -Uri "$SERVER_URL/api/health" -Method Get
    Write-Host "   Status: $($health2.status)" -ForegroundColor $(if($health2.status -eq "critical"){"Red"}elseif($health2.status -eq "degraded"){"Yellow"}else{"Green"})
    Write-Host "   Pending Requests: $($health2.poolStats.pendingRequests)" 
    Write-Host "   Available Connections: $($health2.poolStats.availableConnections)"
    
    if($health2.poolStats.pendingRequests -lt $health.poolStats.pendingRequests) {
        Write-Host "   ✅ Situation improving!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Still critical - may need application restart" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Cannot connect to server!" -ForegroundColor Red
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Yellow
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. If still critical: docker-compose restart" -ForegroundColor Cyan
Write-Host "2. Monitor: curl $SERVER_URL/api/health | jq" -ForegroundColor Cyan
Write-Host "3. Check logs for slow queries" -ForegroundColor Cyan
Write-Host "4. Consider optimizing queries or increasing pool size to 250+" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Yellow

