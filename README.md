# ⚡ Universal Company Portal Auto-Fill Engine

> **Universal Browser Extension (Manifest V3)** for automatically filling account registration credentials (Gmail & Password), personal info, work history, education details, and screening questions across company career portals and job application sites.

---

## 📌 Features & Overview

- 🔑 **Instant Sign-up & Login**: Eliminates repetitive typing of Gmail and passwords across new company portals and account creation forms.
- ⚡ **1-Click Portal Auto-Fill**: Automatically populates multi-page job applications (Workday, Greenhouse, Lever, Taleo, iCIMS, SmartRecruiters, custom corporate career sites).
- 🧠 **Smart Semantic Field Detection**: Sub-millisecond label parsing engine matching input names, labels, aria attributes, placeholders, and data-testids.
- ⚙️ **Comprehensive Profile Manager**: Dedicated options dashboard to manage your credentials, personal info, work experience, education, and custom screening Q&A bank.
- 🔒 **100% Privacy & Security**: All credentials and data remain strictly local inside your browser (`chrome.storage.local`). No external servers, API keys, or cloud tracking.
- 📋 **Fast Clipboard Copy Toolbar**: Copy Email, Password, Phone, or LinkedIn links with a single click from the extension popup.

---

## 📂 Directory Structure

```
Universal Company Portal/
├── CHANGELOG.md               # Version history and detailed changelog
├── README.md                  # Project overview, setup, and usage instructions
└── Extension/                 # Manifest V3 browser extension codebase
    ├── manifest.json          # Extension configuration & permissions (<all_urls>)
    ├── background/
    │   └── background.js      # Background service worker & shortcut command handler
    ├── content/
    │   ├── matcher.js         # Sub-millisecond label parsing & field matching engine
    │   ├── content_script.js  # Synthetic DOM event dispatcher & auto-fill runner
    │   └── content_style.css  # Highlights, floating widget, and toast notification CSS
    ├── popup/
    │   ├── popup.html         # Sleek dark-mode popup interface
    │   ├── popup.css          # Glassmorphic UI styling
    │   └── popup.js           # Trigger actions & quick-copy functionality
    ├── options/
    │   ├── options.html       # Full profile, credentials & screening Q&A manager
    │   ├── options.css        # Tabbed dashboard layout styling
    │   └── options.js         # Storage logic, rule builder & JSON export/import
    └── icons/                 # Extension toolbar and branding icons (16, 48, 128)
```

---

## 🛠️ How to Install in Your Browser

1. Open **Google Chrome**, **Microsoft Edge**, or any Chromium browser.
2. Go to the Extensions page:
   - **Chrome**: `chrome://extensions`
   - **Edge**: `edge://extensions`
   - **Brave**: `brave://extensions`
3. Enable **Developer mode** (toggle switch in the top-right corner).
4. Click **Load unpacked**.
5. Select the `Extension` directory:
   `c:\Users\KIIT\OneDrive\Documents\Automate Jobs\Universal Company Portal\Extension`
6. Pin the extension icon ⚡ to your browser toolbar for quick access.

---

## 🚀 How to Use

### 1. 🔑 Account Registration & Login Auto-Fill
- Whenever you are creating an account on a new company portal or logging in:
  - Press **`Alt + G`** on your keyboard, OR
  - Click the extension icon ⚡ and press **"Fill Gmail & Password"**.
- Automatically fills your saved email/gmail and account password into login/signup forms.

### 2. ⚡ Complete Portal & Application Auto-Fill
- When filling out candidate details on a job portal or career page:
  - Press **`Alt + F`** on your keyboard, OR
  - Click the extension icon ⚡ and hit **"Auto-Fill Portal Form"**.
- Automatically fills:
  - **Personal Info**: First Name, Last Name, Full Name, Email, Phone, Address, City, State, Country, Zip, LinkedIn, GitHub, Portfolio.
  - **Work Experience**: Job Title, Company, Total Experience, Salary/CTC, Location, Responsibilities across stored work entries.
  - **Education**: Degree, Major, University, Graduation Year, GPA.
  - **Screening Q&A**: Answers common questions like Notice Period, Relocation, Work Authorization, and Excel skills.

### 3. ⚙️ Managing Profile, Passwords, Dates & Work Experience
- Right-click the extension icon and select **"Manage Auto-Fill Profile & Passwords"**, OR click the **⚙️** icon in the popup.
- **Structured Date Grids**: Configure From Date (Month/Year) & To Date (Month/Year) or toggle `"I currently work here"` / `"I currently study here"` checkboxes for Work & Education entries.
- **Multi-Work Experience**: Add and manage multiple current & past job experiences (`+ Add Work Experience` button).
- **Add Custom Screening Rules**: Click `+ Add Rule` under the *Screening Q&A* tab to pair keywords (e.g. `python, pandas`) with your desired answer.
- **Backup & Restore**: Use `📥 Export Profile JSON` and `📤 Import Profile JSON` to back up or restore your data.

### 4. 🧠 "Learn as You Go" Memory Engine
- When you type answers into new fields on a company portal that haven't been saved yet:
  - Press **`Alt + L`** on your keyboard, OR
  - Click the popup button **`🧠 Learn & Save Page Inputs`**, OR
  - Right-click and choose **`🧠 Learn & Save Fields on Current Page`**.
- The extension automatically extracts keywords from the field labels, pairs them with your typed answer, and saves them to your Q&A memory. Next time you visit any portal with similar questions, it auto-fills automatically!

### 5. 🌐 Domain Memory Engine & Master Action Workflow (`Alt + S`)
- Pressing **`Alt + S`** (or clicking **`🚀 Auto Sign-Up & Register`**) executes intelligent Master Action routing:
  - **Unregistered Domain (Sign-Up Mode)**: Fills registration details, checks Terms & Conditions, submits account creation, and saves the portal hostname to the Domain Memory Engine.
  - **Registered Domain (Login Mode)**: Automatically fills saved Gmail & Password credentials and clicks the primary **Log In** / **Sign In** button!
- **Manage Registered Portals**: View, manually add (`+ Register Domain`), or delete registered domains anytime under the *Logins & Credentials* tab in the Profile Manager.

### 6. ⚡ Instant Email Auto-Fill & Agreement Auto-Submit
- **Instant Email Auto-Fill**: Automatically fills your saved Gmail / Email into inputs containing label/subtext like `"Email Address *"`, `"This is how we'll communicate with you."`, `"Work Email"`, or `"Email ID"` as soon as the page loads or when you focus on the field!
- **Auto-Submit on Agreement Check**: Whenever you click/check an agreement checkbox (`"I agree with..."`, `"Terms & Conditions"`, `"Privacy Policy"`), the extension automatically triggers the primary **Next**, **Submit**, **Continue**, **Save & Continue**, or **Create Account** button!

### 7. 🔥 On-Demand "Start Automation Engine"
- **On-Demand Initiation**: Click **`🔥 Start Automation Engine`** in the popup to find and click the primary "Apply", "Apply Now", "Apply for job", "Apply Online", or "Apply Manually" button on any ATS job board page (Barclays, IQVIA, Workday, Greenhouse, Lever, Indeed).
- **Advanced Apply Button Hunter**: Queries buttons, links, input buttons, and ARIA roles across main content areas (`<main>`, `article`) and embedded ATS iframes.
- **Dynamic Text Matching**: Matches exact phrases or any button starting with `"apply"` (while filtering negative terms like `"search"`, `"save"`, `"login"`).
- **Element Visibility Check**: Ensures target elements are visible on page (`offsetWidth > 0 && offsetHeight > 0`) before clicking.
- **Workday Modal Bypass**: Retains automated `"Apply Manually"` auto-click when Workday modals appear to bypass resume parsing.

### 8. 🔑 Auto-Auth Trigger (Automatic Master Action Execution)
- **Automatic Execution**: Detects account creation / login forms (`<input type="password">`, "Create Account", "Sign In", "Verify New Password") and triggers Master Action routing (`Alt+S`) automatically.
- **Workday Account Support**: Fills Email, Password, and "Verify New Password" fields seamlessly.
- **Loop Protection**: Uses a `sessionStorage` flag to guarantee execution runs **exactly once** per page load.
- **Settings Toggle**: Enable/disable under Profile Manager -> Settings -> **`Auto-Trigger Login & Sign-Up on Auth Pages`**.

### 9. 📝 Consent Auto-Check Engine (Terms & Privacy Auto-Acceptance)
- **Semantic Checkbox Matching**: Automatically detects checkboxes for consent, terms of service, privacy policy, and personal data processing.
- **Workday & SPA Custom Checkbox Support**: Handles native `<input type="checkbox">` and custom `role="checkbox"` elements with label/wrapper click simulation.
- **Seamless Auto-Auth Pipeline**: Executes immediately prior to form submission during account registration and login sequences.

---

## ⚡ Extension Action Buttons Summary

| Action Button | Feature | Description |
| :--- | :--- | :--- |
| **🔥 Start Automation Engine** | **Start Application** | On-demand scan & click primary "Apply" button on job page |
| **🚀 Auto Sign-Up & Register** | **Master Action Routing** | Auto Sign-Up on new portals / Auto Log-In on registered domains |
| **⚡ Auto-Fill Portal Form** | **Auto-Fill Entire Form** | Auto-fills all candidate, work, education & screening fields on current page |
| **🔑 Fill Gmail & Password** | **Fill Credentials Only** | Fills email and password fields specifically for sign-ups and logins |
| **🧠 Learn & Save Page Inputs** | **Learn & Save Fields** | Scans typed inputs on page and saves new field rules to Q&A memory |

---

## 💡 Troubleshooting & Tips

- **Form values not registering on React/Angular sites?**
  - The extension dispatches native `input`, `change`, and `blur` events so framework-controlled forms update automatically. If a custom field is missed, click into the input or use the **Quick Copy** chips in the extension popup.
- **How to update default login credentials?**
  - Open the Profile Manager (Options page) -> **Logins & Credentials** tab -> update **Gmail / Login Email** and **Account Password** -> click **💾 Save Profile**.

---

## 🐙 Git Version Control & Maintenance

- Every small change, fix, and feature update in `Universal Company Portal` is tracked in Git.
- **Commit History**: Check `git log` or [`CHANGELOG.md`](file:///c:/Users/KIIT/OneDrive/Documents/Automate%20Jobs/Universal%20Company%20Portal/CHANGELOG.md) to inspect version updates.
- **Documentation Policy**: All codebase modifications automatically sync with `README.md` and `CHANGELOG.md`.

