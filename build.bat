@echo off
call compile.bat
call chrome.bat --pack-extension=%~dp0dist --no-message-box

