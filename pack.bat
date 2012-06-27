@echo off
setlocal
call compile.bat
pushd dist
7z a -tzip ..\ffeeder.zip *
popd