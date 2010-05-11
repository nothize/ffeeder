@echo off
call compile.bat
pushd dist
7z a -tzip ..\ffeeder.zip *