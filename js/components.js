import React from 'react';

// ==========================================
// COMPONENT: Icons & InfoPanel
// ==========================================

const { createElement: h } = React;

export const IconUpload = () => h('svg', { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
  h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" })
);

export const IconDemoReal = () => h('svg', { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
  h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" })
);

export const IconDemoAI = () => h('svg', { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
  h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" })
);

export const IconLanguage = () => h('svg', { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
  h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
);

export const IconEmpty = () => h('svg', { className: "w-16 h-16 mb-4 opacity-50", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
  h('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" })
);

export const InfoPanel = ({ t }) => {
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