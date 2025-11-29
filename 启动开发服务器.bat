@echo off
echo 正在启动Vue开发服务器...
echo.
echo 请确保已安装Node.js和npm
echo.

cd /d "%~dp0"

echo 检查依赖是否已安装...
if not exist "node_modules" (
    echo 正在安装依赖包...
    npm install
    if errorlevel 1 (
        echo 依赖安装失败，请检查网络连接或npm配置
        pause
        exit /b 1
    )
)

echo.
echo 启动开发服务器...
echo 服务器地址通常为: http://www.xuerparking.cn:8080
echo.
echo 按 Ctrl+C 停止服务器
echo.

npm run serve

pause 