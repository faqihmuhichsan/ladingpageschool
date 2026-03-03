import shutil, os

src = r"C:\Users\Dapodik PKBM BL\.gemini\antigravity\brain\a3ba6d09-cf3a-49f5-9371-34dd1a4632a5"
dst = r"d:\FAQIH\WEBSITE\lading page school\images"

os.makedirs(dst, exist_ok=True)

files = {
    "hero_banner_1772559926406.png": "hero.png",
    "tk_program_1772559943188.png": "tk.png",
    "sd_program_1772559961960.png": "sd.png",
    "smp_program_1772559992174.png": "smp.png",
    "sma_program_1772560008657.png": "sma.png",
}

for src_name, dst_name in files.items():
    s = os.path.join(src, src_name)
    d = os.path.join(dst, dst_name)
    if os.path.exists(s):
        shutil.copy2(s, d)
        print(f"Copied: {dst_name}")
    else:
        print(f"Not found: {src_name}")

print("ALL DONE")
