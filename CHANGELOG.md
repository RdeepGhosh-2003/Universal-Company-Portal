# Universal Company Portal Auto-Fill Engine - Changelog

All notable changes, updates, version history, and features for the Universal Company Portal Auto-Fill Extension are documented in this file.

## [1.2.0] - 2026-07-25

### 🚀 Auto Sign-Up, Account Creation & Auto-Submit Engine
- **Auto Registration Engine (`content/content_script.js` & `background/background.js`)**:
  - Automatically completes multi-step company portal registration and sign-up forms.
  - Pre-fills email/gmail, passwords, name, phone, and username across account creation pages.
  - **Auto Terms & Privacy Acceptance**: Detects and auto-checks required agreement checkboxes (`Terms & Conditions`, `Privacy Policy`, `User Agreements`).
  - **Smart Registration Submit Finder**: Locates and automatically clicks primary account creation buttons (*Create Account*, *Sign Up*, *Register*, *Join Now*, *Submit*).
- **Keyboard Shortcut (`Alt+S`)**:
  - Introduced **`Alt+S`** shortcut for 1-click auto sign-up and registration submission.
- **Popup & Context Menu Integration**:
  - Added emerald green primary action button **`🚀 Auto Sign-Up & Register`** in the extension popup menu.
  - Added context menu option **`🚀 Auto Sign-Up & Register Account`**.
- **Dashboard Settings Controls**:
  - Added toggles in Profile Manager settings for **`Auto-check Terms & Privacy Policy`** and **`Auto-submit sign-up forms`**.

---

## [1.1.0] - 2026-07-25

### 🧠 "Learn as You Go" Memory Engine
- **Field Memory & Learning (`content/content_script.js` & `background/background.js`)**:
  - Automatically captures user-typed inputs and answers on company portals.
  - Extracts clean field keywords from input labels, placeholders, and aria attributes.
  - Dynamically saves new keyword-to-answer rules to your local screening Q&A memory (`chrome.storage.local`).
- **Keyboard Shortcut (`Alt+L`)**:
  - Introduced **`Alt+L`** shortcut to trigger instant field learning on any page.
- **Popup & Context Menu Integration**:
  - Added purple accent button **`🧠 Learn & Save Page Inputs`** in the extension popup menu.
  - Added context menu option **`🧠 Learn & Save Fields on Current Page`**.
- **Visual Learning Feedback**:
  - Highlights newly learned form fields in vibrant purple (`#a855f7`) with toast notifications confirming learned count.

---

## [1.0.1] - 2026-07-25

### 🔧 Git Integration & Automated Documentation Updates
- **Version Control Initialization**:
  - Initialized dedicated Git repository inside `Universal Company Portal`.
  - Configured local Git user identity (`Rajdeep Ghosh`).
  - Added `.gitignore` to exclude system artifacts (`.DS_Store`, `desktop.ini`, `Thumbs.db`, `.env.local`, `node_modules/`).
  - Staged and committed initial extension codebase, options dashboard, popup interface, and background scripts.
- **Documentation Workflow**:
  - Established continuous Git tracking rule: every code change and feature update will be committed to Git and documented in `CHANGELOG.md` and `README.md`.

---

## [1.0.0] - 2026-07-25

### 🚀 Initial Release - Universal Auto-Fill Engine

#### Key Features Introduced:
- **Manifest V3 Architecture**:
  - Full compatibility with Google Chrome, Microsoft Edge, Brave, Vivaldi, and Opera browsers.
  - Background Service Worker (`background/background.js`) handling keyboard shortcuts, context menus, and storage synchronization.
  - Universal domain matching (`<all_urls>`) allowing auto-fill across any company career portal, Workday, Taleo, Greenhouse, Lever, iCIMS, SmartRecruiters, or custom sign-up form.

- **Universal Auto-Fill Engine (`content/matcher.js` & `content/content_script.js`)**:
  - **Account Registration & Login**: Auto-fills Gmail/Email and Password instantly (triggered via `Alt+G` or popup menu).
  - **Personal Details**: First Name, Last Name, Full Name, Phone, Address, City, State, Country, Zip Code, LinkedIn, GitHub, Portfolio URL.
  - **Work Experience & Target Role**: Current Job Title, Company, Total Years of Experience, Current CTC, Expected CTC, Target Job Title, Target Location, Notice Period.
  - **Education History**: Degree, Major/Specialization, University/College, Graduation Year, GPA/Percentage.
  - **Custom Screening Q&A**: Keyword matching engine to auto-fill common portal questions (Notice Period, Relocation, Work Authorization, Advanced Excel experience).
  - **Framework Compatibility**: Synthetic event dispatching (`input`, `change`, `blur`) ensuring React, Vue, Angular, and custom JavaScript state frameworks accept filled values.

- **Sleek Extension Popup (`popup/`)**:
  - Dark glassmorphism UI.
  - Quick action buttons: `⚡ Auto-Fill Portal Form (Alt+F)` and `🔑 Fill Gmail & Password (Alt+G)`.
  - Fast-copy clipboard chips for Email, Password, Phone, and LinkedIn URL.
  - Instant link to Profile Manager settings.

- **Profile & Password Manager Dashboard (`options/`)**:
  - Full tabbed management dashboard for Logins/Credentials, Personal Info, Work & Target Role, Education, and Screening Q&A Bank.
  - **Custom Screening Rules**: Add/remove unlimited keyword-to-answer mapping rules.
  - **Backup & Restore**: Export profile to `autofill_profile_backup.json` and import from JSON.
  - **Extension Settings**: Toggles for field highlighting, floating widget button, and page load auto-fill.

- **Visual Feedback & Floating Widget**:
  - Filled input fields display a smooth mint green outline (`#10b981`) and subtle highlight effect.
  - Bottom-right toast notifications confirming filled field count.
  - Optional floating widget button (`⚡ Auto-Fill`) on active application pages.
