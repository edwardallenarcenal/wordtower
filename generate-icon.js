const { createCanvas } = require('canvas');
const fs = require('fs');

function createWordTowerIcon(size = 1024) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background gradient
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size*0.6);
    gradient.addColorStop(0, '#E3F2FD');
    gradient.addColorStop(1, '#BBDEFB');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    // Helper function to draw rounded rectangle
    function drawRoundedRect(x, y, width, height, radius, fillColor, strokeColor = null) {
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.fillStyle = fillColor;
        ctx.fill();
        
        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }
    
    // Helper function to draw letter block
    function drawLetterBlock(x, y, blockSize, letter, bgColor, textColor = '#FFFFFF') {
        // Draw block shadow
        drawRoundedRect(x + 8, y + 8, blockSize, blockSize, 12, 'rgba(0,0,0,0.2)');
        
        // Draw block background
        drawRoundedRect(x, y, blockSize, blockSize, 12, bgColor, '#FFFFFF');
        
        // Draw letter
        ctx.fillStyle = textColor;
        ctx.font = `bold ${blockSize * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, x + blockSize/2, y + blockSize/2);
    }
    
    // Define colors for blocks
    const colors = [
        '#FF6B6B', // Red
        '#4ECDC4', // Teal
        '#45B7D1', // Blue
        '#96CEB4', // Green
        '#FECA57', // Yellow
        '#FF9FF3', // Pink
        '#54A0FF', // Light Blue
        '#5F27CD'  // Purple
    ];
    
    // Block size and positions for tower
    const blockSize = size * 0.12;
    const centerX = size / 2;
    
    // Draw tower of blocks spelling "WORD"
    const letters = ['W', 'O', 'R', 'D'];
    const startY = size * 0.2;
    
    for (let i = 0; i < letters.length; i++) {
        const x = centerX - blockSize/2;
        const y = startY + (i * (blockSize + 10));
        const color = colors[i % colors.length];
        
        drawLetterBlock(x, y, blockSize, letters[i], color);
    }
    
    // Add some floating letter blocks around the tower
    const floatingLetters = [
        {letter: 'T', x: size * 0.15, y: size * 0.3, color: colors[4]},
        {letter: 'A', x: size * 0.76, y: size * 0.25, color: colors[5]},
        {letter: 'E', x: size * 0.2, y: size * 0.6, color: colors[6]},
        {letter: 'S', x: size * 0.73, y: size * 0.55, color: colors[7]},
        {letter: 'I', x: size * 0.12, y: size * 0.75, color: colors[0]},
        {letter: 'N', x: size * 0.8, y: size * 0.75, color: colors[1]}
    ];
    
    const smallBlockSize = blockSize * 0.7;
    floatingLetters.forEach(block => {
        drawLetterBlock(block.x, block.y, smallBlockSize, block.letter, block.color);
    });
    
    // Add sparkles around the tower
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 15; i++) {
        const x = size * 0.3 + Math.random() * size * 0.4;
        const y = size * 0.15 + Math.random() * size * 0.5;
        const sparkleSize = 4 + Math.random() * 8;
        
        ctx.beginPath();
        ctx.arc(x, y, sparkleSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add title at bottom
    ctx.fillStyle = '#2C3E50';
    ctx.font = `bold ${size * 0.06}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TOWER', size/2, size * 0.9);
    
    // Add smaller text
    ctx.font = `bold ${size * 0.03}px Arial`;
    ctx.fillStyle = '#7F8C8D';
    ctx.fillText('Word Game', size/2, size * 0.95);
    
    return canvas;
}

// Generate different sizes
console.log('🎨 Generating Word Tower app icons...');

// Main icon sizes
const sizes = [1024, 512, 256, 192, 180, 167, 152, 144, 128, 120, 114, 96, 76, 72, 60, 57, 48, 40, 29];

sizes.forEach(size => {
    console.log(`📱 Creating ${size}x${size} icon...`);
    const canvas = createWordTowerIcon(size);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icon-${size}x${size}.png`, buffer);
    console.log(`✅ Saved icon-${size}x${size}.png`);
});

// Create the main app icons
console.log('🎯 Creating main app icons...');

// Replace existing icons
const mainCanvas = createWordTowerIcon(1024);
const mainBuffer = mainCanvas.toBuffer('image/png');

// Save to assets folder
fs.writeFileSync('assets/icon.png', mainBuffer);
console.log('✅ Saved assets/icon.png');

fs.writeFileSync('assets/adaptive-icon.png', mainBuffer);
console.log('✅ Saved assets/adaptive-icon.png');

fs.writeFileSync('assets/splash-icon.png', mainBuffer);
console.log('✅ Saved assets/splash-icon.png');

console.log('🎉 All icons generated successfully!');
console.log('📁 Your cute Word Tower icons are ready to use!');
console.log('');
console.log('Icon features:');
console.log('🏗️  Tower of letter blocks spelling "WORD"');
console.log('🌈 Colorful gradient background');
console.log('✨ Floating letter blocks around the tower');
console.log('💫 Golden sparkles for magic effect');
console.log('🎮 "TOWER - Word Game" title at bottom');
