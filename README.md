# DebtLens Frontend

**DebtLens** is an AI-powered technical debt analytics platform designed to help agile small-scale software teams identify, visualize, and prioritize technical debt.

This repository contains the **frontend application** of DebtLens, providing the user interface for interacting with repository analysis, technical debt metrics, machine learning results, and project health information.

---

## 🚀 Features

- 🔐 User authentication
- 📊 Technical debt analytics dashboard
- 📈 Code and repository health visualization
- 🔍 Repository analysis results
- 🔥 Technical debt hotspot identification
- 🤖 Machine learning insights
- 🐞 Bug-proneness prediction results
- 📝 Self-Admitted Technical Debt (SATD) insights
- 🎯 Refactor-first prioritization

---

## 🛠️ Technology Stack

- **React** – User interface development
- **TypeScript** – Type-safe application development
- **Vite** – Development server and build tool
- **ESLint** – Code quality and linting
- **CSS** – UI styling
- **REST APIs** – Communication with backend services

---

## 🏗️ System Architecture

The frontend is the presentation layer of the DebtLens system and communicates with the backend services to retrieve analysis and machine learning results.

```text
                ┌──────────────┐
                │     User     │
                └──────┬───────┘
                       │
                       ▼
              ┌─────────────────┐
              │ DebtLens Frontend│
              │ React + TypeScript│
              └────────┬────────┘
                       │
                       ▼
          ┌─────────────────────────┐
          │      Backend APIs       │
          └───────────┬─────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
     Application   Analysis       ML
       Service     Service      Service
```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
