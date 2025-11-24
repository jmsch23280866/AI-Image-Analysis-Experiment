import React, { useState, useRef, useEffect, useCallback } from 'react';
import { computeGradientField, getImageData, ProcessResult } from './utils/imageProcessor';
import { translations, Language } from './utils/translations';
import InfoPanel from './components/InfoPanel';

const DEMO_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/F-35A_flight_%28cropped%29.jpg/1280px-F-35A_flight_%28cropped%29.jpg";

const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>("");
  const [intensity, setIntensity] = useState<number>(5.0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stats, setStats] = useState<ProcessResult['covariance'] | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Language State
  const [currentLang, setCurrentLang] = useState<Language>('zh-TW');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const t = translations[currentLang];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Close language menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleImageLoad = (src: string) => {
    setImageSrc(src);
    setStats(null);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleImageLoad(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle URL Load
  const handleUrlLoad = () => {
    if (imageUrlInput.trim()) {
      handleImageLoad(imageUrlInput.trim());
    }
  };

  // Handle Demo Load
  const handleDemoLoad = () => {
    setImageUrlInput(DEMO_IMAGE_URL);
    handleImageLoad(DEMO_IMAGE_URL);
  };

  // Handle Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                handleImageLoad(event.target.result as string);
              }
            };
            reader.readAsDataURL(blob);
          }
          break; // Stop after finding the first image
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleImageLoad(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Run the computer vision logic
  const processImage = useCallback(() => {
    if (!imgRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);

    // Use setTimeout to allow UI to render the "Processing" state before blocking
    setTimeout(() => {
      try {
        const img = imgRef.current;
        if(!img) return;

        // Get raw pixels
        const originalData = getImageData(img);
        
        // Compute Math
        const result = computeGradientField(originalData, intensity);
        
        // Draw result
        const canvas = canvasRef.current;
        if(!canvas) return;

        // Set canvas buffer size to match image size 1:1
        canvas.width = originalData.width;
        canvas.height = originalData.height;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.putImageData(result.gradientImageData, 0, 0);
        }

        setStats(result.covariance);
      } catch (error) {
        console.error("Processing failed", error);
        alert(t.errorImageLoad);
      } finally {
        setIsProcessing(false);
      }
    }, 50);
  }, [intensity, t.errorImageLoad]);

  // Trigger processing when image loads or intensity changes
  useEffect(() => {
    if (imageSrc && imgRef.current) {
      if (imgRef.current.complete) {
        processImage();
      }
    }
  }, [imageSrc, intensity, processImage]);

  const changeLanguage = (lang: Language) => {
    setCurrentLang(lang);
    setIsLangMenuOpen(false);
  };

  return (
    <div 
      className={`min-h-screen bg-black text-gray-100 font-sans selection:bg-blue-500 selection:text-white flex flex-col transition-colors ${isDragging ? 'bg-gray-900 ring-4 ring-blue-500/50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center font-bold text-lg text-white">
              F
            </div>
            <h1 className="text-xl font-bold tracking-tight">{t.title}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
                aria-label="Select Language"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 z-50">
                  <button 
                    onClick={() => changeLanguage('zh-TW')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${currentLang === 'zh-TW' ? 'text-blue-400 font-bold' : 'text-gray-200'}`}
                  >
                    繁體中文
                  </button>
                  <button 
                    onClick={() => changeLanguage('en')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${currentLang === 'en' ? 'text-blue-400 font-bold' : 'text-gray-200'}`}
                  >
                    English
                  </button>
                  <button 
                    onClick={() => changeLanguage('fr')}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-700 ${currentLang === 'fr' ? 'text-blue-400 font-bold' : 'text-gray-200'}`}
                  >
                    Français
                  </button>
                </div>
              )}
            </div>
            
            <span className="text-sm text-gray-500">v1.2.0</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-grow w-full relative">
        {isDragging && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none border-4 border-dashed border-blue-500 rounded-xl m-4">
            <h2 className="text-3xl font-bold text-white animate-pulse">{t.dragDropHint}</h2>
          </div>
        )}
        
        <InfoPanel t={t} />

        {/* Control Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 bg-gray-900 p-6 rounded-xl border border-gray-800">
          
          {/* Input Section */}
          <div className="flex flex-col gap-4 w-full lg:w-auto flex-grow max-w-2xl">
            
            {/* Buttons Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                  {t.uploadBtn}
                </button>
              </div>

              <span className="text-gray-500 text-sm">{t.orLabel}</span>

              <button 
                onClick={handleDemoLoad}
                className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm border border-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {t.demoBtn}
              </button>
            </div>

            {/* URL Input Row */}
            <div className="flex items-center gap-2 w-full">
              <div className="relative flex-grow">
                 <input 
                    type="text" 
                    placeholder={t.urlPlaceholder}
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlLoad()}
                    className="w-full bg-black border border-gray-700 rounded-lg py-2 px-3 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
                 />
              </div>
              <button 
                onClick={handleUrlLoad}
                className="bg-gray-800 hover:bg-gray-700 text-gray-200 text-sm font-medium py-2 px-4 rounded-lg transition-colors border border-gray-700"
              >
                {t.loadUrlBtn}
              </button>
            </div>
            
            <div className="text-xs text-gray-500 flex gap-2">
              <span>{t.pasteHint}</span>
              <span className="text-gray-700">|</span>
              <span>{t.dragDropHint}</span>
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="w-full lg:w-64 flex-shrink-0 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
             <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-300">{t.gainLabel}</label>
              <span className="text-sm font-mono text-blue-400">{intensity.toFixed(1)}x</span>
             </div>
             <input 
                type="range" 
                min="1" 
                max="50" 
                step="0.5" 
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                disabled={!imageSrc}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
             />
          </div>
        </div>

        {/* Visualization Area */}
        {imageSrc ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Original Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t.originalTitle}</h3>
                <span className="text-xs text-gray-600">{t.originalSub}</span>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl aspect-[4/3] flex items-center justify-center group">
                {/* Background grid for transparency */}
                <div className="absolute inset-0 z-0 opacity-20" style={{backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '10px 10px'}}></div>
                <img 
                  ref={(el) => { imgRef.current = el; }}
                  src={imageSrc} 
                  crossOrigin="anonymous" 
                  alt="Original" 
                  className="w-full h-full object-contain relative z-10"
                  onLoad={processImage} 
                  onError={() => { alert(t.errorImageLoad); setIsProcessing(false); }}
                />
              </div>
            </div>

            {/* Gradient Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t.gradientTitle}</h3>
                {isProcessing ? (
                  <span className="text-xs text-yellow-500 animate-pulse">{t.calculating}</span>
                ) : (
                  <span className="text-xs text-gray-600">{t.gradientSub}</span>
                )}
              </div>
              <div className="relative rounded-xl overflow-hidden border border-gray-800 bg-gray-900 shadow-2xl aspect-[4/3] flex items-center justify-center">
                <canvas 
                  ref={canvasRef} 
                  className="w-full h-full object-contain"
                />
                {!imageSrc && <div className="text-gray-600 absolute">{t.waiting}</div>}
              </div>
            </div>
            
          </div>
        ) : (
          <div 
             className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/30 text-gray-500 transition-colors hover:border-gray-700 hover:bg-gray-900/50"
          >
             <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             <p>{t.emptyState}</p>
             <p className="text-sm mt-2 text-gray-600">{t.pasteHint}</p>
          </div>
        )}

        {/* Stats Panel (Covariance) */}
        {stats && (
          <div className="mt-8 border-t border-gray-800 pt-8">
            <h3 className="text-lg font-bold text-gray-200 mb-4">{t.statsTitle}</h3>
            <div className="bg-black border border-gray-800 rounded-lg p-6 max-w-2xl">
              <p className="text-xs text-gray-500 uppercase mb-4 tracking-widest">{t.statsSub}</p>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 font-mono text-sm">
                 <div className="flex justify-between border-b border-gray-900 pb-2">
                    <span className="text-gray-500">Var(Gx)</span>
                    <span className="text-blue-400">{stats.xx.toExponential(4)}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-900 pb-2">
                    <span className="text-gray-500">Cov(Gx, Gy)</span>
                    <span className="text-purple-400">{stats.xy.toExponential(4)}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-900 pb-2">
                    <span className="text-gray-500">Cov(Gy, Gx)</span>
                    <span className="text-purple-400">{stats.yx.toExponential(4)}</span>
                 </div>
                 <div className="flex justify-between border-b border-gray-900 pb-2">
                    <span className="text-gray-500">Var(Gy)</span>
                    <span className="text-blue-400">{stats.yy.toExponential(4)}</span>
                 </div>
              </div>
              <p className="mt-4 text-xs text-gray-600">
                {t.statsNote}
              </p>
            </div>
          </div>
        )}

      </main>

      {/* Footer Credit */}
      <footer className="w-full border-t border-gray-900 bg-gray-900/50 py-6 text-center text-xs text-gray-500">
        <p>
          {t.footerInspiration} <a 
            href="https://www.facebook.com/100067139973459/posts/pfbid02zxW55GPhPnTM46v1hiNPkeECRv9uVHVrewVwHEgpvZ3vzFwgA3gxvw6wyBEGBeTAl/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 hover:underline transition-colors"
          >
            {t.footerLinkText}
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;