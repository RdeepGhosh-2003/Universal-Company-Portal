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

  // Listen for Messages from Popup / Service Worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "TRIGGER_AUTOFILL") {
      performAutoFill(request.mode || "ALL");
      sendResponse({ status: "STARTED" });
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
