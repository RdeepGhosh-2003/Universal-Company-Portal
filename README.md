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
  - Click the extension popup and hit **"Auto-Fill Portal Form"**, OR
  - Click the floating **⚡ Auto-Fill** widget at the bottom-right of the page.
- Automatically fills:
  - **Personal Info**: First Name, Last Name, Full Name, Email, Phone, Address, City, State, Country, Zip, LinkedIn, GitHub, Portfolio.
  - **Work Experience**: Job Title, Company, Total Experience, Current CTC, Expected CTC, Target Role, Target Location, Notice Period.
  - **Education**: Degree, Major, University, Graduation Year, GPA.
  - **Screening Q&A**: Answers common questions like Notice Period, Relocation, Work Authorization, and Excel skills.

### 3. ⚙️ Managing Profile, Passwords & Custom Screening Q&A
- Right-click the extension icon and select **"Manage Auto-Fill Profile & Passwords"**, OR click the **⚙️** icon in the popup.
- Navigate through tabs to update your information.
- **Add Custom Screening Rules**: Click `+ Add Rule` under the *Screening Q&A* tab to pair keywords (e.g. `python, pandas`) with your desired answer.
- **Backup & Restore**: Use `📥 Export Profile JSON` and `📤 Import Profile JSON` to back up or restore your data.

---

## 🎹 Keyboard Shortcuts Summary

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`Alt + F`** | **Auto-Fill Entire Form** | Auto-fills all candidate, work, education & screening fields on current page |
| **`Alt + G`** | **Fill Gmail & Password** | Fills email and password fields specifically for sign-ups and logins |

---

## 💡 Troubleshooting & Tips

- **Form values not registering on React/Angular sites?**
  - The extension dispatches native `input`, `change`, and `blur` events so framework-controlled forms update automatically. If a custom field is missed, click into the input or use the **Quick Copy** chips in the extension popup.
- **How to update default login credentials?**
  - Open the Profile Manager (Options page) -> **Logins & Credentials** tab -> update **Gmail / Login Email** and **Account Password** -> click **💾 Save Profile**.
