import sys

sys.stdout.reconfigure(encoding='utf-8')

for path in [r'C:\Portfolio\cv-data.js', r'C:\Portfolio\Files\cv-data.js']:
    print(f"=== {path} ===")
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        # Find chapters array in js: data.chapters = [...] or cvData.chapters = [...] or chapters: [...]
        # Let's extract and print the text between chapters: [ and ]
        start_idx = content.find('chapters: [')
        if start_idx == -1:
            start_idx = content.find('chapters = [')
        if start_idx == -1:
            print("Could not find chapters array start.")
            continue
        
        # Find matching close bracket
        depth = 1
        curr = start_idx + len('chapters: [') if 'chapters: [' in content else start_idx + len('chapters = [')
        while depth > 0 and curr < len(content):
            if content[curr] == '[':
                depth += 1
            elif content[curr] == ']':
                depth -= 1
            curr += 1
        
        print(content[start_idx:curr])
    except Exception as e:
        print(f"Error: {e}")
