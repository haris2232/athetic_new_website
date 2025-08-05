@echo off
echo Removing conflicting directories...
rmdir /s /q "app\categories\[category]"
rmdir /s /q "app\categories\[subcategory]"
echo Cleanup complete!
pause 