/**
 * Universal Auto-Fill Engine - Matcher Module
 * High-precision Fuzzy & Semantic Label Identifier Engine
 */

window.UniversalMatcher = (function() {

  // Field dictionary mapping label/placeholder/name keywords to profile paths
  const FIELD_MAPPINGS = [
    // 1. Account Credentials & Logins
    { keys: ['confirm email', 're-enter email', 'verify email'], path: 'credentials.email' },
    { keys: ['this is how we\'ll communicate with you', 'email address', 'email', 'e-mail', 'user email', 'work email', 'personal email', 'gmail', 'login email', 'email id', 'username'], path: 'credentials.email' },
    { keys: ['confirm password', 're-enter password', 'verify password', 'verify new password', 'confirm new password', 'password confirmation'], path: 'credentials.password', isConfirmPassword: true },
    { keys: ['account password', 'create password', 'new password', 'portal password', 'user password', 'password'], path: 'credentials.password' },

    // 2. Personal Information
    { keys: ['first name', 'given name', 'fname', 'forename'], path: 'personal.firstName' },
    { keys: ['last name', 'family name', 'surname', 'lname'], path: 'personal.lastName' },
    { keys: ['full name', 'candidate name', 'your name', 'applicant name', 'name'], path: 'personal.fullName' },
    { keys: ['phone number', 'mobile number', 'contact number', 'phone', 'mobile', 'cell', 'telephone'], path: 'personal.phone' },
    { keys: ['street address', 'address line 1', 'address', 'residence address'], path: 'personal.address' },
    { keys: ['city', 'current city', 'town', 'location city'], path: 'personal.city' },
    { keys: ['state', 'province', 'region'], path: 'personal.state' },
    { keys: ['country', 'nation'], path: 'personal.country' },
    { keys: ['zip code', 'postal code', 'pincode', 'pin code', 'zip'], path: 'personal.zipCode' },
    { keys: ['linkedin', 'linkedin profile', 'linkedin url', 'linkedin link'], path: 'personal.linkedin' },
    { keys: ['github', 'github url', 'github profile'], path: 'personal.github' },
    { keys: ['portfolio', 'website', 'personal site', 'blog', 'url'], path: 'personal.portfolio' },

    // 3. Work Experience & Date Fields
    { keys: ['current job title', 'current role', 'present position', 'recent job title', 'designation', 'current designation', 'title', 'position'], path: 'work.currentRole.jobTitle' },
    { keys: ['current company', 'present company', 'company name', 'current employer', 'employer', 'organization'], path: 'work.currentRole.company' },
    { keys: ['total experience', 'years of experience', 'years experience', 'total exp', 'overall experience'], path: 'work.currentRole.yearsExperience' },
    { keys: ['current ctc', 'current salary', 'present salary', 'current compensation'], path: 'work.currentRole.currentSalary' },
    { keys: ['job start month', 'work start month', 'from month', 'start month', 'joining month'], path: 'work.currentRole.startMonth' },
    { keys: ['job start year', 'work start year', 'from year', 'start year', 'joining year'], path: 'work.currentRole.startYear' },
    { keys: ['job end month', 'work end month', 'to month', 'end month', 'leaving month'], path: 'work.currentRole.endMonth' },
    { keys: ['job end year', 'work end year', 'to year', 'end year', 'leaving year'], path: 'work.currentRole.endYear' },
    { keys: ['currently work here', 'presently working', 'current job'], path: 'work.currentRole.isCurrent' },

    // 4. Education History & Dates
    { keys: ['highest degree', 'degree', 'qualification', 'education level', 'degree earned'], path: 'education.degree' },
    { keys: ['field of study', 'major', 'stream', 'specialization', 'branch', 'course'], path: 'education.major' },
    { keys: ['university', 'college', 'school', 'institution', 'institute'], path: 'education.university' },
    { keys: ['graduation month', 'education end month', 'passing month', 'degree end month'], path: 'education.endMonth' },
    { keys: ['graduation year', 'year of passing', 'passing year', 'completion year', 'grad year', 'education end year', 'degree end year'], path: 'education.endYear' },
    { keys: ['education start month', 'college start month', 'degree start month'], path: 'education.startMonth' },
    { keys: ['education start year', 'college start year', 'degree start year'], path: 'education.startYear' },
    { keys: ['currently study here', 'currently studying', 'present education'], path: 'education.isCurrent' },
    { keys: ['gpa', 'cgpa', 'percentage', 'marks', 'grade'], path: 'education.gpa' },

    // 5. Consent & Terms Checkboxes
    { keys: ['consent', 'terms', 'agree', 'processing of my personal data', 'acknowledge', 'terms of service', 'privacy policy', 'privacy', 'accept', 'condition', 'legal statement'], path: 'settings.autoCheckTerms', isConsentCheckbox: true }
  ];

  /**
   * Helper to dynamically calculate total years of experience across work history
   */
  function calculateTotalExperienceYears(profile) {
    const workList = profile.workExperiences || (profile.work?.currentRole ? [profile.work.currentRole] : []);
    if (!workList || !workList.length) return "0";

    let totalMonths = 0;
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

    workList.forEach(w => {
      if (w.yearsExperience && !w.startYear) {
        totalMonths += (parseFloat(w.yearsExperience) || 0) * 12;
        return;
      }

      if (!w.startYear) return;
      const sYr = parseInt(w.startYear, 10);
      if (isNaN(sYr)) return;

      let sMo = months.indexOf(String(w.startMonth || '').toLowerCase());
      if (sMo === -1) sMo = parseInt(w.startMonth, 10) - 1 || 0;

      let eYr, eMo;
      if (w.isCurrent) {
        const now = new Date();
        eYr = now.getFullYear();
        eMo = now.getMonth();
      } else {
        eYr = parseInt(w.endYear, 10) || new Date().getFullYear();
        eMo = months.indexOf(String(w.endMonth || '').toLowerCase());
        if (eMo === -1) eMo = parseInt(w.endMonth, 10) - 1 || 11;
      }

      const monthsDiff = Math.max(0, (eYr - sYr) * 12 + (eMo - sMo));
      totalMonths += monthsDiff;
    });

    const totalYears = totalMonths / 12;
    return totalYears % 1 === 0 ? totalYears.toString() : totalYears.toFixed(1);
  }

  /**
   * Helper to safely extract nested value from object path (e.g. 'work.currentRole.jobTitle')
   * Supports fallback root resolution for personalDetails vs personal
   */
  function getNestedValue(obj, path) {
    if (!obj || !path) return null;
    if (path === 'work.currentRole.yearsExperience') {
      const direct = obj.work?.currentRole?.yearsExperience;
      if (direct !== undefined && direct !== null && direct !== "" && direct !== "0") return direct;
      return calculateTotalExperienceYears(obj);
    }
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current === undefined || current === null) break;
      current = current[key];
    }
    if (current !== undefined && current !== null && current !== "") return current;

    // Root fallback resolution (personalDetails vs personal)
    if (path.startsWith('personal.')) {
      const prop = path.split('.')[1];
      const pd = obj.personalDetails || {};
      const altPropMap = {
        'address': pd.addressLine1 || pd.address,
        'addressLine2': pd.addressLine2,
        'addressLine3': pd.addressLine3,
        'zipCode': pd.postalCode || pd.zipCode || pd.zip,
        'city': pd.city,
        'state': pd.state || pd.province || pd.countryRegion,
        'country': pd.country,
        'firstName': pd.firstName,
        'lastName': pd.lastName,
        'middleName': pd.middleName,
        'fullName': pd.fullName,
        'phone': pd.phone || pd.phoneNumber,
        'phoneType': pd.phoneType || pd.phoneDeviceType
      };
      const altVal = altPropMap[prop];
      if (altVal !== undefined && altVal !== null && altVal !== "") return altVal;
    }

    return null;
  }

  /**
   * Checks if an input element is a search bar (to avoid filling site search inputs)
   */
  function isSearchInput(el) {
    if (!el) return false;
    const type = (el.type || '').toLowerCase();
    const role = (el.getAttribute('role') || '').toLowerCase();
    const id = (el.id || '').toLowerCase();
    const name = (el.name || '').toLowerCase();
    const placeholder = (el.placeholder || '').toLowerCase();
    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();

    if (type === 'search' || role === 'searchbox') return true;

    const searchKeywords = ['search', 'find', 'query', 'filter'];
    return searchKeywords.some(kw => id.includes(kw) || name.includes(kw) || placeholder.includes(kw) || ariaLabel.includes(kw));
  }

  /**
   * Helper to extract associated label or contextual header text for an input element
   */
  function getElementLabelText(el) {
    if (!el) return "";

    const labelTexts = [];

    // 1. Explicit <label for="id">
    if (el.id) {
      try {
        const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (label) labelTexts.push(label.textContent);
      } catch (e) {}
    }

    // 2. Parent <label> element
    const parentLabel = el.closest('label');
    if (parentLabel) labelTexts.push(parentLabel.textContent);

    // 3. aria-label or aria-labelledby
    const ariaLabel = el.getAttribute('aria-label');
    if (ariaLabel) labelTexts.push(ariaLabel);

    const ariaLabelledBy = el.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      const ids = ariaLabelledBy.split(' ');
      ids.forEach(id => {
        try {
          const lbl = document.getElementById(id);
          if (lbl) labelTexts.push(lbl.textContent);
        } catch (e) {}
      });
    }

    // 4. placeholder or title or name attribute or data-automation-id
    if (el.placeholder) labelTexts.push(el.placeholder);
    if (el.title) labelTexts.push(el.title);
    if (el.name) labelTexts.push(el.name);
    const autoId = el.getAttribute('data-automation-id');
    if (autoId) labelTexts.push(autoId);

    // 5. Contextual header/label inside closest fieldset, form-group, or wrapper
    const container = el.closest('.form-group, fieldset, div[class*="field"], div[class*="Form"], div[class*="group"], tr, td');
    if (container) {
      const header = container.querySelector('label, h1, h2, h3, h4, legend, [class*="label"], [class*="title"], [class*="header"]');
      if (header) labelTexts.push(header.textContent);

      const subtext = container.querySelector('p, small, span, div, [class*="desc"], [class*="help"], [class*="subtext"]');
      if (subtext) labelTexts.push(subtext.textContent);
    }

    return labelTexts.join(' ').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  /**
   * Main matching logic for a given HTML form input element
   */
  function matchField(el, profile, mode = "ALL") {
    if (!profile) return null;
    if (isSearchInput(el)) return null;

    const labelText = getElementLabelText(el);
    const type = (el.type || '').toLowerCase();
    const id = (el.id || '').toLowerCase();
    const name = (el.name || '').toLowerCase();
    const automationId = (el.getAttribute('data-automation-id') || '').toLowerCase();

    // Mode: CREDENTIALS (Only fill Email & Password for portal login / signup)
    if (mode === "CREDENTIALS") {
      if (type === 'password' || labelText.includes('password')) {
        const passVal = getNestedValue(profile, 'credentials.password');
        if (passVal) return { value: passVal, confidence: 0.99, keyMatched: 'password' };
      }
      if (type === 'email' || labelText.includes('email') || labelText.includes('gmail') || labelText.includes('username')) {
        const emailVal = getNestedValue(profile, 'credentials.email') || getNestedValue(profile, 'personal.email');
        if (emailVal) return { value: emailVal, confidence: 0.99, keyMatched: 'email' };
      }
      return null;
    }

    // Direct password check
    if (type === 'password') {
      const passVal = getNestedValue(profile, 'credentials.password');
      if (passVal) return { value: passVal, confidence: 0.99, keyMatched: 'password' };
    }

    // Direct email type check
    if (type === 'email') {
      const emailVal = getNestedValue(profile, 'credentials.email') || getNestedValue(profile, 'personal.email');
      if (emailVal) return { value: emailVal, confidence: 0.99, keyMatched: 'email' };
    }

    if (!labelText) return null;

    // Check direct dictionary mappings
    for (const mapping of FIELD_MAPPINGS) {
      for (const key of mapping.keys) {
        if (labelText.includes(key)) {
          const val = getNestedValue(profile, mapping.path);
          if (val !== null && val !== undefined && val !== "") {
            return { value: val, confidence: 0.95, keyMatched: key };
          }
        }
      }
    }

    // FUZZY MATCHER GLOBAL KILL-SWITCH BLACKLIST
    const blacklist = ['address', 'city', 'postal', 'zip', 'name', 'phone', 'local'];
    const combinedAttributeStr = `${id} ${name} ${automationId} ${labelText}`.toLowerCase();

    // Check screening Q&A bank
    if (profile.screening && Array.isArray(profile.screening)) {
      // Hard abort validation if any blacklisted keyword is found in element attributes or label
      if (blacklist.some(word => combinedAttributeStr.includes(word))) {
        return null;
      }

      for (const item of profile.screening) {
        const keywords = item.keywords.toLowerCase().split(',').map(k => k.trim());
        for (const kw of keywords) {
          if (kw && labelText.includes(kw)) {
            return { value: item.answer, confidence: 0.85, keyMatched: kw };
          }
        }
      }
    }

    return null;
  }

  const CONSENT_KEYWORDS = [
    'consent', 'terms', 'agree', 'processing of my personal data', 'acknowledge', 
    'terms of service', 'privacy policy', 'privacy', 'accept', 'condition', 
    'legal statement', 'data processing', 'terms & conditions', 'policy'
  ];

  // Strict 1:1 Workday & Barclays data-automation-id/id/name/data-fkit-id mapping dictionary
  const WORKDAY_AUTOMATION_MAP = [
    // Legal Name Section (Native, Barclays & Localized)
    { ids: ['legalnamesection_firstnamelocal', 'legalnamesection_firstname', 'firstname', 'legalname_firstname', 'legalname--firstname', 'firstnamelocal'], path: 'personal.firstName', defaultVal: "" },
    { ids: ['legalnamesection_middlenamelocal', 'legalnamesection_middlename', 'middlename', 'legalname_middlename', 'legalname--middlename', 'middlenamelocal'], path: 'personal.middleName', defaultVal: "" },
    { ids: ['legalnamesection_lastnamelocal', 'legalnamesection_lastname', 'lastname', 'legalname_lastname', 'legalname--lastname', 'lastnamelocal'], path: 'personal.lastName', defaultVal: "" },
    { ids: ['legalnamesection_fullnamelocal', 'legalnamesection_fullname', 'fullname', 'legalname--fullname', 'fullnamelocal'], path: 'personal.fullName', defaultVal: "" },

    // Address Section (Native, Barclays fkit-id / id / name & Localized)
    { ids: ['address--addressline1local', 'addressline1local', 'addresssection_addressline1local', 'address--addressline1', 'addresssection_addressline1', 'addressline1', 'streetaddress'], path: 'personal.address', defaultVal: "" },
    { ids: ['address--addressline2local', 'addressline2local', 'addresssection_addressline2local', 'address--addressline2', 'addresssection_addressline2', 'addressline2'], path: 'personal.addressLine2', defaultVal: "" },
    { ids: ['address--addressline3local', 'addressline3local', 'addresssection_addressline3local', 'address--addressline3', 'addresssection_addressline3', 'addressline3'], path: 'personal.addressLine3', defaultVal: "" },
    { ids: ['address--citylocal', 'citylocal', 'addresssection_citylocal', 'address--city', 'addresssection_city', 'city'], path: 'personal.city', defaultVal: "" },
    { ids: ['address--countryregionlocal', 'countryregionlocal', 'addresssection_countryregionlocal', 'address--countryregion', 'addresssection_countryregion', 'state', 'province'], path: 'personal.state', defaultVal: "" },
    { ids: ['address--postalcodelocal', 'postalcodelocal', 'addresssection_postalcodelocal', 'address--postalcode', 'addresssection_postalcode', 'postalcode', 'zipcode', 'zip'], path: 'personal.zipCode', defaultVal: "" },
    { ids: ['address--countrylocal', 'countrylocal', 'addresssection_countrylocal', 'address--country', 'addresssection_country', 'country'], path: 'personal.country', defaultVal: "" },

    // Phone & Contact Section
    { ids: ['phone-device-type', 'devicetype', 'phonetype'], path: 'personal.phoneType', defaultVal: "Mobile" },
    { ids: ['phoneextension', 'phone-extension'], path: 'personal.phoneExtension', defaultVal: "" },
    { ids: ['phone-number', 'contactinformationpage_phonenumber', 'phonenumber', 'phone'], path: 'personal.phone', defaultVal: "" },
    { ids: ['email', 'contactinformationpage_email', 'emailaddress'], path: 'credentials.email', defaultVal: "" },

    // Links & Socials
    { ids: ['linkedin', 'website', 'portfolio'], path: 'personal.linkedin', defaultVal: "" },
    { ids: ['github'], path: 'personal.github', defaultVal: "" }
  ];

  /**
   * Directly matches Workday & Barclays internal attributes (data-automation-id, id, name, data-fkit-id) to profile data.
   * Accepts either an HTML Element or a string attribute value.
   */
  function matchWorkdayAutomationId(elOrId, profile) {
    if (!elOrId || !profile) return null;

    let targetStr = "";
    if (typeof elOrId === 'string') {
      targetStr = elOrId.toLowerCase().trim();
    } else if (elOrId instanceof Element) {
      const id = elOrId.id || '';
      const name = elOrId.getAttribute('name') || '';
      const autoId = elOrId.getAttribute('data-automation-id') || '';
      const fkitId = elOrId.getAttribute('data-fkit-id') || '';
      targetStr = `${id} ${name} ${autoId} ${fkitId}`.toLowerCase().trim();
    }

    if (!targetStr) return null;

    for (const item of WORKDAY_AUTOMATION_MAP) {
      if (item.ids.some(key => targetStr.includes(key.toLowerCase()))) {
        const val = getNestedValue(profile, item.path);
        // Explicitly return string value or defaultVal ("") rather than falling back to invalid properties
        const finalValue = (val !== null && val !== undefined) ? String(val) : (item.defaultVal !== undefined ? item.defaultVal : "");
        return { value: finalValue, path: item.path, isWorkdayCore: true };
      }
    }
    return null;
  }

  /**
   * Helper to determine if a checkbox or role="checkbox" element is for consent/terms
   */
  function isConsentCheckbox(el) {
    if (!el) return false;
    const labelText = getElementLabelText(el);
    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
    const title = (el.getAttribute('title') || '').toLowerCase();
    const automationId = (el.getAttribute('data-automation-id') || '').toLowerCase();
    
    // Parent or wrapper text (common in Workday / SPAs)
    const parentText = (el.parentElement ? el.parentElement.textContent : '').toLowerCase();
    const grandParentText = (el.parentElement && el.parentElement.parentElement ? el.parentElement.parentElement.textContent : '').toLowerCase();

    const combinedText = `${labelText} ${ariaLabel} ${title} ${automationId} ${parentText} ${grandParentText}`.toLowerCase();

    return CONSENT_KEYWORDS.some(kw => combinedText.includes(kw));
  }

  return {
    matchField,
    matchWorkdayAutomationId,
    getElementLabelText,
    isSearchInput,
    isConsentCheckbox
  };
})();
