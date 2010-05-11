@echo off
mkdir dist
xcopy src dist /d /y /s
java -jar d:\work\chrome\compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --externs externs.js --js src\ffeeder.js --js_output_file dist\ffeeder.js 
