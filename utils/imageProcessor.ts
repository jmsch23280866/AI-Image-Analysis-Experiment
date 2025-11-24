export interface ProcessResult {
  gradientImageData: ImageData;
  covariance: {
    xx: number;
    xy: number;
    yx: number;
    yy: number;
  };
}

/**
 * Converts RGB to Grayscale Luminance
 * Formula: L = 0.2126*R + 0.7152*G + 0.0722*B
 */
const getLuminance = (r: number, g: number, b: number): number => {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * Computes the Gradient Field using Sobel Operators
 * Visualization: Relief / Emboss style (Offset 128)
 */
export const computeGradientField = (
  originalImageData: ImageData,
  intensity: number
): ProcessResult => {
  const width = originalImageData.width;
  const height = originalImageData.height;
  const inputData = originalImageData.data;

  // Create buffer for output visualization
  const outputImageData = new ImageData(width, height);
  const outputData = outputImageData.data;

  // 1. Convert to Grayscale Matrix (Float32 for precision)
  const grayMatrix = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    grayMatrix[i] = getLuminance(inputData[idx], inputData[idx + 1], inputData[idx + 2]);
  }

  // Buffers for Gradients
  const gx = new Float32Array(width * height);
  const gy = new Float32Array(width * height);

  // Sobel Kernels
  // Gx: [-1, 0, 1]
  //     [-2, 0, 2]
  //     [-1, 0, 1]
  
  // Gy: [-1, -2, -1]
  //     [ 0,  0,  0]
  //     [ 1,  2,  1]

  let meanGx = 0;
  let meanGy = 0;
  let count = 0;

  // 2. Compute Gradients (Convolution)
  // We skip the 1px border to avoid boundary checks for performance
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;

      // Neighbor indices
      const i_tl = (y - 1) * width + (x - 1); // Top Left
      const i_t  = (y - 1) * width + x;       // Top
      const i_tr = (y - 1) * width + (x + 1); // Top Right
      const i_l  = y * width + (x - 1);       // Left
      const i_r  = y * width + (x + 1);       // Right
      const i_bl = (y + 1) * width + (x - 1); // Bottom Left
      const i_b  = (y + 1) * width + x;       // Bottom
      const i_br = (y + 1) * width + (x + 1); // Bottom Right

      // Apply Sobel X
      const valGx = 
        (-1 * grayMatrix[i_tl]) + (1 * grayMatrix[i_tr]) +
        (-2 * grayMatrix[i_l])  + (2 * grayMatrix[i_r]) +
        (-1 * grayMatrix[i_bl]) + (1 * grayMatrix[i_br]);

      // Apply Sobel Y
      const valGy = 
        (-1 * grayMatrix[i_tl]) + (-2 * grayMatrix[i_t]) + (-1 * grayMatrix[i_tr]) +
        (1 * grayMatrix[i_bl])  + (2 * grayMatrix[i_b])  + (1 * grayMatrix[i_br]);

      gx[i] = valGx;
      gy[i] = valGy;

      // Accumulate for Mean (for Covariance calculation)
      meanGx += valGx;
      meanGy += valGy;
      count++;

      // 3. Visualization: Gradient Relief (Emboss)
      // Instead of Magnitude (which hides noise in black), we use an offset Grey.
      // Raw Gradient Sum projects the derivative onto a diagonal.
      const raw = valGx + valGy;
      
      // Shift 0 gradient to 128 (Mid-Grey)
      // Positive gradients become lighter, Negative become darker.
      let pixelVal = (raw * intensity) + 128;
      
      // Clamp to 0-255
      pixelVal = Math.min(255, Math.max(0, pixelVal));

      // Write to Output (Grayscale)
      const outIdx = i * 4;
      outputData[outIdx] = pixelVal;     // R
      outputData[outIdx + 1] = pixelVal; // G
      outputData[outIdx + 2] = pixelVal; // B
      outputData[outIdx + 3] = 255;      // Alpha
    }
  }

  // 4. Compute Covariance Matrix
  // C = 1/N * M^T * M
  // For proper statistical covariance, we center the data: E[(X - E[X])(Y - E[Y])]
  
  meanGx /= count;
  meanGy /= count;

  let covXX = 0;
  let covXY = 0;
  let covYY = 0;

  // We re-loop for the inner region to calculate covariance
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

  // Normalize by N-1 (unbiased estimator) or N
  const N = count;
  return {
    gradientImageData: outputImageData,
    covariance: {
      xx: covXX / N,
      xy: covXY / N,
      yx: covXY / N, // Symmetric
      yy: covYY / N
    }
  };
};

/**
 * Helper to get ImageData from an Image object
 * Uses natural dimensions to ensure full resolution processing
 */
export const getImageData = (img: HTMLImageElement): ImageData => {
  const canvas = document.createElement('canvas');
  // Critical Fix: Use naturalWidth/Height. 'img.width' gives the rendered CSS width which causes cropping.
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  
  canvas.width = w;
  canvas.height = h;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error("Canvas context unavailable");
  
  // Explicitly draw at the natural size
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
};