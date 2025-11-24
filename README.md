# AI Image Analysis Experiment

此專案是一個基於瀏覽器的電腦視覺實驗工具，旨在透過數學運算將圖像中肉眼難以察覺的微觀紋理可視化，藉此分析潛在的 AI 生成特徵。

👉 **線上體驗 (Live Demo)**: [https://jmsch23280866.github.io/AI-Image-Analysis-Experiment/](https://jmsch23280866.github.io/AI-Image-Analysis-Experiment/)

---

## 🔍 背後原理 (Underlying Principles)

AI 生成圖像（特別是基於 Diffusion Model 的模型）雖然在宏觀上逼真，但在微觀的高頻細節上，往往會殘留與自然光學攝影不同的噪聲特徵。本工具利用**梯度浮雕 (Gradient Relief)** 技術來突顯這些差異。

### 1. 亮度轉換 (Luminance)
首先，程式會將 RGB 圖像轉換為單通道的灰階亮度值，以專注於光影結構而非顏色：
$$ L = 0.2126R + 0.7152G + 0.0722B $$

### 2. 梯度場計算 (Gradient Calculation)
接著，使用 **Sobel 算子 (Sobel Operator)** 對圖像進行卷積運算，計算每個像素在水平 ($G_x$) 與垂直 ($G_y$) 方向的變化率（梯度）。
這在本質上是一種**高通濾波 (High-pass Filter)**，能夠去除低頻的平滑顏色，只保留邊緣與紋理資訊。

### 3. 視覺化映射 (Visualization)
為了讓人眼能夠同時觀察到正向與負向的梯度變化，我們將計算結果疊加在中性灰基底上：

$$ Pixel = (G_x + G_y) \times \text{Gain} + 128 $$

*   **中性灰 (128)**：代表梯度為 0，即平坦區域。
*   **亮/暗細節**：代表該處存在快速的亮度變化。

**分析邏輯**：
*   **自然照片**：在失焦或平坦區域（如藍天），通常呈現平滑的灰色，或帶有隨機的 ISO 顆粒噪點。
*   **AI 圖像**：常在平坦背景中殘留異常的**高頻靜電狀噪聲**、**重複性紋理**或**棋盤格偽影 (Checkerboard Artifacts)**。透過調整增益 (Gain)，這些潛藏的特徵會浮現於灰色背景之上。

### 4. 統計分析 (Covariance Matrix)
為了提供客觀數據，工具會計算梯度場的協方差矩陣：
$$ C = \frac{1}{N} \sum (G - \bar{G})(G - \bar{G})^T $$
這能反映出圖像在紋理層面的統計分佈特性。

---

*本工具僅供實驗研究用途。靈感來源：RogerBit arduino pic y más。*