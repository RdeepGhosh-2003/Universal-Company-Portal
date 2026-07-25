/**
 * Universal Auto-Fill Engine - Core Content Script
 * Executes dynamic field matching and synthetic event dispatching
 */

(function() {
  let currentProfile = null;
  let toastElement = null;

  // Initialize: Fetch User Profile from Extension Storage
  function init() {
    chrome.runtime.sendMessage({ action: "GET_PROFILE" }, (response) => {
      if (response && response.profile) {
        currentProfile = response.profile;

        // Add Floating Widget if enabled
        if (currentProfile.settings && currentProfile.settings.showFloatingWidget !== false) {
          injectFloatingWidget();
        }

        // Auto fill on load if enabled
        if (currentProfile.settings && currentProfile.settings.autoFillOnLoad) {
          setTimeout(() => performAutoFill("ALL"), 800);
        }
      }
    });
  }

  // Helper: Dispatch events to make React / Angular / Vue framework forms accept filled values
  function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  // Handle Dropdown (<select>) elements
  function setSelectValue(selectEl, targetValue) {
    const options = Array.from(selectEl.options);
    const targetLower = String(targetValue).toLowerCase().trim();

    // 1. Exact match on value or text
    let matchedOption = options.find(opt => 
      opt.value.toLowerCase().trim() === targetLower || 
      opt.text.toLowerCase().trim() === targetLower
    );

    // 2. Partial / Fuzzy match
    if (!matchedOption) {
      matchedOption = options.find(opt => 
        opt.text.toLowerCase().includes(targetLower) || 
        targetLower.includes(opt.text.toLowerCase().trim())
      );
    }

    if (matchedOption) {
      selectEl.value = matchedOption.value;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
      selectEl.dispatchEvent(new Event('blur', { bubbles: true }));
      return true;
    }

    return false;
  }

  // Handle Radio & Checkbox elements
  function setRadioOrCheckbox(inputEl, targetValue) {
    const targetLower = String(targetValue).toLowerCase().trim();
    const isYes = targetLower === 'yes' || targetLower === 'true' || targetLower === 'immediate';
    const isNo = targetLower === 'no' || targetLower === 'false';

    const labelText = window.UniversalMatcher.getElementLabelText(inputEl);

    if (isYes && (labelText.includes('yes') || inputEl.value.toLowerCase() === 'yes')) {
      inputEl.checked = true;
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    } else if (isNo && (labelText.includes('no') || inputEl.value.toLowerCase() === 'no')) {
      inputEl.checked = true;
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }

    return false;
  }

  // Highlight filled element visually
  function highlightField(el) {
    if (currentProfile.settings && currentProfile.settings.highlightFilledFields === false) return;
    
    el.classList.add('autofill-highlight-filled');
    setTimeout(() => {
      el.classList.remove('autofill-highlight-filled');
    }, 2500);
  }

  // Display Toast Notification at bottom-right
  function showToast(message, type = "success") {
    if (!toastElement) {
      toastElement = document.createElement('div');
      toastElement.className = 'autofill-toast-notification';
      document.body.appendChild(toastElement);
    }

    toastElement.innerHTML = `
      <div class="autofill-toast-content">
        <span class="autofill-toast-icon">${type === 'success' ? '⚡' : 'ℹ️'}</span>
        <span class="autofill-toast-text">${message}</span>
      </div>
    `;
    toastElement.classList.add('show');

    setTimeout(() => {
      if (toastElement) toastElement.classList.remove('show');
    }, 3000);
  }

  // Core Auto-Fill Loop
  function performAutoFill(mode = "ALL") {
    if (!currentProfile) {
      chrome.runtime.sendMessage({ action: "GET_PROFILE" }, (response) => {
        if (response && response.profile) {
          currentProfile = response.profile;
          executeFill(mode);
        }
      });
    } else {
      executeFill(mode);
    }
  }

  function executeFill(mode) {
    let filledCount = 0;

    // Scan input, select, textarea elements
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"]), select, textarea');

    inputs.forEach(el => {
      const match = window.UniversalMatcher.matchField(el, currentProfile, mode);
      if (match && match.value !== undefined && match.value !== null && match.value !== "") {
        const tagName = el.tagName.toLowerCase();
        const type = (el.type || '').toLowerCase();

        let filledSuccess = false;

        if (tagName === 'select') {
          filledSuccess = setSelectValue(el, match.value);
        } else if (type === 'radio' || type === 'checkbox') {
          filledSuccess = setRadioOrCheckbox(el, match.value);
        } else {
          setNativeValue(el, match.value);
          filledSuccess = true;
        }

        if (filledSuccess) {
          filledCount++;
          highlightField(el);
        }
      }
    });

    if (filledCount > 0) {
      showToast(`Auto-filled ${filledCount} field${filledCount > 1 ? 's' : ''} successfully!`, "success");
    } else {
      showToast(`No new fields matched for auto-fill on this page.`, "info");
    }
  }

  // Inject Floating Widget Button
  function injectFloatingWidget() {
    if (document.getElementById('autofill-floating-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'autofill-floating-widget';
    widget.className = 'autofill-floating-widget';
    widget.title = 'Universal Auto-Fill Portal Form (Alt+F)';
    widget.innerHTML = `
      <div class="autofill-widget-inner">
        <span class="autofill-widget-icon">⚡</span>
        <span class="autofill-widget-label">Auto-Fill</span>
      </div>
    `;

    widget.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      performAutoFill("ALL");
    });

    document.body.appendChild(widget);
  }

  // Learn-as-You-Go Scanner Engine
  function performLearnFields() {
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"]):not([type="password"]), select, textarea');
    const newFieldsToLearn = [];

    inputs.forEach(el => {
      const val = (el.value || '').trim();
      if (!val) return;

      // Skip standard passwords
      if ((el.type || '').toLowerCase() === 'password') return;

      const labelText = window.UniversalMatcher.getElementLabelText(el);
      if (!labelText || labelText.length < 2) return;

      // Clean keywords from label text (remove common filler words)
      const keywords = labelText
        .replace(/[?:*!]/g, '')
        .replace(/\b(please|enter|your|select|choose|type|input|here|field|the|a|an)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (keywords.length >= 3 && val.length >= 1) {
        newFieldsToLearn.push({
          keywords: keywords,
          answer: val
        });

        // Highlight learned field in purple accent
        el.style.outline = '2px solid #a855f7';
        el.style.outlineOffset = '1px';
        setTimeout(() => {
          el.style.outline = '';
          el.style.outlineOffset = '';
        }, 3000);
      }
    });

    if (newFieldsToLearn.length > 0) {
      chrome.runtime.sendMessage({ action: "LEARN_NEW_FIELDS", newFields: newFieldsToLearn }, (res) => {
        if (res && res.count > 0) {
          showToast(`🧠 Learned & saved ${res.count} new field rule${res.count > 1 ? 's' : ''} to memory!`, "success");
        } else {
          showToast(`ℹ️ All filled field rules are already saved in memory.`, "info");
        }
      });
    } else {
      showToast(`⚠️ No filled input fields found to learn on this page. Type your answers first!`, "info");
    }
  }

  // Auto Sign-Up & Account Creation Engine
  function performAutoSignUp() {
    if (!currentProfile) {
      chrome.runtime.sendMessage({ action: "GET_PROFILE" }, (response) => {
        if (response && response.profile) {
          currentProfile = response.profile;
          executeSignUp();
        }
      });
    } else {
      executeSignUp();
    }
  }

  function executeSignUp() {
    let fieldsFilled = 0;

    // 1. Auto Fill credentials & basic personal info
    const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
    inputs.forEach(el => {
      const match = window.UniversalMatcher.matchField(el, currentProfile, "ALL");
      if (match && match.value) {
        setNativeValue(el, match.value);
        fieldsFilled++;
        highlightField(el);
      }
    });

    // 2. Auto-Check Terms & Conditions / Privacy Policy Checkboxes
    if (currentProfile.settings && currentProfile.settings.autoCheckTerms !== false) {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(cb => {
        const labelText = window.UniversalMatcher.getElementLabelText(cb);
        if (
          labelText.includes('terms') || 
          labelText.includes('privacy') || 
          labelText.includes('agree') || 
          labelText.includes('accept') || 
          labelText.includes('condition') ||
          labelText.includes('policy')
        ) {
          cb.checked = true;
          cb.dispatchEvent(new Event('change', { bubbles: true }));
          cb.dispatchEvent(new Event('click', { bubbles: true }));
          highlightField(cb);
          fieldsFilled++;
        }
      });
    }

    showToast(`🚀 Account registration form filled (${fieldsFilled} fields)!`, "success");

    // 3. Auto-Submit Sign-Up Form if enabled
    if (currentProfile.settings && currentProfile.settings.autoSubmitSignUp !== false) {
      setTimeout(() => {
        const submitBtn = findSignUpSubmitButton();
        if (submitBtn) {
          showToast(`🚀 Submitting account creation...`, "success");
          submitBtn.click();
        }
      }, 900);
    }
  }

  // Find Sign-Up Submit Button
  function findSignUpSubmitButton() {
    const candidates = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn, [role="button"]'));
    const targetKeywords = ['create account', 'sign up', 'signup', 'register', 'create profile', 'join now', 'complete registration', 'submit'];

    for (const kw of targetKeywords) {
      const btn = candidates.find(b => {
        const txt = (b.textContent || b.value || b.getAttribute('aria-label') || '').toLowerCase().trim();
        return txt.includes(kw);
      });
      if (btn) return btn;
    }

    // Fallback to first form submit button
    const formSubmit = document.querySelector('form input[type="submit"], form button[type="submit"]');
    return formSubmit || null;
  }

  // Listen for Messages from Popup / Service Worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "TRIGGER_AUTOFILL") {
      performAutoFill(request.mode || "ALL");
      sendResponse({ status: "STARTED" });
    } else if (request.action === "TRIGGER_LEARN") {
      performLearnFields();
      sendResponse({ status: "LEARNING_STARTED" });
    } else if (request.action === "TRIGGER_SIGNUP") {
      performAutoSignUp();
      sendResponse({ status: "SIGNUP_STARTED" });
    } else if (request.action === "UPDATE_PROFILE") {
      currentProfile = request.profile;
      sendResponse({ status: "UPDATED" });
    }
  });

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
