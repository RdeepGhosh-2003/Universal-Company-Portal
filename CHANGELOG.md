# Universal Company Portal Auto-Fill Engine - Changelog

All notable changes, updates, version history, and features for the Universal Company Portal Auto-Fill Extension are documented in this file.

## [1.17.44] - 2026-08-18

### 🔑 React-Bypassing Omni-Click Sequence & Enter-Key Fallback Simulation
- **Synthetic Pointer Event Cascade (`content/content_script.js`)**:
  - Upgraded `executeLoginFlow` button submission with a 5-stage synthetic pointer event cascade (`pointerdown`, `mousedown`, `pointerup`, `mouseup`, `click`) to bypass React event interception.
- **Password Input Enter-Key Fallback (`content/content_script.js`)**:
  - Injected direct `KeyboardEvent` simulation (`keydown`, `keypress`, `keyup` for `Enter` key) on `passInput` as a 100% guarantee fallback to trigger form submission.

---

## [1.17.43] - 2026-08-18

### 🚀 Master Patch: SPA Modal Routing, Login Async Sequencing & Phone Mask Exclusion
- **SPA Modal Routing Fix (`content/content_script.js`)**:
  - Updated `executeMasterAction` to count only VISIBLE password inputs (`visiblePasswordInputs`) and verification fields (`strictConfirmPassEl`), preventing hidden background DOM forms from misclassifying Sign In modals.
- **Login Async Sequence Fix (`content/content_script.js`)**:
  - Refactored `executeLoginFlow` from nested `setTimeout` callbacks to clean, sequential `async/await` execution with 800ms React state settling delay before submit click.
- **Phone Mask Protection (`content/content_script.js`)**:
  - Excluded phone number inputs (`isPhoneField`) from Step 3.5 Space + Backspace simulation in `simulateHumanTyping`, protecting strict numeric input masks.

---

## [1.17.40] - 2026-08-17

### 👻 Space + Backspace React State Override for Workday Ghost Data Fix
- **Automated Keystroke State Override (`content/content_script.js`)**:
  - Injected Space + Backspace keystroke simulation at the end of `simulateHumanTyping` (Step 3.5).
  - Forces Workday's background React state listeners to acknowledge and register typed input values, resolving false "required field" validation errors.

---

## [1.17.39] - 2026-08-17

### 👁️ Visibility-Filtered Login Credential Injection
- **Strictly Visible Input Selection (`content/content_script.js`)**:
  - Upgraded `executeLoginFlow` to filter `emailInput` and `passInput` selection using `isElementVisible(el)`.
  - Prevents credential injection into hidden background DOM forms when modal overlays are active.

---

## [1.17.38] - 2026-08-17

### 🔑 Auth Modal Credential Injection Intercept & Omni-Click Shield Progression
- **Auth Screen Credential Injection Intercept (`content/content_script.js`)**:
  - Refactored `performStartAutomation()` to check for active Auth modals or password inputs (`isAuthScreen`) before executing button clicks.
  - Automatically triggers `performAutoSignUp(activeContainer)` to inject credentials and exits immediately, preventing premature empty form submissions.
- **Omni-Click Workday Progression (`content/content_script.js`)**:
  - Implemented Omni-Click fallback for Workday progression buttons ("Create Account", "Sign In"), firing `focus()`, `mousedown`, `mouseup`, `.click()`, and `Enter` key events on shield targets.

---

## [1.17.36] - 2026-08-17

### 🎯 Strict DOM-Based Auth Mode Classification
- **Refined `isCreateAccountMode` Classification (`content/content_script.js`)**:
  - Removed overly broad text-based fallback matching that misclassified Sign-In modal overlays containing footer links ("Don't have an account yet? Create Account").
  - Enforced strict DOM-based detection (`isCreateAccountMode = !!(confirmPassEl || passwordInputCount >= 2)`), preventing infinite intercept loops and ensuring direct routing to `executeLoginFlow` on Sign-In modals.

---

## [1.17.35] - 2026-08-17

### 🧠 Domain Memory Engine Routing & Workday Sign In Auto-Toggle
- **Registered Domain Intercept & Sign In Auto-Toggle (`content/content_script.js`)**:
  - Updated `executeMasterAction` routing logic to intercept requests where `isRegistered` is `true` but Workday defaulted to the Create Account view.
  - Automatically locates and clicks the "Already have an account? Sign In" toggle link, waits 500ms for React form unmounting, and routes seamlessly to `executeLoginFlow(hostname, container)`.

---

## [1.17.33] - 2026-08-17

### 🔥 Start Automation Button Scoping & Job Alerts Form Exclusion Filter
- **Primary Apply Button Scoping (`content/content_script.js`)**:
  - Refactored `performStartAutomation()` to focus strictly on finding and clicking the primary "Apply", "Apply Now", "Apply for Job", "Apply Online", or "Apply Manually" button on job posting pages.
- **Job Alerts Subscription Exclusion Filter (`content/matcher.js`)**:
  - Built `isJobAlertInput` in `matcher.js` to detect and bypass "Sign up for job alerts", newsletter, and talent community subscription forms, preventing the auto-fill engine from injecting candidate credentials into alert widgets.

---

## [1.17.32] - 2026-08-17

### ⚡ Workday Agreement Checkbox Hard-Check, Omni-Click Submit & Data Page Auto-Fill
- **Agreement Checkbox Visual Target Invocation (`content/content_script.js`)**:
  - Implemented `clickAndCheckCheckbox` helper that forcefully checks native/ARIA checkboxes and fires native `.click()` and `MouseEvent('click')` dispatches on visual target labels, adjacent siblings (`cb.nextElementSibling`), and wrapper containers, guaranteeing Workday React state registration on candidate privacy agreements.
- **Always-On Submit Target Cluster (`content/content_script.js`)**:
  - Included `findSignUpSubmitButton(container)` directly inside `submitTargets` for Omni-Click execution, ensuring "Create Account" buttons are always blasted regardless of dynamic `data-automation-id` changes.
- **Smart Page Routing & Post-Auth Auto-Fill (`content/content_script.js`)**:
  - Upgraded `performStartAutomation()` and `checkAndTriggerAutoAuth()` to detect Auth/Create Account screens, Application Data forms (`My Information`, `My Experience`), and Job Description pages, seamlessly navigating through registration and auto-filling candidate data upon reaching Step 2.

---

## [1.17.31] - 2026-08-15

### 🔑 Universal Password Brute-Force Loop & Omni-Click Submit Shield Bypass
- **Universal Password Brute-Force (`content/content_script.js`)**:
  - Refactored `executeCreateAccountFlow` to query all `input[type="password"]` fields in the container and sequentially inject passwords with `simulateHumanTyping` and 500ms delays, bypassing React unmounting conflicts on verification fields.
- **Omni-Click Submit Shield Bypass (`content/content_script.js`)**:
  - Implemented an Omni-Click event chain on submit targets (`[data-automation-id="click_filter"]`, `[data-automation-id="createAccountSubmitButton"]`, `[data-automation-id="registerSubmitButton"]`, `.css-1hunomw`), firing `focus()`, `mousedown`, `mouseup`, `.click()`, and `Enter` key dispatches post 1200ms DOM settling delay.

---

## [1.17.14] - 2026-08-08

### 🤝 Hybrid Handoff Completion Watcher & Auto-Submission Engine
- **`initCompletionWatcher()` Polling Watcher (`content/content_script.js`)**:
  - Implemented a 500ms post-autofill polling loop that monitors stubborn custom fields deferred to manual user completion (e.g. `candidateIsPreviousWorker` radio buttons and `multiselectContainer` comboboxes).
- **Automated Form Advancement (`content/content_script.js`)**:
  - Verifies DOM satisfaction for both radio selection (`input[name="candidateIsPreviousWorker"]:checked`) and multiselect tag/pill population.
  - Upon user completion, immediately clears the watcher interval and triggers `.click()` on primary submit buttons (`button[title="Save and Continue"]`, `[data-automation-id="bottomNavigation"] button`, `[data-automation-id="nextButton"]`), advancing the application seamlessly.

---

## [1.17.13] - 2026-08-08

### 🔘 Proprietary Multiselect Container & Invisible Radio Sibling Targeting
- **Precision Radio Sibling & Parent Targeting (`content/content_script.js`)**:
  - Upgraded `setRadioOrCheckbox` to locate `inputEl.nextElementSibling` (the custom visual `<span>`/`<div>` circle next to Workday's `opacity: 0` `<input type="radio">`) and `inputEl.parentElement` (Workday wrapper `<div>`), dispatching native `.click()` and `MouseEvent('click')` events to trigger Workday's custom listeners.
- **Multiselect Container & SearchBox Support (`content/content_script.js`)**:
  - Added `[data-automation-id="multiselectContainer"]` to valid dropdown widget selectors across `executeFill` and `handleWorkdayDropdown`.
  - Added detection for `input[data-automation-id="searchBox"]`, clicking the searchBox, executing `simulateHumanTyping(searchBox, targetText)`, waiting 800ms for option rendering, clicking matching `[role="option"]`, and calling `forceCloseMenus()`.

---

## [1.17.12] - 2026-08-08

### 📱 React Mask Substring Injection, Combobox Option Click & Extension Exclusions
- **Typing Bot vs. Input Masks (`content/content_script.js`)**:
  - Refactored `simulateHumanTyping` to forcefully set the exact `strVal.substring(0, i + 1)` on each iteration using `HTMLInputElement.prototype.value` and `HTMLTextAreaElement.prototype.value` prototype setters. Prevents formatted fields (Phone Number) from being truncated when React input masks modify `element.value` mid-loop.
- **Radio Button Label & Parent Element Fallback (`content/content_script.js`)**:
  - Upgraded `setRadioOrCheckbox` to extract `inputEl.id` and click `label[for="id"]`, falling back to `inputEl.parentElement.click()` if no explicit label exists.
- **Searchable Combobox Option Click Selection (`content/content_script.js`)**:
  - Refactored `handleWorkdayDropdown` for combobox inputs to await typing and 800ms filter rendering, then explicitly click the matching rendered `[role="option"]` / `[data-automation-id="promptOption"]` element instead of sending Enter keys.
- **Phone Extension Matcher Exclusions (`content/matcher.js`)**:
  - Updated `FIELD_MAPPINGS` and `matchField` negative keyword exclusions to explicitly reject primary phone mapping on any field containing `"extension"` or `"ext"`, correctly directing extension fields to `personal.phoneExtension`.

---

## [1.17.10] - 2026-08-07

### 🧹 Force-Close & Verify State Cleanser (SPA Option Merging Prevention)
- **`forceCloseMenus()` Helper (`content/content_script.js`)**:
  - Implemented an `async` state cleanser that dispatches `document.body.click()`, fires `Escape` key events on `document.activeElement` and `document`, and polls every 50ms for up to 1000ms until listbox elements are verified absent from the DOM.
- **Cleanser Integration in `handleWorkdayDropdown` (`content/content_script.js`)**:
  - Executes `await forceCloseMenus()` immediately prior to opening a new dropdown widget and immediately after selecting an option.
  - Guarantees Workday's global recycled listbox DOM node is fully cleared, preventing option merging (e.g. Country & Prefix items combining) across sequential dropdown interactions.

---

## [1.17.9] - 2026-08-07

### ⏱️ Strict Sequential Execution & React Listbox Menu Lifecycle Delays
- **Async Promise Handlers (`content/content_script.js`)**:
  - Refactored `handleWorkdayDropdown` and `setRadioOrCheckbox` to be strictly `async` Promise-returning functions.
- **Menu Lifecycle Delays (`content/content_script.js`)**:
  - Added a **600ms render delay** after triggering a custom dropdown widget to allow Workday's recycled global DOM listbox node to fully render and populate options.
  - Added a **300ms menu close delay** after clicking an option to allow the closing animation to complete and React Virtual DOM state to settle before resolving.
- **Strict Sequential Loop Control (`content/content_script.js`)**:
  - Enforced `for...of` loops across `inputs` and `customDropdowns` in `executeFill`, ensuring every single text, dropdown, and radio field is sequentially `await`ed before processing the next element.

---

## [1.17.8] - 2026-08-07

### 🛠️ Workday Given Name Hard-Patch & React Virtual DOM State-Stick Delays
- **Upgraded `simulateHumanTyping` (`content/content_script.js`)**:
  - Added `element.click()` immediately prior to `element.focus()` to resolve UI re-render conflicts on adjacent widgets (e.g. Given Name vs. Prefix dropdown).
  - Added a **150ms post-typing delay** (`setTimeout`) after the final keystroke but before `element.blur()` and dispatching the final `change` event, ensuring Workday's Virtual DOM state sticks cleanly.
- **Full Main Form Automation Synergy**:
  - Combined `simulateHumanTyping` with custom React dropdown handling (`handleWorkdayDropdown` with diacritic normalization) and radio/checkbox visual wrapper targeting (`setRadioOrCheckbox`).

---

## [1.17.7] - 2026-08-07

### ⌨️ Letter-by-Letter Human Typing Simulation
- **Asynchronous `simulateHumanTyping` (`content/content_script.js`)**:
  - Built `simulateHumanTyping(element, text)` helper executing complete human typing sequence: `focus()` ➔ clear field reset ➔ character-by-character iteration with randomized 15ms–30ms delays (`keydown`, `keypress`, `input`, `keyup`) ➔ final `change` event ➔ `blur()`.
- **Refactored Main Form-Filling Loop (`content/content_script.js`)**:
  - Converted `executeFill` and `executeSignUpFlow` to `async` functions and `await simulateHumanTyping(el, val)` for all standard text inputs (`<input type="text">`, `email`, `tel`, `url`, `number`, `password`, `<textarea>`).
  - Completely defeats Workday's aggressive React Virtual DOM state locks on main application forms (Given Name, Address, City, Postal Code), eliminating false "required field" validation errors when saving.

---

## [1.17.6] - 2026-08-07

### 🔤 Workday Custom Dropdowns, Diacritic Normalization & Radio Wrapper Targeting
- **Diacritic Normalization (`content/content_script.js` & `content/matcher.js`)**:
  - Implemented `normalizeText(str)` utilizing `.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()`.
  - Applied diacritic normalization across `setSelectValue` and `handleWorkdayDropdown` to match standard profile strings (e.g. `"Karnataka"`) against Workday's diacritic option texts (e.g. `"Karnātaka"`).
- **Custom React Dropdown Handler (`content/content_script.js`)**:
  - Upgraded `handleWorkdayDropdown(element, targetText)` to open custom Workday `<div>` select widgets, wait 400ms for listbox DOM rendering, and click matching normalized options.
- **Radio & Checkbox Visual Wrapper Targeting (`content/content_script.js`)**:
  - Refactored `setRadioOrCheckbox` to locate the element's `<label>`, `div[role="radio"]`, `div[role="checkbox"]`, or parent wrapper and dispatch native `.click()` and `MouseEvent('click')` events to visual wrappers.

---

## [1.17.5] - 2026-08-07

### 🌐 Globalized Stealth React Injection for Form Text Inputs
- **Globalized `injectReactValue` (`content/content_script.js` & `content/matcher.js`)**:
  - Exposed `injectReactValue` globally on `window` and `window.UniversalMatcher` for cross-module accessibility.
- **Refactored Core Text Input Filling (`content/content_script.js`)**:
  - Updated `executeFill` and `executeSignUpFlow` to route all mapped text-based inputs (`<input type="text">`, `email`, `tel`, `url`, `number`, `password`, `<textarea>`) through `injectReactValue`.
  - Resolves Workday virtual DOM "required field" state validation errors on Given Name, Surname, Address Lines, City, and Postal Code upon clicking "Save and Continue".
- **Preserved Other Input Types**:
  - Left `<select>` elements on `setSelectValue` / `handleWorkdayDropdown` and radio/checkbox inputs on dedicated selection handlers.

---

## [1.17.4] - 2026-08-06

### 🤖 Bot Evasion & Human Interaction Lifecycle Simulation
- **Enhanced `injectReactValue` (`content/content_script.js`)**:
  - Simulates complete human interaction lifecycle: `focus()` ➔ prototype setter ➔ `keydown`/`keyup` events ➔ `input`/`change` events ➔ `blur()`.
  - Evades Workday `noCaptchaWrapper` bot detection to prevent the spawning of invisible `z-index: 3` click interceptor shields (`click_filter`).
- **Sequential Credential Delays (`content/content_script.js`)**:
  - Refactored `executeLoginFlow` to inject email, wait **200ms**, inject password, wait **500ms**, then target the real submit button (`[data-automation-id="signInSubmitButton"]`).

---

## [1.17.3] - 2026-08-06

### 🛡️ Workday Modal Click Interceptor Shield Bypass
- **Target Invisible Click Shield Overlay (`content/content_script.js`)**:
  - Updated `executeLoginFlow` and `findLoginSubmitButton` to prioritize Workday's absolute `z-index: 3` overlay `<div data-automation-id="click_filter" role="button"></div>`.
  - Implemented fallback clicking logic: checks `[data-automation-id="click_filter"]` first, then falls back to `[data-automation-id="signInSubmitButton"]` / `[data-automation-id="signInButton"]`.

---

## [1.17.2] - 2026-08-06

### ⚛️ Workday React State Bypass Login Injection
- **React State Bypass Function (`content/content_script.js`)**:
  - Implemented `injectReactValue(element, value)` helper to invoke `Object.getPrototypeOf(element)` prototype value setters directly.
  - Dispatches native `input` and `change` events so Workday's React virtual DOM registers injected credentials without keeping the submit button disabled.
- **Updated Field Injection**:
  - Directs Workday `[data-automation-id="email"]` and `[data-automation-id="password"]` fields through `injectReactValue`.
- **Targeted Modal Sign-In Button**:
  - Enforces 500ms post-injection delay and targets `[data-automation-id="signInSubmitButton"]` and `[data-automation-id="signInButton"]`.

---

## [1.17.1] - 2026-08-05

### 🏛️ Barclays Customized Workday Instance Support
- **Expanded Barclays Strict Dictionary (`content/matcher.js`)**:
  - Updated `WORKDAY_AUTOMATION_MAP` with Barclays specific `id`, `name`, and `data-fkit-id` attributes:
    - `address--addressLine1Local`, `addressLine1Local`, `data-fkit-id="address--addressLine1Local"` ➔ `personalDetails.addressLine1`
    - `address--addressLine2Local`, `addressLine2Local`, `data-fkit-id="address--addressLine2Local"` ➔ `personalDetails.addressLine2` (fallback `""`)
    - `address--addressLine3Local`, `addressLine3Local`, `data-fkit-id="address--addressLine3Local"` ➔ `personalDetails.addressLine3` (fallback `""`)
    - `address--cityLocal`, `cityLocal`, `data-fkit-id="address--cityLocal"` ➔ `personalDetails.city`
    - `address--postalCodeLocal`, `postalCodeLocal`, `data-fkit-id="address--postalCodeLocal"` ➔ `personalDetails.postalCode`
    - Includes non-local variants (`address--addressLine1`, `addressLine1`, `data-fkit-id="address--addressLine1"`, etc.).
  - Upgraded `matchWorkdayAutomationId` to evaluate HTML element `id`, `name`, `data-automation-id`, and `data-fkit-id` attributes seamlessly.
- **Maintained Core Protections**:
  - React Dropdown Handler (`handleWorkdayDropdown`) and Fuzzy Matcher Global Kill-Switch (`blacklist`) remain 100% active to prevent shotgunning.

---

## [1.17.0] - 2026-08-05

### 🌐 Workday Localized ID Mapping, Fuzzy Kill-Switch & React Dropdown Handler
- **Workday Localized ID 1:1 Mapping (`content/matcher.js`)**:
  - Added exact 1:1 mappings for localized Workday automation IDs: `addressSection_addressLine1Local`, `addressSection_addressLine2Local`, `addressSection_addressLine3Local`, `addressSection_cityLocal`, `addressSection_postalCodeLocal`, `legalNameSection_firstNameLocal`, `legalNameSection_lastNameLocal`, `legalNameSection_middleNameLocal`.
  - Expanded `getNestedValue` to support dual root resolution for `personalDetails` and `personal` object keys.
- **Fuzzy Matcher Global Kill-Switch (`content/matcher.js`)**:
  - Implemented a hard abort validation in generic Q&A fuzzy-matcher loop. If element `id`, `name`, `data-automation-id`, or associated `<label>` contains `['address', 'city', 'postal', 'zip', 'name', 'phone', 'local']`, generic fuzzy Q&A matching immediately aborts and returns `null`.
- **React Dropdown Interaction Handling (`content/content_script.js`)**:
  - Upgraded `handleWorkdayDropdown` to accept DOM elements or string queries, dispatch native MouseEvent clicks on widget triggers, wait 400ms for React listbox DOM rendering, query `[data-automation-id="promptOption"]` / `li[role="option"]`, and dispatch native click events on target options (e.g. `"Mr"`).

---

## [1.16.1] - 2026-08-04

### 🛠️ Hotfix: "Shotgun Effect" Isolation & Strict 1:1 Workday Field Mapping
- **Bypass Fuzzy Q&A Matching for Core Fields (`content/content_script.js` & `content/matcher.js`)**:
  - Isolated predefined Workday `data-automation-id` fields (`legalNameSection_firstName`, `addressSection_addressLine1`, `addressSection_city`, `phone-number`, etc.) so they exclusively pull from Personal Details and bypass screening Q&A fuzzy matching.
- **Strict 1:1 Personal Details Mapping**:
  - Enforced 1:1 exact mapping for `firstName`, `middleName`, `lastName`, `addressLine1`, `addressLine2`, `addressLine3`, `city`, `state`, `zipCode`, and `phoneExtension`.
- **Data Formatting & Empty String Fallback (`content/matcher.js`)**:
  - Configured `addressLine2`, `addressLine3`, and `middleName` to return explicit empty strings (`""`) rather than `undefined` or falling back to `addressLine1`/`fullName` to prevent React UI artifacting.

---

## [1.16.0] - 2026-08-04

### 🏢 Workday Custom Dropdown Handler & Expanded Automation Dictionary
- **Expanded Workday Dictionary (`content/matcher.js`)**:
  - Updated `WORKDAY_AUTOMATION_MAP` with `legalNameSection_firstName`, `legalNameSection_lastName`, `addressSection_addressLine1`, `addressSection_city`, `addressSection_countryRegion`, `phone-device-type`, and `phone-number`.
- **Workday Custom Dropdown Handler (`content/content_script.js`)**:
  - Implemented `handleWorkdayDropdown(questionText, answerToSelect)` for React select widgets (`[data-automation-id="selectWidget"]`, `div[role="combobox"]`, `button[aria-haspopup="listbox"]`).
  - Uses XPath label targeting, clicks dropdown trigger, waits 300ms for React DOM listbox rendering, and clicks the matching option (`li[role="option"]`, `div[role="option"]`).
- **Dynamic Q&A Matching for Custom Widgets (`content/content_script.js`)**:
  - Automatically matches visible custom dropdown widgets on "Application Questions" and "Voluntary Disclosures" steps against the candidate's saved `ScreeningQA` bank in `chrome.storage.local`.

---

## [1.14.1] - 2026-08-04

### 🛠️ Hotfix: Ghost Click Fix & 500ms React State Delay
- **500ms React Virtual DOM Delay (`content/content_script.js`)**:
  - Increased the post-injection delay in `executeLoginFlow` to 500ms to guarantee Workday's React state handlers process injected credentials before the submit click fires.
- **Broadened Sign-In Button Queries & XPath Fallback (`content/content_script.js`)**:
  - Expanded `findLoginSubmitButton` to query `[data-automation-id="signInSubmitButton"]`, `button[aria-label="Sign In"]`, `div[data-automation-id="click_filter"]`, `[data-automation-id="click_sub"]`, `[data-automation-id="signInButton"]`, and `[data-automation-id="loginSubmitButton"]`.
  - Added an XPath fallback to locate visible elements containing exact text `"Sign In"`.

---

## [1.14.0] - 2026-08-04

### 🔑 Dual-Mode Workday Auto-Auth Engine (Sign In Fallback)
- **Dual-Mode Auth Detection (`content/content_script.js`)**:
  - Automatically evaluates auth form fields on screen. If `confirmPassword` input exists and is visible, executes **Mode A (Account Creation)**. If `confirmPassword` is absent, switches to **Mode B (Sign In)**.
- **Sign-In Mode Logic (`content/content_script.js`)**:
  - Injects email and password into `[data-automation-id="email"]` and `[data-automation-id="password"]` using React-safe setters.
  - Queries `[data-automation-id="signInSubmitButton"]`, `[data-automation-id="click_sub"]`, or `[data-automation-id="signInButton"]` (with fallback to visible `"Sign In"` / `"Log In"` buttons).
  - Implemented 200ms delay prior to submit click to allow React / Angular SPA state handlers to register injected text cleanly.

---

## [1.13.0] - 2026-08-04

### 🏢 Workday Auto-Fill Engine & React-Safe Data Injection
- **Workday Automation ID Mapping Dictionary (`content/matcher.js`)**:
  - Created `WORKDAY_AUTOMATION_MAP` dictionary linking profile data directly to Workday internal automation IDs:
    - `legalNameSection_firstName`, `firstName` ➔ `personal.firstName`
    - `legalNameSection_lastName`, `lastName` ➔ `personal.lastName`
    - `addressSection_addressLine1`, `addressLine1` ➔ `personal.address`
    - `addressSection_city`, `city` ➔ `personal.city`
    - `addressSection_countryRegion`, `state` ➔ `personal.state`
    - `addressSection_postalCode`, `postalCode` ➔ `personal.zipCode`
    - `phone-number`, `contactInformationPage_phoneNumber`, `phoneNumber` ➔ `personal.phone`
    - `email`, `contactInformationPage_email` ➔ `credentials.email`
    - `linkedin`, `website` ➔ `personal.linkedin`
  - Exported `matchWorkdayAutomationId(automationId, profile)` helper in `UniversalMatcher`.
- **React-Safe Data Injection (`content/content_script.js`)**:
  - Enhanced `setNativeValue` using native property setters (`HTMLInputElement.prototype`, `HTMLTextAreaElement.prototype`) to update React/SPA internal state.
  - Automatically dispatches `input`, `change`, and `blur` events immediately after injection.
- **Trigger Wiring (`content/content_script.js`)**:
  - Wired `performAutoFill` (`TRIGGER_AUTOFILL`) to query all `[data-automation-id]` fields first and execute React-safe injection across the "My Information" step.

---

## [1.12.1] - 2026-08-04

### 🛠️ Hotfix: Apply Button Phrase Expansion & Iframe Fallback
- **Expanded Button Matching Phrases (`content/content_script.js`)**:
  - Added `"apply for job"` (Barclays portal), `"apply for a job"`, `"apply to job"`, and `"apply today"` to target phrases.
- **Enhanced Matching Logic (`content/content_script.js`)**:
  - Updated matching condition to check if button text matches valid phrases OR starts with `"apply"` while filtering out negative keywords (`filter`, `search`, `save`, `login`, `sign in`, `remove`, `delete`, `share`, `help`, `menu`).
- **Same-Origin Iframe & Container Sorting Fallback**:
  - Automatically queries candidate buttons within embedded same-origin ATS iframes (Workday, Phenom, Barclays, Taleo).
  - Prioritizes candidates within `<main>`, `article`, `[role="main"]`, `#content`, `.job-details`.

---

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
