import os

files = [
    r'C:\Portfolio\index.html',
    r'C:\Portfolio\Files\index.html'
]

for file_path in files:
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # We want to replace specific sections
    # Let's perform exact string replacements for safety
    replacements = [
        ('<span class="title">NEOM Multimodal Mobility Hubs</span>\n              <span class="subtitle">OVERVIEW · STATION ARCHITECTURE · SYSTEMS</span>\n            </span>\n            <span class="page">p.07</span>',
         '<span class="title">NEOM Multimodal Mobility Hubs</span>\n              <span class="subtitle">OVERVIEW · STATION ARCHITECTURE · SYSTEMS</span>\n            </span>\n            <span class="page">p.08</span>'),
         
        ('<span class="title">Distributed Exploration of Titan</span>\n              <span class="subtitle">COOPERATIVE 9-AGENT SWARM · FULL MBSE</span>\n            </span>\n            <span class="page">p.12</span>',
         '<span class="title">Distributed Exploration of Titan</span>\n              <span class="subtitle">COOPERATIVE 9-AGENT SWARM · FULL MBSE</span>\n            </span>\n            <span class="page">p.13</span>'),
         
        ('<span class="title">Orbital Gateway Construction</span>\n              <span class="subtitle">CONSENSUS COORDINATION FOR IN-ORBIT ASSEMBLY</span>\n            </span>\n            <span class="page">p.16</span>',
         '<span class="title">Orbital Gateway Construction</span>\n              <span class="subtitle">CONSENSUS COORDINATION FOR IN-ORBIT ASSEMBLY</span>\n            </span>\n            <span class="page">p.17</span>'),
         
        ('<span class="title">Computational Design & Resilience</span>\n              <span class="subtitle">ENVIRONMENTAL STRESS · X-BIM DASHBOARD</span>\n            </span>\n            <span class="page">p.19</span>',
         '<span class="title">Computational Design & Resilience</span>\n              <span class="subtitle">ENVIRONMENTAL STRESS · X-BIM DASHBOARD</span>\n            </span>\n            <span class="page">p.20</span>'),
         
        ('<span class="title">Curriculum Vitae</span>\n              <span class="subtitle">EXPERIENCE · EDUCATION · AFFILIATIONS · SKILLS</span>\n            </span>\n            <span class="page">p.21</span>',
         '<span class="title">Curriculum Vitae</span>\n              <span class="subtitle">EXPERIENCE · EDUCATION · AFFILIATIONS · SKILLS</span>\n            </span>\n            <span class="page">p.22</span>')
    ]
    
    modified = content
    replaced_count = 0
    for old, new in replacements:
        if old in modified:
            modified = modified.replace(old, new)
            replaced_count += 1
        else:
            # Try with single-line whitespace normalization in case of small format differences
            # Let's print a warning
            print(f"Warning: could not find exact pattern in {file_path}")
            
    if replaced_count > 0:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(modified)
        print(f"Updated {file_path} successfully ({replaced_count}/5 replacements made).")
    else:
        print(f"No replacements made in {file_path}.")
