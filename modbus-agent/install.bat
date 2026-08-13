@echo off
chcp 65001 >nul
title Daikin Connect - Modbus Agent Installer
color 0B

echo.
echo  ===========================================================
echo.
echo    DAIKIN CONNECT - MODBUS AGENT INSTALLER v1.0
echo.
echo  ===========================================================
echo.

:: Check for Admin privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Script ini harus dijalankan sebagai Administrator!
    echo.
    echo  Cara: Klik kanan file ini lalu pilih "Run as Administrator"
    echo.
    pause
    exit /b 1
)

echo  [1/5] Memeriksa Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] Node.js belum terinstall.
    echo  [!] Mengunduh Node.js v20 LTS...
    echo.
    
    :: Download Node.js LTS installer using PowerShell
    powershell -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi' -OutFile '%TEMP%\node-installer.msi' -UseBasicParsing } catch { Write-Host $_.Exception.Message; exit 1 }"
    
    if not exist "%TEMP%\node-installer.msi" (
        echo.
        echo  [ERROR] Gagal mengunduh Node.js!
        echo  Silakan install Node.js secara manual dari https://nodejs.org
        echo  Setelah install, jalankan install.bat ini lagi.
        echo.
        pause
        exit /b 1
    )
    
    echo  [!] Menginstall Node.js...
    echo  [!] Mohon tunggu, proses ini membutuhkan waktu 1-2 menit...
    msiexec /i "%TEMP%\node-installer.msi" /qn /norestart ADDLOCAL=ALL
    
    if %errorlevel% neq 0 (
        echo.
        echo  [ERROR] Instalasi Node.js gagal!
        echo  Silakan install Node.js secara manual dari https://nodejs.org
        echo.
        pause
        exit /b 1
    )
    
    :: Refresh PATH for current session
    set "PATH=%PATH%;C:\Program Files\nodejs;%APPDATA%\npm"
    
    :: Verify node is now available
    where node >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo  [WARN] Node.js terinstall tapi PATH belum terupdate.
        echo  [WARN] Silakan RESTART komputer, lalu jalankan install.bat lagi.
        echo.
        pause
        exit /b 1
    )
    
    echo  [OK] Node.js berhasil diinstall!
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo  [OK] Node.js sudah terinstall: %NODE_VER%
)

echo.
echo  [2/5] Memeriksa konfigurasi...

:: Check config.json exists
if not exist "%~dp0config.json" (
    echo  [ERROR] File config.json tidak ditemukan!
    echo  [ERROR] Pastikan config.json ada di folder yang sama dengan install.bat
    pause
    exit /b 1
)

:: Check if API key is configured
findstr /C:"PASTE_API_KEY" "%~dp0config.json" >nul 2>&1
if %errorlevel% neq 0 goto config_ok

echo.
echo  ===========================================================
echo  API Key belum diatur dalam config.json.
echo  Silakan copy API Key dari Admin Panel Daikin Connect.
echo  ===========================================================
echo.
set /p NEW_API_KEY="Paste API Key di sini (klik kanan untuk paste), lalu tekan Enter: "

if "%NEW_API_KEY%"=="" (
    echo  [ERROR] API Key tidak boleh kosong!
    pause
    exit /b 1
)

echo.
echo  ===========================================================
echo  Konfigurasi Alamat Server (VPS)
echo  Default: https://dconnect.id
echo  ===========================================================
set /p NEW_SERVER_URL="Masukkan alamat server (Tekan Enter untuk pakai default https://dconnect.id): "

if "%NEW_SERVER_URL%"=="" (
    set "NEW_SERVER_URL=https://dconnect.id"
)

echo.
echo  [!] Mengupdate config.json...
node -e "const fs=require('fs');const p='%~dp0config.json'.replace(/\\/g, '\\\\');try{const c=JSON.parse(fs.readFileSync(p));c.api_key=process.env.NEW_API_KEY;c.server_url=process.env.NEW_SERVER_URL;fs.writeFileSync(p,JSON.stringify(c,null,2));console.log('  [OK] Konfigurasi berhasil disimpan!');}catch(e){console.error('  [ERROR] Gagal update config:',e.message);process.exit(1);}"

if %errorlevel% neq 0 (
    pause
    exit /b 1
)

:config_ok
echo  [OK] Konfigurasi valid

echo.
echo  [3/5] Menginstall dependencies...
echo  [!] Mohon tunggu, proses ini membutuhkan waktu 1-3 menit...
cd /d "%~dp0"
call npm install --production 2>nul
if %errorlevel% neq 0 (
    echo.
    echo  [WARN] npm install gagal, mencoba ulang...
    call npm install --production 2>nul
    if %errorlevel% neq 0 (
        echo  [ERROR] Gagal menginstall dependencies!
        echo  [ERROR] Pastikan komputer terhubung ke internet.
        pause
        exit /b 1
    )
)
echo  [OK] Dependencies berhasil diinstall

echo.
echo  [4/5] Menguji koneksi ke server...
node -e "try{const h=require('https'),p=require('http'),c=require('./config.json'),u=new URL(c.server_url),m=u.protocol==='https:'?h:p;const r=m.get(c.server_url,{timeout:10000},function(s){console.log('  [OK] Server merespon: HTTP '+s.statusCode);process.exit(0)});r.on('error',function(e){console.log('  [WARN] Server tidak dapat dijangkau: '+e.message);console.log('  [INFO] Agent tetap akan diinstall, koneksi akan di-retry otomatis.');process.exit(0)});r.on('timeout',function(){console.log('  [WARN] Koneksi timeout - tidak masalah, agent akan retry.');process.exit(0)})}catch(e){console.log('  [WARN] Test gagal: '+e.message);process.exit(0)}"

echo.
echo  [5/5] Mendaftarkan sebagai Windows Service...
echo  [!] Jika muncul dialog UAC, pilih "Yes"...
call node service-install.js
if %errorlevel% neq 0 (
    echo.
    echo  [WARN] Registrasi service mungkin gagal.
    echo  [INFO] Anda masih bisa menjalankan agent secara manual dengan:
    echo         cd %~dp0
    echo         node agent.js
    echo.
)

echo.
echo  ===========================================================
echo   INSTALASI SELESAI!
echo.
echo   Service Name : DaikinModbusAgent
echo   Auto-Start   : YA (otomatis saat komputer menyala)
echo.
echo   Log files    : %~dp0logs\
echo   Cek status   : Buka services.msc, cari "DaikinModbusAgent"
echo.
echo   Untuk uninstall: jalankan "node service-uninstall.js"
echo  ===========================================================
echo.
pause
