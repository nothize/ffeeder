@echo off
call compile.bat
"C:\Documents and Settings\nothize\Local Settings\Application Data\Google\Chrome\Application\chrome.exe " --pack-extension=%~dp0dist --pack-extension-key=%~dp0dist.pem --no-message-box

