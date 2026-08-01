# Universal Company Portal Auto-Fill Engine - Changelog

All notable changes, updates, version history, and features for the Universal Company Portal Auto-Fill Extension are documented in this file.

## [1.5.0] - 2026-08-01

### 🌐 Domain Memory Engine & Master Action Routing (`Alt+S`)
- **Domain Memory Engine (`background/background.js` & `content/content_script.js`)**:
  - Automatically initializes and manages a `registeredDomains` array in `chrome.storage.local`.
  - Automatically registers the active portal hostname after executing a successful account sign-up flow.
- **Intelligent Master Action Workflow (`Alt+S`)**:
  - Bound **`Alt+S`** command, popup sign-up button, and context menu to the new Master Action routing engine.
  - **Login Mode (Registered Domain)**: If current hostname exists in `registeredDomains`, automatically pre-fills saved Gmail/password and clicks the primary **"Log In"** / **"Sign In"** button!
  - **Sign-Up Mode (Unregistered Domain)**: If domain is not registered, completes registration details, checks Terms & Conditions, submits account creation, and registers domain to memory.
- **Registered Portals UI (`options/options.html` & `options/options.js`)**:
  - Added new section card **"Registered Portals (Domain Memory Engine)"** in Profile Manager.
  - Dynamically renders all registered domains with a **Delete** (`🗑️ Delete`) button for easy domain management.
  - Added **`+ Register Domain`** button allowing users to manually register portal hostnames.

---

## [1.4.0] - 2026-08-01

### 💼 Multi-Work Experience Manager & UI Streamlining
- **Multi-Work Experience Support (`options/options.html` & `options/options.js`)**:
  - Removed "Target Role Preferences" section from Profile Manager.
  - Renamed tab to **`💼 Work Experience`**.
  - Added dynamic multi-work experience builder (`+ Add Work Experience` button), allowing users to store multiple job entries (Company Name, Job Title, Experience Years, Salary/CTC, Location, and Responsibilities).
  - Updated storage schema to maintain `workExperiences` array while preserving backward compatibility for `work.currentRole`.
- **Floating Overlay Widget Removal**:
  - Completely removed the on-page floating overlay button (`.autofill-floating-widget`) and `injectFloatingWidget()` code to keep web pages clean and unobtrusive.
  - Form auto-fill remains accessible via keyboard shortcut **`Alt+F`**, extension toolbar popup icon ⚡, and right-click context menu.

---

## [1.3.0] - 2026-07-25

### ⚡ Instant Email Auto-Fill & Agreement Auto-Submit Engine
- **Instant Email Auto-Filler (`content/content_script.js` & `content/matcher.js`)**:
  - Automatically pre-fills your saved Gmail / Email address into fields as soon as they are loaded or focused!
  - Expanded email matcher dictionary to recognize field subtext instructions such as `"This is how we'll communicate with you."`, `"Email Address *"`, `"Work Email"`, and `"Email ID"`.
  - Added setting toggle: **`Instant Auto-fill Email on Focus / Page Load`** in Profile Manager.
- **Auto-Click Next / Submit on Agreement Checkbox (`content/content_script.js`)**:
  - Dynamic event listener on agreement checkboxes (`"I agree with..."`, `"Terms & Conditions"`, `"Privacy Policy"`).
  - Whenever you check an agreement checkbox, the extension automatically finds and clicks the primary **`Next`**, **`Submit`**, **`Continue`**, **`Save & Continue`**, or **`Create Account`** button on the page!
  - Added setting toggle: **`Auto-click Next / Submit when Agreement checkbox is checked`** in Profile Manager.

---

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
