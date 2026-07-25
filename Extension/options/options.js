document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');
  const pageTitle = document.getElementById('page-title');
  const toastBanner = document.getElementById('toast-banner');
  const btnSave = document.getElementById('btn-save');
  const btnAddQA = document.getElementById('btn-add-qa');
  const screeningList = document.getElementById('screening-list');
  const btnExport = document.getElementById('btn-export');
  const btnImportTrigger = document.getElementById('btn-import-trigger');
  const fileImport = document.getElementById('file-import');

  let currentProfileData = null;

  const TAB_TITLES = {
    'tab-credentials': 'Logins & Portal Credentials',
    'tab-personal': 'Personal Information',
    'tab-work': 'Work Experience & Target Role',
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

  // 2. Load Profile Data
  function loadProfile() {
    chrome.storage.local.get(['profile'], (result) => {
      if (result.profile) {
        currentProfileData = result.profile;
        populateForm(currentProfileData);
      }
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

    // Work
    setVal('work-current-title', p.work?.currentRole?.jobTitle);
    setVal('work-current-company', p.work?.currentRole?.company);
    setVal('work-current-exp', p.work?.currentRole?.yearsExperience);
    setVal('work-current-salary', p.work?.currentRole?.currentSalary);

    setVal('work-target-title', p.work?.targetRole?.jobTitle);
    setVal('work-target-location', p.work?.targetRole?.targetLocation);
    setVal('work-target-salary', p.work?.targetRole?.expectedSalary);
    setVal('work-target-notice', p.work?.targetRole?.noticePeriod);

    // Education
    setVal('edu-degree', p.education?.degree);
    setVal('edu-major', p.education?.major);
    setVal('edu-university', p.education?.university);
    setVal('edu-year', p.education?.graduationYear);
    setVal('edu-gpa', p.education?.gpa);

    // Settings
    setCheck('set-highlight', p.settings?.highlightFilledFields !== false);
    setCheck('set-widget', p.settings?.showFloatingWidget !== false);
    setCheck('set-onload', p.settings?.autoFillOnLoad === true);

    // Screening Q&A
    renderScreeningList(p.screening || []);
  }

  function renderScreeningList(screeningArray) {
    screeningList.innerHTML = '';
    screeningArray.forEach((item, index) => {
      addQARow(item.keywords, item.answer, index);
    });
  }

  function addQARow(keywords = '', answer = '', index = Date.now()) {
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

    // Collect Screening Q&A items
    const newScreening = [];
    document.querySelectorAll('.qa-item').forEach(row => {
      const kw = row.querySelector('.qa-kw').value.trim();
      const ans = row.querySelector('.qa-ans').value.trim();
      if (kw && ans) {
        newScreening.push({ keywords: kw, answer: ans });
      }
    });

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
      work: {
        currentRole: {
          jobTitle: getVal('work-current-title'),
          company: getVal('work-current-company'),
          yearsExperience: getVal('work-current-exp'),
          currentSalary: getVal('work-current-salary')
        },
        targetRole: {
          jobTitle: getVal('work-target-title'),
          targetLocation: getVal('work-target-location'),
          expectedSalary: getVal('work-target-salary'),
          noticePeriod: getVal('work-target-notice'),
          workMode: "Hybrid"
        }
      },
      education: {
        degree: getVal('edu-degree'),
        major: getVal('edu-major'),
        university: getVal('edu-university'),
        graduationYear: getVal('edu-year'),
        gpa: getVal('edu-gpa')
      },
      screening: newScreening,
      settings: {
        highlightFilledFields: getCheck('set-highlight'),
        showFloatingWidget: getCheck('set-widget'),
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

  // Add Q&A Rule Button
  btnAddQA.addEventListener('click', () => {
    addQARow('', '');
  });

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
