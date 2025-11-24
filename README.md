# AI Image Analysis Experiment (Vanilla JS Edition)

這是一個基於瀏覽器的電腦視覺工具，用於可視化圖像中的梯度場（Gradient Fields），藉此分析潛在的 AI 生成偽影（Artifacts）。

此版本經過重構，**完全不需要構建工具（No Build Step）**。它使用原生的 JavaScript (ES6) 配合 React (UMD) 運行，無需 `npm`、`webpack` 或 `vite`。

## ✨ 功能特色

*   **梯度浮雕可視化 (Gradient Relief)**：利用 Sobel 算子計算圖像梯度，並以中性灰為基底進行偏移顯示。
*   **統計分析**：計算梯度場的協方差矩陣 (Covariance Matrix)，幫助識別非自然的噪聲分佈。
*   **隱私安全**：所有圖像處理皆在**本地瀏覽器**中完成，圖片不會上傳至任何伺服器。
*   **零依賴運行**：單純的靜態網頁，雙擊 `index.html` 即可使用。

## 🚀 如何執行

由於此專案已移除編譯需求，您有兩種方式可以執行：

### 方法 1：直接開啟 (最簡單)
直接在資料夾中找到 `index.html`，雙擊使用瀏覽器開啟即可。

### 方法 2：使用靜態伺服器 (推薦)
雖然可以直接開啟，但為了避免某些瀏覽器的嚴格 CORS (跨域) 限制影響圖片載入，建議使用簡易的 HTTP 伺服器：

```bash
# 如果你有安裝 python
python3 -m http.server 8000

# 或者使用 node
npx serve .
```
然後在瀏覽器訪問 `http://localhost:8000`。

## 📂 專案結構

此專案僅由 4 個核心檔案組成：

1.  **`index.html`**
    *   網頁入口。
    *   透過 CDN 引入 React, ReactDOM 和 TailwindCSS。
    *   不包含任何編譯器 (Babel) 引用。
2.  **`main.js`**
    *   包含所有邏輯：UI 組件、電腦視覺算法、多語言翻譯。
    *   使用 `React.createElement` (別名 `h`) 代替 JSX，讓瀏覽器能直接執行。
3.  **`style.css`**
    *   自定義樣式與滾動條美化。
4.  **`README.md`**
    *   本說明文件。

## 🛠️ 技術細節

*   **Framework**: React 18 (UMD Version)
*   **Styling**: Tailwind CSS (Runtime CDN)
*   **Algorithm**: Sobel Operator for Gradient calculation (Implemented in pure JS).
*   **Architecture**: Single File Component (SFC) pattern merged into one JS file for portability.

## 📝 授權與致謝

本工具靈感來自 RogerBit arduino pic y más 的文章。
程式碼為開源實驗專案。
