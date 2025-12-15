@echo off
echo 正在检查代码语法错误...
echo.

cd /d "%~dp0"

echo 检查 StaffManagement.vue 文件...
npx eslint src/views/admin/StaffManagement.vue --no-eslintrc --config .eslintrc.js

echo.
echo 检查完成！
pause 