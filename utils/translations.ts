export type Language = 'zh-TW' | 'en' | 'fr';

export interface Translation {
  title: string;
  uploadBtn: string;
  demoBtn: string;
  urlPlaceholder: string;
  loadUrlBtn: string;
  orLabel: string;
  dragDropHint: string;
  pasteHint: string;
  gainLabel: string;
  originalTitle: string;
  originalSub: string;
  gradientTitle: string;
  gradientSub: string;
  calculating: string;
  waiting: string;
  emptyState: string;
  statsTitle: string;
  statsSub: string;
  statsNote: string;
  infoTitle: string;
  infoDesc: string;
  methodLabel: string;
  visualGuideLabel: string;
  visualGuideValue: string;
  footerInspiration: string;
  footerLinkText: string;
  errorImageLoad: string;
}

export const translations: Record<Language, Translation> = {
  'zh-TW': {
    title: "AI 圖像分析實驗",
    uploadBtn: "上傳圖片",
    demoBtn: "示範",
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
    demoBtn: "Demo",
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
    demoBtn: "Démo",
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