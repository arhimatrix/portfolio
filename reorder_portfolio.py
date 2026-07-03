import re
import sys
import shutil

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Portfolio\Files\portfolio-book.html'
bak_path = file_path + '.bak'

# 1. Restore the original backup
try:
    shutil.copyfile(bak_path, file_path)
    print(f"Restored file from backup: {bak_path}")
except Exception as e:
    print(f"Failed to restore backup: {e}")
    sys.exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 2. Parse page blocks
pattern = re.compile(r'<!-- ═+\n\s+PAGE (\d+) · ([^\n]+)\n\s+═+ -->')
matches = list(pattern.finditer(content))

# Drop duplicate COVER comment if present
if len(matches) == 24 and matches[0].group(2).strip() == "COVER" and matches[1].group(2).strip() == "COVER":
    matches = matches[1:]

blocks = []
for idx, m in enumerate(matches):
    page_num = int(m.group(1))
    page_title = m.group(2).strip()
    start_pos = m.start()
    
    if idx + 1 < len(matches):
        end_pos = matches[idx+1].start()
    else:
        # last page
        div_match = re.search(r'<div\s+class=["\']page\b[^"\']*["\']', content[start_pos:])
        if not div_match:
            print(f"Error: no page div found for page {page_num}")
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
        
    blocks.append({
        'orig_page_num': page_num,
        'title': page_title,
        'start': start_pos,
        'end': end_pos,
        'text': content[start_pos:end_pos]
    })

print(f"Successfully parsed {len(blocks)} page blocks.")

# 3. Define mapping to reorder blocks
new_sequence_indices = [
    0, 1, 2,     # Pages 1-3 (Cover, Profile, TOC)
    3, 4, 5,     # Pages 4-6 (Ch 1)
    15, 16, 17, 18, # Pages 16-19 (Ch 5 - NEOM, becomes Ch 2)
    6, 7, 8, 9,  # Pages 7-10 (Ch 2 - Titan, becomes Ch 3)
    10, 11, 12,  # Pages 11-13 (Ch 3 - Orbital, becomes Ch 4)
    19, 20,      # Pages 20-21 (Ch 6 - Computational, becomes Ch 5)
    21, 22       # Pages 22-23 (CV, Back Cover)
]

new_blocks = [blocks[i] for i in new_sequence_indices]
print(f"New blocks count: {len(new_blocks)}")

# 4. Renumber and rewrite elements inside each block
updated_blocks = []
for new_idx, b in enumerate(new_blocks):
    new_page_num = new_idx + 1
    block_text = b['text']
    
    # Identify new chapter number and mapping for this page block
    if 7 <= new_page_num <= 10:
        new_ch_num = 2
        # NEOM was Ch 5
        ch_replacements = [('Ch.05 · NEOM', 'Ch.02 · NEOM'), ('CHAPTER 05', 'CHAPTER 02')]
    elif 11 <= new_page_num <= 14:
        new_ch_num = 3
        # Titan was Ch 2
        ch_replacements = [('Ch.02 · Distributed Exploration', 'Ch.03 · Distributed Exploration'), ('CHAPTER 02', 'CHAPTER 03')]
    elif 15 <= new_page_num <= 17:
        new_ch_num = 4
        # Orbital was Ch 3
        ch_replacements = [('Ch.03 · Orbital Gateway', 'Ch.04 · Orbital Gateway'), ('CHAPTER 03', 'CHAPTER 04')]
    elif 18 <= new_page_num <= 19:
        new_ch_num = 5
        # Computational Design was Ch 6
        ch_replacements = [('Ch.06 · Computational Design', 'Ch.05 · Computational Design'), ('CHAPTER 06', 'CHAPTER 05')]
    else:
        new_ch_num = None
        ch_replacements = []

    # a. Update comment header page number
    comment_pattern = re.compile(r'(<!-- ═+\n\s+PAGE )\d+( · [^\n]+\n\s+═+ -->)')
    block_text = comment_pattern.sub(rf'\g<1>{new_page_num:02d}\2', block_text)
    
    # b. Apply chapter replacements specifically for this page block
    for old_val, new_val in ch_replacements:
        block_text = block_text.replace(old_val, new_val)
        
    # c. Renumber running headers page number
    rh_pattern = re.compile(r'(<div class="rh">.*?<span class="rh-label">)\d+(</span>\s*</div>)', re.DOTALL)
    block_text = rh_pattern.sub(rf'\g<1>{new_page_num:02d}\2', block_text)
    
    # d. Renumber running footers page number
    pf_pattern = re.compile(r'(<span class="pf-right">p.\s*)\d+(</span>)')
    block_text = pf_pattern.sub(rf'\g<1>{new_page_num:02d}\2', block_text)
    
    # e. Renumber opener chapter numbers (<div class="ch-num">XX</div>)
    if new_ch_num is not None:
        ch_num_pattern = re.compile(r'(<div class="ch-num">)\d+(</div>)')
        block_text = ch_num_pattern.sub(rf'\g<1>{new_ch_num:02d}\2', block_text)
        
    updated_blocks.append(block_text)

# 5. Update the Table of Contents block (which is index 2)
toc_block = updated_blocks[2]
new_toc_list_html = """      <ul class="toc-list">
        <li class="toc-item">
          <span class="toc-num">01</span>
          <span class="toc-title-wrap">
            <span class="toc-title">Human-Machine Collaboration & Sentient Infrastructure</span>
            <span class="toc-sub">EuroMoonMars Lunar Village · Adaptive Human-Robot Interface</span>
          </span>
          <span class="toc-page">p.04</span>
        </li>
        <li class="toc-item">
          <span class="toc-num">02</span>
          <span class="toc-title-wrap">
            <span class="toc-title">NEOM Multimodal Mobility Hubs</span>
            <span class="toc-sub">Human-Machine Interface · Zero-Carbon Transit · Occupant Sensing</span>
          </span>
          <span class="toc-page">p.07</span>
        </li>
        <li class="toc-item">
          <span class="toc-num">03</span>
          <span class="toc-title-wrap">
            <span class="toc-title">Distributed Exploration of Titan's Organic Chemistry - A Cooperative Hybrid-Agent Swarm Mission</span>
            <span class="toc-sub">9-Agent Swarm · Adaptive Task Planning · Full MBSE</span>
          </span>
          <span class="toc-page">p.11</span>
        </li>
        <li class="toc-item">
          <span class="toc-num">04</span>
          <span class="toc-title-wrap">
            <span class="toc-title">Orbital Gateway Construction</span>
            <span class="toc-sub">Consensus Coordination · In-Orbit Assembly · Digital Twin</span>
          </span>
          <span class="toc-page">p.15</span>
        </li>
        <li class="toc-item">
          <span class="toc-num">05</span>
          <span class="toc-title-wrap">
            <span class="toc-title">Computational Design & Resilience</span>
            <span class="toc-sub">Storm-Resilient Buildings · X-BIM Suite · Real-Time Dashboard</span>
          </span>
          <span class="toc-page">p.18</span>
        </li>
        <li class="toc-item">
          <span class="toc-num">06</span>
          <span class="toc-title-wrap">
            <span class="toc-title">Curriculum Vitae</span>
            <span class="toc-sub">Experience · Education · Affiliations · Skills</span>
          </span>
          <span class="toc-page">p.20</span>
        </li>
      </ul>"""

# Replace the ul in toc_block
toc_list_pattern = re.compile(r'<ul class="toc-list">.*?</ul>', re.DOTALL)
updated_blocks[2] = toc_list_pattern.sub(new_toc_list_html, toc_block)

# 6. Reconstruct the entire file
header = content[:blocks[0]['start']]
footer = content[blocks[-1]['end']:]
new_content = header + "".join(updated_blocks) + footer

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Reordered portfolio book written to: {file_path}")
print(f"New file length: {len(new_content)}")
