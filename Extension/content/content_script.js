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

  // Requirement R1: React State Injection Helper with Human Interaction Simulation (Bot Evasion & Virtual DOM Sync)
  function injectReactValue(element, value) {
    if (!element) return;

    // 1. Focus element
    element.focus();

    // 2. Prototype value setter invocation
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

    // 3. Dispatch KeyboardEvent ('keydown' and 'keyup')
    try {
      element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'a' }));
      element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'a' }));
    } catch (e) {}

    // 4. Dispatch Input and Change events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));

    // 5. Blur element
    element.blur();
  }

  /**
   * Letter-by-Letter Human Typing Simulation
   * Asynchronously types text character-by-character with randomized 15-30ms delays
   * to force React Virtual DOM state managers to accept filled input values.
   * Forcefully sets exact substring on each iteration using prototype setter to override React input masks.
   */
  async function simulateHumanTyping(element, text) {
    if (!element) return;
    const strVal = String(text ?? "");

    // 1. Click element first then focus (resolves Given Name UI re-render conflict)
    try {
      element.click();
    } catch (e) {}
    element.focus();

    const inputProtoSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    const textareaProtoSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;

    const setVal = (v) => {
      const isTextarea = element.tagName.toLowerCase() === 'textarea';
      const protoSetter = isTextarea ? textareaProtoSetter : inputProtoSetter;

      if (protoSetter) {
        protoSetter.call(element, v);
      } else {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
        if (valueSetter) valueSetter.call(element, v);
        else element.value = v;
      }
    };

    // 2. Clear field completely & reset React state
    setVal("");
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));

    // 3. Iterate through string character by character with 15-30ms randomized delays
    for (let i = 0; i < strVal.length; i++) {
      const char = strVal[i];
      const currentStr = strVal.substring(0, i + 1);

      setVal(currentStr);

      try {
        element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: char, charCode: char.charCodeAt(0) }));
        element.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, key: char, charCode: char.charCodeAt(0) }));
      } catch (e) {}

      element.dispatchEvent(new Event('input', { bubbles: true }));

      try {
        element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: char, charCode: char.charCodeAt(0) }));
      } catch (e) {}

      const delay = Math.floor(Math.random() * 16) + 15;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // 3.5 Ghost Data React State Fix (Space + Backspace Simulation)
    const isPhoneField = element.type === 'tel' || (element.name && element.name.toLowerCase().includes('phone')) || (element.id && element.id.toLowerCase().includes('phone'));

    if (!isPhoneField) {
      setVal(strVal + " ");
      element.dispatchEvent(new Event('input', { bubbles: true }));
      try {
        element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: ' ', code: 'Space' }));
        element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: ' ', code: 'Space' }));
      } catch(e) {}

      await new Promise(resolve => setTimeout(resolve, 30));

      setVal(strVal);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      try {
        element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Backspace', code: 'Backspace' }));
        element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Backspace', code: 'Backspace' }));
      } catch(e) {}
    }

    // 4. 150ms delay after final keystroke before blur/change to ensure state sticks
    await new Promise(resolve => setTimeout(resolve, 150));

    // 5. Final change event & blur
    element.dispatchEvent(new Event('change', { bubbles: true }));
    element.blur();
  }

  // Expose stealth injection & human typing helpers globally on window and UniversalMatcher
  window.injectReactValue = injectReactValue;
  window.simulateHumanTyping = simulateHumanTyping;
  if (window.UniversalMatcher) {
    window.UniversalMatcher.injectReactValue = injectReactValue;
    window.UniversalMatcher.simulateHumanTyping = simulateHumanTyping;
  }

  // Helper: Dispatch events to make React / Angular / Vue framework forms accept filled values
  function setNativeValue(element, value) {
    injectReactValue(element, value);
  }

  // Helper: Diacritic & String Normalization
  function normalizeText(str) {
    if (!str) return "";
    return str
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // Handle Dropdown (<select>) elements with Diacritic Normalization
  function setSelectValue(selectEl, targetValue) {
    const options = Array.from(selectEl.options);
    const targetNorm = normalizeText(targetValue);

    // 1. Exact match on value or text
    let matchedOption = options.find(opt => 
      normalizeText(opt.value) === targetNorm || 
      normalizeText(opt.text) === targetNorm
    );

    // 2. Partial / Fuzzy match
    if (!matchedOption) {
      matchedOption = options.find(opt => 
        normalizeText(opt.text).includes(targetNorm) || 
        targetNorm.includes(normalizeText(opt.text))
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

  // Handle Radio & Checkbox elements with visual sibling & parentElement click targeting
  async function setRadioOrCheckbox(inputEl, targetValue) {
    if (!inputEl) return false;

    const targetNorm = normalizeText(targetValue);
    const isYes = targetNorm === 'yes' || targetNorm === 'true' || targetNorm === 'immediate';
    const isNo = targetNorm === 'no' || targetNorm === 'false';

    const labelText = normalizeText(window.UniversalMatcher.getElementLabelText(inputEl));
    const inputValue = normalizeText(inputEl.value);

    let isMatched = false;
    if (isYes && (labelText.includes('yes') || inputValue === 'yes')) {
      isMatched = true;
    } else if (isNo && (labelText.includes('no') || inputValue === 'no')) {
      isMatched = true;
    } else if (targetNorm && (labelText.includes(targetNorm) || targetNorm.includes(labelText) || inputValue === targetNorm)) {
      isMatched = true;
    }

    if (isMatched) {
      inputEl.checked = true;
      inputEl.dispatchEvent(new Event('change', { bubbles: true }));
      inputEl.dispatchEvent(new Event('input', { bubbles: true }));

      // Precision Radio/Checkbox Visual Sibling & Parent Targeting
      const visualSibling = inputEl.nextElementSibling;
      let clickedVisual = false;

      // 1. Dispatch click on visualSibling (span/div adjacent to hidden opacity:0 input)
      if (visualSibling && isElementVisible(visualSibling)) {
        visualSibling.click();
        try {
          visualSibling.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } catch (e) {}
        clickedVisual = true;
      }

      // 2. Dispatch click on inputEl.parentElement (Workday's custom listener wrapper div)
      if (inputEl.parentElement && isElementVisible(inputEl.parentElement)) {
        inputEl.parentElement.click();
        try {
          inputEl.parentElement.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } catch (e) {}
        clickedVisual = true;
      }

      // 3. Fallback to label[for="id"] or direct input click if visual wrappers were not clicked
      if (!clickedVisual) {
        let labelEl = null;
        if (inputEl.id) {
          try {
            labelEl = document.querySelector(`label[for="${CSS.escape(inputEl.id)}"]`);
          } catch (e) {}
        }
        if (!labelEl && inputEl.labels && inputEl.labels[0]) {
          labelEl = inputEl.labels[0];
        }

        if (labelEl && isElementVisible(labelEl)) {
          labelEl.click();
          try {
            labelEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          } catch (e) {}
        } else {
          inputEl.click();
        }
      }

      await new Promise(r => setTimeout(r, 100));
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

  async function executeFill(mode) {
    let filledCount = 0;

    // Scan input, select, textarea elements
    const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="image"]), select, textarea'));

    for (const el of inputs) {
      // 1. Direct Workday & Barclays internal selector matching (Strict 1:1)
      let match = window.UniversalMatcher.matchWorkdayAutomationId(el, currentProfile);

      // 2. Fallback to general semantic matcher ONLY if not a core Workday automation ID field
      if (!match) {
        match = window.UniversalMatcher.matchField(el, currentProfile, mode);
      }

      if (match && match.value !== undefined && match.value !== null) {
        // If it's a Workday Core field with an empty string (""), inject empty string and skip Q&A matching
        if (match.isWorkdayCore && match.value === "") {
          await simulateHumanTyping(el, "");
          continue;
        }

        if (match.value !== "") {
          const tagName = el.tagName.toLowerCase();
          const type = (el.type || '').toLowerCase();

          let filledSuccess = false;

          if (tagName === 'select') {
            filledSuccess = setSelectValue(el, match.value);
          } else if (type === 'radio' || type === 'checkbox') {
            filledSuccess = await setRadioOrCheckbox(el, match.value);
          } else {
            // Apply Letter-by-Letter human typing simulation to all text inputs and textareas
            await simulateHumanTyping(el, match.value);
            filledSuccess = true;
          }

          if (filledSuccess) {
            filledCount++;
            highlightField(el);
          }
        }
      }
    }

    // 3. Scan Workday Custom Dropdowns & Multiselect Containers
    const customDropdowns = Array.from(document.querySelectorAll('[data-automation-id="selectWidget"], [data-automation-id="multiselectContainer"], div[role="combobox"], input[role="combobox"], button[aria-haspopup="listbox"], [data-automation-id*="prompt"]'));
    for (const widget of customDropdowns) {
      if (!isElementVisible(widget)) continue;

      let match = window.UniversalMatcher.matchWorkdayAutomationId(widget, currentProfile);
      if (match && match.value) {
        const success = await handleWorkdayDropdown(widget, match.value);
        if (success) {
          filledCount++;
          highlightField(widget);
        }
      } else {
        const labelText = window.UniversalMatcher.getElementLabelText(widget);
        if (labelText) {
          const matchField = window.UniversalMatcher.matchField(widget, currentProfile, mode);
          if (matchField && matchField.value) {
            const success = await handleWorkdayDropdown(widget, matchField.value);
            if (success) {
              filledCount++;
              highlightField(widget);
            }
          }
        }
      }
    }

    if (filledCount > 0) {
      showToast(`Auto-filled ${filledCount} field${filledCount > 1 ? 's' : ''} successfully!`, "success");
    } else {
      showToast(`No new fields matched for auto-fill on this page.`, "info");
    }

    // Call Hybrid Handoff Completion Watcher to monitor manual field completion and auto-submit
    initCompletionWatcher();
  }

  let completionWatcherInterval = null;

  /**
   * Hybrid Handoff Completion Watcher
   * Polls every 500ms post-autofill to check if user has manually completed stubborn custom fields
   * (e.g., candidateIsPreviousWorker radio and multiselectContainer combobox).
   * Once satisfied, automatically submits the form via Save and Continue / Submit button.
   */
  function initCompletionWatcher() {
    if (completionWatcherInterval) {
      clearInterval(completionWatcherInterval);
    }

    completionWatcherInterval = setInterval(() => {
      // 1. Radio Button Check (candidateIsPreviousWorker or any required radio on page)
      const isPreviousWorkerRadio = document.querySelector('input[name="candidateIsPreviousWorker"]');
      let radioSatisfied = true;
      if (isPreviousWorkerRadio) {
        radioSatisfied = document.querySelector('input[name="candidateIsPreviousWorker"]:checked') !== null;
      } else {
        const requiredRadios = Array.from(document.querySelectorAll('input[type="radio"][required], input[type="radio"][aria-required="true"]'));
        if (requiredRadios.length > 0) {
          const names = new Set(requiredRadios.map(r => r.name).filter(Boolean));
          radioSatisfied = Array.from(names).every(name => document.querySelector(`input[name="${CSS.escape(name)}"]:checked`) !== null);
        }
      }

      // 2. Combobox / Multiselect Check (multiselectContainer or searchBox pill/item)
      const multiselectContainer = document.querySelector('[data-automation-id="multiselectContainer"], [data-automation-id="multiselectInputContainer"]');
      let comboboxSatisfied = true;
      if (multiselectContainer) {
        const selectedPill = multiselectContainer.querySelector('[data-automation-id="selectedItem"], [class*="pill"], [class*="item"], [data-automation-id="searchBox"]');
        if (selectedPill) {
          const pillText = (selectedPill.textContent || selectedPill.value || '').trim();
          comboboxSatisfied = pillText.length > 0;
        } else {
          comboboxSatisfied = (multiselectContainer.textContent || '').trim().length > 0;
        }
      }

      // 3. Auto-Submit if both custom fields evaluate to true
      if (radioSatisfied && comboboxSatisfied) {
        clearInterval(completionWatcherInterval);
        completionWatcherInterval = null;

        showToast("⚡ Hybrid Handoff: Custom fields completed! Auto-submitting application...", "success");

        setTimeout(() => {
          const submitBtn = document.querySelector(
            'button[title="Save and Continue"], ' +
            '[data-automation-id="bottomNavigation"] button, ' +
            '[data-automation-id="pageFooter"] button, ' +
            '[data-automation-id="nextButton"], ' +
            'button[data-automation-id="saveAndContinueButton"], ' +
            'button[type="submit"]'
          );

          if (submitBtn && isElementVisible(submitBtn)) {
            submitBtn.click();
            try {
              submitBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            } catch (e) {}
          }
        }, 300);
      }
    }, 500);
  }

  /**
   * Global State Cleanser: Force-Close Menus & Verify Listbox Removal
   * Dispatches body click & Escape keys, then polls until listboxes are removed from DOM.
   */
  async function forceCloseMenus() {
    // 1. Dispatch generic click on body to trigger "click outside" listeners
    try {
      document.body.click();
      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    } catch (e) {}

    // 2. Dispatch Escape key KeyboardEvent on activeElement and document
    try {
      const escEvent = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape', code: 'Escape', keyCode: 27 });
      if (document.activeElement) document.activeElement.dispatchEvent(escEvent);
      document.dispatchEvent(escEvent);
    } catch (e) {}

    // 3. Polling loop: check every 50ms for up to 1000ms until listboxes disappear from DOM
    const startTime = Date.now();
    while (Date.now() - startTime < 1000) {
      const openMenu = document.querySelector('[role="listbox"], [data-automation-id*="list"], div[data-automation-id*="selectWidget-list"]');
      if (!openMenu) break;
      await new Promise(r => setTimeout(r, 50));
    }
  }

  /**
   * Workday Custom Dropdown & Multiselect Handler (React Select Widgets & Searchable Comboboxes)
   * Handles [data-automation-id="selectWidget"] and [data-automation-id="multiselectContainer"].
   * Dispatches native click events or types into searchBox inputs, then explicitly clicks matching filtered [role="option"] elements.
   * Strictly async with forceCloseMenus state cleanser to prevent DOM listbox node recycling option merging.
   */
  async function handleWorkdayDropdown(targetWidgetOrText, answerToSelect) {
    if (!targetWidgetOrText || !answerToSelect) return false;

    let dropdownTrigger = null;
    const normAnswer = normalizeText(answerToSelect);

    if (targetWidgetOrText instanceof Element) {
      dropdownTrigger = targetWidgetOrText;
    } else if (typeof targetWidgetOrText === 'string') {
      const normQuestion = normalizeText(targetWidgetOrText);

      // Step A: Locate the question label / legend using XPath
      try {
        const xpathQuery = `//*[self::label or self::legend or self::span or self::div][contains(translate(normalize-space(text()), "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz"), "${normQuestion.replace(/"/g, '')}")]`;
        const xpathResult = document.evaluate(xpathQuery, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

        for (let i = 0; i < xpathResult.snapshotLength; i++) {
          const labelNode = xpathResult.snapshotItem(i);
          if (!isElementVisible(labelNode)) continue;

          // Step B: Find closest sibling or child button representing the dropdown
          const container = labelNode.closest('.form-group, fieldset, div[data-automation-id*="formField"], div[class*="FormField"], form > div, div');
          if (container) {
            dropdownTrigger = container.querySelector('[data-automation-id="selectWidget"], [data-automation-id="multiselectContainer"], [data-automation-id*="prompt"], div[role="combobox"], input[role="combobox"], input[data-automation-id="searchBox"], button[aria-haspopup="listbox"], button[aria-haspopup="menu"], [data-automation-id="activeMenuButton"]');
            if (dropdownTrigger && isElementVisible(dropdownTrigger)) break;
          }
        }
      } catch (e) {}

      // Fallback: If no direct trigger found via label XPath, scan visible select widgets on page directly
      if (!dropdownTrigger) {
        const widgets = Array.from(document.querySelectorAll('[data-automation-id="selectWidget"], [data-automation-id="multiselectContainer"], div[role="combobox"], input[role="combobox"], button[aria-haspopup="listbox"], [data-automation-id*="prompt"]'));
        dropdownTrigger = widgets.find(w => {
          if (!isElementVisible(w)) return false;
          const text = normalizeText(window.UniversalMatcher.getElementLabelText(w));
          return text.includes(normQuestion);
        });
      }
    }

    if (!dropdownTrigger) return false;

    // Cleanser Step 1: Force-close any existing open menus before triggering new dropdown
    await forceCloseMenus();

    // Check if dropdown trigger is or contains an input[data-automation-id="searchBox"], input[role="combobox"], or input
    const searchBox = (dropdownTrigger.tagName.toLowerCase() === 'input') ? dropdownTrigger :
                      (dropdownTrigger.querySelector('input[data-automation-id="searchBox"]') ||
                       dropdownTrigger.querySelector('input[role="combobox"]') ||
                       dropdownTrigger.querySelector('input'));

    if (searchBox) {
      // Execute click on searchBox first
      searchBox.click();
      try {
        searchBox.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      } catch (e) {}

      // Searchable Combobox / Multiselect Flow: Type search term via simulateHumanTyping then wait 800ms for options to render
      await simulateHumanTyping(searchBox, answerToSelect);
      await new Promise(r => setTimeout(r, 800));
    } else {
      // Standard Select Widget Flow: Click trigger button and wait 600ms to open listbox
      dropdownTrigger.click();
      try {
        dropdownTrigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      } catch (e) {}
      await new Promise(r => setTimeout(r, 600));
    }

    // Action Step 3: Query document for rendered dropdown options ([data-automation-id="promptOption"], [role="option"], etc.)
    const optionElements = Array.from(document.querySelectorAll(
      '[data-automation-id="promptOption"], ' +
      'div[data-automation-id*="promptOption"], ' +
      'ul[role="listbox"] li, ' +
      'div[role="listbox"] div[role="option"], ' +
      '[role="option"], ' +
      '[data-automation-id="selectWidget-list"] li, ' +
      'li[role="option"], ' +
      'div[role="option"]'
    ));

    if (optionElements.length === 0) {
      await forceCloseMenus();
      return false;
    }

    // Action Step 4: Match option using diacritic normalization
    let matchedOption = optionElements.find(opt => {
      const rawText = opt.textContent || opt.getAttribute('aria-label') || opt.getAttribute('data-automation-label') || '';
      const normOptText = normalizeText(rawText);
      return normOptText === normAnswer || normOptText.includes(normAnswer) || normAnswer.includes(normOptText);
    });

    // Fallback for filtered combobox: if exact text match not found but filtered list exists, pick the first visible option
    if (!matchedOption && searchBox && optionElements.length > 0) {
      matchedOption = optionElements.find(opt => isElementVisible(opt)) || optionElements[0];
    }

    if (matchedOption) {
      matchedOption.click();
      try {
        matchedOption.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      } catch (e) {}
      highlightField(dropdownTrigger);
      showToast(`📝 Workday Dropdown: Selected "${matchedOption.textContent.trim()}"`, "success");

      // Cleanser Step 2: Force-close and verify listbox removal after selecting option
      await forceCloseMenus();
      return true;
    }

    // Fallback Cleanser if option not matched
    await forceCloseMenus();
    return false;
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
      showToast(`ℹ️ No typed input fields found to learn on this page.`, "info");
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

  // Master Action Engine (Alt+S): Intelligent Sign-Up & Auto-Login Routing
  function performAutoSignUp(container = document) {
    if (!currentProfile) {
      chrome.runtime.sendMessage({ action: "GET_PROFILE" }, (response) => {
        if (response && response.profile) {
          currentProfile = response.profile;
          executeMasterAction(container);
        }
      });
    } else {
      executeMasterAction(container);
    }
  }

  function executeMasterAction(container = document) {
    chrome.runtime.sendMessage({ action: "GET_REGISTERED_DOMAINS" }, (response) => {
      const registeredDomains = (response && response.registeredDomains) ? response.registeredDomains : (currentProfile?.registeredDomains || []);
      const hostname = window.location.hostname.toLowerCase();

      const isRegistered = registeredDomains.some(d => d.toLowerCase() && (hostname.includes(d.toLowerCase()) || d.toLowerCase().includes(hostname)));

      // Dual-Mode Auth Detection: Strictly target VISIBLE password elements
      const visiblePasswordInputs = Array.from(container.querySelectorAll('input[type="password"]')).filter(el => isElementVisible(el));
      const passwordInputCount = visiblePasswordInputs.length;

      const strictConfirmPassEl = Array.from(container.querySelectorAll('[data-automation-id="confirmPassword"], [data-automation-id="verifyPassword"]')).find(el => isElementVisible(el)) ||
                            visiblePasswordInputs.find(el => {
                              const txt = window.UniversalMatcher.getElementLabelText(el).toLowerCase();
                              return txt.includes('verify') || txt.includes('confirm') || txt.includes('re-enter') || txt.includes('retype');
                            });

      // Account Creation Mode: Strictly rely on presence of verification fields or multiple VISIBLE password inputs
      const isCreateAccountMode = !!(strictConfirmPassEl || passwordInputCount >= 2);

      if (isRegistered && isCreateAccountMode) {
        // Intercept: User is registered, but Workday defaulted to Account Creation
        showToast(`🧠 ${hostname} recognized in Memory! Switching to Sign In...`, "success");

        // Locate the "Already have an account? Sign In" toggle link
        const signInToggle = Array.from(container.querySelectorAll('a, button, [role="link"], div')).find(el => {
          const txt = (el.textContent || '').toLowerCase().trim();
          return (txt.includes('already have an account') && txt.includes('sign in')) || txt === 'sign in';
        });

        if (signInToggle && isElementVisible(signInToggle)) {
          signInToggle.click();
          try {
            signInToggle.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
          } catch(e) {}
        }

        // Allow 500ms for React to unmount the registration form and mount the login form, then execute Login Flow
        setTimeout(() => executeLoginFlow(hostname, container), 500);

      } else if (isCreateAccountMode) {
        // Normal Account Creation
        executeCreateAccountFlow(hostname, container);
      } else {
        // Normal Login
        executeLoginFlow(hostname, container);
      }
    });
  }

  function executeLoginFlow(hostname, container = document) {
    showToast(`🔑 Recognized Auth Form on ${hostname}! Auto-signing in...`, "success");

    const emailVal = currentProfile?.credentials?.email || currentProfile?.personal?.email;
    const passVal = currentProfile?.credentials?.password;

    (async () => {
      // 1. Locate strictly VISIBLE Email and Password fields
      const emailInput = Array.from(document.querySelectorAll('[data-automation-id="email"], input[type="email"], input[type="text"]')).find(el => {
        if (!isElementVisible(el)) return false;
        const txt = (window.UniversalMatcher ? window.UniversalMatcher.getElementLabelText(el) : '').toLowerCase();
        return el.getAttribute('data-automation-id') === 'email' || el.type === 'email' || txt.includes('email') || txt.includes('username');
      });

      const passInput = Array.from(document.querySelectorAll('[data-automation-id="password"], input[type="password"]')).find(el => isElementVisible(el));

      if (emailInput && emailVal) {
        await simulateHumanTyping(emailInput, emailVal);
        highlightField(emailInput);
      }
      await new Promise(r => setTimeout(r, 200));

      if (passInput && passVal) {
        await simulateHumanTyping(passInput, passVal);
        highlightField(passInput);
      }

      executeConsentAutoCheck(container);
      await new Promise(r => setTimeout(r, 800)); // Wait for React state to settle

      const realBtn = container.querySelector('[data-automation-id="signInSubmitButton"], [data-automation-id="signInButton"]');
      const shieldBtn = container.querySelector('[data-automation-id="click_filter"]');
      const loginBtn = realBtn || shieldBtn || findLoginSubmitButton(container);

      if (loginBtn) {
        showToast(`🔑 Signing into ${hostname}...`, "success");
        loginBtn.click();
        try {
          loginBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } catch (e) {}
      } else {
        showToast(`⚠️ Filled credentials, but could not locate Sign In submit button.`, "info");
      }
    })();
  }

  async function executeCreateAccountFlow(hostname, container = document) {
    showToast(`📝 Recognized Account Creation Form on ${hostname}! Auto-registering...`, "success");

    const emailVal = currentProfile?.credentials?.email || currentProfile?.personal?.email;
    const passVal = currentProfile?.credentials?.password;

    // Step 1: Inject Email input
    const emailInput = container.querySelector('[data-automation-id="email"], input[type="email"]') ||
                       Array.from(container.querySelectorAll('input:not([type="hidden"])')).find(el => {
                         const txt = window.UniversalMatcher.getElementLabelText(el);
                         return txt.includes('email') || txt.includes('username');
                       });

    if (emailInput && emailVal) {
      await simulateHumanTyping(emailInput, emailVal);
      highlightField(emailInput);
      await new Promise(r => setTimeout(r, 200));
    }

    // Step 2: Universal Password Brute-Force Iteration Loop
    const allPassInputs = Array.from(container.querySelectorAll('input[type="password"]'));
    for (const pInput of allPassInputs) {
      if (isElementVisible(pInput) && passVal) {
        await simulateHumanTyping(pInput, passVal);
        highlightField(pInput);
        await new Promise(r => setTimeout(r, 500));
      }
    }

    await new Promise(r => setTimeout(r, 300));

    // Step 3: Auto-fill remaining registration inputs
    const inputs = Array.from(container.querySelectorAll('input:not([type="hidden"]):not([type="password"]):not([type="email"]):not([type="checkbox"]):not([type="radio"]), select, textarea'));
    for (const el of inputs) {
      if (el === emailInput) continue;
      const match = window.UniversalMatcher.matchField(el, currentProfile, "ALL");
      if (match && match.value) {
        const tagName = el.tagName.toLowerCase();

        if (tagName === 'select') {
          setSelectValue(el, match.value);
        } else {
          await simulateHumanTyping(el, match.value);
        }
        highlightField(el);
      }
    }

    await new Promise(r => setTimeout(r, 300));

    // Step 4: Forcefully check ALL terms & privacy agreement checkboxes on Create Account form
    const allCbs = Array.from(container.querySelectorAll('input[type="checkbox"], [role="checkbox"], [data-automation-id*="checkbox"], [data-automation-id*="Checkbox"]'));
    for (const cb of allCbs) {
      clickAndCheckCheckbox(cb, container);
    }
    executeConsentAutoCheck(container);

    // Register hostname to Domain Memory Engine
    chrome.runtime.sendMessage({ action: "REGISTER_DOMAIN", domain: hostname });

    showToast(`🚀 Account registration filled! Saved ${hostname} to Memory Engine.`, "success");

    // Step 5: Omni-Click Submit Bypass (Wait 1200ms for DOM settling then blast submit cluster)
    if (currentProfile?.settings?.autoSubmitSignUp !== false) {
      await new Promise(r => setTimeout(r, 1200));

      const submitTargets = [
        container.querySelector('[data-automation-id="createAccountSubmitButton"]'),
        container.querySelector('[data-automation-id="click_filter"]'),
        container.querySelector('[data-automation-id="registerSubmitButton"]'),
        container.querySelector('.css-1hunomw'),
        findSignUpSubmitButton(container)
      ].filter(el => el && isElementVisible(el));

      if (submitTargets.length > 0) {
        showToast("🚀 Blasting through Workday submit shield...", "success");
        submitTargets.forEach(target => {
          try {
            target.focus();
            target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
            target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
            target.click();
            target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter' }));
          } catch (e) {}
        });
      } else {
        showToast(`⚠️ Filled registration, but could not locate Create Account button.`, "info");
      }
    }
  }

  // Alias for backward compatibility
  async function executeSignUpFlow(hostname, container = document) {
    return executeCreateAccountFlow(hostname, container);
  }

  // Helper: Safely checks and fires native/React click events on checkboxes & visual wrappers
  function clickAndCheckCheckbox(cb, container = document) {
    if (!cb) return;

    if (cb.tagName === 'INPUT') {
      if (!cb.checked) {
        cb.checked = true;
      }
      cb.dispatchEvent(new Event('change', { bubbles: true }));
      cb.dispatchEvent(new Event('input', { bubbles: true }));

      // Locate visual target (label, sibling, or wrapper) to trigger Workday React event listener
      let visualTarget = null;
      if (cb.id) {
        try {
          visualTarget = container.querySelector(`label[for="${CSS.escape(cb.id)}"]`);
        } catch (e) {}
      }
      if (!visualTarget && cb.nextElementSibling) {
        visualTarget = cb.nextElementSibling;
      }
      if (!visualTarget && cb.closest('label')) {
        visualTarget = cb.closest('label');
      }
      if (!visualTarget && cb.parentElement) {
        visualTarget = cb.parentElement;
      }

      if (visualTarget && isElementVisible(visualTarget)) {
        visualTarget.click();
        try {
          visualTarget.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } catch (e) {}
      } else {
        cb.click();
      }
      highlightField(visualTarget || cb);
    } else {
      cb.setAttribute('aria-checked', 'true');
      cb.dataset.checked = 'true';
      cb.dispatchEvent(new Event('change', { bubbles: true }));
      cb.dispatchEvent(new Event('input', { bubbles: true }));
      if (isElementVisible(cb)) {
        cb.click();
        try {
          cb.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        } catch (e) {}
      }
      highlightField(cb);
    }
  }

  // Consent Auto-Check Engine: Automatically accepts terms, privacy policy & consent checkboxes
  function executeConsentAutoCheck(container = document) {
    if (currentProfile?.settings?.autoCheckTerms === false) return 0;

    let checkedCount = 0;
    // Scan both native input checkboxes and ARIA role="checkbox" elements (Workday / SPAs)
    const checkboxElements = Array.from(container.querySelectorAll('input[type="checkbox"], [role="checkbox"]'));

    checkboxElements.forEach(cb => {
      const isConsent = window.UniversalMatcher.isConsentCheckbox(cb);
      if (isConsent) {
        clickAndCheckCheckbox(cb, container);
        checkedCount++;
      }
    });

    if (checkedCount > 0) {
      showToast(`📝 Consent Auto-Check Engine: Auto-accepted ${checkedCount} terms & privacy checkbox(es)!`, "success");
    }

    return checkedCount;
  }

  // Find Login Submit Button with Workday Selectors & XPath Fallback
  function findLoginSubmitButton(container = document) {
    // 1. Prioritize real button selectors (human simulation evades shield trigger), then shield overlay
    const signInBtn = container.querySelector(
      '[data-automation-id="signInSubmitButton"], ' +
      '[data-automation-id="signInButton"], ' +
      'button[aria-label="Sign In"], ' +
      '[data-automation-id="click_sub"], ' +
      '[data-automation-id="loginSubmitButton"]'
    );
    if (signInBtn && isElementVisible(signInBtn)) return signInBtn;

    const shieldBtn = container.querySelector('[data-automation-id="click_filter"]');
    if (shieldBtn && isElementVisible(shieldBtn)) return shieldBtn;

    // 2. Query visible candidate buttons by keyword
    const candidates = Array.from(container.querySelectorAll('button, input[type="submit"], input[type="button"], a.btn, [role="button"], div[role="button"]'));
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
        container,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      for (let i = 0; i < xpathResult.snapshotLength; i++) {
        const node = xpathResult.snapshotItem(i);
        if (isElementVisible(node)) return node;
      }
    } catch (e) {}

    const formSubmit = container.querySelector('form input[type="submit"], form button[type="submit"]');
    return (formSubmit && isElementVisible(formSubmit)) ? formSubmit : null;
  }

  // Find Sign-Up Submit Button
  function findSignUpSubmitButton(container = document) {
    // 1. Workday specific automation ID queries
    const workdayBtn = container.querySelector('[data-automation-id="createAccountSubmitButton"], [data-automation-id="click_sub"], [data-automation-id="registerSubmitButton"]');
    if (workdayBtn && isElementVisible(workdayBtn)) return workdayBtn;

    // 2. Query visible candidate buttons by keyword
    const candidates = Array.from(container.querySelectorAll('button, input[type="submit"], input[type="button"], a.btn, [role="button"]'));
    const targetKeywords = ['create account', 'sign up', 'signup', 'register', 'create profile', 'join now', 'complete registration', 'submit'];

    for (const kw of targetKeywords) {
      const btn = candidates.find(b => {
        const txt = (b.textContent || b.value || b.getAttribute('aria-label') || b.getAttribute('data-automation-id') || '').toLowerCase().trim();
        return txt.includes(kw) && isElementVisible(b);
      });
      if (btn) return btn;
    }

    // Fallback to first form submit button
    const formSubmit = container.querySelector('form input[type="submit"], form button[type="submit"]');
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
    // 1. Check for Active Auth Modal or Auth Page (The v1.17.38 Fix)
    const activeContainer = document.querySelector('[role="dialog"], [aria-modal="true"], .wd-popup') || document;
    const isAuthScreen = activeContainer.querySelector('input[type="password"]');

    if (isAuthScreen) {
      showToast(`🔑 Auth form detected! Auto-filling credentials...`, "success");
      performAutoSignUp(activeContainer);
      return; // Exit function so it doesn't prematurely click submit buttons
    }

    const validPhrases = [
      'apply', 'apply now', 'apply online', 'apply for job', 'apply for a job',
      'apply for this job', 'apply for position', 'apply to job', 'apply today',
      'start application', 'apply manually', 'submit application', 'create account', 'sign in', 'save and continue', 'next', 'submit', 'register'
    ];
    // Removed 'login' and 'sign in' from negative words so it doesn't block progression
    const negativeWords = ['filter', 'search', 'save', 'remove', 'delete', 'share', 'help', 'menu', 'alert', 'alerts', 'newsletter', 'job alert', 'job alerts']; 

    let candidates = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]'));

    try {
      const iframes = Array.from(document.querySelectorAll('iframe'));
      iframes.forEach(iframe => {
        try {
          if (iframe.contentDocument) {
            const iframeCandidates = Array.from(iframe.contentDocument.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"]'));
            candidates.push(...iframeCandidates);
          }
        } catch (e) {}
      });
    } catch (e) {}

    candidates.sort((a, b) => {
      const aInMain = a.closest('main, article, [role="main"], #content, .job-details, .job-description, header, [class*="job"]') ? 1 : 0;
      const bInMain = b.closest('main, article, [role="main"], #content, .job-details, .job-description, header, [class*="job"]') ? 1 : 0;
      return bInMain - aInMain;
    });

    const applyBtn = candidates.find(el => {
      if (!isElementVisible(el)) return false;
      const btnText = (el.textContent || el.value || el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('data-automation-id') || '').toLowerCase().trim();
      if (!btnText) return false;
      if (negativeWords.some(word => btnText.includes(word))) return false;
      return validPhrases.includes(btnText) || (btnText.startsWith('apply') && !negativeWords.some(word => btnText.includes(word)));
    });

    if (applyBtn) {
      const displayBtnText = (applyBtn.textContent || applyBtn.value || applyBtn.getAttribute('aria-label') || 'Apply').trim();
      applyBtn.dataset.autofillNavClicked = "true";

      // Omni-Click fallback for Workday progression
      if (displayBtnText.toLowerCase().includes('create account') || displayBtnText.toLowerCase().includes('sign in')) {
         showToast(`🚀 Blasting through Workday submit shield...`, "success");
         const submitTargets = [
           document.querySelector('[data-automation-id="click_filter"]'),
           document.querySelector('[data-automation-id="createAccountSubmitButton"]'),
           document.querySelector('[data-automation-id="signInSubmitButton"]'),
           applyBtn
         ].filter(el => el && isElementVisible(el));

         submitTargets.forEach(target => {
           try {
             target.focus();
             target.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
             target.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
             target.click();
             target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter' }));
           } catch (e) {}
         });
      } else {
         showToast(`🔥 Start Automation: Clicking "${displayBtnText}"...`, "success");
         setTimeout(() => applyBtn.click(), 300);
      }
    } else {
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
    } else {
      // Auto-trigger Form Auto-Fill when arriving on candidate data page (e.g. My Information)
      const formKeyData = `dataform_${window.location.pathname}`;
      if (sessionStorage.getItem('autoDataFormKey') !== formKeyData && lastHandledFormId !== formKeyData) {
        const candidateInputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="password"]):not([type="submit"]):not([type="button"]), select, textarea')).filter(el => isElementVisible(el));
        if (candidateInputs.length >= 2) {
          sessionStorage.setItem('autoDataFormKey', formKeyData);
          lastHandledFormId = formKeyData;
          showToast(`⚡ Application Data Page Detected! Auto-filling form fields...`, "success");
          setTimeout(() => {
            performAutoFill("ALL");
          }, 600);
        }
      }
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
