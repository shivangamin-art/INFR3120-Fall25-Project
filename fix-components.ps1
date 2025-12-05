// Run this in PowerShell to fix common component issues:

# 1. Find and replace in all component files
Get-ChildItem "src/app" -Recurse -Filter "*.ts" -File | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace 'car\.price\b', 'car.dailyRate'
    $newContent = $newContent -replace 'car\.id\b', 'car._id'
    $newContent = $newContent -replace 'car\.make\b', 'car.model'
    $newContent = $newContent -replace 'Car\[\]', 'Car[]' # Keep as is
    if ($newContent -ne $content) {
        $newContent | Set-Content $_.FullName -Encoding UTF8
        Write-Host "Updated: $($_.Name)" -ForegroundColor Green
    }
}

# 2. Check HTML templates
Get-ChildItem "src/app" -Recurse -Filter "*.html" -File | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $newContent = $content -replace '\{\{\s*car\.price\s*\}\}', '{{ car.dailyRate }}'
    $newContent = $newContent -replace '\{\{\s*car\.id\s*\}\}', '{{ car._id }}'
    $newContent = $newContent -replace '\{\{\s*car\.make\s*\}\}', '{{ car.model }}'
    if ($newContent -ne $content) {
        $newContent | Set-Content $_.FullName -Encoding UTF8
        Write-Host "Updated HTML: $($_.Name)" -ForegroundColor Green
    }
}
