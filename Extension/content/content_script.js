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

        // Instant Email Auto-Fill on Load
        setTimeout(() => performInstantEmailAutoFill(), 300);

        // Attach Agreement Checkbox Listeners
        setTimeout(() => setupAgreementCheckboxListeners(), 500);

        // Auto-Navigation Engine & Auto-Auth Trigger
        setTimeout(() => setupAutoNavigationEngine(), 600);

        // Attach Focus Listener for Email Fields
        document.addEventListener('focusin', (e) => {
          if (e.target && e.target.tagName === 'INPUT') {
            performInstantEmailAutoFill(e.target);
          }
        });

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
      // 1. Direct Workday data-automation-id matching (Strict 1:1)
      const automationId = el.getAttribute('data-automation-id');
      let match = null;

      if (automationId) {
        match = window.UniversalMatcher.matchWorkdayAutomationId(automationId, currentProfile);
      }

      // 2. Fallback to general semantic matcher ONLY if not a core Workday automation ID field
      if (!match) {
        match = window.UniversalMatcher.matchField(el, currentProfile, mode);
      }

      if (match && match.value !== undefined && match.value !== null) {
        // If it's a Workday Core field with an empty string (""), inject empty string and skip Q&A matching
        if (match.isWorkdayCore && match.value === "") {
          setNativeValue(el, "");
          return;
        }

        if (match.value !== "") {
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
      }
    });

    // 3. Workday Custom Dropdowns & Select Widgets (Application Questions & Voluntary Disclosures)
    if (currentProfile?.screening && Array.isArray(currentProfile.screening)) {
      const customDropdowns = Array.from(document.querySelectorAll('[data-automation-id="selectWidget"], div[role="combobox"], button[aria-haspopup="listbox"], [data-automation-id*="prompt"]'));

      customDropdowns.forEach(widget => {
        if (!isElementVisible(widget)) return;

        // Skip Workday Core dropdowns (like countryRegion or phone-device-type) from screening Q&A fuzzy matching
        const automationId = widget.getAttribute('data-automation-id');
        if (automationId && window.UniversalMatcher.matchWorkdayAutomationId(automationId, currentProfile)) {
          return;
        }

        const labelText = window.UniversalMatcher.getElementLabelText(widget);
        if (!labelText) return;

        currentProfile.screening.forEach(item => {
          if (!item.keywords || !item.answer) return;
          const keywords = item.keywords.toLowerCase().split(',').map(k => k.trim());
          const isMatched = keywords.some(kw => kw && labelText.includes(kw));

          if (isMatched) {
            const success = handleWorkdayDropdown(labelText, item.answer);
            if (success) filledCount++;
          }
        });
      });
    }

    if (filledCount > 0) {
      showToast(`Auto-filled ${filledCount} field${filledCount > 1 ? 's' : ''} successfully!`, "success");
    } else {
      showToast(`No new fields matched for auto-fill on this page.`, "info");
    }
  }

  /**
   * Workday Custom Dropdown Handler (React Select Widgets)
   * Navigates Workday custom dropdowns for Application Questions & Voluntary Disclosures
   */
  function handleWorkdayDropdown(questionText, answerToSelect) {
    if (!questionText || !answerToSelect) return false;
    const cleanQuestion = questionText.toLowerCase().trim();
    const cleanAnswer = answerToSelect.toString().toLowerCase().trim();

    // Step A: Locate the question label / legend using XPath
    let dropdownTrigger = null;

    try {
      const xpathQuery = `//*[self::label or self::legend or self::span or self::div][contains(translate(normalize-space(text()), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${cleanQuestion.replace(/"/g, '')}")]`;
      const xpathResult = document.evaluate(xpathQuery, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

      for (let i = 0; i < xpathResult.snapshotLength; i++) {
        const labelNode = xpathResult.snapshotItem(i);
        if (!isElementVisible(labelNode)) continue;

        // Step B: Find closest sibling or child button representing the dropdown
        const container = labelNode.closest('.form-group, fieldset, div[data-automation-id*="formField"], div[class*="FormField"], form > div, div');
        if (container) {
          dropdownTrigger = container.querySelector('[data-automation-id="selectWidget"], [data-automation-id*="prompt"], div[role="combobox"], button[aria-haspopup="listbox"], button[aria-haspopup="menu"], [data-automation-id="activeMenuButton"]');
          if (dropdownTrigger && isElementVisible(dropdownTrigger)) break;
        }
      }
    } catch (e) {}

    // Fallback: If no direct trigger found via label XPath, scan visible select widgets on page directly
    if (!dropdownTrigger) {
      const widgets = Array.from(document.querySelectorAll('[data-automation-id="selectWidget"], div[role="combobox"], button[aria-haspopup="listbox"], [data-automation-id*="prompt"]'));
      dropdownTrigger = widgets.find(w => {
        if (!isElementVisible(w)) return false;
        const text = window.UniversalMatcher.getElementLabelText(w);
        return text.includes(cleanQuestion);
      });
    }

    if (!dropdownTrigger) return false;

    // Step B (Execution): Execute a .click() on the dropdown trigger element
    dropdownTrigger.click();

    // Step C: Wrap the next step in a setTimeout of 300ms to allow React DOM to render the dropdown listbox
    setTimeout(() => {
      // Step D: Query the newly rendered listbox
      const optionElements = Array.from(document.querySelectorAll('ul[role="listbox"] li, div[role="listbox"] div[role="option"], [data-automation-id="selectWidget-list"] li, div[data-automation-id*="promptOption"], li[role="option"], div[role="option"]'));

      if (optionElements.length === 0) return;

      // Step E: Find an item whose text matches answerToSelect
      const matchedOption = optionElements.find(opt => {
        const optText = (opt.textContent || opt.getAttribute('aria-label') || '').toLowerCase().trim();
        return optText === cleanAnswer || optText.includes(cleanAnswer) || cleanAnswer.includes(optText);
      });

      if (matchedOption) {
        matchedOption.click();
        highlightField(dropdownTrigger);
        showToast(`📝 Workday Dropdown: Selected "${matchedOption.textContent.trim()}"`, "success");
      }
    }, 300);

    return true;
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

  // Master Action Engine (Alt+S): Intelligent Sign-Up & Auto-Login Routing
  function performAutoSignUp() {
    if (!currentProfile) {
      chrome.runtime.sendMessage({ action: "GET_PROFILE" }, (response) => {
        if (response && response.profile) {
          currentProfile = response.profile;
          executeMasterAction();
        }
      });
    } else {
      executeMasterAction();
    }
  }

  function executeMasterAction() {
    chrome.runtime.sendMessage({ action: "GET_REGISTERED_DOMAINS" }, (response) => {
      const registeredDomains = (response && response.registeredDomains) ? response.registeredDomains : (currentProfile?.registeredDomains || []);
      const hostname = window.location.hostname.toLowerCase();

      const isRegistered = registeredDomains.some(d => d.toLowerCase() && (hostname.includes(d.toLowerCase()) || d.toLowerCase().includes(hostname)));

      // Dual-Mode Auth Detection: Check if confirmPassword / verify password input exists on screen
      const confirmPassEl = document.querySelector('[data-automation-id="confirmPassword"]') ||
                            Array.from(document.querySelectorAll('input[type="password"]')).find(el => {
                              const txt = window.UniversalMatcher.getElementLabelText(el);
                              return txt.includes('verify') || txt.includes('confirm') || txt.includes('re-enter');
                            });
      const isCreateAccountMode = confirmPassEl && isElementVisible(confirmPassEl);

      if (isRegistered || !isCreateAccountMode) {
        // Mode B (Sign In): Auto-fill saved credentials and submit login
        executeLoginFlow(hostname);
      } else {
        // Mode A (Create Account): Auto-fill registration, check terms, submit & register domain
        executeSignUpFlow(hostname);
      }
    });
  }

  function executeLoginFlow(hostname) {
    executeFill("CREDENTIALS");
    executeConsentAutoCheck();
    showToast(`🔑 Recognized Auth Form on ${hostname}! Auto-signing in...`, "success");

    // 500ms React State Delay: Guarantees Workday React virtual DOM has fully registered injected values
    setTimeout(() => {
      const loginBtn = findLoginSubmitButton();
      if (loginBtn) {
        showToast(`🔑 Signing into ${hostname}...`, "success");
        loginBtn.click();
      } else {
        showToast(`⚠️ Filled credentials, but could not locate Sign In submit button.`, "info");
      }
    }, 500);
  }

  function executeSignUpFlow(hostname) {
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

    // 2. Consent Auto-Check Engine (Terms & Conditions / Privacy Policy Checkboxes)
    fieldsFilled += executeConsentAutoCheck();

    // 3. Register hostname to Domain Memory Engine
    chrome.runtime.sendMessage({ action: "REGISTER_DOMAIN", domain: hostname });

    showToast(`🚀 Account registration filled! Saved ${hostname} to Memory Engine.`, "success");

    // 4. Auto-Submit Sign-Up Form if enabled
    if (currentProfile.settings && currentProfile.settings.autoSubmitSignUp !== false) {
      setTimeout(() => {
        const submitBtn = findSignUpSubmitButton();
        if (submitBtn) {
          showToast(`🚀 Submitting account creation...`, "success");
          submitBtn.click();
        }
      }, 500);
    }
  }

  // Consent Auto-Check Engine: Automatically accepts terms, privacy policy & consent checkboxes
  function executeConsentAutoCheck() {
    if (currentProfile?.settings?.autoCheckTerms === false) return 0;

    let checkedCount = 0;
    // Scan both native input checkboxes and ARIA role="checkbox" elements (Workday / SPAs)
    const checkboxElements = Array.from(document.querySelectorAll('input[type="checkbox"], [role="checkbox"]'));

    checkboxElements.forEach(cb => {
      const isConsent = window.UniversalMatcher.isConsentCheckbox(cb);
      if (isConsent) {
        if (cb.tagName === 'INPUT') {
          if (!cb.checked) {
            cb.checked = true;
            cb.dispatchEvent(new Event('change', { bubbles: true }));
            cb.dispatchEvent(new Event('input', { bubbles: true }));

            // Workday / SPA compatibility: Simulate direct click on associated label or parent wrapper
            const label = cb.id ? document.querySelector(`label[for="${CSS.escape(cb.id)}"]`) : null;
            if (label && isElementVisible(label)) {
              label.click();
            } else if (cb.parentElement && isElementVisible(cb.parentElement)) {
              cb.parentElement.click();
            } else {
              cb.click();
            }

            highlightField(cb);
            checkedCount++;
          }
        } else {
          // Custom div/span with role="checkbox"
          const isAriaChecked = cb.getAttribute('aria-checked') === 'true';
          if (!isAriaChecked) {
            cb.setAttribute('aria-checked', 'true');
            cb.dispatchEvent(new Event('change', { bubbles: true }));
            cb.dispatchEvent(new Event('input', { bubbles: true }));
            if (isElementVisible(cb)) {
              cb.click();
            }
            highlightField(cb);
            checkedCount++;
          }
        }
      }
    });

    if (checkedCount > 0) {
      showToast(`📝 Consent Auto-Check Engine: Auto-accepted ${checkedCount} terms & privacy checkbox(es)!`, "success");
    }

    return checkedCount;
  }

  // Find Login Submit Button with Workday Selectors & XPath Fallback
  function findLoginSubmitButton() {
    // 1. Broadened Workday / SPA query selectors
    const signInBtn = document.querySelector(
      '[data-automation-id="signInSubmitButton"], ' +
      'button[aria-label="Sign In"], ' +
      'div[data-automation-id="click_filter"], ' +
      '[data-automation-id="click_sub"], ' +
      '[data-automation-id="signInButton"], ' +
      '[data-automation-id="loginSubmitButton"]'
    );
    if (signInBtn && isElementVisible(signInBtn)) return signInBtn;

    // 2. Query visible candidate buttons by keyword
    const candidates = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a.btn, [role="button"], div[role="button"]'));
    const targetKeywords = ['sign in', 'log in', 'login', 'signin', 'log-in', 'sign-in', 'continue', 'submit'];

    for (const kw of targetKeywords) {
      const btn = candidates.find(b => {
        const txt = (b.textContent || b.value || b.getAttribute('aria-label') || b.getAttribute('data-automation-id') || '').toLowerCase().trim();
        return txt.includes(kw) && isElementVisible(b);
      });
      if (btn) return btn;
    }

    // 3. XPath fallback for visible buttons containing exact text "Sign In"
    try {
      const xpathResult = document.evaluate(
        '//*[self::button or self::div or self::a or self::input][translate(normalize-space(text()), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz")="sign in" or contains(translate(normalize-space(text()), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "sign in")]',
        document,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      for (let i = 0; i < xpathResult.snapshotLength; i++) {
        const node = xpathResult.snapshotItem(i);
        if (isElementVisible(node)) return node;
      }
    } catch (e) {}

    const formSubmit = document.querySelector('form input[type="submit"], form button[type="submit"]');
    return (formSubmit && isElementVisible(formSubmit)) ? formSubmit : null;
  }

  // Find Sign-Up Submit Button
  function findSignUpSubmitButton() {
    // 1. Workday specific automation ID queries
    const workdayBtn = document.querySelector('[data-automation-id="createAccountSubmitButton"], [data-automation-id="click_sub"], [data-automation-id="registerSubmitButton"]');
    if (workdayBtn && isElementVisible(workdayBtn)) return workdayBtn;

    // 2. Query visible candidate buttons by keyword
    const candidates = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a.btn, [role="button"]'));
    const targetKeywords = ['create account', 'sign up', 'signup', 'register', 'create profile', 'join now', 'complete registration', 'submit'];

    for (const kw of targetKeywords) {
      const btn = candidates.find(b => {
        const txt = (b.textContent || b.value || b.getAttribute('aria-label') || b.getAttribute('data-automation-id') || '').toLowerCase().trim();
        return txt.includes(kw) && isElementVisible(b);
      });
      if (btn) return btn;
    }

    // Fallback to first form submit button
    const formSubmit = document.querySelector('form input[type="submit"], form button[type="submit"]');
    return (formSubmit && isElementVisible(formSubmit)) ? formSubmit : null;
  }

  // Setup Agreement Checkbox Listeners (Auto-click Next/Submit when "I agree with..." is checked)
  function setupAgreementCheckboxListeners() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      if (cb.dataset.autofillListenerAttached) return;
      cb.dataset.autofillListenerAttached = "true";

      cb.addEventListener('change', function() {
        if (!this.checked) return;
        if (currentProfile?.settings?.autoSubmitOnAgreement === false) return;

        const labelText = window.UniversalMatcher.getElementLabelText(this);
        if (
          labelText.includes('agree') ||
          labelText.includes('agree with') ||
          labelText.includes('terms') ||
          labelText.includes('privacy') ||
          labelText.includes('consent') ||
          labelText.includes('condition')
        ) {
          setTimeout(() => {
            const nextBtn = findNextOrSubmitButton();
            if (nextBtn) {
              showToast(`⏩ Agreement checked! Auto-clicking ${nextBtn.textContent.trim() || 'Next'}...`, "success");
              nextBtn.click();
            }
          }, 300);
        }
      });
    });
  }

  // Find Next / Submit / Continue / Save Button
  function findNextOrSubmitButton() {
    const candidates = Array.from(document.querySelectorAll('button, input[type="submit"], a.btn, [role="button"]'));
    const targetKeywords = ['next', 'continue', 'save & continue', 'save and continue', 'submit', 'create account', 'register', 'sign up', 'apply'];

    for (const kw of targetKeywords) {
      const btn = candidates.find(b => {
        const txt = (b.textContent || b.value || b.getAttribute('aria-label') || '').toLowerCase().trim();
        return txt.includes(kw) && b.offsetWidth > 0 && b.offsetHeight > 0;
      });
      if (btn) return btn;
    }

    return document.querySelector('form button[type="submit"], form input[type="submit"]') || null;
  }

  // Instant Email Auto-Filler on Field Focus or Load
  function performInstantEmailAutoFill(targetInput = null) {
    if (currentProfile?.settings?.instantEmailAutoFill === false) return;

    const emailVal = currentProfile?.credentials?.email || currentProfile?.personal?.email;
    if (!emailVal) return;

    const inputs = targetInput ? [targetInput] : Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"])'));

    inputs.forEach(el => {
      if (el.value) return; // Don't overwrite if user already typed
      const labelText = window.UniversalMatcher.getElementLabelText(el);
      const type = (el.type || '').toLowerCase();

      if (
        type === 'email' ||
        labelText.includes('communicate with you') ||
        labelText.includes('email address') ||
        labelText.includes('email id') ||
        labelText.includes('work email') ||
        labelText.includes('gmail') ||
        labelText.includes('e-mail')
      ) {
        setNativeValue(el, emailVal);
        highlightField(el);
        showToast(`⚡ Instant Email Auto-Filled!`, "success");
      }
    });
  }

  let autoNavObserver = null;
  let navDebounceTimer = null;

  // Auto-Navigation Engine & Workday Bypass
  function setupAutoNavigationEngine() {
    // Scan for high-priority Workday "Apply Manually" bypass
    scanWorkdayBypass();

    if (currentProfile?.settings?.autoAuthEnabled !== false) {
      checkAndTriggerAutoAuth();
    }

    // Setup MutationObserver for dynamic SPAs (Workday, Greenhouse, Lever, etc.)
    if (!autoNavObserver) {
      autoNavObserver = new MutationObserver(() => {
        clearTimeout(navDebounceTimer);
        navDebounceTimer = setTimeout(() => {
          scanWorkdayBypass();
          if (currentProfile?.settings?.autoAuthEnabled !== false) {
            checkAndTriggerAutoAuth();
          }
        }, 350);
      });

      autoNavObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }

  // Workday Modal Bypass: "Apply Manually"
  function scanWorkdayBypass() {
    if (currentProfile?.settings?.autoNavigateEnabled === false) return;

    const candidates = Array.from(document.querySelectorAll('button, a, input[type="submit"], input[type="button"], [role="button"]'));

    const applyManuallyBtn = candidates.find(el => {
      if (el.dataset.autofillNavClicked === "true") return false;
      const text = (el.textContent || el.value || el.getAttribute('aria-label') || '').toLowerCase().trim();
      return text.includes('apply manually') && isElementVisible(el);
    });

    if (applyManuallyBtn) {
      applyManuallyBtn.dataset.autofillNavClicked = "true";
      showToast(`⚡ Workday Bypass: Auto-clicking "Apply Manually"...`, "success");
      setTimeout(() => {
        applyManuallyBtn.click();
      }, 300);
    }
  }

  // On-Demand Automation Trigger (Start Automation Button)
  function performStartAutomation() {
    const validPhrases = [
      'apply', 'apply now', 'apply online', 'apply for job', 'apply for a job',
      'apply for this job', 'apply for position', 'apply to job', 'apply today',
      'start application', 'apply manually', 'submit application'
    ];
    const negativeWords = ['filter', 'search', 'save', 'login', 'sign in', 'remove', 'delete', 'share', 'help', 'menu'];

    // 1. Broaden Selector Scope & Collect Candidates
    let candidates = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]'));

    // Check same-origin iframes for embedded ATS forms (Barclays, Workday, Taleo, Phenom)
    try {
      const iframes = Array.from(document.querySelectorAll('iframe'));
      iframes.forEach(iframe => {
        try {
          if (iframe.contentDocument) {
            const iframeCandidates = Array.from(iframe.contentDocument.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]'));
            candidates.push(...iframeCandidates);
          }
        } catch (e) {
          // Cross-origin iframe, ignore
        }
      });
    } catch (e) {}

    // Sort candidates: prioritize elements within <main>, article, [role="main"], #content, .job-details
    candidates.sort((a, b) => {
      const aInMain = a.closest('main, article, [role="main"], #content, .job-details, .job-description') ? 1 : 0;
      const bInMain = b.closest('main, article, [role="main"], #content, .job-details, .job-description') ? 1 : 0;
      return bInMain - aInMain;
    });

    // 2 & 3. Flexible Text Matching & Visibility Check
    const applyBtn = candidates.find(el => {
      if (!isElementVisible(el)) return false;
      const btnText = (el.textContent || el.value || el.getAttribute('aria-label') || el.getAttribute('title') || '').toLowerCase().trim();

      if (!btnText) return false;

      // Filter negative words first
      if (negativeWords.some(word => btnText.includes(word))) return false;

      // Match criteria: Exact valid phrase OR startsWith("apply")
      const isMatch = validPhrases.includes(btnText) ||
                      (btnText.startsWith('apply') && !negativeWords.some(word => btnText.includes(word)));

      return isMatch;
    });

    if (applyBtn) {
      const displayBtnText = (applyBtn.textContent || applyBtn.value || applyBtn.getAttribute('aria-label') || 'Apply').trim();
      applyBtn.dataset.autofillNavClicked = "true";
      showToast(`🔥 Start Automation: Clicking "${displayBtnText}"...`, "success");
      setTimeout(() => {
        applyBtn.click();
      }, 300);
    } else {
      // 4. Silence Chrome Warnings: Use console.info instead of console.warn to prevent Extension errors
      console.info("Universal Auto-Fill Engine: No 'Apply' button found on current page.");
      showToast(`⚠️ No 'Apply' button found on current page.`, "error");
    }
  }

  let lastHandledFormId = null;

  function checkAndTriggerAutoAuth() {
    if (currentProfile?.settings?.autoAuthEnabled === false) return;

    const passwordInputs = Array.from(document.querySelectorAll('input[type="password"]'));
    const isPasswordVisible = passwordInputs.some(el => isElementVisible(el));

    const pageText = (document.body.innerText || '').toLowerCase();
    const hasAuthForm = isPasswordVisible ||
      pageText.includes('create account') ||
      pageText.includes('sign in') ||
      pageText.includes('log in') ||
      pageText.includes('register your account') ||
      pageText.includes('verify new password') ||
      pageText.includes('verify password');

    // Create a unique form key based on current URL path + visible password input count
    const formKey = `${window.location.pathname}_${passwordInputs.length}_${isPasswordVisible ? 'pw' : 'nopw'}`;

    if (hasAuthForm) {
      if (sessionStorage.getItem('autoAuthFormKey') === formKey || lastHandledFormId === formKey) {
        return;
      }

      sessionStorage.setItem('autoAuthFormKey', formKey);
      lastHandledFormId = formKey;

      // Consent Auto-Check Engine (Terms & Conditions / Privacy Policy Checkboxes)
      executeConsentAutoCheck();

      showToast(`🔑 Auth Page Detected! Auto-triggering Login / Sign-Up...`, "success");
      setTimeout(() => {
        performAutoSignUp();
      }, 500);
    }
  }

  function isElementVisible(el) {
    if (!el) return false;
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

  // Listen for Messages from Popup / Service Worker
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "START_AUTOMATION") {
      performStartAutomation();
      sendResponse({ status: "AUTOMATION_STARTED" });
    } else if (request.action === "TRIGGER_AUTOFILL") {
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
