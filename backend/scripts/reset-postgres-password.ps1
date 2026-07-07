# Resets PostgreSQL 18 postgres user password (requires Administrator)
# Right-click PowerShell -> Run as administrator, then:
#   cd "c:\Users\Mithun\OneDrive\Desktop\news\backend\scripts"
#   .\reset-postgres-password.ps1

$ErrorActionPreference = 'Stop'
$PgHba = 'C:\Program Files\PostgreSQL\18\data\pg_hba.conf'
$PgHbaBackup = "$PgHba.stock-news-backup"
$Psql = 'C:\Program Files\PostgreSQL\18\bin\psql.exe'
$ServiceName = 'postgresql-x64-18'
$NewPassword = 'postgres'

function Restore-PgHba {
  if (Test-Path $PgHbaBackup) {
    Copy-Item $PgHbaBackup $PgHba -Force
    Remove-Item $PgHbaBackup -Force -ErrorAction SilentlyContinue
  }
}

try {
  if (-not (Test-Path $PgHba)) {
    throw "pg_hba.conf not found at $PgHba"
  }

  Write-Host 'Backing up pg_hba.conf...'
  Copy-Item $PgHba $PgHbaBackup -Force

  Write-Host 'Temporarily enabling trust auth for localhost...'
  $content = Get-Content $PgHba -Raw
  $content = $content -replace 'scram-sha-256', 'trust'
  Set-Content $PgHba $content -NoNewline

  Write-Host 'Restarting PostgreSQL service...'
  Restart-Service $ServiceName
  Start-Sleep -Seconds 4

  Write-Host "Setting postgres password to $NewPassword..."
  $alterSql = "ALTER USER postgres WITH PASSWORD '$NewPassword';"
  & $Psql -h localhost -p 5434 -U postgres -d postgres -c $alterSql

  Write-Host 'Restoring secure pg_hba.conf...'
  Restore-PgHba

  Write-Host 'Restarting PostgreSQL service...'
  Restart-Service $ServiceName
  Start-Sleep -Seconds 4

  Write-Host 'Verifying login...'
  $env:PGPASSWORD = $NewPassword
  & $Psql -h localhost -p 5434 -U postgres -d postgres -c "SELECT 'Password reset OK' AS status;"

  Write-Host ''
  Write-Host 'SUCCESS - use in pgAdmin and backend/.env:'
  Write-Host '  Host: localhost | Port: 5434 | User: postgres | Password: postgres'
}
catch {
  Write-Host "ERROR: $_" -ForegroundColor Red
  Write-Host 'Restoring pg_hba.conf backup...'
  Restore-PgHba
  throw
}
