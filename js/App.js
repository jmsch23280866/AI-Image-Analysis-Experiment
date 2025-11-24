
import { translations } from './translations.js';
import { computeGradientField, getImageData } from './imageProcessor.js';
import { IconUpload, IconDemoReal, IconDemoAI, IconLanguage, IconEmpty, InfoPanel } from './components.js';

const { useState, useRef, useEffect, useCallback, createElement: h } = React;

const REAL_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/F-35A_flight_%28cropped%29.jpg/1280px-F-35A_flight_%28cropped%29.jpg";
const AI_IMAGE_URL = "https://raw.githubusercontent.com/jmsch23280866/AI-Image-Analysis-Experiment/cdaed9396bb1036cf08f3de676feee39962642e6/Gemini_Generated_F-22(Demo).png";

export const App = () => {
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

  // Handle Demo Loads
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
          h('div', { className: "w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center font-bold text-lg text-white" }, "🛦"),
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
