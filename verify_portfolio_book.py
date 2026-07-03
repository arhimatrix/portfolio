import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Portfolio\Files\portfolio-book.html'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Check duplicate comment and find all page comments
pattern = re.compile(r'<!-- ═+\n\s+PAGE (\d+) · ([^\n]+)\n\s+═+ -->')
matches = list(pattern.finditer(content))

print(f"Total page matches found: {len(matches)}")
if len(matches) != 27:
    print(f"Error: expected exactly 27 page comments, found {len(matches)}.")
    sys.exit(1)

# 2. Check comments are sequentially numbered 1 to 21
if len(matches) == 27 and matches[0].group(2).strip() == "COVER" and matches[1].group(2).strip() == "COVER":
    matches = matches[1:]
for idx, m in enumerate(matches):
    page_num = int(m.group(1))
    page_title = m.group(2).strip()
    expected = idx + 1
    if page_num != expected:
        print(f"Error: page comment mismatch at index {expected}: found PAGE {page_num:02d} instead of PAGE {expected:02d}.")
        sys.exit(1)
    print(f"OK: comment Page {page_num:02d} - {page_title}")

# 3. Find and inspect page blocks
blocks = []
errors = 0
for idx, m in enumerate(matches):
    page_num = idx + 1
    start_pos = m.start()
    
    if idx + 1 < len(matches):
        end_pos = matches[idx+1].start()
    else:
        # Find closing div of last page
        div_match = re.search(r'<div\s+class=["\']page\b[^"\']*["\']', content[start_pos:])
        if not div_match:
            print(f"Error: Page {page_num:02d} has no page div container!")
            sys.exit(1)
        div_start = start_pos + div_match.start()
        tag_end = content.find('>', div_start)
        depth = 1
        curr = tag_end + 1
        while depth > 0 and curr < len(content):
            next_open = content.find('<div', curr)
            next_close = content.find('</div>', curr)
            if next_close == -1:
                break
            if next_open != -1 and next_open < next_close:
                depth += 1
                curr = next_open + 4
            else:
                depth -= 1
                curr = next_close + 6
        end_pos = curr
        
    page_html = content[start_pos:end_pos]
    
    # 4. Check running footer page number (pf-right)
    # E.g. <span class="pf-right">p. 02</span>
    # Note: COVER and BACK COVER might not have page number footers
    if "COVER" not in m.group(2) and "BACK COVER" not in m.group(2):
        pf_match = re.search(r'<span class="pf-right">p.\s*(\d+)</span>', page_html)
        if pf_match:
            pf_num = int(pf_match.group(1))
            if pf_num != page_num:
                print(f"Error: Page {page_num:02d} running footer is p. {pf_num:02d} instead of p. {page_num:02d}.")
                errors += 1
        else:
            # Let's check if the page actually has a footer
            if '<div class="pf">' in page_html and "Simulation" not in m.group(2):
                print(f"Warning: Page {page_num:02d} has pf div but no page number.")
                errors += 1

    # 5. Check running header page number (rh-label) for light pages
    if 'class="page light"' in page_html or 'class="page  light"' in page_html:
        # Running header page number is the last digit group in rh div
        rh_match = re.search(r'<div class="rh">.*?<span class="rh-label">(\d+)</span>\s*</div>', page_html, re.DOTALL)
        if rh_match:
            rh_num = int(rh_match.group(1))
            if rh_num != page_num:
                print(f"Error: Page {page_num:02d} running header page is {rh_num:02d} instead of {page_num:02d}.")
                errors += 1
        else:
            if "COVER" not in m.group(2) and "TABLE OF CONTENTS" not in m.group(2):
                print(f"Warning: Light Page {page_num:02d} has no running header page number.")
                errors += 1

# 6. Check tag balance in the whole file (specifically, divs)
open_divs = content.count('<div')
close_divs = content.count('</div>')
print(f"Div tags count - Open: {open_divs}, Close: {close_divs}")
if open_divs != close_divs:
    print(f"Error: Unbalanced div tags! Difference is {abs(open_divs - close_divs)}")
    errors += 1
else:
    print("OK: Div tags are perfectly balanced.")

if errors == 0:
    print("Verification SUCCESSFUL! No errors found.")
    sys.exit(0)
else:
    print(f"Verification FAILED with {errors} errors.")
    sys.exit(1)
