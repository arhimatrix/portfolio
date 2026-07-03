import re
import sys
import shutil

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Portfolio\Files\portfolio-book.html'
bak_path = file_path + '.bak2'

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
        'start': start_pos,
        'end': end_pos,
        'text': content[start_pos:end_pos]
    })

print(f"Successfully parsed {len(blocks)} page blocks.")

# 3. Construct new Page 09 block
new_page_09_text = """<!-- ══════════════════════════════════════════
       PAGE 09 · CHAPTER 02 NEOM MOBILITY NETWORK
       ══════════════════════════════════════════ -->
  <div class="page light">
    <div class="rh">
      <span class="rh-label">Ch.02 · NEOM Multimodal Mobility Hubs</span>
      <div class="rh-line"></div>
      <span class="rh-label">09</span>
    </div>
    
    <div class="ch-content" style="padding: 4mm 14mm 0; gap: 4mm; flex: 1; display: flex; flex-direction: row; min-height: 0;">
      
      <!-- Left Column: Text Flow -->
      <div style="flex: 1.0; display: flex; flex-direction: column; gap: 3.5mm; min-height: 0; padding-right: 2mm; margin-bottom: 2mm;">
        <div style="display: flex; flex-direction: column; gap: 3.5mm; min-height: 0;">
          
          <div>
            <div class="ch-section-title" style="margin-bottom: 1.5mm;">The Network Structure: Seamless Interchange</div>
            <p style="margin-bottom: 1.5mm;">The modern transit network shifts away from segmented transport toward a continuous, fluid spatial fabric. Within this ecosystem, mobility hubs are no longer static endpoints; they act as dynamic intersection points for a highly synchronized, multimodal transit system. By blending grade-separated autonomous transit links, micro-mobility channels, and pedestrian concourses into a unified structural layout, these hubs minimize friction during transfers and optimize spatial capacity.</p>
            <p>The public realm is reimagined as an active geometric filter that organically guides commuter movement while supporting a vibrant, high-density civic space.</p>
          </div>
          
          <div>
            <div class="ch-section-title" style="margin-bottom: 1.5mm;">The Cognitive Superposition: BOH Digital to FOH Physical</div>
            <p style="margin-bottom: 1.5mm;">Behind the physical architecture lies a hidden digital layer that coordinates ongoing operational logistics:</p>
            <ul class="ch-bullets" style="margin: 0; padding: 0;">
              <li><strong>Augmented Wayfinding &amp; Spatial Navigation:</strong> As showcased in <code>image_4a0e04.jpg</code>, the digital framework projects dynamic, real-time spatial indicators directly onto the structural surfaces. This responsive wayfinding system fluidly adapts to pedestrian density and active transit schedules, removing standard visual clutter.</li>
              <li><strong>Smart Responsive MEP &amp; Infrastructure:</strong> Environmental control systems are tied directly to predictive flow metrics. Heating, cooling, ventilation, and lighting adjust dynamically across active zones to conserve energy while optimizing human comfort.</li>
              <li><strong>Seamless Operation Pipelines:</strong> By treating Front-of-House (FOH) architectural pathways and Back-of-House (BOH) automated logistical grids as a single, connected network, the hub functions as a living, predictable machine.</li>
            </ul>
          </div>
          
          <div>
            <div class="ch-section-title" style="margin-bottom: 1.5mm;">Morphological Introduction: Typological Scalability</div>
            <p style="margin-bottom: 1.5mm;">To translate this multi-layered network into physical form, the portfolio transitions from high-level mapping into targeted geometry generation. The following chapters detail a parametric exploration across different architectural scales:</p>
            <ul class="ch-bullets" style="margin: 0; padding: 0;">
              <li><strong>Mobility Hubs:</strong> Scaled infrastructure designed to anchor civic spaces while handling fluid mid-tier regional transit intersections.</li>
              <li><strong>Autonomous PUDO Nodes (Pick-Up / Drop-Off):</strong> Minimalist micro-architectures sculpted to shelter high-frequency autonomous vehicle transfers without interrupting surrounding urban flows.</li>
            </ul>
          </div>
          
        </div>
      </div>
      
      <!-- Right Column: System Diagram, Video, & 2x2 Render Grid -->
      <div style="flex: 1.0; display: flex; flex-direction: column; gap: 3.5mm; min-height: 0; margin-bottom: 2mm;">
        <!-- Top Half: Circular Diagram (No border, aligned to top) -->
        <div style="flex: 1.4; display: flex; flex-direction: column; min-height: 0;">
          <div style="flex: 1; overflow: hidden; min-height: 0; background: transparent;">
            <img src="NEOM/portfolio_assets/diagram.jpg" alt="BOH and FOH Multimodal Mobility System Diagram" style="width: 100%; height: 100%; object-fit: contain; object-position: top;">
          </div>
          <div style="font-family: var(--f-m); font-size: 6.5pt; color: #64748B; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 1.5mm; padding-left: 1mm; flex-shrink: 0;">
            FIG.05.L — Systems Integration: Cognitive BOH Layer &amp; Concourse FOH Interfaces
          </div>
        </div>
        
        <!-- Middle: Video (Moved from left column) -->
        <div style="flex: 0.8; display: flex; flex-direction: column; min-height: 0;">
          <div style="flex: 1; overflow: hidden; min-height: 0; background: #000; border: 0.3mm solid var(--border); border-radius: 2px;">
            <video src="NEOM/portfolio_assets/neom_network_video.mp4" autoplay loop muted playsinline style="width: 100%; height: 100%; object-fit: cover; display: block;"></video>
          </div>
          <div style="font-family: var(--f-m); font-size: 6.5pt; color: #64748B; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 1.5mm; padding-left: 1mm; flex-shrink: 0;">
            FIG.05.K — Pedestrian Flow Simulation: Real-Time Dynamic Routing Indicator
          </div>
        </div>
        
        <!-- Bottom Half: 2x2 Station Renders Grid -->
        <div style="flex: 1.1; display: flex; flex-direction: column; min-height: 0;">
          <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 1.5mm; min-height: 0;">
            <div class="img-cell sq" style="min-height: 0; border: 0.3mm solid var(--border); border-radius: 2px;">
              <img src="NEOM/portfolio_assets/Neom HSR3.jpg" alt="NEOM Station Interior Rendering 1" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="img-cell sq" style="min-height: 0; border: 0.3mm solid var(--border); border-radius: 2px;">
              <img src="NEOM/portfolio_assets/Neom HSR4.jpg" alt="NEOM Station Interior Rendering 2" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="img-cell sq" style="min-height: 0; border: 0.3mm solid var(--border); border-radius: 2px;">
              <img src="NEOM/portfolio_assets/Neom HSR8.jpg" alt="NEOM Station Exterior Rendering 1" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
            <div class="img-cell sq" style="min-height: 0; border: 0.3mm solid var(--border); border-radius: 2px;">
              <img src="NEOM/portfolio_assets/Neom HSR9.jpg" alt="NEOM Station Exterior Rendering 2" style="width: 100%; height: 100%; object-fit: cover;">
            </div>
          </div>
          <div style="font-family: var(--f-m); font-size: 6.5pt; color: #64748B; letter-spacing: 0.1em; text-transform: uppercase; margin-top: 1.5mm; padding-left: 1mm; flex-shrink: 0;">
            FIG.05.M — Morphological Prototypes: Multi-Scale Station Shells &amp; Structural Canopy Forms
          </div>
        </div>
      </div>
      
    </div>
    
    <div class="pf">
      <span class="pf-left">Ch.02 · NEOM Multimodal Mobility Hubs</span>
      <span class="pf-right">p. 09</span>
    </div>
  </div>\n\n"""

# 4. Insert new Page 09 block in sequence list
# We want it after Page 08 (index 8, since duplicate COVER is index 1).
new_blocks = list(blocks)
new_blocks.insert(9, {
    'orig_page_num': 9,
    'title': 'CHAPTER 02 NEOM MOBILITY NETWORK',
    'text': new_page_09_text
})

print(f"New sequence has {len(new_blocks)} page blocks.")

# 5. Renumber pages and run elements
updated_blocks = []
for new_idx, b in enumerate(new_blocks):
    if new_idx >= 2:
        new_page_num = new_idx
    else:
        new_page_num = 1
        
    block_text = b['text']
    
    # We only update pages starting from index 10 onwards (shifted pages)
    if new_idx >= 10:
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

# 6. Update the Table of Contents block (which is index 3)
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
          <span class="toc-page">p.07</span>
        </li>
        <li class="toc-item">
          <span class="toc-num">03</span>
          <span class="toc-title-wrap">
            <span class="toc-title">Distributed Exploration of Titan's Organic Chemistry - A Cooperative Hybrid-Agent Swarm Mission</span>
            <span class="toc-sub">9-Agent Swarm · Adaptive Task Planning · Full MBSE</span>
          </span>
          <span class="toc-page">p.12</span>
        </li>
        <li class="toc-item">
          <span class="toc-num">04</span>
          <span class="toc-title-wrap">
            <span class="toc-title">Orbital Gateway Construction</span>
            <span class="toc-sub">Consensus Coordination · In-Orbit Assembly · Digital Twin</span>
          </span>
          <span class="toc-page">p.16</span>
        </li>
        <li class="toc-item">
          <span class="toc-num">05</span>
          <span class="toc-title-wrap">
            <span class="toc-title">Computational Design & Resilience</span>
            <span class="toc-sub">Storm-Resilient Buildings · X-BIM Suite · Real-Time Dashboard</span>
          </span>
          <span class="toc-page">p.19</span>
        </li>
        <li class="toc-item">
          <span class="toc-num">06</span>
          <span class="toc-title-wrap">
            <span class="toc-title">Curriculum Vitae</span>
            <span class="toc-sub">Experience · Education · Affiliations · Skills</span>
          </span>
          <span class="toc-page">p.21</span>
        </li>
      </ul>"""

# Replace the ul in toc_block
toc_list_pattern = re.compile(r'<ul class="toc-list">.*?</ul>', re.DOTALL)
updated_blocks[3] = toc_list_pattern.sub(new_toc_list_html, toc_block)

# 7. Reconstruct the entire file
header = content[:blocks[0]['start']]
footer = content[blocks[-1]['end']:]
new_content = header + "".join(updated_blocks) + footer

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Updated portfolio book written to: {file_path}")
print(f"New file length: {len(new_content)}")
