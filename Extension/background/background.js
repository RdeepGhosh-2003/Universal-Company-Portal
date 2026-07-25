/**
 * Universal Auto-Fill Engine - Background Service Worker (Manifest V3)
 */

// Default Candidate & Portal Profile
const DEFAULT_PROFILE = {
  credentials: {
    email: "rajdeep@example.com",
    password: "",
    altEmail: "",
    username: "rajdeepghosh"
  },
  personal: {
    fullName: "Rajdeep Ghosh",
    firstName: "Rajdeep",
    lastName: "Ghosh",
    phone: "9876543210",
    address: "123 Tech Park Road",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    zipCode: "560001",
    linkedin: "https://linkedin.com/in/rajdeepghosh",
    github: "https://github.com/rajdeepghosh",
    portfolio: "https://rajdeepghosh.dev"
  },
  work: {
    currentRole: {
      jobTitle: "MIS Analyst",
      company: "Durga Bearings Co. Pvt Ltd",
      yearsExperience: "1",
      currentSalary: "450000"
    },
    targetRole: {
      jobTitle: "MIS Analyst",
      targetLocation: "Bengaluru",
      expectedSalary: "600000",
      noticePeriod: "Immediate",
      workMode: "Hybrid"
    }
  },
  education: {
    degree: "Bachelor of Technology",
    major: "Computer Science / IT",
    university: "ABC University",
    graduationYear: "2022",
    gpa: "8.5"
  },
  screening: [
    {
      keywords: "excel, advanced excel, vlookup, pivot table",
      answer: "Yes, extensive experience with Advanced Excel, VLOOKUP, XLOOKUP, and Pivot Tables."
    },
    {
      keywords: "relocate, relocation",
      answer: "Yes"
    },
    {
      keywords: "notice period, how soon, join, availability",
      answer: "Immediate"
    },
    {
      keywords: "authorized, legal, work permit, eligibility",
      answer: "Yes"
    },
    {
      keywords: "sponsorship, require visa",
      answer: "No"
    }
  ],
  settings: {
    autoFillOnLoad: false,
    autoAdvanceStep: false,
    autoCheckTerms: true,
    autoSubmitSignUp: true,
    autoSubmitOnAgreement: true,
    instantEmailAutoFill: true,
    highlightFilledFields: true,
    showFloatingWidget: true
  }
};

// 1. Initialize Context Menu and Storage on Install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["profile"], (result) => {
    if (!result.profile) {
      chrome.storage.local.set({ profile: DEFAULT_PROFILE });
    }
  });

  // Create Context Menus
  chrome.contextMenus.create({
    id: "fill_portal_all",
    title: "⚡ Universal Auto-Fill Entire Portal Form",
    contexts: ["editable", "page"]
  });

  chrome.contextMenus.create({
    id: "fill_portal_credentials",
    title: "🔑 Auto-Fill Gmail & Password Only",
    contexts: ["editable", "page"]
  });

  chrome.contextMenus.create({
    id: "auto_signup_portal",
    title: "🚀 Auto Sign-Up & Register Account",
    contexts: ["editable", "page"]
  });

  chrome.contextMenus.create({
    id: "learn_portal_fields",
    title: "🧠 Learn & Save Fields on Current Page",
    contexts: ["editable", "page"]
  });

  chrome.contextMenus.create({
    id: "open_portal_options",
    title: "⚙️ Manage Auto-Fill Profile & Passwords",
    contexts: ["action"]
  });
});

// 2. Handle Context Menu Clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === "fill_portal_all") {
    chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_AUTOFILL", mode: "ALL" });
  } else if (info.menuItemId === "fill_portal_credentials") {
    chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_AUTOFILL", mode: "CREDENTIALS" });
  } else if (info.menuItemId === "auto_signup_portal") {
    chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_SIGNUP" });
  } else if (info.menuItemId === "learn_portal_fields") {
    chrome.tabs.sendMessage(tab.id, { action: "TRIGGER_LEARN" });
  } else if (info.menuItemId === "open_portal_options") {
    chrome.runtime.openOptionsPage();
  }
});

// 3. Handle Keyboard Shortcuts (Alt+F, Alt+G, Alt+L, Alt+S)
chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0] || !tabs[0].id) return;
    
    if (command === "fill_form") {
      chrome.tabs.sendMessage(tabs[0].id, { action: "TRIGGER_AUTOFILL", mode: "ALL" });
    } else if (command === "fill_credentials") {
      chrome.tabs.sendMessage(tabs[0].id, { action: "TRIGGER_AUTOFILL", mode: "CREDENTIALS" });
    } else if (command === "learn_fields") {
      chrome.tabs.sendMessage(tabs[0].id, { action: "TRIGGER_LEARN" });
    } else if (command === "auto_signup") {
      chrome.tabs.sendMessage(tabs[0].id, { action: "TRIGGER_SIGNUP" });
    }
  });
});

// 4. Handle Incoming Messages from Content Script or Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_PROFILE") {
    chrome.storage.local.get(["profile"], (result) => {
      sendResponse({ profile: result.profile || DEFAULT_PROFILE });
    });
    return true; // Keep message channel open for async response
  } else if (request.action === "SAVE_PROFILE") {
    chrome.storage.local.set({ profile: request.profile }, () => {
      sendResponse({ status: "SUCCESS" });
    });
    return true;
  } else if (request.action === "LEARN_NEW_FIELDS") {
    chrome.storage.local.get(["profile"], (result) => {
      const profile = result.profile || DEFAULT_PROFILE;
      if (!profile.screening) profile.screening = [];

      let learnedCount = 0;
      request.newFields.forEach(item => {
        const kwLower = item.keywords.toLowerCase();
        // Check if rule already exists
        const exists = profile.screening.some(rule => rule.keywords.toLowerCase() === kwLower);
        if (!exists && item.keywords && item.answer) {
          profile.screening.unshift({
            keywords: item.keywords,
            answer: item.answer,
            learnedAt: new Date().toISOString()
          });
          learnedCount++;
        }
      });

      if (learnedCount > 0) {
        chrome.storage.local.set({ profile }, () => {
          sendResponse({ status: "SUCCESS", count: learnedCount });
        });
      } else {
        sendResponse({ status: "NO_NEW_FIELDS", count: 0 });
      }
    });
    return true;
  } else if (request.action === "SHOW_NOTIFICATION") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: request.title || "Universal Auto-Fill Engine",
      message: request.message || "Auto-fill completed!"
    });
  }
});
