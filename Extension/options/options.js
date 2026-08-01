document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const pageTitle = document.getElementById('page-title');
  const toastBanner = document.getElementById('toast-banner');
  const btnSave = document.getElementById('btn-save');
  const btnAddQA = document.getElementById('btn-add-qa');
  const btnAddWork = document.getElementById('btn-add-work');
  const screeningList = document.getElementById('screening-list');
  const workExperienceList = document.getElementById('work-experience-list');
  const registeredDomainsList = document.getElementById('registered-domains-list');
  const btnAddDomain = document.getElementById('btn-add-domain');
  const btnExport = document.getElementById('btn-export');
  const btnImportTrigger = document.getElementById('btn-import-trigger');
  const fileImport = document.getElementById('file-import');

  let currentProfileData = null;

  const TAB_TITLES = {
    'tab-credentials': 'Logins & Portal Credentials',
    'tab-personal': 'Personal Information',
    'tab-work': 'Work Experience',
    'tab-education': 'Education History',
    'tab-screening': 'Custom Screening Q&A Bank',
    'tab-settings': 'Extension Settings & Backup'
  };

  // 1. Tab Navigation
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');
      navItems.forEach(n => n.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      item.classList.add('active');
      document.getElementById(targetTab).classList.add('active');
      pageTitle.textContent = TAB_TITLES[targetTab] || 'Profile Manager';
    });
  });

  // 2. Load Profile Data & Registered Domains
  function loadProfile() {
    chrome.storage.local.get(['profile', 'registeredDomains'], (result) => {
      if (result.profile) {
        currentProfileData = result.profile;
        populateForm(currentProfileData);
      }
      const domains = result.registeredDomains || result.profile?.registeredDomains || [];
      renderRegisteredDomains(domains);
    });
  }

  function renderRegisteredDomains(domainsArray) {
    if (!registeredDomainsList) return;
    registeredDomainsList.innerHTML = '';

    if (!domainsArray || domainsArray.length === 0) {
      registeredDomainsList.innerHTML = `
        <div class="empty-domain-state">No registered domains yet. Auto sign-up (Alt+S) will automatically register portals here!</div>
      `;
      return;
    }

    domainsArray.forEach(domain => {
      const item = document.createElement('div');
      item.className = 'domain-item';
      item.innerHTML = `
        <span class="domain-name-tag">🌐 ${escapeHtml(domain)}</span>
        <button type="button" class="domain-delete-btn" title="Remove domain registration">🗑️ Delete</button>
      `;

      item.querySelector('.domain-delete-btn').addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: "DELETE_REGISTERED_DOMAIN", domain: domain }, (res) => {
          showToastBanner(`Removed ${domain} from Registered Portals`);
          renderRegisteredDomains(res.registeredDomains || []);
        });
      });

      registeredDomainsList.appendChild(item);
    });
  }

  function populateForm(p) {
    // Credentials
    setVal('cred-email', p.credentials?.email);
    setVal('cred-password', p.credentials?.password);
    setVal('cred-username', p.credentials?.username);
    setVal('cred-alt-email', p.credentials?.altEmail);

    // Personal
    setVal('personal-first-name', p.personal?.firstName);
    setVal('personal-last-name', p.personal?.lastName);
    setVal('personal-full-name', p.personal?.fullName);
    setVal('personal-phone', p.personal?.phone);
    setVal('personal-address', p.personal?.address);
    setVal('personal-city', p.personal?.city);
    setVal('personal-state', p.personal?.state);
    setVal('personal-country', p.personal?.country);
    setVal('personal-zip', p.personal?.zipCode);
    setVal('personal-linkedin', p.personal?.linkedin);
    setVal('personal-github', p.personal?.github);
    setVal('personal-portfolio', p.personal?.portfolio);

    // Work Experience Array (with fallback to currentRole)
    let workList = p.workExperiences;
    if (!workList || !Array.isArray(workList) || workList.length === 0) {
      if (p.work?.currentRole && p.work.currentRole.company) {
        workList = [{
          company: p.work.currentRole.company || '',
          jobTitle: p.work.currentRole.jobTitle || '',
          yearsExperience: p.work.currentRole.yearsExperience || '',
          currentSalary: p.work.currentRole.currentSalary || '',
          location: p.personal?.city || '',
          description: ''
        }];
      } else {
        workList = [];
      }
    }
    renderWorkExperienceList(workList);

    // Education
    setVal('edu-degree', p.education?.degree);
    setVal('edu-major', p.education?.major);
    setVal('edu-university', p.education?.university);
    setVal('edu-gpa', p.education?.gpa);
    setVal('edu-start-month', p.education?.startMonth);
    setVal('edu-start-year', p.education?.startYear);
    setVal('edu-end-month', p.education?.endMonth);
    setVal('edu-end-year', p.education?.endYear || p.education?.graduationYear);
    setCheck('edu-is-current', p.education?.isCurrent);

    const eduIsCurrent = document.getElementById('edu-is-current');
    const eduToGroup = document.getElementById('edu-to-group');
    const eduEndMonth = document.getElementById('edu-end-month');
    const eduEndYear = document.getElementById('edu-end-year');

    if (eduIsCurrent) {
      if (eduIsCurrent.checked && eduToGroup) {
        eduToGroup.classList.add('disabled-date-group');
        if (eduEndMonth) eduEndMonth.disabled = true;
        if (eduEndYear) eduEndYear.disabled = true;
      }
      eduIsCurrent.addEventListener('change', () => {
        if (eduIsCurrent.checked) {
          eduToGroup?.classList.add('disabled-date-group');
          if (eduEndMonth) eduEndMonth.disabled = true;
          if (eduEndYear) eduEndYear.disabled = true;
        } else {
          eduToGroup?.classList.remove('disabled-date-group');
          if (eduEndMonth) eduEndMonth.disabled = false;
          if (eduEndYear) eduEndYear.disabled = false;
        }
      });
    }

    // Settings
    setCheck('set-highlight', p.settings?.highlightFilledFields !== false);
    setCheck('set-auto-nav', p.settings?.autoNavigateEnabled !== false);
    setCheck('set-auto-auth', p.settings?.autoAuthEnabled !== false);
    setCheck('set-instant-email', p.settings?.instantEmailAutoFill !== false);
    setCheck('set-agree-submit', p.settings?.autoSubmitOnAgreement !== false);
    setCheck('set-terms', p.settings?.autoCheckTerms !== false);
    setCheck('set-signup-submit', p.settings?.autoSubmitSignUp !== false);
    setCheck('set-onload', p.settings?.autoFillOnLoad === true);

    // Screening Q&A
    renderScreeningList(p.screening || []);
  }

  // Work Experience Dynamic UI
  function renderWorkExperienceList(workArray) {
    if (!workExperienceList) return;
    workExperienceList.innerHTML = '';
    if (workArray.length === 0) {
      // Add one default empty work experience row
      addWorkItemRow();
    } else {
      workArray.forEach((item, index) => {
        addWorkItemRow(item, index);
      });
    }
  }

  function getMonthOptionsHTML(selectedMonth = '') {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const selLower = String(selectedMonth || '').toLowerCase().trim();
    return months.map(m => {
      const isSel = selLower === m.toLowerCase() || selLower === m.substring(0, 3).toLowerCase();
      return `<option value="${m}" ${isSel ? 'selected' : ''}>${m}</option>`;
    }).join('');
  }

  function calculateYearsDiff(startMonth, startYear, endMonth, endYear, isCurrent) {
    if (!startYear) return "0";
    const sYr = parseInt(startYear, 10);
    if (isNaN(sYr)) return "0";

    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    let sMo = months.indexOf(String(startMonth || '').toLowerCase());
    if (sMo === -1) sMo = parseInt(startMonth, 10) - 1 || 0;

    let eYr, eMo;
    if (isCurrent) {
      const now = new Date();
      eYr = now.getFullYear();
      eMo = now.getMonth();
    } else {
      eYr = parseInt(endYear, 10) || new Date().getFullYear();
      eMo = months.indexOf(String(endMonth || '').toLowerCase());
      if (eMo === -1) eMo = parseInt(endMonth, 10) - 1 || 11;
    }

    const monthsDiff = Math.max(0, (eYr - sYr) * 12 + (eMo - sMo));
    const totalYears = monthsDiff / 12;
    return totalYears % 1 === 0 ? totalYears.toString() : totalYears.toFixed(1);
  }

  function addWorkItemRow(item = {}, index = Date.now()) {
    if (!workExperienceList) return;
    const company = item.company || '';
    const jobTitle = item.jobTitle || '';
    const startMonth = item.startMonth || '';
    const startYear = item.startYear || '';
    const endMonth = item.endMonth || '';
    const endYear = item.endYear || '';
    const isCurrent = !!item.isCurrent;
    const salary = item.currentSalary || item.salary || '';
    const location = item.location || '';
    const description = item.description || '';

    const card = document.createElement('div');
    card.className = 'work-item';
    card.innerHTML = `
      <div class="work-item-header">
        <span class="work-item-title">💼 ${escapeHtml(company || jobTitle || 'Work Experience Entry')}</span>
        <button type="button" class="work-delete-btn" title="Remove work experience">🗑️ Remove</button>
      </div>
      <div class="grid-2">
        <div class="form-group">
          <label>Company Name</label>
          <input type="text" class="work-company" value="${escapeHtml(company)}" placeholder="e.g. Acme Corp / Company Pvt Ltd">
        </div>
        <div class="form-group">
          <label>Job Title / Designation</label>
          <input type="text" class="work-title" value="${escapeHtml(jobTitle)}" placeholder="e.g. MIS Analyst / Software Engineer">
        </div>
      </div>

      <div class="date-section margin-top-xs">
        <div class="grid-2">
          <div class="form-group">
            <label>From Date (Start Month & Year)</label>
            <div class="month-year-flex">
              <select class="work-start-month">
                <option value="">Month</option>
                ${getMonthOptionsHTML(startMonth)}
              </select>
              <input type="number" class="work-start-year" value="${escapeHtml(startYear)}" placeholder="YYYY" min="1970" max="2035">
            </div>
          </div>

          <div class="form-group work-to-group ${isCurrent ? 'disabled-date-group' : ''}">
            <label>To Date (End Month & Year)</label>
            <div class="month-year-flex">
              <select class="work-end-month" ${isCurrent ? 'disabled' : ''}>
                <option value="">Month</option>
                ${getMonthOptionsHTML(endMonth)}
              </select>
              <input type="number" class="work-end-year" value="${escapeHtml(endYear)}" placeholder="YYYY" min="1970" max="2035" ${isCurrent ? 'disabled' : ''}>
            </div>
          </div>
        </div>

        <div class="form-group margin-top-xs">
          <label class="checkbox-inline">
            <input type="checkbox" class="work-is-current" ${isCurrent ? 'checked' : ''}> I currently work here
          </label>
        </div>
      </div>

      <div class="grid-2 margin-top-xs">
        <div class="form-group">
          <label>Salary / CTC</label>
          <input type="text" class="work-salary" value="${escapeHtml(salary)}" placeholder="e.g. 500000">
        </div>
        <div class="form-group">
          <label>Location</label>
          <input type="text" class="work-location" value="${escapeHtml(location)}" placeholder="e.g. Bengaluru, India">
        </div>
        <div class="form-group full-width-grid">
          <label>Job Description & Responsibilities</label>
          <input type="text" class="work-desc" value="${escapeHtml(description)}" placeholder="e.g. Advanced Excel, SQL, Data analysis, VLOOKUP">
        </div>
      </div>
    `;

    // Checkbox listener to disable To-Date group
    const cb = card.querySelector('.work-is-current');
    const toGroup = card.querySelector('.work-to-group');
    const endMonthSel = card.querySelector('.work-end-month');
    const endYearInp = card.querySelector('.work-end-year');

    cb.addEventListener('change', () => {
      if (cb.checked) {
        toGroup.classList.add('disabled-date-group');
        endMonthSel.disabled = true;
        endYearInp.disabled = true;
      } else {
        toGroup.classList.remove('disabled-date-group');
        endMonthSel.disabled = false;
        endYearInp.disabled = false;
      }
    });

    card.querySelector('.work-delete-btn').addEventListener('click', () => {
      card.remove();
    });

    workExperienceList.appendChild(card);
  }

  function renderScreeningList(screeningArray) {
    if (!screeningList) return;
    screeningList.innerHTML = '';
    screeningArray.forEach((item, index) => {
      addQARow(item.keywords, item.answer, index);
    });
  }

  function addQARow(keywords = '', answer = '', index = Date.now()) {
    if (!screeningList) return;
    const row = document.createElement('div');
    row.className = 'qa-item';
    row.innerHTML = `
      <input type="text" class="qa-kw" value="${escapeHtml(keywords)}" placeholder="Keywords (e.g. excel, vlookup)">
      <input type="text" class="qa-ans" value="${escapeHtml(answer)}" placeholder="Answer text to auto-fill">
      <button type="button" class="qa-delete-btn" title="Remove rule">🗑️</button>
    `;

    row.querySelector('.qa-delete-btn').addEventListener('click', () => {
      row.remove();
    });

    screeningList.appendChild(row);
  }

  // 3. Save Profile
  btnSave.addEventListener('click', (e) => {
    e.preventDefault();

    // Collect Work Experiences
    const newWorkExperiences = [];
    document.querySelectorAll('.work-item').forEach(card => {
      const company = card.querySelector('.work-company').value.trim();
      const jobTitle = card.querySelector('.work-title').value.trim();
      const startMonth = card.querySelector('.work-start-month').value.trim();
      const startYear = card.querySelector('.work-start-year').value.trim();
      const endMonth = card.querySelector('.work-end-month').value.trim();
      const endYear = card.querySelector('.work-end-year').value.trim();
      const isCurrent = card.querySelector('.work-is-current').checked;
      const salary = card.querySelector('.work-salary').value.trim();
      const location = card.querySelector('.work-location').value.trim();
      const description = card.querySelector('.work-desc').value.trim();

      const yearsExp = calculateYearsDiff(startMonth, startYear, endMonth, endYear, isCurrent);

      if (company || jobTitle) {
        newWorkExperiences.push({
          company,
          jobTitle,
          startMonth,
          startYear,
          endMonth,
          endYear,
          isCurrent,
          yearsExperience: yearsExp,
          currentSalary: salary,
          location,
          description
        });
      }
    });

    // Collect Screening Q&A items
    const newScreening = [];
    document.querySelectorAll('.qa-item').forEach(row => {
      const kw = row.querySelector('.qa-kw').value.trim();
      const ans = row.querySelector('.qa-ans').value.trim();
      if (kw && ans) {
        newScreening.push({ keywords: kw, answer: ans });
      }
    });

    const primaryWork = newWorkExperiences[0] || {};

    const updatedProfile = {
      credentials: {
        email: getVal('cred-email'),
        password: getVal('cred-password'),
        username: getVal('cred-username'),
        altEmail: getVal('cred-alt-email')
      },
      personal: {
        firstName: getVal('personal-first-name'),
        lastName: getVal('personal-last-name'),
        fullName: getVal('personal-full-name'),
        phone: getVal('personal-phone'),
        address: getVal('personal-address'),
        city: getVal('personal-city'),
        state: getVal('personal-state'),
        country: getVal('personal-country'),
        zipCode: getVal('personal-zip'),
        linkedin: getVal('personal-linkedin'),
        github: getVal('personal-github'),
        portfolio: getVal('personal-portfolio')
      },
      workExperiences: newWorkExperiences,
      work: {
        currentRole: {
          jobTitle: primaryWork.jobTitle || '',
          company: primaryWork.company || '',
          startMonth: primaryWork.startMonth || '',
          startYear: primaryWork.startYear || '',
          endMonth: primaryWork.endMonth || '',
          endYear: primaryWork.endYear || '',
          isCurrent: !!primaryWork.isCurrent,
          yearsExperience: primaryWork.yearsExperience || '',
          currentSalary: primaryWork.currentSalary || ''
        }
      },
      education: {
        degree: getVal('edu-degree'),
        major: getVal('edu-major'),
        university: getVal('edu-university'),
        gpa: getVal('edu-gpa'),
        startMonth: getVal('edu-start-month'),
        startYear: getVal('edu-start-year'),
        endMonth: getVal('edu-end-month'),
        endYear: getVal('edu-end-year'),
        graduationYear: getVal('edu-end-year'),
        isCurrent: getCheck('edu-is-current')
      },
      screening: newScreening,
      settings: {
        highlightFilledFields: getCheck('set-highlight'),
        autoNavigateEnabled: getCheck('set-auto-nav'),
        autoAuthEnabled: getCheck('set-auto-auth'),
        instantEmailAutoFill: getCheck('set-instant-email'),
        autoSubmitOnAgreement: getCheck('set-agree-submit'),
        autoCheckTerms: getCheck('set-terms'),
        autoSubmitSignUp: getCheck('set-signup-submit'),
        autoFillOnLoad: getCheck('set-onload')
      }
    };

    chrome.storage.local.set({ profile: updatedProfile }, () => {
      currentProfileData = updatedProfile;
      showToastBanner('Profile & Credentials Saved Successfully!');
      
      // Notify active tabs of profile update
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { action: 'UPDATE_PROFILE', profile: updatedProfile }).catch(() => {});
        });
      });
    });
  });

  // Add Work Experience Button
  if (btnAddWork) {
    btnAddWork.addEventListener('click', () => {
      addWorkItemRow();
    });
  }

  // Add Domain Button
  if (btnAddDomain) {
    btnAddDomain.addEventListener('click', () => {
      const input = prompt("Enter portal domain or hostname to register (e.g. linkedin.com or careers.company.com):");
      if (input && input.trim()) {
        const domain = input.trim().toLowerCase();
        chrome.runtime.sendMessage({ action: "REGISTER_DOMAIN", domain }, (res) => {
          showToastBanner(`Registered ${domain} into Memory Engine!`);
          renderRegisteredDomains(res.registeredDomains || []);
        });
      }
    });
  }

  // Add Q&A Rule Button
  if (btnAddQA) {
    btnAddQA.addEventListener('click', () => {
      addQARow('', '');
    });
  }

  // Export JSON
  btnExport.addEventListener('click', () => {
    if (!currentProfileData) return;
    const blob = new Blob([JSON.stringify(currentProfileData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'autofill_profile_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // Import JSON
  btnImportTrigger.addEventListener('click', () => fileImport.click());
  fileImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        chrome.storage.local.set({ profile: imported }, () => {
          currentProfileData = imported;
          populateForm(imported);
          showToastBanner('Profile Imported & Saved!');
        });
      } catch (err) {
        alert('Invalid JSON profile file.');
      }
    };
    reader.readAsText(file);
  });

  // Helpers
  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  }
  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  function setCheck(id, val) {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  }
  function getCheck(id) {
    const el = document.getElementById(id);
    return el ? el.checked : false;
  }
  function escapeHtml(str) {
    return String(str || '').replace(/"/g, '&quot;');
  }
  function showToastBanner(msg) {
    toastBanner.textContent = msg;
    toastBanner.classList.remove('hidden');
    setTimeout(() => toastBanner.classList.add('hidden'), 2500);
  }

  // Load initial
  loadProfile();
});
