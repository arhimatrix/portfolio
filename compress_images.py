import os
import re
import sys
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

file_path = r'C:\Portfolio\Files\portfolio-book.html'

if not os.path.exists(file_path):
    print(f"Error: {file_path} not found.")
    sys.exit(1)

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find all img tags in portfolio-book.html
img_pattern = re.compile(r'<img\s+[^>]*src=["\']([^"\']+)["\']', re.IGNORECASE)
img_srcs = img_pattern.findall(content)
unique_srcs = list(set(img_srcs))

print(f"Found {len(unique_srcs)} unique images in portfolio-book.html.")

# Let's keep track of conversions (old_name -> new_name)
conversions = {}
total_saved = 0

for src in unique_srcs:
    # Resolve absolute path (search in Files/ and Portfolio root)
    path = os.path.join(r'C:\Portfolio\Files', src)
    if not os.path.exists(path):
        path = os.path.join(r'C:\Portfolio', src)
        
    if not os.path.exists(path):
        print(f"Warning: image file not found: {src}")
        continue
        
    orig_size = os.path.getsize(path)
    ext = os.path.splitext(path)[1].lower()
    
    # We only compress files larger than 150KB to avoid wasting time and degrading small chips
    if orig_size < 150 * 1024:
        print(f"Skipping small image ({orig_size/1024:.1f} KB): {src}")
        continue
        
    try:
        with Image.open(path) as img:
            # Check if we need to resize
            width, height = img.size
            needs_resize = False
            max_dim = 1920
            if width > max_dim or height > max_dim:
                needs_resize = True
                if width > height:
                    new_w = max_dim
                    new_h = int(height * (max_dim / width))
                else:
                    new_h = max_dim
                    new_w = int(width * (max_dim / height))
                    
            if needs_resize:
                print(f"Resizing {src} from {width}x{height} to {new_w}x{new_h}...")
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                
            if ext == '.png':
                # Convert PNG to JPG
                new_src = os.path.splitext(src)[0] + '.jpg'
                new_path = os.path.splitext(path)[0] + '.jpg'
                
                print(f"Converting PNG to JPG: {src} -> {new_src}")
                
                # Handle transparency
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    # Extract alpha channel
                    alpha = img.convert('RGBA').split()[3]
                    background.paste(img, mask=alpha)
                    img_rgb = background
                else:
                    img_rgb = img.convert('RGB')
                    
                img_rgb.save(new_path, 'JPEG', quality=75, optimize=True)
                new_size = os.path.getsize(new_path)
                
                conversions[src] = new_src
                # Save space
                total_saved += (orig_size - new_size)
                # Remove original PNG
                os.remove(path)
                print(f"  Saved {(orig_size - new_size)/(1024*1024):.2f} MB (new size: {new_size/1024:.1f} KB)")
                
            elif ext in ('.jpg', '.jpeg'):
                # Compress existing JPEG
                # Temporary path for compression
                temp_path = path + '.temp'
                img.save(temp_path, 'JPEG', quality=75, optimize=True)
                new_size = os.path.getsize(temp_path)
                
                if new_size < orig_size:
                    os.replace(temp_path, path)
                    total_saved += (orig_size - new_size)
                    print(f"Compressed JPEG: {src} | Saved {(orig_size - new_size)/(1024*1024):.2f} MB (new size: {new_size/1024:.1f} KB)")
                else:
                    os.remove(temp_path)
                    print(f"Compression did not reduce size for: {src}")
                    
    except Exception as e:
        print(f"Error processing {src}: {e}")

print(f"\nTotal size saved on disk: {total_saved / (1024*1024):.2f} MB")

# Now perform replacement across all project files
if conversions:
    print(f"\nApplying {len(conversions)} file name conversions across HTML and JS files...")
    
    target_files = [
        r'C:\Portfolio\Files\portfolio-book.html',
        r'C:\Portfolio\index.html',
        r'C:\Portfolio\Files\index.html',
        r'C:\Portfolio\Portfolio\index.html',
        r'C:\Portfolio\app.js',
        r'C:\Portfolio\Files\app.js',
        r'C:\Portfolio\Portfolio\app.js',
        r'C:\Portfolio\cv-data.js',
        r'C:\Portfolio\Files\cv-data.js'
    ]
    
    for tf in target_files:
        if not os.path.exists(tf):
            continue
            
        print(f"Updating references in: {tf}")
        try:
            with open(tf, 'r', encoding='utf-8') as f:
                file_content = f.read()
                
            orig_content = file_content
            for old_name, new_name in conversions.items():
                # Replace exact string in file
                # E.g. NEOM/portfolio_assets/Neom HSR1.png -> NEOM/portfolio_assets/Neom HSR1.jpg
                file_content = file_content.replace(old_name, new_name)
                # Also replace just the basename just in case (e.g. Neom HSR1.png -> Neom HSR1.jpg)
                old_base = os.path.basename(old_name)
                new_base = os.path.basename(new_name)
                file_content = file_content.replace(old_base, new_base)
                
            if file_content != orig_content:
                with open(tf, 'w', encoding='utf-8') as f:
                    f.write(file_content)
                print("  Updated successfully.")
            else:
                print("  No references found to update.")
        except Exception as e:
            print(f"  Error updating {tf}: {e}")
            
print("\nCompression and renaming completed successfully!")
