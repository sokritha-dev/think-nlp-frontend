# ThinkNLP Frontend 💻

_Frontend for the ThinkNLP Educational NLP Platform_

[![License](https://img.shields.io/github/license/sokritha-dev/think-nlp-frontend)]()

🌐 [Live App](https://www.thinknlp.xyz)  
🧠 [Backend Repo](https://github.com/sokritha-dev/think-nlp)

---

## 📚 Overview

This is the frontend for **ThinkNLP**, an interactive educational platform that helps users explore sentiment analysis and topic modeling with real-world review data.

Built with:

- **React + TypeScript**
- **Vite**
- **Tailwind CSS**
- **TanStack Query**
- **Deployed via Vercel**

---

## 🚀 Features

- File upload for review datasets
- Step-by-step UI for each NLP pipeline stage
- Real-time chart visualizations (Sentiment, Topics)
- Dynamic settings (e.g. number of topics)
- Celebratory animations and onboarding for beginners

---

## 🛠️ Development

### 📦 Install Dependencies

```bash
yarn install
```

### 🧪 Start Dev Server

```bash
yarn dev
```

### 🔐 Environment Variables

Make sure you create a .env file which follow .env.sample file

### 🧱 Folder Structure

```bash
thinknlp-frontend/
├── .vscode/               # Editor settings
├── .yarn/                 # Yarn modern mode
├── node_modules/          # Installed dependencies
├── public/                # Static assets
├── src/                   # App source code
│   ├── components/        # UI components
│   ├── pages/             # App pages (e.g. Upload, Result)
│   ├── hooks/             # Custom React hooks
│   ├── api/               # API functions (fetching NLP results)
│   └── assets/            # Icons, illustrations
├── .env                   # Environment variables
├── .gitignore             # Git rules
├── yarn.lock              # Lockfile
├── vite.config.ts         # Vite config
├── tailwind.config.ts     # Tailwind config
├── tsconfig*.json         # TypeScript configs
├── postcss.config.js      # PostCSS config
├── vercel.json            # Vercel config

```

### 🧪 Testing (Optional)

```bash
# Coming soon: Vitest or React Testing Library
```

### 📝 License

This project is licensed under the MIT License.
See the LICENSE file for details.

### 🙌 Acknowledgements

- Design inspired by components and flows from **[Lovable AI](https://www.lovable.dev/)**
- Tailwind UI and shadcn/ui for reusable UI patterns
- TanStack Query for modern data fetching
- Chart.js and Lottie for data visualization and animations
