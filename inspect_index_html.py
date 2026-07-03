import sys

sys.stdout.reconfigure(encoding='utf-8')

for path in [r'C:\Portfolio\index.html', r'C:\Portfolio\Files\index.html']:
    print(f"=== {path} ===")
    try:
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        for idx, line in enumerate(lines):
            if 'id="chapters"' in line:
                start = idx
                end = min(len(lines), idx + 80)
                for j in range(start, end):
                    print(f"  {j+1}: {lines[j].rstrip()}")
    except Exception as e:
        print(f"Error: {e}")
