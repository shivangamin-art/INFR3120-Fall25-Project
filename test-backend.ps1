# Test the new backend connection
Write-Host "Testing backend: https://autorent-k8dr.onrender.com/" -ForegroundColor Cyan

try {
    # Test the cars endpoint
    $response = Invoke-WebRequest -Uri "https://autorent-k8dr.onrender.com/api/cars" -Method Get -ErrorAction Stop
    Write-Host "✅ Backend is accessible!" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host "Content Type: $($response.Headers['Content-Type'])" -ForegroundColor White
    
    # Try to parse JSON
    $data = $response.Content | ConvertFrom-Json
    Write-Host "✅ Cars data received: $($data.Count) cars" -ForegroundColor Green
    
    # Show first car
    if ($data.Count -gt 0) {
        Write-Host "`nSample car data:" -ForegroundColor Yellow
        $firstCar = $data[0]
        Write-Host "Model: $($firstCar.model)" -ForegroundColor White
        Write-Host "Type: $($firstCar.type)" -ForegroundColor White
        Write-Host "Year: $($firstCar.year)" -ForegroundColor White
        Write-Host "Daily Rate: $($firstCar.dailyRate)" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Backend test failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host @"

`n=== APPLICATION SETUP ===
Backend URL updated to: https://autorent-k8dr.onrender.com/

To test the application:
1. Run: ng serve --open
2. Check if cars load from new backend
3. Click on backend links in the footer
4. Test the connection

If cars don't load, check:
- Backend is running: https://autorent-k8dr.onrender.com/api/cars
- CORS is enabled on backend
- Network tab in browser DevTools
"@ -ForegroundColor Cyan
