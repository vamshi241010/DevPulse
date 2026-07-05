# 🚀 DevPulse

> **Your AI Co-Engineer for Continuous Code Quality**

DevPulse is an AI-powered code intelligence platform that automatically reviews your GitHub repositories, detects bugs and security vulnerabilities, monitors every commit in real time, and provides intelligent debugging assistance—all from a single dashboard.

---

## ✨ Features

### 🔍 Repository Scan
- Analyze the entire repository in one click
- Detect bugs, security vulnerabilities, and performance issues
- Find bad coding practices
- Repository Health Score (0–100)
- Severity-based issue classification
- Exact file and line references
- AI-powered explanations

---

### ⚡ Watch Mode
- Real-time GitHub webhook integration
- Automatically reviews every commit
- Detects issues in newly pushed code
- Live notifications
- Tracks commit history
- Zero manual intervention

---

### 🕵️ Error Detective
- Paste any error message or broken code
- Root cause analysis
- Exact file & line identification
- Before vs After code comparison
- AI-generated fixes
- One-click copy solution

---

## 🎯 Why DevPulse?

Unlike traditional AI chatbots, DevPulse works directly inside your GitHub workflow.

Instead of manually copying and pasting code into AI tools, DevPulse continuously monitors repositories, reviews commits automatically, and provides intelligent code analysis in real time.

It acts as your **24/7 AI Co-Engineer**.

---

## 🛠 Tech Stack

### Frontend
- React
- Tailwind CSS
- Framer Motion
- Lucide Icons

### Backend
- Node.js
- Express.js

### Database
- MongoDB

### Authentication
- GitHub OAuth

### APIs
- GitHub REST API
- GitHub Webhooks
- AI API

---

## 🏗 Architecture

GitHub Repository
        │
        ▼
GitHub OAuth Authentication
        │
        ▼
      DevPulse
        │
 ┌──────┼─────────┐
 │      │         │
 ▼      ▼         ▼
Scan   Watch   Error Detective
 │      │         │
 ▼      ▼         ▼
AI Code Analysis
 │
 ▼
Interactive Dashboard

---

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/your-username/devpulse.git
```

---

### Install dependencies

Frontend

```bash
cd client
npm install
```

Backend

```bash
cd server
npm install
```

---

### Environment Variables

Create a `.env` file inside the server folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection

GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret

JWT_SECRET=your_jwt_secret

AI_API_KEY=your_ai_api_key

WEBHOOK_SECRET=your_webhook_secret
```

---

### Run the Backend

```bash
npm run dev
```

---

### Run the Frontend

```bash
npm run dev
```

---

## 📊 Workflow

1. Login with GitHub
2. Select Repository
3. Run Repository Scan
4. Enable Watch Mode
5. Push Code
6. Receive Live AI Review
7. Fix Issues
8. Ship Better Software 🚀

---

## 📸 Screenshots

- Dashboard
- Repository Scan
- Watch Mode
- Error Detective
- Scan Results
- Live Notifications

(Add screenshots here)

---

## 💡 Future Scope

- Pull Request Review Bot
- GitHub Actions Integration
- GitLab & Bitbucket Support
- VS Code Extension
- Multi-AI Review Engine
- Team Analytics Dashboard
- Dependency Vulnerability Scanner
- AI Auto-Fix Pull Requests
- Slack & Discord Notifications
- Enterprise Policy Checks

---

## 🌍 Problem Statement

Modern software development moves faster than manual code reviews can keep up.

Critical bugs, security vulnerabilities, and performance issues often remain undetected until production, where fixing them becomes expensive and risky.

Small teams, students, and solo developers rarely have access to experienced code reviewers, making it difficult to maintain high-quality software.

DevPulse bridges this gap by providing continuous AI-powered code reviews directly within the GitHub workflow.

---

## 🎯 Vision

> **Every developer deserves an expert reviewing their code.**

DevPulse makes enterprise-grade code quality accessible to everyone through continuous AI-powered code reviews.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added feature"
```

4. Push

```bash
git push origin feature-name
```

5. Open a Pull Request

---

## 📜 License

MIT License

---

## ⭐ Support

If you like DevPulse, consider giving it a ⭐ on GitHub.

It helps the project reach more developers.

---

## ❤️ Built With Passion

Made for developers who believe that **great software starts with great code.**
