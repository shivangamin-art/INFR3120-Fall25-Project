# Setup script for Angular project
Write-Host "Setting up Angular project..." -ForegroundColor Yellow

# 1. First, install dependencies manually if needed
if (Test-Path "package.json") {
    Write-Host "Found package.json" -ForegroundColor Green
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        
        # Try using npx
        if (Get-Command npx -ErrorAction SilentlyContinue) {
            npx npm install
        } else {
            Write-Host "Please run: npm install" -ForegroundColor Red
        }
    } else {
        Write-Host "Dependencies already installed" -ForegroundColor Green
    }
    
    # 2. Fix the Angular component
    Write-Host "Fixing component issues..." -ForegroundColor Yellow
    
    $componentPath = "src/app/pages/cars/cars.component.ts"
    if (Test-Path $componentPath) {
        $content = Get-Content $componentPath -Raw
        
        # Remove bad import
        $content = $content -replace "import \{ HttpClient \} from '@angular/common/http/client';", ""
        
        # Add correct import if HttpClient is needed
        if ($content -match "HttpClient") {
            $content = $content -replace "import.*from '@angular/core';", 
                "import { Component, OnInit } from '@angular/core';`nimport { HttpClient } from '@angular/common/http';"
        }
        
        # Fix constructor
        if ($content -match "constructor\(private http: HttpClient\)") {
            # Keep it if HttpClient is imported
            Write-Host "HttpClient in constructor - keeping it" -ForegroundColor Yellow
        } else {
            # Remove empty constructor
            $content = $content -replace "constructor\(\) \{\}", ""
        }
        
        $content | Set-Content $componentPath -Encoding UTF8
        Write-Host "Component fixed!" -ForegroundColor Green
    }
    
    # 3. Try to build
    Write-Host "Attempting to build..." -ForegroundColor Yellow
    
    # Check for build script
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    if ($packageJson.scripts.build) {
        Write-Host "Build script found" -ForegroundColor Green
        
        if (Get-Command npx -ErrorAction SilentlyContinue) {
            npx ng build
        } else {
            Write-Host "Run: ng build" -ForegroundColor Red
        }
    }
} else {
    Write-Host "No package.json found!" -ForegroundColor Red
}
