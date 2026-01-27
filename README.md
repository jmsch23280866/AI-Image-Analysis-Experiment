[English](#english) | [中文](#chinese)

<a id="english"></a>

# AI Image Analysis Experiment

This project is a browser-based computer vision experiment tool designed to visualize microscopic textures invisible to the naked eye using mathematical operations, thereby analyzing potential AI-generated features.

👉 **Live Demo**: [https://jmsch23280866.github.io/AI-Image-Analysis-Experiment/](https://jmsch23280866.github.io/AI-Image-Analysis-Experiment/)

---

## 🔍 Underlying Principles

While AI-generated images (especially those based on Diffusion Models) appear realistic at a macroscopic level, they often retain noise characteristics in microscopic high-frequency details that differ from natural optical photography. This tool utilizes **Gradient Relief** technology to highlight these differences.

### 1. Luminance

First, the program converts RGB images into single-channel grayscale luminance values to focus on light and shadow structure rather than color:
L = 0.2126R + 0.7152G + 0.0722B

### 2. Gradient Calculation

Next, the **Sobel Operator** is used to convolute the image to calculate the rate of change (gradient) for each pixel in horizontal (G_x) and vertical (G_y) directions.
Essentially, this acts as a **High-pass Filter**, removing low-frequency smooth colors while retaining edge and texture information.

### 3. Visualization

To allow the human eye to observe both positive and negative gradient changes simultaneously, we superimpose the calculation results onto a neutral gray base:

Pixel = (G_x + G_y) \times \text{Gain} + 128

*   **Neutral Gray (128)**: Represents zero gradient, i.e., flat areas.
*   **Bright/Dark Details**: Represents rapid brightness changes in that area.

**Analysis Logic**:
*   **Natural Photos**: In out-of-focus or flat areas (e.g., blue sky), typically present smooth gray or random ISO grain noise.
*   **AI Images**: Often retain abnormal **high-frequency static-like noise**, **repetitive textures**, or **Checkerboard Artifacts** in flat backgrounds. By adjusting the Gain, these hidden features emerge above the gray background.

### 4. Statistical Analysis (Covariance Matrix)

To provide objective data, the tool calculates the covariance matrix of the gradient field:
C = \frac{1}{N} \sum (G - \bar{G})(G - \bar{G})^T
This reflects the statistical distribution characteristics of the image at the texture level.

---

*This tool is for experimental research purposes only. Inspiration: RogerBit arduino pic y más.*

---

<br>

<a id="chinese"></a>

# AI 影像微觀特徵分析器

此專案是一個基於瀏覽器的電腦視覺實驗工具，旨在透過數學運算將圖像中肉眼難以察覺的微觀紋理可視化，藉此分析潛在的 AI 生成特徵。

👉 **線上體驗**: [https://jmsch23280866.github.io/AI-Image-Analysis-Experiment/](https://jmsch23280866.github.io/AI-Image-Analysis-Experiment/)

---

## 🔍 背後原理

AI 生成圖像（特別是基於 Diffusion Model 的模型）雖然在宏觀上逼真，但在微觀的高頻細節上，往往會殘留與自然光學攝影不同的噪聲特徵。本工具利用**梯度浮雕 (Gradient Relief)** 技術來突顯這些差異。

### 1. 亮度轉換
首先，程式會將 RGB 圖像轉換為單通道的灰階亮度值，以專注於光影結構而非顏色：
L = 0.2126R + 0.7152G + 0.0722B

### 2. 梯度場計算
接著，使用 **Sobel 算子 (Sobel Operator)** 對圖像進行卷積運算，計算每個像素在水平 (G_x) 與垂直 (G_y) 方向的變化率（梯度）。
這在本質上是一種**高通濾波 (High-pass Filter)**，能夠去除低頻的平滑顏色，只保留邊緣與紋理資訊。

### 3. 視覺化映射
為了讓人眼能夠同時觀察到正向與負向的梯度變化，我們將計算結果疊加在中性灰基底上：

Pixel = (G_x + G_y) \times \text{Gain} + 128

*   **中性灰 (128)**：代表梯度為 0，即平坦區域。
*   **亮/暗細節**：代表該處存在快速的亮度變化。

**分析邏輯**：
*   **自然照片**：在失焦或平坦區域（如藍天），通常呈現平滑的灰色，或帶有隨機的 ISO 顆粒噪點。
*   **AI 圖像**：常在平坦背景中殘留異常的**高頻靜電狀噪聲**、**重複性紋理**或**棋盤格偽影 (Checkerboard Artifacts)**。透過調整增益 (Gain)，這些潛藏的特徵會浮現於灰色背景之上。

### 4. 統計分析
為了提供客觀數據，工具會計算梯度場的協方差矩陣：
C = \frac{1}{N} \sum (G - \bar{G})(G - \bar{G})^T
這能反映出圖像在紋理層面的統計分佈特性。

---

*本工具僅供實驗研究用途。靈感來源：RogerBit arduino pic y más。*
