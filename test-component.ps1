# Quick test to verify component
Write-Host "Testing component structure..." -ForegroundColor Yellow

$component = Get-Content "src/app/pages/cars/cars.component.ts" -Raw

$checks = @(
    @{Name="closeModal method"; Pattern="closeModal\(\):"},
    @{Name="hideLogin method"; Pattern="hideLogin\(\):"},
    @{Name="backendConnected property"; Pattern="backendConnected\s*="},
    @{Name="users array"; Pattern="users:\s*User\[\]\s*="},
    @{Name="loginForm object"; Pattern="loginForm\s*="}
)

foreach ($check in $checks) {
    if ($component -match $check.Pattern) {
        Write-Host "✅ $($check.Name)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($check.Name)" -ForegroundColor Red
    }
}

Write-Host "`nIf all checks pass, run: ng serve --open" -ForegroundColor Magenta
