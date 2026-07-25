document.addEventListener('DOMContentLoaded', () => {
  const btnFillAll = document.getElementById('btn-fill-all');
  const btnFillCredentials = document.getElementById('btn-fill-credentials');
  const btnOptions = document.getElementById('btn-options');
  const statusEl = document.getElementById('popup-status');

  const valEmail = document.getElementById('val-email');
  const valPhone = document.getElementById('val-phone');

  let activeProfile = null;

  // Load Profile from Storage
  chrome.storage.local.get(['profile'], (result) => {
    if (result.profile) {
      activeProfile = result.profile;
      if (valEmail && activeProfile.credentials && activeProfile.credentials.email) {
        valEmail.textContent = activeProfile.credentials.email;
      }
      if (valPhone && activeProfile.personal && activeProfile.personal.phone) {
        valPhone.textContent = activeProfile.personal.phone;
      }
    }
  });

  // Action: Fill All Details
  btnFillAll.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "TRIGGER_AUTOFILL", mode: "ALL" }, () => {
          statusEl.textContent = "⚡ Form auto-fill signal sent!";
          setTimeout(() => window.close(), 1200);
        });
      }
    });
  });

  // Action: Fill Credentials Only
  btnFillCredentials.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "TRIGGER_AUTOFILL", mode: "CREDENTIALS" }, () => {
          statusEl.textContent = "🔑 Gmail & Password signal sent!";
          setTimeout(() => window.close(), 1200);
        });
      }
    });
  });

  // Action: Learn & Save Page Inputs
  const btnLearnFields = document.getElementById('btn-learn-fields');
  if (btnLearnFields) {
    btnLearnFields.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { action: "TRIGGER_LEARN" }, () => {
            statusEl.textContent = "🧠 Learn fields signal sent!";
            setTimeout(() => window.close(), 1200);
          });
        }
      });
    });
  }

  // Action: Open Options Manager
  btnOptions.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Quick Copy Event Listeners
  setupCopyChip('copy-email', () => activeProfile?.credentials?.email || activeProfile?.personal?.email);
  setupCopyChip('copy-password', () => activeProfile?.credentials?.password);
  setupCopyChip('copy-phone', () => activeProfile?.personal?.phone);
  setupCopyChip('copy-linkedin', () => activeProfile?.personal?.linkedin);

  function setupCopyChip(elementId, getValueFn) {
    const chip = document.getElementById(elementId);
    if (!chip) return;

    chip.addEventListener('click', () => {
      const val = getValueFn();
      if (val) {
        navigator.clipboard.writeText(val).then(() => {
          statusEl.textContent = `📋 Copied to clipboard!`;
          setTimeout(() => statusEl.textContent = "Ready to auto-fill", 2000);
        });
      } else {
        statusEl.textContent = `⚠️ Field not set in options`;
      }
    });
  }
});
