@echo off
chcp 65001 >nul
title Daikin Connect — Modbus Agent Installer
color 0B

echo.
echo  ╔══════════════════════════════════════════════════════╗
echo  ║                                                      ║
echo  ║    DAIKIN CONNECT — MODBUS AGENT INSTALLER v1.0      ║
echo  ║                                                      ║
echo  ╚══════════════════════════════════════════════════════╝
echo.

:: Check for Admin privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Script ini harus dijalankan sebagai Administrator!
    echo.
    echo  Cara: Klik kanan file ini ^> "Run as Administrator"
    echo.
    pause
    exit /b 1
)

echo  [1/5] Memeriksa Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [!] Node.js belum terinstall.
    echo  [!] Mengunduh Node.js LTS...
    
    :: Download Node.js LTS installer
    powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.18.0/node-v20.18.0-x64.msi' -OutFile '%TEMP%\node-installer.msi' }"
    
    if not exist "%TEMP%\node-installer.msi" (
        echo  [ERROR] Gagal mengunduh Node.js!
        echo  Silakan install Node.js secara manual dari https://nodejs.org
        pause
        exit /b 1
    )
    
    echo  [!] Menginstall Node.js (silent)...
    msiexec /i "%TEMP%\node-installer.msi" /qn /norestart
    
    :: Refresh PATH
    set "PATH=%PATH%;C:\Program Files\nodejs"
    
    echo  [OK] Node.js berhasil diinstall!
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo  [OK] Node.js sudah terinstall: %NODE_VER%
)

echo.
echo  [2/5] Memeriksa konfigurasi...

:: Check config.json
if not exist "%~dp0config.json" (
    echo  [ERROR] File config.json tidak ditemukan!
    pause
    exit /b 1
)

:: Check if API key is configured
findstr /C:"PASTE_API_KEY" "%~dp0config.json" >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo  ╔══════════════════════════════════════════════════════╗
    echo  ║  PERHATIAN: API Key belum dikonfigurasi!            ║
    echo  ║                                                      ║
    echo  ║  Langkah-langkah:                                   ║
    echo  ║  1. Buka admin panel Daikin Connect                  ║
    echo  ║  2. Buat gateway baru di halaman Modbus Settings     ║
    echo  ║  3. Copy API Key yang diberikan                      ║
    echo  ║  4. Paste ke file config.json                        ║
    echo  ║  5. Jalankan install.bat lagi                        ║
    echo  ╚══════════════════════════════════════════════════════╝
    echo.
    echo  Membuka config.json untuk diedit...
    notepad "%~dp0config.json"
    pause
    exit /b 1
)

echo  [OK] Konfigurasi valid

echo.
echo  [3/5] Menginstall dependencies...
cd /d "%~dp0"
call npm install --production
if %errorlevel% neq 0 (
    echo  [ERROR] Gagal menginstall dependencies!
    pause
    exit /b 1
)
echo  [OK] Dependencies berhasil diinstall

echo.
echo  [4/5] Menguji koneksi ke server...
node -e "const https=require('https');const http=require('http');const c=require('./config.json');const u=new URL(c.server_url);const p=u.protocol==='https:'?https:http;const r=p.get(c.server_url,{timeout:10000},(res)=>{console.log('  [OK] Server merespon: HTTP '+res.statusCode);process.exit(0)});r.on('error',(e)=>{console.log('  [WARN] Server tidak dapat dijangkau: '+e.message);console.log('  [WARN] Agent tetap akan diinstall, akan retry otomatis.');process.exit(0)});r.on('timeout',()=>{console.log('  [WARN] Koneksi timeout');process.exit(0)})"

echo.
echo  [5/5] Mendaftarkan sebagai Windows Service...
call node service-install.js

echo.
echo  ═══════════════════════════════════════════════════════
echo   INSTALASI SELESAI!
echo.
echo   Service Name : DaikinModbusAgent
echo   Status       : RUNNING
echo   Auto-Start   : YES (saat komputer menyala)
echo.
echo   Log files ada di: %~dp0logs\
echo   Untuk cek status: Buka services.msc
echo  ═══════════════════════════════════════════════════════
echo.
pause
