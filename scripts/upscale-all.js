const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const RAW = path.join(__dirname, '../public/images/raw');
const OUT = path.join(__dirname, '../public/images/products');
const EDITORIAL = path.join(__dirname, '../public/images/editorial');
const DETAILS = path.join(__dirname, '../public/images/details');
const BRANDING = path.join(__dirname, '../public/images/branding');

[OUT, EDITORIAL, DETAILS, BRANDING].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// High-fidelity image processor
async function saveHighDef(imagePipeline, destJpgPath, isAlpha = false) {
  const destWebpPath = destJpgPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  if (isAlpha) {
    // PNG with transparency
    await imagePipeline
      .clone()
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(destJpgPath);
      
    await imagePipeline
      .clone()
      .webp({ quality: 98, effort: 6, lossless: true })
      .toFile(destWebpPath);
  } else {
    // JPEG 96% with MozJPEG and 4:4:4 chroma subsampling for pristine color fidelity
    await imagePipeline
      .clone()
      .jpeg({
        quality: 96,
        mozjpeg: true,
        chromaSubsampling: '4:4:4',
        progressive: true
      })
      .toFile(destJpgPath);

    // WebP 96% with maximum compression effort for ultra-fast load
    await imagePipeline
      .clone()
      .webp({
        quality: 96,
        effort: 6
      })
      .toFile(destWebpPath);
  }
}

// 4x Sheet Upscaler with Lanczos3 + edge-preserving unsharp mask
async function getUpscaledSheet(filename, scaleFactor = 4) {
  const filePath = path.join(RAW, filename);
  const meta = await sharp(filePath).metadata();
  
  const targetWidth = Math.round(meta.width * scaleFactor);
  const targetHeight = Math.round(meta.height * scaleFactor);

  return sharp(filePath)
    .resize({
      width: targetWidth,
      height: targetHeight,
      kernel: sharp.kernel.lanczos3
    })
    // Gentle de-noise and unsharp mask at the sheet level
    .sharpen({ sigma: 1.1, m1: 1.2, m2: 2.0 })
    .toBuffer();
}

async function upscaleAll() {
  console.log('⚡ Starting Ultra-HD 4K/Super-Resolution Upscaling of All Assets...');
  const SCALE = 4;

  // 1. Sneaker (media_1790864468125.png) 990 x 540 -> 3960 x 2160
  console.log('→ Upscaling Sneakers & Chrome Hardware...');
  {
    const sneakerBuffer = await getUpscaledSheet('media_1790864468125.png', SCALE);
    
    // Main full sneaker shot (wide 4K format)
    const sneakerMain = sharp(sneakerBuffer)
      .sharpen({ sigma: 0.8, m1: 1.2, m2: 2.2 })
      .modulate({ brightness: 1.02, saturation: 1.04 });
    await saveHighDef(sneakerMain, path.join(OUT, 'sneaker-cyber-white-1.jpg'));

    // Chrome logo detail (1120 x 1120)
    const chromeLogo = sharp(sneakerBuffer)
      .extract({ left: 450 * SCALE, top: 180 * SCALE, width: 280 * SCALE, height: 280 * SCALE })
      .sharpen({ sigma: 1.0, m1: 1.4, m2: 2.5 })
      .modulate({ brightness: 1.04 });
    await saveHighDef(chromeLogo, path.join(DETAILS, 'sneaker-chrome-logo.jpg'));

    // Lace tag detail (880 x 880)
    const laceTag = sharp(sneakerBuffer)
      .extract({ left: 340 * SCALE, top: 220 * SCALE, width: 220 * SCALE, height: 220 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.3, m2: 2.2 });
    await saveHighDef(laceTag, path.join(DETAILS, 'sneaker-lace-tag.jpg'));
  }

  // 2. Fur Hoodie Close-up macro (media_1790864434140.png) 955 x 960 -> 3820 x 3840
  console.log('→ Upscaling 550 GSM Fur Macro Texture & Zipper to Ultra-HD...');
  {
    const macroBuffer = await getUpscaledSheet('media_1790864434140.png', SCALE);
    const macroImg = sharp(macroBuffer)
      .sharpen({ sigma: 1.0, m1: 1.4, m2: 2.4 })
      .modulate({ brightness: 1.02, saturation: 1.05 });
    await saveHighDef(macroImg, path.join(DETAILS, 'teddy-fur-macro-zipper.jpg'));
  }

  // 3. Campaign & Editorial (media_1790864464932.png) 960 x 856 -> 3840 x 3424
  console.log('→ Upscaling Editorial Couple & Hoodie Trio...');
  {
    const campaignBuffer = await getUpscaledSheet('media_1790864464932.png', SCALE);

    // Editorial model standing front (1600 x 2140)
    const coupleFront = sharp(campaignBuffer)
      .extract({ left: 70 * SCALE, top: 20 * SCALE, width: 400 * SCALE, height: 535 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 });
    await saveHighDef(coupleFront, path.join(EDITORIAL, 'editorial-couple-front.jpg'));

    // Editorial model back view (1440 x 2140)
    const coupleBack = sharp(campaignBuffer)
      .extract({ left: 590 * SCALE, top: 20 * SCALE, width: 360 * SCALE, height: 535 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 });
    await saveHighDef(coupleBack, path.join(EDITORIAL, 'editorial-couple-back.jpg'));

    // Hoodie Trios (1240 x 1120 each)
    const blackDuo = sharp(campaignBuffer)
      .extract({ left: 20 * SCALE, top: 575 * SCALE, width: 310 * SCALE, height: 280 * SCALE })
      .sharpen({ sigma: 0.8, m1: 1.2, m2: 1.8 });
    await saveHighDef(blackDuo, path.join(OUT, 'teddy-hoodie-black-duo.jpg'));

    const creamDuo = sharp(campaignBuffer)
      .extract({ left: 335 * SCALE, top: 575 * SCALE, width: 315 * SCALE, height: 280 * SCALE })
      .sharpen({ sigma: 0.8, m1: 1.2, m2: 1.8 });
    await saveHighDef(creamDuo, path.join(OUT, 'teddy-hoodie-cream-duo.jpg'));

    const greyDuo = sharp(campaignBuffer)
      .extract({ left: 650 * SCALE, top: 575 * SCALE, width: 300 * SCALE, height: 280 * SCALE })
      .sharpen({ sigma: 0.8, m1: 1.2, m2: 1.8 });
    await saveHighDef(greyDuo, path.join(OUT, 'teddy-hoodie-grey-duo.jpg'));

    // RUN Branding Editorial Logo (1760 x 640)
    const logoEditorial = sharp(campaignBuffer)
      .extract({ left: 285 * SCALE, top: 0, width: 440 * SCALE, height: 160 * SCALE })
      .sharpen({ sigma: 1.2, m1: 2.0, m2: 3.0 });
    await saveHighDef(logoEditorial, path.join(BRANDING, 'run-logo-editorial.png'), true);
  }

  // 4. Fur Hoodies (media_1790864424119.png) 947 x 960 -> 3788 x 3840
  console.log('→ Upscaling Black & Cream Teddy Hoodies (Front, Back & Details)...');
  {
    const hoodieBuffer = await getUpscaledSheet('media_1790864424119.png', SCALE);

    // Black Hoodie Front (1200 x 1520)
    const blackFront = sharp(hoodieBuffer)
      .extract({ left: 20 * SCALE, top: 30 * SCALE, width: 300 * SCALE, height: 380 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 })
      .modulate({ brightness: 1.02 });
    await saveHighDef(blackFront, path.join(OUT, 'teddy-black-front.jpg'));

    // Also save fallback / alternate name
    await saveHighDef(blackFront, path.join(OUT, 'run-teddy-black-1.jpg'));

    // Black Hoodie Back (1200 x 1520)
    const blackBack = sharp(hoodieBuffer)
      .extract({ left: 325 * SCALE, top: 30 * SCALE, width: 300 * SCALE, height: 380 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 })
      .modulate({ brightness: 1.02 });
    await saveHighDef(blackBack, path.join(OUT, 'teddy-black-back.jpg'));

    // Black Hoodie Details
    const blackEmbro = sharp(hoodieBuffer)
      .extract({ left: 635 * SCALE, top: 15 * SCALE, width: 305 * SCALE, height: 165 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(blackEmbro, path.join(DETAILS, 'teddy-black-logo-embroidery.jpg'));

    const blackBackPrint = sharp(hoodieBuffer)
      .extract({ left: 635 * SCALE, top: 180 * SCALE, width: 305 * SCALE, height: 155 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(blackBackPrint, path.join(DETAILS, 'teddy-black-back-print.jpg'));

    const blackStrings = sharp(hoodieBuffer)
      .extract({ left: 635 * SCALE, top: 335 * SCALE, width: 305 * SCALE, height: 135 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(blackStrings, path.join(DETAILS, 'teddy-black-metal-strings.jpg'));

    // Cream Hoodie Front (1200 x 1580)
    const creamFront = sharp(hoodieBuffer)
      .extract({ left: 20 * SCALE, top: 485 * SCALE, width: 300 * SCALE, height: 395 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 })
      .modulate({ brightness: 1.01 });
    await saveHighDef(creamFront, path.join(OUT, 'teddy-cream-front.jpg'));

    // Cream Hoodie Back (1200 x 1580)
    const creamBack = sharp(hoodieBuffer)
      .extract({ left: 325 * SCALE, top: 485 * SCALE, width: 300 * SCALE, height: 395 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 })
      .modulate({ brightness: 1.01 });
    await saveHighDef(creamBack, path.join(OUT, 'teddy-cream-back.jpg'));

    // Cream Hoodie Details
    const creamEmbro = sharp(hoodieBuffer)
      .extract({ left: 635 * SCALE, top: 485 * SCALE, width: 305 * SCALE, height: 150 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(creamEmbro, path.join(DETAILS, 'teddy-cream-logo-embroidery.jpg'));

    const creamBackPrint = sharp(hoodieBuffer)
      .extract({ left: 635 * SCALE, top: 640 * SCALE, width: 305 * SCALE, height: 155 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(creamBackPrint, path.join(DETAILS, 'teddy-cream-back-print.jpg'));

    const creamStrings = sharp(hoodieBuffer)
      .extract({ left: 635 * SCALE, top: 800 * SCALE, width: 305 * SCALE, height: 140 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(creamStrings, path.join(DETAILS, 'teddy-cream-metal-strings.jpg'));
  }

  // 5. White Zip Hoodie (media_1790864419637.png) 443 x 960 -> 1772 x 3840
  console.log('→ Upscaling White Zip Hoodie...');
  {
    const zipBuffer = await getUpscaledSheet('media_1790864419637.png', SCALE);

    const zipDuo = sharp(zipBuffer)
      .extract({ left: 0, top: 300 * SCALE, width: 443 * SCALE, height: 420 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 });
    await saveHighDef(zipDuo, path.join(OUT, 'white-zip-hoodie-duo.jpg'));

    const zipFront = sharp(zipBuffer)
      .extract({ left: 0, top: 315 * SCALE, width: 235 * SCALE, height: 340 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 });
    await saveHighDef(zipFront, path.join(OUT, 'white-zip-hoodie-front.jpg'));

    const zipBack = sharp(zipBuffer)
      .extract({ left: 230 * SCALE, top: 315 * SCALE, width: 213 * SCALE, height: 340 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 });
    await saveHighDef(zipBack, path.join(OUT, 'white-zip-hoodie-back.jpg'));
  }

  // 6. Pants & Jeans (media_1790864471048.png) 960 x 960 -> 3840 x 3840
  console.log('→ Upscaling Sweatpants & Washed Denim Jeans...');
  {
    const pantsBuffer = await getUpscaledSheet('media_1790864471048.png', SCALE);

    // Grey Sweatpants Model
    const modelPants = sharp(pantsBuffer)
      .extract({ left: 10 * SCALE, top: 0, width: 220 * SCALE, height: 465 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 });
    await saveHighDef(modelPants, path.join(EDITORIAL, 'model-grey-sweatpants.jpg'));

    // Grey Sweatpants Front
    const pantsFront = sharp(pantsBuffer)
      .extract({ left: 240 * SCALE, top: 40 * SCALE, width: 245 * SCALE, height: 415 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 });
    await saveHighDef(pantsFront, path.join(OUT, 'sweatpants-grey-front.jpg'));

    // Grey Sweatpants Back
    const pantsBack = sharp(pantsBuffer)
      .extract({ left: 485 * SCALE, top: 40 * SCALE, width: 240 * SCALE, height: 415 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 });
    await saveHighDef(pantsBack, path.join(OUT, 'sweatpants-grey-back.jpg'));

    // Sweatpants Details
    const pantsEmbro = sharp(pantsBuffer)
      .extract({ left: 725 * SCALE, top: 0, width: 230 * SCALE, height: 155 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(pantsEmbro, path.join(DETAILS, 'sweatpants-logo-embroidery.jpg'));

    const pantsDraw = sharp(pantsBuffer)
      .extract({ left: 725 * SCALE, top: 155 * SCALE, width: 230 * SCALE, height: 160 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(pantsDraw, path.join(DETAILS, 'sweatpants-waistband-drawstrings.jpg'));

    const pantsTexture = sharp(pantsBuffer)
      .extract({ left: 725 * SCALE, top: 315 * SCALE, width: 230 * SCALE, height: 155 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(pantsTexture, path.join(DETAILS, 'sweatpants-heavy-cotton-texture.jpg'));

    // Black Denim Model
    const modelDenim = sharp(pantsBuffer)
      .extract({ left: 10 * SCALE, top: 470 * SCALE, width: 220 * SCALE, height: 450 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 });
    await saveHighDef(modelDenim, path.join(EDITORIAL, 'model-black-denim.jpg'));

    // Black Denim Front
    const denimFront = sharp(pantsBuffer)
      .extract({ left: 245 * SCALE, top: 490 * SCALE, width: 245 * SCALE, height: 420 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 });
    await saveHighDef(denimFront, path.join(OUT, 'denim-black-front.jpg'));

    // Black Denim Back
    const denimBack = sharp(pantsBuffer)
      .extract({ left: 490 * SCALE, top: 490 * SCALE, width: 240 * SCALE, height: 420 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 });
    await saveHighDef(denimBack, path.join(OUT, 'denim-black-back.jpg'));

    // Denim Details
    const denimPocket = sharp(pantsBuffer)
      .extract({ left: 725 * SCALE, top: 475 * SCALE, width: 230 * SCALE, height: 160 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(denimPocket, path.join(DETAILS, 'denim-pocket-logo.jpg'));

    const denimButton = sharp(pantsBuffer)
      .extract({ left: 725 * SCALE, top: 635 * SCALE, width: 230 * SCALE, height: 155 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(denimButton, path.join(DETAILS, 'denim-branded-metal-button.jpg'));

    const denimWash = sharp(pantsBuffer)
      .extract({ left: 725 * SCALE, top: 790 * SCALE, width: 230 * SCALE, height: 135 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(denimWash, path.join(DETAILS, 'denim-wash-texture.jpg'));
  }

  // 7. White T-Shirt (media_1790864474071.png) 960 x 960 -> 3840 x 3840
  console.log('→ Upscaling White Heavyweight T-Shirt...');
  {
    const tshirtBuffer = await getUpscaledSheet('media_1790864474071.png', SCALE);

    // Front (1900 x 2000)
    const tshirtFront = sharp(tshirtBuffer)
      .extract({ left: 15 * SCALE, top: 60 * SCALE, width: 475 * SCALE, height: 500 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 });
    await saveHighDef(tshirtFront, path.join(OUT, 'tshirt-white-front.jpg'));

    // Back (1820 x 2000)
    const tshirtBack = sharp(tshirtBuffer)
      .extract({ left: 495 * SCALE, top: 60 * SCALE, width: 455 * SCALE, height: 500 * SCALE })
      .sharpen({ sigma: 0.9, m1: 1.2, m2: 2.0 });
    await saveHighDef(tshirtBack, path.join(OUT, 'tshirt-white-back.jpg'));

    // Details
    const tshirtChest = sharp(tshirtBuffer)
      .extract({ left: 10 * SCALE, top: 605 * SCALE, width: 315 * SCALE, height: 340 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(tshirtChest, path.join(DETAILS, 'tshirt-chest-logo.jpg'));

    const tshirtBackPrint = sharp(tshirtBuffer)
      .extract({ left: 335 * SCALE, top: 605 * SCALE, width: 315 * SCALE, height: 340 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(tshirtBackPrint, path.join(DETAILS, 'tshirt-back-statement-print.jpg'));

    const tshirtNeck = sharp(tshirtBuffer)
      .extract({ left: 660 * SCALE, top: 605 * SCALE, width: 295 * SCALE, height: 340 * SCALE })
      .sharpen({ sigma: 1.1, m1: 1.4, m2: 2.4 });
    await saveHighDef(tshirtNeck, path.join(DETAILS, 'tshirt-neck-label.jpg'));
  }

  console.log('✅ ALL images on website successfully upscaled to 4K Ultra-HD with razor-sharp detail!');
}

upscaleAll().catch(err => {
  console.error('Upscaling failed:', err);
  process.exit(1);
});
