# Universal Company Portal Auto-Fill Engine - Changelog

All notable changes, updates, version history, and features for the Universal Company Portal Auto-Fill Extension are documented in this file.

## [1.12.0] - 2026-08-03

### 🔑 Workday Create Account Auto-Auth & Attribute Engine
- **Dynamic Form Key Tracking (`content/content_script.js`)**:
  - Replaced global `sessionStorage` boolean lock with dynamic `formKey` (`pathname + pw_count + visibility`) tracking.
  - Ensures auto-auth automatically fires when Workday transitions from the job description page to the `Create Account` / `Sign In` view.
- **Workday `data-automation-id` Support (`content/matcher.js`)**:
  - Enhanced `getElementLabelText` and `isConsentCheckbox` to extract and evaluate Workday's native `data-automation-id` attributes (`data-automation-id="email"`, `data-automation-id="password"`, `data-automation-id="confirmPassword"`, `data-automation-id="createAccountCheckbox"`).

---

## [1.11.0] - 2026-08-03

### 🎯 Advanced Apply Button Hunter & Extension Health
- **Broadened Selector Scope (`content/content_script.js`)**:
  - Upgraded `performStartAutomation()` to query `button, a, input[type="button"], input[type="submit"], [role="button"]`.
  - Smart container prioritization (`<main>`, `article`, `[role="main"]`, `#content`, `.job-details`) ensures proper button selection over headers, sidebars, and control menus on modern ATS platforms (IQVIA, Workday, Greenhouse, Lever).
- **Flexible Text & Title Matching**:
  - Detects `"apply"`, `"apply now"`, `"apply online"`, `"apply for this job"`, `"apply for position"`, `"start application"`, and `"apply manually"` across text content, values, `aria-label`, and `title` attributes.
- **Element Visibility Check**:
  - Enforces `isElementVisible(el)` (`offsetWidth > 0 && offsetHeight > 0`) to prevent clicking hidden mobile menus or template elements.
- **Chrome Extension Warning Silencing**:
  - Replaced `console.warn` when no apply button is found with `console.info` to prevent Chrome's Extension Management page (`chrome://extensions`) from flagging warnings as extension errors.

---

## [1.10.0] - 2026-08-03

### 📝 Consent Auto-Check Engine (Terms & Privacy Auto-Acceptance)
- **Semantic Checkbox Matching (`content/matcher.js`)**:
  - Added new Consent & Terms matching category to detect terms, conditions, privacy policy, and data processing checkboxes.
  - Included keywords: `"consent"`, `"terms"`, `"agree"`, `"processing of my personal data"`, `"acknowledge"`, `"terms of service"`, `"privacy policy"`, `"accept"`, `"condition"`, `"legal statement"`.
- **Workday & SPA Custom Checkbox Support (`content/content_script.js` & `content/matcher.js`)**:
  - Scans native `<input type="checkbox">` elements and custom ARIA `role="checkbox"` elements.
  - Programmatically sets `.checked = true` / `aria-checked = true`, dispatches synthetic `change` and `input` events.
  - Simulates direct click events on associated `<label>` and wrapper `div` elements to handle styled custom checkboxes in Workday and modern SPAs.
- **Auto-Auth & Master Action Sequence Injection (`content/content_script.js`)**:
  - Injected `executeConsentAutoCheck()` immediately before auto-submitting in `executeSignUpFlow`, `executeLoginFlow`, and `checkAndTriggerAutoAuth`.
  - Operates seamlessly within the `sessionStorage` loop protection framework.

---

## [1.9.1] - 2026-08-01

### 🛠️ Hotfix: Manifest Loading Error & Shortcut Cleanup
- **Manifest Cleanup (`manifest.json`)**:
  - Removed the entire `"commands"` block to resolve Chrome's 4-command limit load error (`MAX_COMMANDS_PER_EXTENSION_EXCEEDED`).
  - Ensured strictly valid JSON with no trailing commas.
- **Background Script Cleanup (`background/background.js`)**:
  - Removed the `chrome.commands.onCommand.addListener` block since commands are no longer registered in manifest.
- **Popup UI Text Cleanup (`popup/popup.html`)**:
  - Removed keyboard shortcut indicators (`(Alt+A)`, `(Alt+S)`, `(Alt+F)`, `(Alt+G)`, `(Alt+L)`) from button subtexts to prevent user confusion.

---

## [1.9.0] - 2026-08-01

### 🔥 On-Demand "Start Automation Engine" (`Alt+A`)
- **On-Demand Initiation Button (`popup/popup.html`, `popup/popup.js`, `popup/popup.css`)**:
  - Added prominent action button **"Start Automation Engine"** at the top of the popup UI.
  - Styled with a warm sunrise orange/red gradient (`linear-gradient(135deg, #ff512f, #dd2476)`).
  - Subtext: *"Find & click 'Apply' on this page (Alt+A)"*.
- **Keyboard Shortcut (`manifest.json` & `background/background.js`)**:
  - Registered **`Alt+A`** (Mac: `Command+Shift+A`) command to trigger `START_AUTOMATION`.
- **Content Script Refactoring (`content/content_script.js`)**:
  - Removed aggressive automatic scanning for generic "Apply Now" buttons on page load to prevent unwanted clicks while browsing.
  - Retained automated **Workday Modal Bypass** (`"Apply Manually"` auto-click) on dynamic modals.
  - Implemented `performStartAutomation()` with **Smart Selector Logic**: prioritizes buttons within `<main>`, `article`, or main job detail containers over sidebars and headers.
  - Added clear console warnings (`console.warn`) and toast feedback if no "Apply" button is found on page.

---

## [1.8.0] - 2026-08-01

### 🔑 Auto-Auth Trigger (Automatic Master Action Execution)
- **Automatic Auth Form Detection (`content/content_script.js`)**:
  - Scans DOM and `MutationObserver` stream for password inputs (`<input type="password">`) or form titles matching `"Create Account"`, `"Sign In"`, `"Log In"`, `"Register"`, `"Verify Password"`, `"Verify New Password"`.
  - Automatically executes the Master Action (`Alt+S` routing logic) as soon as an authentication form renders, eliminating manual shortcut presses.
- **Enhanced Field Matching (`content/matcher.js`)**:
  - Added explicit target support for `"Verify New Password"` and `"Confirm Password"` fields commonly found on Workday account creation forms.
- **Strict Debouncing & Infinite Loop Protection (`content/content_script.js`)**:
  - Implemented `sessionStorage.setItem('autoAuthTriggered', 'true')` flag to guarantee auto-fill and auto-submit run **exactly once** per page load/session.
- **Domain Memory Integration & Settings Toggle (`options/options.html`, `options/options.js`, `background/background.js`)**:
  - Seamlessly integrates with the Domain Memory Engine to intelligently switch between Login Mode (registered domains) and Sign-Up Mode (unregistered domains).
  - Added new toggle in Profile Manager settings: **`Auto-Trigger Login & Sign-Up on Auth Pages`** (Default: `true`).

---

## [1.7.0] - 2026-08-01

### 🚀 Auto-Navigation Engine (Job Application Auto-Initiation)
- **DOM Scanner & SPA Support (`content/content_script.js`)**:
  - Implemented automatic DOM scanning and `MutationObserver` to auto-detect and click job application initiation buttons.
  - **Target 1 (Job Description Page)**: Automatically detects and clicks buttons matching `"Apply Now"`, `"Apply for this job"`, or `"Apply"`.
  - **Target 2 (Workday / Application Modals)**: Automatically detects and clicks `"Apply Manually"` when Workday modals appear to bypass resume parsing and launch the form immediately.
  - Built-in MutationObserver debouncing and double-click prevention (`data-autofill-nav-clicked`) to support dynamic Single-Page Applications (Workday, Greenhouse, Lever, Indeed).
- **Settings Toggle (`options/options.html`, `options/options.js`, `background/background.js`)**:
  - Added new toggle in Profile Manager settings: **`Auto-Click 'Apply Now' and 'Apply Manually' on Job Pages`** (Default: `true`).

---

## [1.6.0] - 2026-08-01

### 📅 Work Experience & Education Date Inputs Refactoring
- **Structured Month & Year Inputs (`options/options.html` & `options/options.js`)**:
  - Replaced generic static "Years of Experience" and "Graduation Year" inputs with structured date grids.
  - **From Date**: Month dropdown (`January` - `December`) and Year input (`YYYY`).
  - **To Date**: Month dropdown (`January` - `December`) and Year input (`YYYY`).
  - **Current Checkboxes**: `"I currently work here"` (Work Experience) and `"I currently study here"` (Education).
- **Dynamic UI Interactions (`options/options.js` & `options/options.css`)**:
  - Checking `"I currently work here"` or `"I currently study here"` automatically dims and disables the "To Date" Month and Year inputs.
- **State Management & Backward Compatibility (`options/options.js` & `background/background.js`)**:
  - Profile objects now store `startMonth`, `startYear`, `endMonth`, `endYear`, and `isCurrent` (boolean).
  - Automatically converts legacy `yearsExperience` or `graduationYear` values to the new format seamlessly.
- **Enhanced Matching Engine (`content/matcher.js`)**:
  - Detects portal date fields: `"Start Month"`, `"Start Year"`, `"End Month"`, `"End Year"`, `"From Date"`, `"To Date"`, `"Graduation Month"`, `"Graduation Year"`.
  - **Dynamic Fallback Calculation**: If a portal asks for total "Years of Experience", the matcher dynamically calculates total years based on From/To dates across work entries.

---

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
