#!/usr/bin/env pwsh

# Test script para verificar que Gemini API está funcionando

Write-Host "🧪 Iniciando pruebas de Gemini API..." -ForegroundColor Cyan

# Test 1: Verificar que el endpoint /api/ai/questions existe y funciona
Write-Host "`n[Test 1] Probando endpoint de preguntas..." -ForegroundColor Yellow

$test1Payload = @{
    prompt = "quiero una pagina web para venta de ropa"
    history = @()
} | ConvertTo-Json

$response1 = Invoke-WebRequest -Uri "http://localhost:3000/api/ai/questions" `
    -Method POST `
    -Body $test1Payload `
    -ContentType "application/json" `
    -ErrorAction SilentlyContinue

if ($response1.StatusCode -eq 200) {
    $data = $response1.Content | ConvertFrom-Json
    Write-Host "✅ Endpoint funcionando" -ForegroundColor Green
    Write-Host "Respuesta: $($data | ConvertTo-Json -Depth 10)"
} else {
    Write-Host "❌ Error: Status code $($response1.StatusCode)" -ForegroundColor Red
}

# Test 2: Probar el endpoint de generación
Write-Host "`n[Test 2] Probando endpoint de generación de proyecto..." -ForegroundColor Yellow

$test2Payload = @{
    prompt = "quiero una pagina web para venta de ropa"
} | ConvertTo-Json

$response2 = Invoke-WebRequest -Uri "http://localhost:3000/api/ai/generate" `
    -Method POST `
    -Body $test2Payload `
    -ContentType "application/json" `
    -ErrorAction SilentlyContinue

if ($response2.StatusCode -eq 200) {
    $data = $response2.Content | ConvertFrom-Json
    Write-Host "✅ Endpoint funcionando" -ForegroundColor Green
    Write-Host "Respuesta:" -ForegroundColor Cyan
    Write-Host $data.data | ConvertTo-Json -Depth 10
} else {
    Write-Host "❌ Error: Status code $($response2.StatusCode)" -ForegroundColor Red
    Write-Host "Contenido: $($response2.Content)"
}

Write-Host "`n✨ Pruebas completadas" -ForegroundColor Cyan
