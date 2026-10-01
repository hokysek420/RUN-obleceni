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

async function processAll() {
  console.log('Starting image extraction with sharp...');

  // 1. Sneaker (media_1790864468125.png) 990 x 540
  await sharp(path.join(RAW, 'media_1790864468125.png'))
    .resize(1200, null, { withoutEnlargement: false })
    .toFile(path.join(OUT, 'sneaker-cyber-white-1.jpg'));

  await sharp(path.join(RAW, 'media_1790864468125.png'))
    .extract({ left: 450, top: 180, width: 280, height: 280 })
    .toFile(path.join(DETAILS, 'sneaker-chrome-logo.jpg'));

  await sharp(path.join(RAW, 'media_1790864468125.png'))
    .extract({ left: 340, top: 220, width: 220, height: 220 })
    .toFile(path.join(DETAILS, 'sneaker-lace-tag.jpg'));

  // 2. Fur Hoodie Close-up macro (media_1790864434140.png) 955 x 960
  await sharp(path.join(RAW, 'media_1790864434140.png'))
    .toFile(path.join(DETAILS, 'teddy-fur-macro-zipper.jpg'));

  // 3. Campaign / Editorial (media_1790864464932.png) 960 x 856
  // Full campaign top hero banner (models)
  await sharp(path.join(RAW, 'media_1790864464932.png'))
    .extract({ left: 0, top: 0, width: 960, height: 560 })
    .toFile(path.join(EDITORIAL, 'campaign-hero-models.jpg'));

  // Editorial model standing front
  await sharp(path.join(RAW, 'media_1790864464932.png'))
    .extract({ left: 70, top: 20, width: 400, height: 535 })
    .toFile(path.join(EDITORIAL, 'editorial-couple-front.jpg'));

  // Editorial model back view
  await sharp(path.join(RAW, 'media_1790864464932.png'))
    .extract({ left: 590, top: 20, width: 360, height: 535 })
    .toFile(path.join(EDITORIAL, 'editorial-couple-back.jpg'));

  // Bottom 3 Fur hoodies from campaign image
  // Black fur hoodie
  await sharp(path.join(RAW, 'media_1790864464932.png'))
    .extract({ left: 20, top: 575, width: 310, height: 280 })
    .toFile(path.join(OUT, 'teddy-hoodie-black-duo.jpg'));

  // White fur hoodie
  await sharp(path.join(RAW, 'media_1790864464932.png'))
    .extract({ left: 335, top: 575, width: 315, height: 280 })
    .toFile(path.join(OUT, 'teddy-hoodie-cream-duo.jpg'));

  // Grey fur hoodie
  await sharp(path.join(RAW, 'media_1790864464932.png'))
    .extract({ left: 650, top: 575, width: 300, height: 280 })
    .toFile(path.join(OUT, 'teddy-hoodie-grey-duo.jpg'));

  // 4. Fur Hoodie Clean Shots & Details from media_1790864424119.png (947 x 960)
  // Top row: Black Hoodie
  await sharp(path.join(RAW, 'media_1790864424119.png'))
    .extract({ left: 20, top: 30, width: 300, height: 380 })
    .toFile(path.join(OUT, 'teddy-black-front.jpg'));

  await sharp(path.join(RAW, 'media_1790864424119.png'))
    .extract({ left: 325, top: 30, width: 300, height: 380 })
    .toFile(path.join(OUT, 'teddy-black-back.jpg'));

  await sharp(path.join(RAW, 'media_1790864424119.png'))
    .extract({ left: 635, top: 15, width: 305, height: 165 })
    .toFile(path.join(DETAILS, 'teddy-black-logo-embroidery.jpg'));

  await sharp(path.join(RAW, 'media_1790864424119.png'))
    .extract({ left: 635, top: 180, width: 305, height: 155 })
    .toFile(path.join(DETAILS, 'teddy-black-back-print.jpg'));

  await sharp(path.join(RAW, 'media_1790864424119.png'))
    .extract({ left: 635, top: 335, width: 305, height: 135 })
    .toFile(path.join(DETAILS, 'teddy-black-metal-strings.jpg'));

  // Bottom row: Cream/White Fur Hoodie
  await sharp(path.join(RAW, 'media_1790864424119.png'))
    .extract({ left: 20, top: 485, width: 300, height: 395 })
    .toFile(path.join(OUT, 'teddy-cream-front.jpg'));

  await sharp(path.join(RAW, 'media_1790864424119.png'))
    .extract({ left: 325, top: 485, width: 300, height: 395 })
    .toFile(path.join(OUT, 'teddy-cream-back.jpg'));

  await sharp(path.join(RAW, 'media_1790864424119.png'))
    .extract({ left: 635, top: 485, width: 305, height: 150 })
    .toFile(path.join(DETAILS, 'teddy-cream-logo-embroidery.jpg'));

  await sharp(path.join(RAW, 'media_1790864424119.png'))
    .extract({ left: 635, top: 640, width: 305, height: 155 })
    .toFile(path.join(DETAILS, 'teddy-cream-back-print.jpg'));

  await sharp(path.join(RAW, 'media_1790864424119.png'))
    .extract({ left: 635, top: 800, width: 305, height: 140 })
    .toFile(path.join(DETAILS, 'teddy-cream-metal-strings.jpg'));

  // 5. White Zip Hoodie (media_1790864419637.png) 443 x 960
  await sharp(path.join(RAW, 'media_1790864419637.png'))
    .extract({ left: 0, top: 300, width: 443, height: 420 })
    .toFile(path.join(OUT, 'white-zip-hoodie-duo.jpg'));

  await sharp(path.join(RAW, 'media_1790864419637.png'))
    .extract({ left: 0, top: 315, width: 235, height: 340 })
    .toFile(path.join(OUT, 'white-zip-hoodie-front.jpg'));

  await sharp(path.join(RAW, 'media_1790864419637.png'))
    .extract({ left: 230, top: 315, width: 213, height: 340 })
    .toFile(path.join(OUT, 'white-zip-hoodie-back.jpg'));

  // 6. Pants & Jeans from media_1790864471048.png (960 x 960)
  // Top row: Grey Heavy Cotton Sweatpants
  await sharp(path.join(RAW, 'media_1790864471048.png'))
    .extract({ left: 10, top: 0, width: 220, height: 465 })
    .toFile(path.join(EDITORIAL, 'model-grey-sweatpants.jpg'));

  await sharp(path.join(RAW, 'media_1790864471048.png'))
    .extract({ left: 240, top: 40, width: 245, height: 415 })
    .toFile(path.join(OUT, 'sweatpants-grey-front.jpg'));

  await sharp(path.join(RAW, 'media_1790864471048.png'))
    .extract({ left: 485, top: 40, width: 240, height: 415 })
    .toFile(path.join(OUT, 'sweatpants-grey-back.jpg'));

  await sharp(path.join(RAW, 'media_1790864471048.png'))
    .extract({ left: 725, top: 0, width: 230, height: 155 })
    .toFile(path.join(DETAILS, 'sweatpants-logo-embroidery.jpg'));

  await sharp(path.join(RAW, 'media_1790864471048.png'))
    .extract({ left: 725, top: 155, width: 230, height: 160 })
    .toFile(path.join(DETAILS, 'sweatpants-waistband-drawstrings.jpg'));

  await sharp(path.join(RAW, 'media_1790864471048.png'))
    .extract({ left: 725, top: 315, width: 230, height: 155 })
    .toFile(path.join(DETAILS, 'sweatpants-heavy-cotton-texture.jpg'));

  // Bottom row: Washed Black Denim Jeans
  await sharp(path.join(RAW, 'media_1790864471048.png'))
    .extract({ left: 10, top: 470, width: 220, height: 450 })
    .toFile(path.join(EDITORIAL, 'model-black-denim.jpg'));

  await sharp(path.join(RAW, 'media_1790864471048.png'))
    .extract({ left: 245, top: 490, width: 245, height: 420 })
    .toFile(path.join(OUT, 'denim-black-front.jpg'));

  await sharp(path.join(RAW, 'media_1790864471048.png'))
    .extract({ left: 490, top: 490, width: 240, height: 420 })
    .toFile(path.join(OUT, 'denim-black-back.jpg'));

  await sharp(path.join(RAW, 'media_1790864471048.png'))
    .extract({ left: 725, top: 475, width: 230, height: 160 })
    .toFile(path.join(DETAILS, 'denim-pocket-logo.jpg'));

  await sharp(path.join(RAW, 'media_1790864471048.png'))
    .extract({ left: 725, top: 635, width: 230, height: 155 })
    .toFile(path.join(DETAILS, 'denim-branded-metal-button.jpg'));

  await sharp(path.join(RAW, 'media_1790864471048.png'))
    .extract({ left: 725, top: 790, width: 230, height: 135 })
    .toFile(path.join(DETAILS, 'denim-wash-texture.jpg'));

  // 7. White T-Shirt from media_1790864474071.png (960 x 960)
  await sharp(path.join(RAW, 'media_1790864474071.png'))
    .extract({ left: 15, top: 60, width: 475, height: 500 })
    .toFile(path.join(OUT, 'tshirt-white-front.jpg'));

  await sharp(path.join(RAW, 'media_1790864474071.png'))
    .extract({ left: 495, top: 60, width: 455, height: 500 })
    .toFile(path.join(OUT, 'tshirt-white-back.jpg'));

  await sharp(path.join(RAW, 'media_1790864474071.png'))
    .extract({ left: 10, top: 605, width: 315, height: 340 })
    .toFile(path.join(DETAILS, 'tshirt-chest-logo.jpg'));

  await sharp(path.join(RAW, 'media_1790864474071.png'))
    .extract({ left: 335, top: 605, width: 315, height: 340 })
    .toFile(path.join(DETAILS, 'tshirt-back-statement-print.jpg'));

  await sharp(path.join(RAW, 'media_1790864474071.png'))
    .extract({ left: 660, top: 605, width: 295, height: 340 })
    .toFile(path.join(DETAILS, 'tshirt-neck-label.jpg'));

  // 8. Extract RUN vector logo or branding
  // From media_1790864464932.png top center
  await sharp(path.join(RAW, 'media_1790864464932.png'))
    .extract({ left: 285, top: 0, width: 440, height: 160 })
    .toFile(path.join(BRANDING, 'run-logo-editorial.png'));

  console.log('Successfully generated all brand and product assets!');
}

processAll().catch(err => {
  console.error('Extraction failed:', err);
  process.exit(1);
});
