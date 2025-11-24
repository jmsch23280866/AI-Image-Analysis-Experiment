// Destructure React globals from the UMD build
const { useState, useRef, useEffect, useCallback, createElement: h } = React;
const { createRoot } = ReactDOM;

// ==========================================
// UTILS: Translations
// ==========================================
const translations = {
  'zh-TW': {
    title: "AI 圖像分析實驗",
    uploadBtn: "上傳圖片",
    demoRealBtn: "示範 (真實)",
    demoAIBtn: "示範 (AI)",
    urlPlaceholder: "輸入圖片網址...",
    loadUrlBtn: "載入",
    orLabel: "或",
    dragDropHint: "拖曳圖片至此",
    pasteHint: "支援剪貼簿貼上 (Ctrl+V)",
    gainLabel: "噪聲放大 (增益)",
    originalTitle: "原始輸入",
    originalSub: "RGB 模式",
    gradientTitle: "梯度浮雕圖",
    gradientSub: "高通濾波 (灰色偏移)",
    calculating: "計算中...",
    waiting: "等待輸入...",
    emptyState: "上傳、貼上或拖曳圖片以可視化其潛在的梯度噪聲模式。",
    statsTitle: "統計分析",
    statsSub: "協方差矩陣 (C = 1/N MᵀM)",
    statsNote: "* 高方差可能表示高頻細節或噪聲。AI 生成圖片有時會在協方差特徵上展現出與自然圖像不同的統計分佈。",
    infoTitle: "分析原理",
    infoDesc: "本工具使用 <strong>Gradient Relief (梯度浮雕)</strong> 可視化技術。在平坦區域（如天空），真實照片通常呈現平滑的灰色，而 AI 生成圖像（尤其是 Diffusion Model）往往會在灰色背景中殘留異常的「靜電狀」高頻噪聲或不自然的紋理。",
    methodLabel: "方法:",
    visualGuideLabel: "視覺指南:",
    visualGuideValue: "灰色=平坦, 亮/暗=邊緣/噪點",
    footerInspiration: "靈感來源：",
    footerLinkText: "RogerBit arduino pic y más 的文章",
    errorImageLoad: "無法載入圖片 (可能是跨域 CORS 限制或無效的 URL)"
  },
  'en': {
    title: "AI Image Analysis Experiment",
    uploadBtn: "Upload Image",
    demoRealBtn: "Demo (Real)",
    demoAIBtn: "Demo (AI)",
    urlPlaceholder: "Enter image URL...",
    loadUrlBtn: "Load",
    orLabel: "or",
    dragDropHint: "Drag & Drop image here",
    pasteHint: "Paste from clipboard supported",
    gainLabel: "Noise Amplification (Gain)",
    originalTitle: "Original Input",
    originalSub: "RGB Mode",
    gradientTitle: "Gradient Relief Map",
    gradientSub: "High-Pass Filter (Grey Offset)",
    calculating: "Calculating...",
    waiting: "Waiting for input...",
    emptyState: "Upload, paste, or drag an image to visualize its underlying gradient noise patterns.",
    statsTitle: "Statistical Analysis",
    statsSub: "Covariance Matrix (C = 1/N MᵀM)",
    statsNote: "* High variance may indicate high-frequency details or noise. AI-generated images sometimes exhibit different statistical distributions in covariance features compared to natural images.",
    infoTitle: "Analysis Logic",
    infoDesc: "This tool uses <strong>Gradient Relief</strong> visualization. Real photos usually appear smooth grey in flat areas (like the sky), while AI-generated images (especially Diffusion Models) often leave abnormal 'static-like' high-frequency noise or unnatural textures on the grey background.",
    methodLabel: "Method:",
    visualGuideLabel: "Visual Guide:",
    visualGuideValue: "Grey=Flat, Light/Dark=Edges/Noise",
    footerInspiration: "Inspiration:",
    footerLinkText: "Article by RogerBit arduino pic y más",
    errorImageLoad: "Failed to load image (Possible CORS restriction or invalid URL)"
  },
  'fr': {
    title: "Expérience d'Analyse d'Image IA",
    uploadBtn: "Télécharger une image",
    demoRealBtn: "Démo (Réelle)",
    demoAIBtn: "Démo (IA)",
    urlPlaceholder: "Entrez l'URL de l'image...",
    loadUrlBtn: "Charger",
    orLabel: "ou",
    dragDropHint: "Glisser-déposer l'image ici",
    pasteHint: "Coller depuis le presse-papiers supporté",
    gainLabel: "Amplification du Bruit (Gain)",
    originalTitle: "Entrée Originale",
    originalSub: "Mode RVB",
    gradientTitle: "Carte de Relief de Gradient",
    gradientSub: "Filtre Passe-Haut (Décalage Gris)",
    calculating: "Calcul en cours...",
    waiting: "En attente d'entrée...",
    emptyState: "Téléchargez, collez ou faites glisser une image pour visualiser ses motifs de bruit de gradient sous-jacents.",
    statsTitle: "Analyse Statistique",
    statsSub: "Matrice de Covariance (C = 1/N MᵀM)",
    statsNote: "* Une variance élevée peut indiquer des détails à haute fréquence ou du bruit. Les images générées par IA montrent parfois des distributions statistiques différentes dans les caractéristiques de covariance par rapport aux images naturelles.",
    infoTitle: "Logique d'Analyse",
    infoDesc: "Cet outil utilise la visualisation <strong>Relief de Gradient</strong>. Les vraies photos apparaissent généralement en gris lisse dans les zones plates (comme le ciel), tandis que les images générées par l'IA (surtout les modèles de diffusion) laissent souvent un bruit haute fréquence anormal de type 'statique' ou des textures non naturelles sur le fond gris.",
    methodLabel: "Méthode :",
    visualGuideLabel: "Guide Visuel :",
    visualGuideValue: "Gris=Plat, Clair/Foncé=Bords/Bruit",
    footerInspiration: "Inspiration :",
    footerLinkText: "Article de RogerBit arduino pic y más",
    errorImageLoad: "Échec du chargement de l'image (Restriction CORS possible ou URL invalide)"
  }
};

// ==========================================
// UTILS: Image Processor
// ==========================================
const getLuminance = (r, g, b) => {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const computeGradientField = (originalImageData, intensity) => {
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

const getImageData = (img) => {
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

// ==========================================
// COMPONENT: Icons (SVG Helpers)
// ==========================================
const IconUpload = () => h('svg', { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
  h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" })
);

const IconDemoReal = () => h('svg', { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
  h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" })
);

const IconDemoAI = () => h('svg', { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
  h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" })
);

const IconLanguage = () => h('svg', { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
  h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
);

const IconEmpty = () => h('svg', { className: "w-16 h-16 mb-4 opacity-50", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
  h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" })
);

// ==========================================
// COMPONENT: InfoPanel
// ==========================================
const InfoPanel = ({ t }) => {
  return h('div', { className: "bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6 shadow-lg" },
    h('h2', { className: "text-xl font-bold text-blue-400 mb-2" }, t.infoTitle),
    h('p', { 
      className: "text-gray-300 leading-relaxed text-sm mb-4",
      dangerouslySetInnerHTML: { __html: t.infoDesc }
    }),
    h('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-gray-400 bg-gray-900 p-4 rounded" },
      h('div', null,
        h('span', { className: "block font-bold text-gray-200 mb-1" }, t.methodLabel),
        "Pixel = (Gx + Gy) * Gain + 128"
      ),
      h('div', null,
        h('span', { className: "block font-bold text-gray-200 mb-1" }, t.visualGuideLabel),
        t.visualGuideValue
      )
    )
  );
};

// ==========================================
// MAIN APP
// ==========================================
const REAL_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/F-35A_flight_%28cropped%29.jpg/1280px-F-35A_flight_%28cropped%29.jpg";
const AI_IMAGE_URL = "https://raw.githubusercontent.com/jmsch23280866/AI-Image-Analysis-Experiment/refs/heads/main/Gemini_Generated_F-22(Demo).png";

const App = () => {
  const [imageSrc, setImageSrc] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [intensity, setIntensity] = useState(5.0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Language State
  const [currentLang, setCurrentLang] = useState('zh-TW');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  const t = translations[currentLang];

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageLoad = (src) => {
    setImageSrc(src);
    setStats(null);
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleImageLoad(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset value to allow selecting the same file again
    e.target.value = '';
  };

  // Handle URL Load
  const handleUrlLoad = () => {
    if (imageUrlInput.trim()) {
      handleImageLoad(imageUrlInput.trim());
    }
  };

  // Handle Demo Load
  const handleRealDemoLoad = () => {
    setImageUrlInput(REAL_IMAGE_URL);
    handleImageLoad(REAL_IMAGE_URL);
  };

  const handleAIDemoLoad = () => {
    setImageUrlInput(AI_IMAGE_URL);
    handleImageLoad(AI_IMAGE_URL);
  };

  // Handle Paste
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                handleImageLoad(event.target.result);
              }
            };
            reader.readAsDataURL(blob);
          }
          break; 
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleImageLoad(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const img = imgRef.current;
        if(!img) return;

        const originalData = getImageData(img);
        const result = computeGradientField(originalData, intensity);
        
        const canvas = canvasRef.current;
        if(!canvas) return;

        canvas.width = originalData.width;
        canvas.height = originalData.height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(result.gradientImageData, 0, 0);
        }

        setStats(result.covariance);
      } catch (error) {
        console.error("Processing failed", error);
        if (error instanceof DOMException && error.name === "SecurityError") {
            alert("Security Error: Cannot access image data. This usually happens when loading images from a different domain (CORS). Please try uploading the image file directly instead of using a URL.");
        } else {
            alert(t.errorImageLoad);
        }
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  }, [intensity, t.errorImageLoad]);

  useEffect(() => {
    if (imageSrc && imgRef.current) {
      if (imgRef.current.complete) {
        processImage();
      }
    }
  }, [imageSrc, intensity, processImage]);

  const changeLanguage = (lang) => {
    setCurrentLang(lang);
    setIsLangMenuOpen(false);
  };

  // RENDER UI (Replacing JSX with h())
  return h('div', {
      className: `min-h-screen bg-black text-gray-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col transition-colors ${isDragging ? 'bg-gray-900 ring-4 ring-blue-500/50' : ''}`,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop
    },
    /* HEADER */
    h('header', { className: "border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10" },
      h('div', { className: "max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" },
        h('div', { className: "flex items-center gap-3" },
          h('div', { className: "w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center font-bold text-lg text-white" }, "F"),
          h('h1', { className: "text-xl font-bold tracking-tight" }, t.title)
        ),
        h('div', { className: "flex items-center gap-4" },
          /* Language Dropdown */
          h('div', { className: "relative", ref: langMenuRef },
            h('button', {
              onClick: () => setIsLangMenuOpen(!isLangMenuOpen),
              className: "flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800",
              'aria-label': "Select Language"
            }, h(IconLanguage)),
            isLangMenuOpen && h('div', { className: "absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 z-50" },
              h('button', {
                onClick: () => changeLanguage('zh-TW'),
                className: `block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${currentLang === 'zh-TW' ? 'text-blue-400 font-bold' : 'text-gray-200'}`
              }, "繁體中文"),
              h('button', {
                onClick: () => changeLanguage('en'),
                className: `block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${currentLang === 'en' ? 'text-blue-400 font-bold' : 'text-gray-200'}`
              }, "English"),
              h('button', {
                onClick: () => changeLanguage('fr'),
                className: `block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${currentLang === 'fr' ? 'text-blue-400 font-bold' : 'text-gray-200'}`
              }, "Français")
            )
          ),
          h('span', { className: "text-sm text-gray-500" }, "v1.3.0")
        )
      )
    ),
    /* MAIN CONTENT */
    h('main', { className: "max-w-7xl mx-auto px-6 py-8 flex-grow w-full relative" },
      isDragging && h('div', { className: "absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none border-4 border-dashed border-blue-500 rounded-xl m-4" },
        h('h2', { className: "text-3xl font-bold text-white animate-pulse" }, t.dragDropHint)
      ),
      
      h(InfoPanel, { t }),

      /* Controls */
      h('div', { className: "flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 bg-gray-900 p-6 rounded-xl border border-gray-800" },
        h('div', { className: "flex flex-col gap-4 w-full lg:w-auto flex-grow max-w-2xl" },
          /* Buttons */
          h('div', { className: "flex flex-wrap items-center gap-3" },
            h('div', { className: "relative group" },
              h('input', {
                type: "file",
                accept: "image/*",
                onChange: handleFileUpload,
                className: "absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              }),
              h('button', { className: "bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2" },
                h(IconUpload),
                t.uploadBtn
              )
            ),
            h('span', { className: "text-gray-500 text-sm" }, t.orLabel),
            h('div', { className: "flex gap-2" },
              h('button', {
                onClick: handleRealDemoLoad,
                title: "Real Photo",
                className: "bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm border border-gray-600"
              },
                h(IconDemoReal),
                t.demoRealBtn
              ),
              h('button', {
                onClick: handleAIDemoLoad,
                title: "AI Generated",
                className: "bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-100 font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm border border-indigo-700/50"
              },
                h(IconDemoAI),
                t.demoAIBtn
              )
            )
          ),
          /* URL Input */
          h('div', { className: "flex items-center gap-2 w-full" },
            h('div', { className: "relative flex-grow" },
              h('input', {
                type: "text",
                placeholder: t.urlPlaceholder,
                value: imageUrlInput,
                onChange: (e) => setImageUrlInput(e.target.value),
                onKeyDown: (e) => e.key === 'Enter' && handleUrlLoad(),
                className: "w-full bg-black border border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
              })
            ),
            h('button', {
              onClick: handleUrlLoad,
              className: "bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium py-2 px-4 rounded-lg transition-colors border border-gray-700"
            }, t.loadUrlBtn)
          ),
          h('div', { className: "text-xs text-gray-500 flex gap-2" },
            h('span', null, t.pasteHint),
            h('span', { className: "text-gray-700" }, "|"),
            h('span', null, t.dragDropHint)
          )
        ),
        /* Slider */
        h('div', { className: "w-full lg:w-64 flex-shrink-0 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50" },
          h('div', { className: "flex justify-between mb-2" },
            h('label', { className: "text-sm font-medium text-gray-300" }, t.gainLabel),
            h('span', { className: "text-sm font-mono text-blue-400" }, intensity.toFixed(1) + 'x')
          ),
          h('input', {
            type: "range",
            min: "1",
            max: "50",
            step: "0.5",
            value: intensity,
            onChange: (e) => setIntensity(parseFloat(e.target.value)),
            disabled: !imageSrc,
            className: "w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
          })
        )
      ),

      /* Visualizations */
      imageSrc ? h('div', { className: "grid grid-cols-1 lg:grid-cols-2 gap-8" },
        /* Original */
        h('div', { className: "space-y-2" },
          h('div', { className: "flex items-center justify-between" },
            h('h3', { className: "text-sm font-bold text-gray-400 uppercase tracking-wider" }, t.originalTitle),
            h('span', { className: "text-xs text-gray-600" }, t.originalSub)
          ),
          h('div', { className: "relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl aspect-[4/3] flex items-center justify-center group" },
            h('div', { className: "absolute inset-0 z-0 opacity-20", style: { backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '10px 10px' } }),
            h('img', {
              ref: (el) => { imgRef.current = el; },
              src: imageSrc,
              crossOrigin: "anonymous",
              alt: "Original",
              className: "w-full h-full object-contain relative z-10",
              onLoad: processImage,
              onError: () => { alert(t.errorImageLoad); setIsProcessing(false); }
            })
          )
        ),
        /* Gradient */
        h('div', { className: "space-y-2" },
          h('div', { className: "flex items-center justify-between" },
            h('h3', { className: "text-sm font-bold text-gray-400 uppercase tracking-wider" }, t.gradientTitle),
            isProcessing ? h('span', { className: "text-xs text-yellow-500 animate-pulse" }, t.calculating) : h('span', { className: "text-xs text-gray-600" }, t.gradientSub)
          ),
          h('div', { className: "relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl aspect-[4/3] flex items-center justify-center" },
            h('canvas', { ref: canvasRef, className: "w-full h-full object-contain" }),
            !imageSrc && h('div', { className: "text-gray-600 absolute" }, t.waiting)
          )
        )
      ) : h('div', { className: "h-96 flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/30 text-gray-500 transition-colors hover:border-gray-700 hover:bg-gray-900/50" },
        h(IconEmpty),
        h('p', null, t.emptyState),
        h('p', { className: "text-sm mt-2 text-gray-600" }, t.pasteHint)
      ),

      /* Stats */
      stats && h('div', { className: "mt-8 border-t border-gray-800 pt-8" },
        h('h3', { className: "text-lg font-bold text-gray-200 mb-4" }, t.statsTitle),
        h('div', { className: "bg-black border border-gray-800 rounded-lg p-6 max-w-2xl" },
          h('p', { className: "text-xs text-gray-500 uppercase mb-4 tracking-widest" }, t.statsSub),
          h('div', { className: "grid grid-cols-2 gap-x-8 gap-y-4 font-mono text-sm" },
            h('div', { className: "flex justify-between border-b border-gray-900 pb-2" },
               h('span', { className: "text-gray-500" }, "Var(Gx)"),
               h('span', { className: "text-blue-400" }, stats.xx.toExponential(4))
            ),
            h('div', { className: "flex justify-between border-b border-gray-900 pb-2" },
               h('span', { className: "text-gray-500" }, "Cov(Gx, Gy)"),
               h('span', { className: "text-purple-400" }, stats.xy.toExponential(4))
            ),
            h('div', { className: "flex justify-between border-b border-gray-900 pb-2" },
               h('span', { className: "text-gray-500" }, "Cov(Gy, Gx)"),
               h('span', { className: "text-purple-400" }, stats.yx.toExponential(4))
            ),
            h('div', { className: "flex justify-between border-b border-gray-900 pb-2" },
               h('span', { className: "text-gray-500" }, "Var(Gy)"),
               h('span', { className: "text-blue-400" }, stats.yy.toExponential(4))
            )
          ),
          h('p', { className: "mt-4 text-xs text-gray-600" }, t.statsNote)
        )
      )
    ),
    /* Footer */
    h('footer', { className: "w-full border-t border-gray-900 bg-gray-900/50 py-6 text-center text-xs text-gray-500" },
      h('p', null,
        t.footerInspiration,
        " ",
        h('a', {
          href: "https://www.facebook.com/100067139973459/posts/pfbid02zxW55GPhPnTM46v1hiNPkeECRv9uVHVrewVwHEgpvZ3vzFwgA3gxvw6wyBEGBeTAl/",
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-blue-500 hover:text-blue-400 hover:underline transition-colors"
        }, t.footerLinkText)
      )
    )
  );
};

// Initialize App
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(h(App));
}