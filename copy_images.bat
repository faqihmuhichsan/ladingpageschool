@echo off
if not exist "images" mkdir "images"
copy "C:\Users\Dapodik PKBM BL\.gemini\antigravity\brain\a3ba6d09-cf3a-49f5-9371-34dd1a4632a5\hero_banner_1772559926406.png" "images\hero.png" /Y
copy "C:\Users\Dapodik PKBM BL\.gemini\antigravity\brain\a3ba6d09-cf3a-49f5-9371-34dd1a4632a5\tk_program_1772559943188.png" "images\tk.png" /Y
copy "C:\Users\Dapodik PKBM BL\.gemini\antigravity\brain\a3ba6d09-cf3a-49f5-9371-34dd1a4632a5\sd_program_1772559961960.png" "images\sd.png" /Y
copy "C:\Users\Dapodik PKBM BL\.gemini\antigravity\brain\a3ba6d09-cf3a-49f5-9371-34dd1a4632a5\smp_program_1772559992174.png" "images\smp.png" /Y
copy "C:\Users\Dapodik PKBM BL\.gemini\antigravity\brain\a3ba6d09-cf3a-49f5-9371-34dd1a4632a5\sma_program_1772560008657.png" "images\sma.png" /Y
echo DONE
del "%~f0"
