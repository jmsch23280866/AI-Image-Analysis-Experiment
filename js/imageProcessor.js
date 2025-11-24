
// ==========================================
// UTILS: Image Processor
// ==========================================

const getLuminance = (r, g, b) => {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const computeGradientField = (originalImageData, intensity) => {
  const width = originalImageData.width;
  const height = originalImageData.height;
  const inputData = originalImageData.data;

  const outputImageData = new ImageData(width, height);
  const outputData = outputImageData.data;

  const grayMatrix = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    grayMatrix[i] = getLuminance(inputData[idx], inputData[idx + 1], inputData[idx + 2]);
  }

  const gx = new Float32Array(width * height);
  const gy = new Float32Array(width * height);

  let meanGx = 0;
  let meanGy = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;

      const i_tl = (y - 1) * width + (x - 1);
      const i_t  = (y - 1) * width + x;
      const i_tr = (y - 1) * width + (x + 1);
      const i_l  = y * width + (x - 1);
      const i_r  = y * width + (x + 1);
      const i_bl = (y + 1) * width + (x - 1);
      const i_b  = (y + 1) * width + x;
      const i_br = (y + 1) * width + (x + 1);

      const valGx = 
        (-1 * grayMatrix[i_tl]) + (1 * grayMatrix[i_tr]) +
        (-2 * grayMatrix[i_l])  + (2 * grayMatrix[i_r]) +
        (-1 * grayMatrix[i_bl]) + (1 * grayMatrix[i_br]);

      const valGy = 
        (-1 * grayMatrix[i_tl]) + (-2 * grayMatrix[i_t]) + (-1 * grayMatrix[i_tr]) +
        (1 * grayMatrix[i_bl])  + (2 * grayMatrix[i_b])  + (1 * grayMatrix[i_br]);

      gx[i] = valGx;
      gy[i] = valGy;

      meanGx += valGx;
      meanGy += valGy;
      count++;

      const raw = valGx + valGy;
      let pixelVal = (raw * intensity) + 128;
      pixelVal = Math.min(255, Math.max(0, pixelVal));

      const outIdx = i * 4;
      outputData[outIdx] = pixelVal;
      outputData[outIdx + 1] = pixelVal;
      outputData[outIdx + 2] = pixelVal;
      outputData[outIdx + 3] = 255;
    }
  }

  meanGx /= count;
  meanGy /= count;

  let covXX = 0;
  let covXY = 0;
  let covYY = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      const centeredX = gx[i] - meanGx;
      const centeredY = gy[i] - meanGy;

      covXX += centeredX * centeredX;
      covXY += centeredX * centeredY;
      covYY += centeredY * centeredY;
    }
  }

  const N = count;
  return {
    gradientImageData: outputImageData,
    covariance: {
      xx: covXX / N,
      xy: covXY / N,
      yx: covXY / N,
      yy: covYY / N
    }
  };
};

export const getImageData = (img) => {
  const canvas = document.createElement('canvas');
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  
  canvas.width = w;
  canvas.height = h;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Canvas context unavailable");
  
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
};
