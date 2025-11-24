import React from 'react';

interface InfoPanelProps {
  t: {
    infoTitle: string;
    infoDesc: string;
    methodLabel: string;
    visualGuideLabel: string;
    visualGuideValue: string;
  }
}

const InfoPanel: React.FC<InfoPanelProps> = ({ t }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6 shadow-lg">
      <h2 className="text-xl font-bold text-blue-400 mb-2">{t.infoTitle}</h2>
      <p 
        className="text-gray-300 leading-relaxed text-sm mb-4"
        dangerouslySetInnerHTML={{ __html: t.infoDesc }}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-gray-400 bg-gray-900 p-4 rounded">
        <div>
          <span className="block font-bold text-gray-200 mb-1">{t.methodLabel}</span>
          Pixel = (Gx + Gy) * Gain + 128
        </div>
        <div>
          <span className="block font-bold text-gray-200 mb-1">{t.visualGuideLabel}</span>
          {t.visualGuideValue}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;