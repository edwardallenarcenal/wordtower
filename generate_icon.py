#!/usr/bin/env python3
"""
Word Tower App Icon Generator
Creates cute app icons for the Word Tower game
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import math
    import random
except ImportError:
    print("PIL (Pillow) not found. Installing...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw, ImageFont
    import math
    import random

def create_rounded_rectangle(draw, bbox, radius, fill_color, outline_color=None, outline_width=0):
    """Create a rounded rectangle"""
    x1, y1, x2, y2 = bbox
    
    # Create a mask for the rounded rectangle
    mask = Image.new('L', (x2-x1, y2-y1), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((0, 0, x2-x1, y2-y1), radius, fill=255)
    
    # Create colored rectangle
    colored_rect = Image.new('RGBA', (x2-x1, y2-y1), fill_color)
    
    # Apply mask
    colored_rect.putalpha(mask)
    
    return colored_rect

def create_word_tower_icon(size=1024):
    """Create a cute Word Tower app icon"""
    
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Create gradient background
    for y in range(size):
        # Create a radial gradient effect
        center_x, center_y = size // 2, size // 2
        distance = math.sqrt((center_x - size//2)**2 + (center_y - y)**2)
        max_distance = math.sqrt((size//2)**2 + (size//2)**2)
        gradient_factor = 1 - (distance / max_distance)
        
        # Blue gradient colors
        color1 = (227, 242, 253)  # Light blue
        color2 = (187, 222, 251)  # Darker blue
        
        r = int(color1[0] + (color2[0] - color1[0]) * (1 - gradient_factor))
        g = int(color1[1] + (color2[1] - color1[1]) * (1 - gradient_factor))
        b = int(color1[2] + (color2[2] - color1[2]) * (1 - gradient_factor))
        
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    
    # Define colors for blocks
    colors = [
        (255, 107, 107, 255),  # Red
        (78, 205, 196, 255),   # Teal
        (69, 183, 209, 255),   # Blue
        (150, 206, 180, 255),  # Green
        (254, 202, 87, 255),   # Yellow
        (255, 159, 243, 255),  # Pink
        (84, 160, 255, 255),   # Light Blue
        (95, 39, 205, 255)     # Purple
    ]
    
    # Block properties
    block_size = int(size * 0.12)  # 12% of image size
    center_x = size // 2
    
    # Draw main tower blocks spelling "WORD"
    letters = ['W', 'O', 'R', 'D']
    start_y = int(size * 0.2)
    
    try:
        # Try to use a system font
        font_size = int(block_size * 0.6)
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    for i, letter in enumerate(letters):
        x = center_x - block_size // 2
        y = start_y + (i * int(block_size * 1.1))
        color = colors[i % len(colors)]
        
        # Draw shadow
        shadow_offset = int(block_size * 0.06)
        shadow_rect = create_rounded_rectangle(
            draw, 
            (x + shadow_offset, y + shadow_offset, x + block_size + shadow_offset, y + block_size + shadow_offset),
            int(block_size * 0.1),
            (0, 0, 0, 50)
        )
        img.paste(shadow_rect, (x + shadow_offset, y + shadow_offset), shadow_rect)
        
        # Draw main block
        block_rect = create_rounded_rectangle(
            draw,
            (x, y, x + block_size, y + block_size),
            int(block_size * 0.1),
            color
        )
        img.paste(block_rect, (x, y), block_rect)
        
        # Draw letter
        bbox = draw.textbbox((0, 0), letter, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        text_x = x + (block_size - text_width) // 2
        text_y = y + (block_size - text_height) // 2
        
        draw.text((text_x, text_y), letter, fill=(255, 255, 255, 255), font=font)
    
    # Add floating letter blocks around the tower
    smaller_block_size = int(block_size * 0.7)
    try:
        smaller_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", int(smaller_block_size * 0.6))
    except:
        try:
            smaller_font = ImageFont.truetype("arial.ttf", int(smaller_block_size * 0.6))
        except:
            smaller_font = ImageFont.load_default()
    
    floating_letters = [
        {'letter': 'T', 'x': int(size * 0.15), 'y': int(size * 0.3), 'color': colors[4]},
        {'letter': 'A', 'x': int(size * 0.76), 'y': int(size * 0.25), 'color': colors[5]},
        {'letter': 'E', 'x': int(size * 0.2), 'y': int(size * 0.6), 'color': colors[6]},
        {'letter': 'S', 'x': int(size * 0.73), 'y': int(size * 0.55), 'color': colors[7]},
        {'letter': 'I', 'x': int(size * 0.12), 'y': int(size * 0.75), 'color': colors[0]},
        {'letter': 'N', 'x': int(size * 0.8), 'y': int(size * 0.75), 'color': colors[1]}
    ]
    
    for block in floating_letters:
        x, y = block['x'], block['y']
        color = block['color']
        letter = block['letter']
        
        # Draw shadow
        shadow_offset = int(smaller_block_size * 0.06)
        shadow_rect = create_rounded_rectangle(
            draw,
            (x + shadow_offset, y + shadow_offset, x + smaller_block_size + shadow_offset, y + smaller_block_size + shadow_offset),
            int(smaller_block_size * 0.1),
            (0, 0, 0, 40)
        )
        img.paste(shadow_rect, (x + shadow_offset, y + shadow_offset), shadow_rect)
        
        # Draw block
        block_rect = create_rounded_rectangle(
            draw,
            (x, y, x + smaller_block_size, y + smaller_block_size),
            int(smaller_block_size * 0.1),
            color
        )
        img.paste(block_rect, (x, y), block_rect)
        
        # Draw letter
        bbox = draw.textbbox((0, 0), letter, font=smaller_font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        text_x = x + (smaller_block_size - text_width) // 2
        text_y = y + (smaller_block_size - text_height) // 2
        
        draw.text((text_x, text_y), letter, fill=(255, 255, 255, 255), font=smaller_font)
    
    # Add sparkles
    sparkle_color = (255, 215, 0, 255)  # Gold
    for _ in range(20):
        x = random.randint(int(size * 0.3), int(size * 0.7))
        y = random.randint(int(size * 0.15), int(size * 0.65))
        sparkle_size = random.randint(3, 8)
        
        draw.ellipse([x, y, x + sparkle_size, y + sparkle_size], fill=sparkle_color)
    
    # Add title at bottom
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", int(size * 0.06))
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", int(size * 0.03))
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
    
    title_text = "TOWER"
    title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (size - title_width) // 2
    title_y = int(size * 0.87)
    
    draw.text((title_x, title_y), title_text, fill=(44, 62, 80, 255), font=title_font)
    
    subtitle_text = "Word Game"
    subtitle_bbox = draw.textbbox((0, 0), subtitle_text, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (size - subtitle_width) // 2
    subtitle_y = int(size * 0.93)
    
    draw.text((subtitle_x, subtitle_y), subtitle_text, fill=(127, 140, 141, 255), font=subtitle_font)
    
    return img

def main():
    print("🎨 Generating Word Tower app icons...")
    
    # Generate different sizes
    sizes = [1024, 512, 192, 180, 167, 152, 144, 128, 120, 114, 96, 76, 72, 60, 57, 48, 40, 29]
    
    for size in sizes:
        print(f"📱 Creating {size}x{size} icon...")
        icon = create_word_tower_icon(size)
        
        # Save with high quality
        filename = f"icon-{size}x{size}.png"
        icon.save(filename, "PNG", quality=100)
        print(f"✅ Saved {filename}")
    
    # Create the main app icons
    print("🎯 Creating main app icons...")
    
    # Main icon (1024x1024)
    main_icon = create_word_tower_icon(1024)
    main_icon.save("icon.png", "PNG", quality=100)
    print("✅ Saved icon.png")
    
    # Adaptive icon (1024x1024)
    main_icon.save("adaptive-icon.png", "PNG", quality=100)
    print("✅ Saved adaptive-icon.png")
    
    # Splash icon (1024x1024)
    main_icon.save("splash-icon.png", "PNG", quality=100)
    print("✅ Saved splash-icon.png")
    
    print("🎉 All icons generated successfully!")
    print("📁 Icons are ready to use in your Word Tower app!")

if __name__ == "__main__":
    main()
