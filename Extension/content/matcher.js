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
    { keys: ['confirm password', 're-enter password', 'verify password', 'password confirmation'], path: 'credentials.password', isConfirmPassword: true },
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

    // 3. Work Experience & Target Role
    { keys: ['current job title', 'current role', 'present position', 'recent job title', 'designation', 'current designation', 'title', 'position'], path: 'work.currentRole.jobTitle' },
    { keys: ['current company', 'present company', 'company name', 'current employer', 'employer', 'organization'], path: 'work.currentRole.company' },
    { keys: ['total experience', 'years of experience', 'years experience', 'total exp', 'overall experience'], path: 'work.currentRole.yearsExperience' },
    { keys: ['current ctc', 'current salary', 'present salary', 'current compensation'], path: 'work.currentRole.currentSalary' },

    { keys: ['target job title', 'desired role', 'target role', 'role applying for', 'applied position'], path: 'work.targetRole.jobTitle' },
    { keys: ['expected ctc', 'expected salary', 'desired salary', 'expected compensation'], path: 'work.targetRole.expectedSalary' },
    { keys: ['notice period', 'notice', 'how soon can you start', 'availability', 'joining time'], path: 'work.targetRole.noticePeriod' },
    { keys: ['preferred location', 'target location', 'desired location', 'work location'], path: 'work.targetRole.targetLocation' },
    { keys: ['work mode', 'preferred mode', 'remote preference'], path: 'work.targetRole.workMode' },

    // 4. Education History
    { keys: ['highest degree', 'degree', 'qualification', 'education level', 'degree earned'], path: 'education.degree' },
    { keys: ['field of study', 'major', 'stream', 'specialization', 'branch', 'course'], path: 'education.major' },
    { keys: ['university', 'college', 'school', 'institution', 'institute'], path: 'education.university' },
    { keys: ['graduation year', 'year of passing', 'passing year', 'completion year', 'grad year'], path: 'education.graduationYear' },
    { keys: ['gpa', 'cgpa', 'percentage', 'marks', 'grade'], path: 'education.gpa' }
  ];

  /**
   * Helper to safely extract nested value from object path (e.g. 'work.currentRole.jobTitle')
   */
  function getNestedValue(obj, path) {
    if (!obj || !path) return null;
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current === undefined || current === null) return null;
      current = current[key];
    }
    return current;
  }

  /**
   * Checks if an input element is a search bar (to avoid filling site search inputs)
   */
  function isSearchInput(el) {
    if (!el) return false;

    // Search inputs on search engines or navbar search bars
    const type = (el.type || '').toLowerCase();
    if (type === 'search') return true;

    const id = (el.id || '').toLowerCase();
    const name = (el.name || '').toLowerCase();

    if (id.includes('search') || name.includes('search') || name === 'q' || name === 'l') {
      // Check if it's inside an actual job application form modal
      const isForm = el.closest('form, div[role="dialog"], modal, .ia-FormGroup, .application-form');
      if (!isForm) return true;
    }

    return false;
  }

  /**
   * Aggregate all label text, placeholders, aria attributes, names & IDs associated with element
   */
  function getElementLabelText(el) {
    let labelTexts = [];

    // 1. HTML5 <label for="id">
    if (el.id) {
      try {
        const labelEl = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (labelEl) labelTexts.push(labelEl.textContent);
      } catch(e) {}
    }

    // 2. Direct parent <label>
    const parentLabel = el.closest('label');
    if (parentLabel) {
      labelTexts.push(parentLabel.textContent);
    }

    // 3. aria-labelledby target text
    const ariaLabelledBy = el.getAttribute('aria-labelledby');
    if (ariaLabelledBy) {
      ariaLabelledBy.split(' ').forEach(id => {
        const target = document.getElementById(id);
        if (target) labelTexts.push(target.textContent);
      });
    }

    // 4. Attributes: autocomplete, aria-label, placeholder, name, id, data-testid, title
    if (el.getAttribute('autocomplete')) labelTexts.push(el.getAttribute('autocomplete'));
    if (el.getAttribute('aria-label')) labelTexts.push(el.getAttribute('aria-label'));
    if (el.getAttribute('data-testid')) labelTexts.push(el.getAttribute('data-testid'));
    if (el.placeholder) labelTexts.push(el.placeholder);
    if (el.name) labelTexts.push(el.name);
    if (el.id) labelTexts.push(el.id);
    if (el.title) labelTexts.push(el.title);

    // 5. Parent container heading / label / subtext
    const container = el.closest('.form-group, .field, .form-item, fieldset, form > div, div[class*="Form"], div[class*="input"], div[class*="field"]');
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

    // Check screening Q&A bank
    if (profile.screening && Array.isArray(profile.screening)) {
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

  return {
    matchField,
    getElementLabelText,
    isSearchInput
  };
})();
