import re
import sys
import os
import shutil

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Portfolio\Files\portfolio-book.html'
bak_path = file_path + '.bak3'

# 1. Back up current file before making edits
shutil.copyfile(file_path, bak_path)
print(f"Backed up current file to: {bak_path}")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 2. Parse current page blocks
pattern = re.compile(r'<!-- ═+\n\s+PAGE (\d+) · ([^\n]+)\n\s+═+ -->')
matches = list(pattern.finditer(content))

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
        'text': content[start_pos:end_pos]
    })

print(f"Successfully parsed {len(blocks)} page blocks.")

# Validate block 5 and 6
print(f"Block 5 (idx 5): PAGE {blocks[5]['orig_page_num']} - {blocks[5]['title']}")
print(f"Block 6 (idx 6): PAGE {blocks[6]['orig_page_num']} - {blocks[6]['title']}")

new_page_text = """<!-- ══════════════════════════════════════════
       PAGE 06 · CHAPTER 01 DEEP ENGINEERING
       ══════════════════════════════════════════ -->
  <div class="page light">
    <div class="rh">
      <span class="rh-label">Ch.01 · Human-Machine Collaboration</span>
      <div class="rh-line"></div>
      <span class="rh-label">06</span>
    </div>
    <div class="ch-content" style="padding: 4mm 14mm 0; gap: 3mm; flex: 1; display: flex; flex-direction: column; min-height: 0;">
      
      <!-- Top Image: Full Width -->
      <div class="img-cell" style="height: 52mm; flex-shrink: 0; border: 0.3mm solid var(--border); border-radius: 2px;">
        <img src="Horizon Protocol/portfolio_assets/deep_engineering_top.jpg" alt="Intelligent Structural Sensing Dome">
      </div>

      <!-- Middle Image: Side-by-side elevation and perspective -->
      <div class="img-cell" style="height: 40mm; flex-shrink: 0; border: 0.3mm solid var(--border); border-radius: 2px;">
        <img src="Horizon Protocol/portfolio_assets/deep_engineering_middle.jpg" alt="Elevation & Perspective Views">
      </div>

      <!-- Text Section: 2 Columns -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; flex: 1; min-height: 0;">
        <!-- Left Column -->
        <div class="ch-text-block" style="display: flex; flex-direction: column; justify-content: flex-start;">
          <div class="ch-section-kicker" style="margin-bottom: 1.5mm;">01. Deep Engineering: Intelligent Structural Sensing</div>
          <div class="ch-section-title" style="margin-top: 0; margin-bottom: 1.5mm; font-size: 7.5pt; font-weight: 600;">Piezoelectric Regolith Integration</div>
          <p style="font-size: 7.2pt; line-height: 1.45; text-align: justify; color: var(--gray); margin-bottom: 0;">Terrestrial architecture relies on static mass to resist environmental loads; extreme extraterrestrial environments demand that infrastructure functions as an active, self-organizing system of autonomous agents. By embedding a dense, continuous matrix of piezoelectric sensors directly within the 3D-printed ISRU (In-Situ Resource Utilization) lunar concrete shell, the passive shield is transformed into a reactive, cyber-physical membrane. This multi-layered enclosure operates as a localized nervous system, continuously translating mechanical stresses, vibrations, and structural deformations into real-time telemetry.</p>
        </div>
        
        <!-- Right Column -->
        <div class="ch-text-block" style="display: flex; flex-direction: column; justify-content: flex-start; gap: 2.5mm;">
          <div>
            <div class="ch-section-title" style="margin-top: 0; margin-bottom: 1mm; font-size: 7.5pt; font-weight: 600;">The "Acoustic" Building: The Reflex Arc</div>
            <p style="font-size: 7.2pt; line-height: 1.45; text-align: justify; color: var(--gray); margin-bottom: 0;">Instead of merely reacting to structural failure after it occurs, the system utilizes a biological "reflex arc" framework to achieve predictive habitability. Acoustic emission sensors and piezoelectric nodes capture the high-frequency structural signatures generated by extreme 300°C thermal cycling and micrometeoroid impacts. This continuous sensory stream allows the underlying system model to predict structural fatigue, localize impact coordinates, and calculate micro-fissure propagation vectors before localized failures can breach the pressurized habitat envelope.</p>
          </div>
          <div>
            <div class="ch-section-title" style="margin-top: 0; margin-bottom: 1mm; font-size: 7.5pt; font-weight: 600;">Structural Adaptation & Preemptive Mitigation</div>
            <p style="font-size: 7.2pt; line-height: 1.45; text-align: justify; color: var(--gray); margin-bottom: 1.5mm;">The architectural geometry dynamically responds to real-time predictive hazard overlays through a dual-layered mitigation strategy:</p>
            <ul class="ch-bullets" style="gap: 1.5mm;">
              <li style="font-size: 6.8pt; line-height: 1.35; color: var(--gray); padding-left: 4mm;"><strong style="color: var(--black);">Sub-Structure Optimization:</strong> Adaptive foundations utilize active kinetic components to shift load distributions and modify grounding profiles, directly mitigating the intense structural shear caused by extreme lunar thermal expansion and contraction.</li>
              <li style="font-size: 6.8pt; line-height: 1.35; color: var(--gray); padding-left: 4mm;"><strong style="color: var(--black);">Enclosure Thickening & Material Deposition:</strong> Triggered by high-risk predictive modeling, autonomous robotic responders can apply targeted material reinforcement to high-stress zones. The shell dynamically thickens its outer protective layers in direct response to directional micrometeoroid flux and localized material degradation.</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Bottom Image: Full Width -->
      <div class="img-cell" style="height: 48mm; flex-shrink: 0; margin-bottom: 1mm; border: 0.3mm solid var(--border); border-radius: 2px;">
        <img src="Horizon Protocol/portfolio_assets/deep_engineering_bottom.jpg" alt="Wireframe Mesh Shell">
      </div>

    </div>
    <div class="pf">
      <span class="pf-left">Ch.01 · Human-Machine Collaboration</span>
      <span class="pf-right">p. 06</span>
    </div>
  </div>\n\n"""

# 3. Insert new block
new_blocks = list(blocks)
new_blocks.insert(6, {
    'orig_page_num': 6,
    'title': 'CHAPTER 01 DEEP ENGINEERING',
    'text': new_page_text
})

print(f"New sequence has {len(new_blocks)} page blocks.")

# 4. Renumber all blocks
updated_blocks = []
for new_idx, b in enumerate(new_blocks):
    if new_idx >= 2:
        new_page_num = new_idx
    else:
        new_page_num = 1
        
    block_text = b['text']
    
    # We only update pages starting from index 6 onwards (new page and shifted pages)
    if new_idx >= 6:
        # a. Update comment header
        comment_pattern = re.compile(r'(<!-- ═+\n\s+PAGE )\d+( · [^\n]+\n\s+═+ -->)')
        block_text = comment_pattern.sub(rf'\g<1>{new_page_num:02d}\2', block_text)
        
        # b. Renumber running headers page number
        rh_pattern = re.compile(r'(<div class="rh">.*?<span class="rh-label">)\d+(</span>\s*</div>)', re.DOTALL)
        block_text = rh_pattern.sub(rf'\g<1>{new_page_num:02d}\2', block_text)
        
        # c. Renumber running footers page number
        pf_pattern = re.compile(r'(<span class="pf-right">p.\s*)\d+(</span>)')
        block_text = pf_pattern.sub(rf'\g<1>{new_page_num:02d}\2', block_text)
        
    updated_blocks.append(block_text)

# 5. Update the Table of Contents block (which is index 3)
toc_block = updated_blocks[3]
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
          <span class="toc-page">p.08</span>
        </li>
        <li class="toc-item">
          <span class="toc-num">03</span>
          <span class="toc-title-wrap">
            <span class="toc-title">Distributed Exploration of Titan's Organic Chemistry - A Cooperative Hybrid-Agent Swarm Mission</span>
            <span class="toc-sub">9-Agent Swarm · Adaptive Task Planning · Full MBSE</span>
          </span>
          <span class="toc-page">p.13</span>
        </li>
        <li class="toc-item">
          <span class="toc-num">04</span>
          <span class="toc-title-wrap">
            <span class="toc-title">Orbital Gateway Construction</span>
            <span class="toc-sub">Consensus Coordination · In-Orbit Assembly · Digital Twin</span>
          </span>
          <span class="toc-page">p.17</span>
        </li>
        <li class="toc-item">
          <span class="toc-num">05</span>
          <span class="toc-title-wrap">
            <span class="toc-title">Computational Design & Resilience</span>
            <span class="toc-sub">Storm-Resilient Buildings · X-BIM Suite · Real-Time Dashboard</span>
          </span>
          <span class="toc-page">p.20</span>
        </li>
        <li class="toc-item">
          <span class="toc-num">06</span>
          <span class="toc-title-wrap">
            <span class="toc-title">Curriculum Vitae</span>
            <span class="toc-sub">Experience · Education · Affiliations · Skills</span>
          </span>
          <span class="toc-page">p.22</span>
        </li>
      </ul>"""

toc_list_pattern = re.compile(r'<ul class="toc-list">.*?</ul>', re.DOTALL)
updated_blocks[3] = toc_list_pattern.sub(new_toc_list_html, toc_block)

# 6. Reconstruct the entire file
header = content[:matches[0].start()]
footer = content[matches[-1].start() + len(blocks[-1]['text']) :]
new_content = header + "".join(updated_blocks) + footer

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Updated portfolio book written to: {file_path}")
print(f"New file length: {len(new_content)}")
