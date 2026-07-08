// scripts/compress.js - Image compression script
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const inputDir = path.join(__dirname, '../public/textures');
const outputDir = inputDir; // Overwrite original files

const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
const quality = 85; // Quality percentage for JPEG/PNG

console.log('Starting image compression...');

function compressImage(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const basename = path.basename(filePath, ext);
    
    if (imageExtensions.includes(ext)) {
        // For JPEG and PNG, use sharp to compress
        if (['.jpg', '.jpeg'].includes(ext)) {
            const outputPath = path.join(outputDir, `${basename}_compressed${ext}`);
            exec(`sharp "${filePath}" -o "${outputPath}" --quality ${quality}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error compressing ${filePath}:`, error);
                } else {
                    console.log(`Compressed ${filePath} -> ${outputPath}`);
                    // Replace original file with compressed version
                    fs.unlinkSync(filePath);
                    fs.renameSync(outputPath, filePath);
                }
            });
        } 
        // For PNG and other formats, we could optimize but sharp works for most
        else {
            console.log(`Skipping ${filePath} (not JPEG/PNG)`);
        }
    }
    
    // Process all image files
    fs.readdir(inputDir, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }
        
        let processedCount = 0;
        for (const file of files) {
            if (imageExtensions.includes(path.extname(file).toLowerCase())) {
                const filePath = path.join(inputDir, file);
                compressImage(filePath);
                processedCount++;
            }
        }
        
        console.log(`Compression complete. Processed ${processedCount} images.`);
    });
}

compressImage();