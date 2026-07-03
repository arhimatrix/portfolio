import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Portfolio\Files\portfolio-book.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for "PAGE 05" and "PAGE 13" blocks and print their text containers.
pattern = re.compile(r'<!-- ═+\n\s+PAGE (\d+) · ([^\n]+)\n\s+═+ -->')
matches = list(pattern.finditer(content))

for idx in [5, 13, 17]: # index of Page 05, Page 13, Page 17
    m = matches[idx]
    page_num = int(m.group(1))
    page_title = m.group(2).strip()
    start_pos = m.start()
    
    if idx + 1 < len(matches):
        end_pos = matches[idx+1].start()
    else:
        end_pos = start_pos + 5000
        
    page_html = content[start_pos:end_pos]
    
    print(f"\n=== Page {page_num:02d} ({page_title}) Snippet ===")
    txt_start = page_html.find('class="ch-text-block"')
    if txt_start != -1:
        # Find closing div of ch-text-block
        depth = 1
        curr = page_html.find('>', txt_start) + 1
        while depth > 0 and curr < len(page_html):
            next_open = page_html.find('<div', curr)
            next_close = page_html.find('</div>', curr)
            if next_close == -1:
                break
            if next_open != -1 and next_open < next_close:
                depth += 1
                curr = next_open + 4
            else:
                depth -= 1
                curr = next_close + 6
        print(page_html[txt_start-20:curr])
    else:
        print("ch-text-block NOT FOUND")
