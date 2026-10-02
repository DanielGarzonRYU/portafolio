# Calcula la huella SHA-256 y el tamaño de un archivo (APK, ZIP, EXE...)
# para pegarlos en sitio/js/proyectos.js.
#
# Uso (en PowerShell, dentro de la carpeta mi-WEB):
#   .\herramientas\hash.ps1 "C:\ruta\a\mi-app.apk"

param(
    [Parameter(Mandatory = $true)]
    [string]$Archivo
)

if (-not (Test-Path -LiteralPath $Archivo)) {
    Write-Host "No se encontró el archivo: $Archivo" -ForegroundColor Red
    exit 1
}

$item = Get-Item -LiteralPath $Archivo
$hash = (Get-FileHash -LiteralPath $Archivo -Algorithm SHA256).Hash.ToLower()
$mb = $item.Length / 1MB
$tamano = if ($mb -ge 1) { "{0:N1} MB" -f $mb } else { "{0:N0} KB" -f ($item.Length / 1KB) }

Write-Host ""
Write-Host "Copia estas líneas dentro de la descarga en proyectos.js:" -ForegroundColor Cyan
Write-Host ""
Write-Host "        archivo: `"$($item.Name)`","
Write-Host "        tamano: `"$tamano`","
Write-Host "        sha256: `"$hash`","
Write-Host ""
