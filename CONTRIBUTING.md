# 🤝 Contributing to GradeMate

Thank you for your interest in contributing to **GradeMate**! This document provides a complete, detailed, step-by-step guide to help you contribute successfully — whether you're fixing a bug, improving the UI, adding a new feature, or just improving the documentation.

> **Please read this entire guide before submitting any Pull Request.**

---

## 📋 Table of Contents

1. [Code of Conduct](#-code-of-conduct)
2. [Project Philosophy](#-project-philosophy)
3. [Getting Started — Prerequisites](#-getting-started--prerequisites)
4. [Step 1 — Fork the Repository](#-step-1--fork-the-repository)
5. [Step 2 — Clone Your Fork](#-step-2--clone-your-fork)
6. [Step 3 — Set Up the Project Locally](#-step-3--set-up-the-project-locally)
7. [Step 4 — Create a Feature Branch](#-step-4--create-a-feature-branch)
8. [Step 5 — Make Your Changes](#-step-5--make-your-changes)
9. [Step 6 — Test Your Changes](#-step-6--test-your-changes)
10. [Step 7 — Commit Your Changes](#-step-7--commit-your-changes)
11. [Step 8 — Push to Your Fork](#-step-8--push-to-your-fork)
12. [Step 9 — Open a Pull Request](#-step-9--open-a-pull-request)
13. [Reporting Bugs](#-reporting-bugs)
14. [Suggesting Features](#-suggesting-features)
15. [Coding Standards](#-coding-standards)
16. [Project Structure](#-project-structure)

---

## 🧭 Code of Conduct

By contributing to this project, you agree to be respectful and constructive in all interactions. Please:

- Be kind and welcoming to all contributors.
- Avoid offensive, discriminatory, or harassing language.
- Keep discussions on-topic and professional.
- Accept feedback graciously and give feedback kindly.

---

## 💡 Project Philosophy

Before contributing, please understand GradeMate's core principles:

- ✅ **Zero Dependencies** — No frameworks (no React, Vue, Angular). Pure HTML, CSS, and Vanilla JavaScript only.
- ✅ **100% Client-Side** — No backend, no server, no database. Everything runs in the browser.
- ✅ **Privacy First** — No user accounts, no data collection, no cookies beyond LocalStorage for saving user preferences.
- ✅ **Mobile First** — Every change must work beautifully on small screens before considering large screens.
- ✅ **Premium UI** — Maintain the glassmorphism, animations, and polished visual language already established.

**Do NOT introduce:**
- New npm packages or external frameworks
- Server-side code or APIs that store user data
- Features that break the mobile layout

---

## 🔧 Getting Started — Prerequisites

Before you begin, ensure you have the following installed on your computer:

| Tool | Purpose | Download |
| :--- | :--- | :--- |
| **Git** | Version control | [git-scm.com](https://git-scm.com/downloads) |
| **A Code Editor** | Writing code (VS Code recommended) | [code.visualstudio.com](https://code.visualstudio.com/) |
| **A Modern Browser** | Testing (Chrome or Firefox) | Already installed |
| **Node.js** *(Optional)* | Running a local dev server | [nodejs.org](https://nodejs.org/) |

---

## 📌 Step 1 — Fork the Repository

"Forking" creates a copy of the GradeMate repository under **your own GitHub account**, so you can freely make changes without affecting the original project.

1. Go to the GradeMate GitHub repository:
   👉 **[https://github.com/PrudhviRaavi/GradeMate](https://github.com/PrudhviRaavi/GradeMate)**

2. In the top-right corner of the page, click the **"Fork"** button.

3. GitHub will ask where to fork it — select **your own account**.

4. Wait a few seconds. You now have a copy at:
   `https://github.com/YOUR-USERNAME/GradeMate`

---

## 📥 Step 2 — Clone Your Fork

"Cloning" downloads your forked copy to your local machine so you can edit it.

1. Go to **your fork** on GitHub (e.g., `https://github.com/YOUR-USERNAME/GradeMate`).

2. Click the green **"Code"** button and copy the URL (HTTPS tab):
   ```
   https://github.com/YOUR-USERNAME/GradeMate.git
   ```

3. Open your terminal (Command Prompt, PowerShell, or Git Bash) and run:
   ```bash
   git clone https://github.com/YOUR-USERNAME/GradeMate.git
   ```

4. Navigate into the project folder:
   ```bash
   cd GradeMate
   ```

5. Add the **original repository** as a remote called `upstream` (so you can sync future updates):
   ```bash
   git remote add upstream https://github.com/PrudhviRaavi/GradeMate.git
   ```

6. Verify your remotes are correct:
   ```bash
   git remote -v
   ```
   You should see:
   ```
   origin    https://github.com/YOUR-USERNAME/GradeMate.git (fetch)
   origin    https://github.com/YOUR-USERNAME/GradeMate.git (push)
   upstream  https://github.com/PrudhviRaavi/GradeMate.git (fetch)
   upstream  https://github.com/PrudhviRaavi/GradeMate.git (push)
   ```

---

## 🖥️ Step 3 — Set Up the Project Locally

Since GradeMate is a static website (no build step needed), setup is simple.

**Option A — Open directly in browser:**
1. In your file explorer, navigate to the `GradeMate` folder.
2. Double-click `index.html` to open it in your browser.
3. ⚠️ **Note**: Some features (like LocalStorage) may not work correctly with `file://` URLs.

**Option B — Use a local dev server (Recommended):**
1. Make sure Node.js is installed.
2. In your terminal, run:
   ```bash
   npx -y http-server . -p 8080
   ```
3. Open your browser and go to: **[http://localhost:8080](http://localhost:8080)**
4. The site will now run exactly as it does in production.

**Option C — Use VS Code Live Server:**
1. Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) for VS Code.
2. Open the `GradeMate` folder in VS Code.
3. Right-click `index.html` → **"Open with Live Server"**.
4. Your browser will automatically reload whenever you save a file.

---

## 🌿 Step 4 — Create a Feature Branch

**Never work directly on the `main` branch.** Always create a new branch for your changes.

1. First, make sure your local `main` is up-to-date:
   ```bash
   git checkout main
   git pull upstream main
   ```

2. Create and switch to a new branch. Use a descriptive name:
   ```bash
   # For a new feature:
   git checkout -b feature/add-dark-mode

   # For a bug fix:
   git checkout -b fix/mobile-navbar-overflow

   # For documentation:
   git checkout -b docs/update-readme
   ```

3. Confirm you're on your new branch:
   ```bash
   git branch
   ```
   The currently active branch will be marked with `*`.

---

## ✍️ Step 5 — Make Your Changes

Now you can edit the code! Here's an overview of the key files:

| File | What it does |
| :--- | :--- |
| `index.html` | Homepage — hero, features, testimonials, contact |
| `utilities.html` | All 6 calculators in a tabbed layout |
| `how_to_use.html` | Guides and interactive tools |
| `styles.css` | All global styles and responsive design |
| `script.js` | All JavaScript logic (calculators, navigation, charts) |
| `useful_links.html` | Quick links page |
| `faq.html` | FAQ accordion page |
| `disclaimer.html` | Disclaimer page |
| `terms.html` | Terms and Conditions page |
| `credits.html` | Credits/attribution page |

**Best practices while making changes:**
- Keep changes focused. One Pull Request = One feature or fix.
- Follow the existing code style (see [Coding Standards](#-coding-standards) below).
- Do NOT minify or obfuscate any code.
- Add comments to explain complex logic.
- Do NOT add inline styles to HTML if a CSS class can be used instead.

---

## 🧪 Step 6 — Test Your Changes

Before committing, **thoroughly test your changes** on both mobile and desktop:

**Desktop Testing:**
- [ ] Open the page at full width (1280px+)
- [ ] Check all navigational links still work
- [ ] Test the specific calculator or page you modified
- [ ] Confirm no layout shifts or overflows

**Mobile Testing:**
- [ ] Open Chrome DevTools (`F12`) → click the device icon (Toggle Device Toolbar)
- [ ] Test at 375px width (iPhone SE)
- [ ] Test at 390px width (iPhone 14)
- [ ] Test at 768px width (iPad)
- [ ] Confirm the hamburger menu opens and closes
- [ ] Confirm no content overflows its container horizontally

**Feature-Specific Testing:**
- [ ] If modifying a calculator: Test with valid inputs, edge cases (0, max values), and invalid inputs
- [ ] If modifying CSS: Check that existing styles on other pages are not broken
- [ ] If modifying JavaScript: Open the browser console (`F12` → Console) and confirm zero errors

---

## 💾 Step 7 — Commit Your Changes

Good commit messages make the project history easy to read and understand.

1. Check which files you've changed:
   ```bash
   git status
   ```

2. Stage the files you want to include in the commit:
   ```bash
   # Stage a specific file:
   git add styles.css

   # Stage all changed files:
   git add .
   ```

3. Write a clear, descriptive commit message using this format:
   ```bash
   git commit -m "Type: Short description of what you did"
   ```

   **Commit message types:**
   | Type | When to use |
   | :--- | :--- |
   | `Add:` | Adding a new feature or file |
   | `Fix:` | Fixing a bug |
   | `Update:` | Updating existing functionality |
   | `Docs:` | Documentation only changes |
   | `Style:` | CSS/design changes that don't affect logic |
   | `Refactor:` | Code restructuring without changing behavior |

   **Good examples:**
   ```
   Fix: Prevent testimonial cards from overflowing on mobile
   Add: Dark mode toggle with LocalStorage persistence
   Style: Increase font-size for better readability on small screens
   Docs: Add FAQ entry for CGPA calculation
   ```

---

## 📤 Step 8 — Push to Your Fork

Send your committed changes up to GitHub on your fork:

```bash
git push origin your-branch-name
```

For example:
```bash
git push origin fix/mobile-navbar-overflow
```

If this is your first push for this branch, Git might ask you to set the upstream:
```bash
git push --set-upstream origin your-branch-name
```

---

## 📬 Step 9 — Open a Pull Request

1. Go to **your fork** on GitHub.

2. You should see a yellow banner saying **"Compare & pull request"** — click it.
   - If you don't see it, go to the **"Pull requests"** tab and click **"New pull request"**.

3. Make sure:
   - **Base repository**: `PrudhviRaavi/GradeMate` / **Base branch**: `main`
   - **Head repository**: `YOUR-USERNAME/GradeMate` / **Compare branch**: your feature branch

4. Fill in the Pull Request form:
   - **Title**: Clear and descriptive (same as your commit message)
   - **Description**: Explain *what* you changed and *why*. Include screenshots if it's a UI change.

5. Click **"Create Pull Request"**.

6. Wait for the maintainer to review. Please be patient — feedback may take a few days.
   - If changes are requested, make them on the same branch and push again. The PR will update automatically.

---

## 🐛 Reporting Bugs

If you found a bug but don't want to fix it yourself, please open a GitHub Issue:

1. Go to: [https://github.com/PrudhviRaavi/GradeMate/issues](https://github.com/PrudhviRaavi/GradeMate/issues)
2. Click **"New Issue"**.
3. Include the following details:
   - **What happened?** (describe the bug clearly)
   - **What did you expect to happen?**
   - **Steps to reproduce** (numbered list)
   - **Your browser and device** (e.g., Chrome 121 on Android 13)
   - **Screenshot or video** (highly helpful!)

---

## 💡 Suggesting Features

Have an idea for a new feature?

1. Go to: [https://github.com/PrudhviRaavi/GradeMate/issues](https://github.com/PrudhviRaavi/GradeMate/issues)
2. Click **"New Issue"** and label it as a feature request.
3. Describe your idea clearly:
   - What is the feature?
   - Why is it useful to students?
   - Does it align with GradeMate's philosophy (client-side, no dependencies)?

---

## 📐 Coding Standards

### HTML
- Use semantic elements (`<section>`, `<nav>`, `<header>`, `<footer>`, `<article>`)
- Always include `alt` text on images
- Keep indentation at **4 spaces**
- Use lowercase for all tag names and attributes

### CSS
- Use existing CSS variables (`--primary-color`, `--accent-color`, etc.) instead of hardcoding color values
- Add mobile styles using `@media (max-width: 768px)` and `@media (max-width: 480px)`
- Avoid `!important` unless absolutely necessary
- Group related rules together with a comment header

### JavaScript
- Use `const` and `let` — never `var`
- Write descriptive variable and function names
- Always add a `// comment` to explain non-obvious logic
- Do NOT use external libraries. Vanilla JavaScript only.
- Handle edge cases (e.g., what happens if a field is empty or has an invalid value?)

---

## 📁 Project Structure

```
GradeMate/
├── index.html              # Homepage
├── utilities.html          # All calculators
├── how_to_use.html         # User guide
├── useful_links.html       # Quick links
├── faq.html                # FAQ page
├── disclaimer.html         # Disclaimer
├── terms.html              # Terms & Conditions
├── credits.html            # Credits
├── styles.css              # All global styles
├── script.js               # All JavaScript logic
├── README.md               # Project overview
├── CONTRIBUTING.md         # This file
└── LICENSE                 # MIT License
```

---

Thank you so much for taking the time to contribute to GradeMate! 🎓

Every improvement — no matter how small — makes this tool better for thousands of students. We appreciate you! ❤️
