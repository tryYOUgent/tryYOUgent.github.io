// ===================== STATE =====================
  const TOTAL_STEPS = 12;
  const STEP_NAMES = [
    'Church Information','Identity & Voice','Services & Visitor Experience',
    'Beliefs & Teaching','Ministries','Membership & Next Steps',
    'Prayer & Care','Staff Directory','Data & Notifications',
    'Documents','Branding','Review & Submit'
  ];
  let currentStep = 1;
  let staffCount = 0;
  let selectedMinistries = [];
  let selectedPrayerCategories = [];

  // ===================== INIT =====================
  document.addEventListener('DOMContentLoaded', () => {
    buildProgressDots();
    addStaffCard();
    loadFromStorage();
    updateProgress(1);
    updateMockChurchName();

    document.getElementById('churchName').addEventListener('input', updateMockChurchName);

    window.addEventListener('scroll', () => {
      const nav = document.getElementById('mainNav');
      nav.classList.toggle('scrolled', window.scrollY > 20);
    });

    document.getElementById('hamburger').addEventListener('click', () => {
      document.getElementById('mobileMenu').classList.toggle('open');
    });
  });

  function buildProgressDots() {
    const container = document.getElementById('progressDots');
    container.innerHTML = '';
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const dot = document.createElement('div');
      dot.className = 'progress-dot';
      dot.id = `dot-${i}`;
      dot.innerHTML = `<span>${i}</span>`;
      dot.onclick = () => jumpToStep(i);
      container.appendChild(dot);
    }
  }

  function updateProgress(step) {
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const dot = document.getElementById(`dot-${i}`);
      if (!dot) continue;
      dot.className = 'progress-dot';
      if (i < step) dot.classList.add('completed');
      else if (i === step) dot.classList.add('current');
    }
    document.getElementById('progressLabel').innerHTML =
      `Step <strong>${step}</strong> of ${TOTAL_STEPS} — <strong>${STEP_NAMES[step-1]}</strong>`;
    const pct = (step / TOTAL_STEPS) * 100;
    document.getElementById('progressBar').style.width = pct + '%';
  }

  // ===================== NAVIGATION =====================
  function nextStep(from) {
    if (!validateStep(from)) return;
    autoSave();
    if (from === 11) buildReviewAccordions();
    goToStep(from + 1);
  }

  function prevStep(from) {
    goToStep(from - 1);
  }

  function jumpToStep(target) {
    if (target >= currentStep) return;
    goToStep(target);
  }

  function goToStep(target) {
    if (target < 1 || target > TOTAL_STEPS) return;
    const currentCard = document.getElementById(`step-${currentStep}`);
    const targetCard = document.getElementById(`step-${target}`);
    if (!currentCard || !targetCard) return;

    currentCard.classList.remove('active');
    currentCard.classList.add('leave');
    setTimeout(() => {
      currentCard.classList.remove('leave');
      currentCard.style.display = 'none';
      targetCard.style.display = 'block';
      targetCard.classList.add('enter');
      setTimeout(() => targetCard.classList.remove('enter'), 400);
      currentStep = target;
      updateProgress(target);
      window.scrollTo({ top: document.getElementById('progressWrap').offsetTop - 10, behavior: 'smooth' });
    }, 280);
  }

  // ===================== VALIDATION =====================
  function validateStep(step) {
    let valid = true;
    const clearErr = (id) => {
      const el = document.getElementById(id);
      if (el) { el.classList.remove('visible'); }
    };
    const showErr = (id) => {
      const el = document.getElementById(id);
      if (el) { el.classList.add('visible'); }
      valid = false;
    };
    const setInputErr = (id, hasErr) => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('error', hasErr);
    };

    if (step === 1) {
      ['churchName','city','state','contactEmail'].forEach(id => {
        const val = document.getElementById(id)?.value.trim();
        clearErr(`err-${id}`);
        setInputErr(id, false);
        if (!val) { showErr(`err-${id}`); setInputErr(id, true); }
      });
    }
    if (step === 2) {
      clearErr('err-churchDescription'); clearErr('err-tone');
      const desc = document.getElementById('churchDescription')?.value.trim();
      if (!desc) { showErr('err-churchDescription'); setInputErr('churchDescription', true); }
      else setInputErr('churchDescription', false);
      const tone = document.getElementById('selectedTone')?.value;
      if (!tone) showErr('err-tone');
    }
    if (step === 3) {
      clearErr('err-serviceTimes'); clearErr('err-visitorExperience');
      const times = Array.from(document.querySelectorAll('.service-time-input')).map(i => i.value.trim()).filter(Boolean);
      if (!times.length) showErr('err-serviceTimes');
      const ve = document.getElementById('visitorExperience')?.value.trim();
      if (!ve) { showErr('err-visitorExperience'); setInputErr('visitorExperience', true); }
      else setInputErr('visitorExperience', false);
    }
    if (step === 5) {
      clearErr('err-ministries');
      if (!selectedMinistries.length) showErr('err-ministries');
    }
    if (step === 6) {
      clearErr('err-membershipProcess');
      const mp = document.getElementById('membershipProcess')?.value.trim();
      if (!mp) { showErr('err-membershipProcess'); setInputErr('membershipProcess', true); }
      else setInputErr('membershipProcess', false);
    }
    if (step === 7) {
      clearErr('err-prayerReceiver');
      const pr = document.getElementById('prayerReceiver')?.value.trim();
      if (!pr) { showErr('err-prayerReceiver'); setInputErr('prayerReceiver', true); }
      else setInputErr('prayerReceiver', false);
    }
    if (step === 9) {
      clearErr('err-storage');
      const st = document.getElementById('selectedStorage')?.value;
      if (!st) showErr('err-storage');
    }
    return valid;
  }

  // ===================== TONE SELECTION =====================
  function selectTone(tone) {
    document.querySelectorAll('.tone-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.tone-card[data-tone="${tone}"]`)?.classList.add('selected');
    document.getElementById('selectedTone').value = tone;
  }

  // ===================== STORAGE SELECTION =====================
  function selectStorage(type) {
    document.querySelectorAll('.storage-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.storage-card[data-storage="${type}"]`)?.classList.add('selected');
    document.getElementById('selectedStorage').value = type;
  }

  // ===================== SERVICE TIMES =====================
  function addServiceTime() {
    const container = document.getElementById('serviceTimesContainer');
    const row = document.createElement('div');
    row.className = 'repeatable-item';
    row.innerHTML = `
      <input type="text" class="service-time-input" placeholder="e.g. 11:00 AM" style="background:var(--input-bg);border:1px solid var(--border-color);border-radius:8px;padding:12px 16px;font-family:'Lato',sans-serif;font-size:15px;color:var(--input-text);width:100%;outline:none;" />
      <button class="remove-btn" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(row);
  }

  // ===================== MINISTRY PILLS =====================
  function toggleMinistry(el) {
    const ministry = el.dataset.ministry;
    el.classList.toggle('selected');
    if (el.classList.contains('selected')) {
      if (!selectedMinistries.includes(ministry)) selectedMinistries.push(ministry);
    } else {
      selectedMinistries = selectedMinistries.filter(m => m !== ministry);
    }
    if (ministry === 'Other') {
      document.getElementById('otherMinistryField').classList.toggle('hidden', !el.classList.contains('selected'));
    }
    rebuildMinistryAccordions();
  }

  function rebuildMinistryAccordions() {
    const container = document.getElementById('ministryAccordion');
    const ministries = selectedMinistries.filter(m => m !== 'Other');
    if (!ministries.length) { container.innerHTML = ''; return; }
    const existing = {};
    container.querySelectorAll('.ministry-acc-item').forEach(item => {
      const key = item.dataset.ministryKey;
      existing[key] = {
        desc: item.querySelector('.ministry-acc-desc')?.value || '',
        schedule: item.querySelector('.ministry-acc-schedule')?.value || '',
        contact: item.querySelector('.ministry-acc-contact')?.value || '',
        details: item.querySelector('.ministry-acc-details')?.value || ''
      };
    });
    container.innerHTML = '';
    ministries.forEach(m => {
      const saved = existing[m] || {};
      const item = document.createElement('div');
      item.className = 'ministry-acc-item';
      item.dataset.ministryKey = m;
      item.innerHTML = `
        <div class="ministry-acc-header" onclick="toggleAccordion(this.parentElement)">
          <span>${m}</span>
          <span class="ministry-acc-arrow">▼</span>
        </div>
        <div class="ministry-acc-body">
          <div class="field-group">
            <label>Description</label>
            <textarea class="ministry-acc-desc" rows="2" placeholder="What does this ministry do and who is it for?">${saved.desc || ''}</textarea>
            <div class="field-helper">What does this ministry do and who is it for?</div>
          </div>
          <div class="field-group">
            <label>Meeting Schedule</label>
            <input type="text" class="ministry-acc-schedule" placeholder="e.g. Every Sunday at 9 AM" value="${saved.schedule || ''}" />
            <div class="field-helper">When and how often does this ministry meet?</div>
          </div>
          <div class="field-group">
            <label>Key Contact or Leader Name</label>
            <input type="text" class="ministry-acc-contact" placeholder="Name..." value="${saved.contact || ''}" />
          </div>
          <div class="field-group">
            <label>Additional Details</label>
            <textarea class="ministry-acc-details" rows="2" placeholder="Anything else to know...">${saved.details || ''}</textarea>
          </div>
        </div>
      `;
      // Style inner inputs
      item.querySelectorAll('input, textarea').forEach(inp => {
        inp.style.cssText = 'width:100%;background:var(--input-bg);border:1px solid var(--border-color);border-radius:8px;padding:12px 16px;font-family:Lato,sans-serif;font-size:15px;color:var(--input-text);outline:none;resize:vertical;';
        inp.addEventListener('focus', () => { inp.style.borderColor = 'var(--border-focus)'; inp.style.boxShadow = '0 0 0 3px rgba(31,163,179,0.12)'; });
        inp.addEventListener('blur', () => { inp.style.borderColor = 'var(--border-color)'; inp.style.boxShadow = 'none'; });
      });
      container.appendChild(item);
    });
  }

  function toggleAccordion(item) {
    item.classList.toggle('open');
  }

  // ===================== PRAYER CATEGORY PILLS =====================
  function togglePill(el, hiddenId) {
    const cat = el.dataset.cat;
    el.classList.toggle('selected');
    if (el.classList.contains('selected')) {
      if (!selectedPrayerCategories.includes(cat)) selectedPrayerCategories.push(cat);
    } else {
      selectedPrayerCategories = selectedPrayerCategories.filter(c => c !== cat);
    }
    document.getElementById(hiddenId).value = selectedPrayerCategories.join(', ');
  }

  function toggleCustomPrayerCat(el) {
    document.getElementById('customPrayerCatField').classList.toggle('hidden', !el.classList.contains('selected'));
  }

  // ===================== CONDITIONAL FIELDS =====================
  function toggleConditional(toggleId, fieldId) {
    const checked = document.getElementById(toggleId)?.checked;
    const field = document.getElementById(fieldId);
    if (field) field.classList.toggle('visible', !!checked);
  }

  // ===================== STAFF CARDS =====================
  function addStaffCard() {
    staffCount++;
    const container = document.getElementById('staffCardsContainer');
    const card = document.createElement('div');
    card.className = 'staff-card';
    card.id = `staffCard-${staffCount}`;
    card.innerHTML = `
      <div class="staff-card-header">
        <span class="staff-card-title">Staff Member ${staffCount}</span>
        ${staffCount > 1 ? `<button class="staff-remove-btn" onclick="removeStaffCard(${staffCount})">Remove</button>` : ''}
      </div>
      <div class="field-row">
        <div class="field-group">
          <label>Full Name</label>
          <input type="text" class="staff-name" placeholder="e.g. Pastor John Smith" />
        </div>
        <div class="field-group">
          <label>Role / Title</label>
          <input type="text" class="staff-role" placeholder="e.g. Senior Pastor" />
        </div>
      </div>
      <div class="field-group">
        <label>Primary Responsibility</label>
        <input type="text" class="staff-responsibility" placeholder="e.g. Oversees all pastoral care and counseling" />
        <div class="field-helper">e.g. Oversees all pastoral care and counseling</div>
      </div>
      <div class="field-group">
        <label>Email Address</label>
        <input type="email" class="staff-email" placeholder="pastor@yourchurch.com" />
      </div>
      <div class="field-group">
        <div class="toggle-wrap">
          <label class="toggle">
            <input type="checkbox" class="staff-notify" />
            <span class="toggle-slider"></span>
          </label>
          <span class="toggle-label-text">Receive notifications from ChurchCompass?</span>
        </div>
        <div class="field-helper" style="margin-top:8px;">This person will be notified when care needs or prayer requests are submitted.</div>
      </div>
    `;
    card.querySelectorAll('input, textarea').forEach(inp => {
      inp.style.cssText = 'width:100%;background:var(--input-bg);border:1px solid var(--border-color);border-radius:8px;padding:12px 16px;font-family:Lato,sans-serif;font-size:15px;color:var(--input-text);outline:none;';
      inp.addEventListener('focus', () => { inp.style.borderColor = 'var(--border-focus)'; inp.style.boxShadow = '0 0 0 3px rgba(31,163,179,0.12)'; });
      inp.addEventListener('blur', () => { inp.style.borderColor = 'var(--border-color)'; inp.style.boxShadow = 'none'; });
    });
    container.appendChild(card);
  }

  function removeStaffCard(id) {
    document.getElementById(`staffCard-${id}`)?.remove();
  }

  // ===================== FILE UPLOADS =====================
  function handleDragOver(e, zoneId) {
    e.preventDefault();
    document.getElementById(zoneId)?.classList.add('dragover');
  }
  function handleDragLeave(e, zoneId) {
    document.getElementById(zoneId)?.classList.remove('dragover');
  }
  function handleDrop(e, zoneId, infoId) {
    e.preventDefault();
    document.getElementById(zoneId)?.classList.remove('dragover');
    const file = e.dataTransfer?.files[0];
    if (file) showFileInfo(file, infoId, zoneId);
  }
  function handleFileSelect(e, infoId, zoneId) {
    const file = e.target.files[0];
    if (file) showFileInfo(file, infoId, zoneId);
  }
  function showFileInfo(file, infoId, zoneId) {
    const info = document.getElementById(infoId);
    const num = infoId.replace('fileInfo','');
    document.getElementById(`fileName${num}`).textContent = file.name;
    document.getElementById(`fileSize${num}`).textContent = ` (${(file.size/1024).toFixed(1)} KB)`;
    info.classList.remove('hidden');
    document.getElementById(zoneId).style.opacity = '0.5';
  }
  function removeFile(infoId, zoneId) {
    document.getElementById(infoId)?.classList.add('hidden');
    document.getElementById(zoneId).style.opacity = '1';
  }

  // ===================== LOGO UPLOAD =====================
  function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const preview = document.getElementById('logoPreview');
      preview.src = ev.target.result;
      preview.style.display = 'block';
      document.getElementById('mockLogoImg').src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }
  function handleLogoDropEvt(e) {
    e.preventDefault();
    document.getElementById('logoUploadZone')?.classList.remove('dragover');
    const file = e.dataTransfer?.files[0];
    if (file) {
      const fakeEvt = { target: { files: [file] } };
      handleLogoUpload(fakeEvt);
    }
  }

  // ===================== BRAND PREVIEW =====================
  function updateBrandPreview() {
    const primary = document.getElementById('primaryColor').value;
    const secondary = document.getElementById('secondaryColor').value;
    document.getElementById('primarySwatch').style.background = primary;
    document.getElementById('secondarySwatch').style.background = secondary;
    document.getElementById('primaryColorVal').textContent = primary;
    document.getElementById('secondaryColorVal').textContent = secondary;
    document.getElementById('mockBubble1').style.background = primary;
    document.getElementById('mockBubble2').style.background = secondary;
  }

  function updateMockChurchName() {
    const name = document.getElementById('churchName')?.value || 'Your Church';
    document.getElementById('mockChurchName').textContent = name || 'Your Church';
  }

  // ===================== REVIEW STEP =====================
  function buildReviewAccordions() {
    const container = document.getElementById('reviewAccordions');
    const steps = [
      { num: 1, name: 'Church Information', fields: getStep1Summary() },
      { num: 2, name: 'Identity & Voice', fields: getStep2Summary() },
      { num: 3, name: 'Services & Visitor Experience', fields: getStep3Summary() },
      { num: 4, name: 'Beliefs & Teaching', fields: getStep4Summary() },
      { num: 5, name: 'Ministries', fields: getStep5Summary() },
      { num: 6, name: 'Membership & Next Steps', fields: getStep6Summary() },
      { num: 7, name: 'Prayer & Care', fields: getStep7Summary() },
      { num: 8, name: 'Staff Directory', fields: getStep8Summary() },
      { num: 9, name: 'Data & Notifications', fields: getStep9Summary() },
      { num: 10, name: 'Documents', fields: [{ label: 'Files', value: 'See uploaded documents' }] },
      { num: 11, name: 'Branding', fields: getStep11Summary() },
    ];
    container.innerHTML = steps.map(s => `
      <div class="review-accordion review-acc-item" id="review-acc-${s.num}">
        <div class="review-acc-header" onclick="this.parentElement.classList.toggle('open')">
          <div class="review-acc-title">
            <span class="step-badge">Step ${s.num}</span>
            ${s.name}
          </div>
          <span class="review-edit-link" onclick="event.stopPropagation();goToStep(${s.num})">✏️ Edit</span>
        </div>
        <div class="review-acc-body">
          ${s.fields.map(f => `
            <div class="review-field">
              <div class="review-field-label">${f.label}</div>
              <div class="review-field-value ${!f.value ? 'empty' : ''}">${f.value || 'Not provided'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
    // Open first accordion
    document.querySelector('.review-acc-item')?.classList.add('open');
  }

  function val(id) { return document.getElementById(id)?.value?.trim() || ''; }
  function getStep1Summary() {
    return [
      { label: 'Church Name', value: val('churchName') },
      { label: 'City', value: val('city') },
      { label: 'State', value: val('state') },
      { label: 'Address', value: val('streetAddress') },
      { label: 'Website', value: val('websiteUrl') },
      { label: 'Phone', value: val('phoneNumber') },
      { label: 'Email', value: val('contactEmail') },
    ];
  }
  function getStep2Summary() {
    return [
      { label: 'Description', value: val('churchDescription') },
      { label: 'Mission', value: val('missionStatement') },
      { label: 'Core Values', value: val('coreValues') },
      { label: 'Tone', value: val('selectedTone') },
    ];
  }
  function getStep3Summary() {
    const times = Array.from(document.querySelectorAll('.service-time-input')).map(i => i.value.trim()).filter(Boolean).join(', ');
    return [
      { label: 'Service Times', value: times },
      { label: 'Midweek', value: val('midweekServices') },
      { label: 'Visitor Experience', value: val('visitorExperience') },
      { label: 'Service Length', value: val('serviceLength') },
      { label: 'Dress Style', value: val('dressStyle') },
    ];
  }
  function getStep4Summary() {
    return [
      { label: 'Denomination', value: val('denomination') },
      { label: 'Statement of Faith', value: val('statementOfFaith') },
      { label: 'Baptism', value: val('baptismBeliefs') },
      { label: 'Communion', value: val('communionPractices') },
      { label: 'Salvation', value: val('salvationExplanation') },
    ];
  }
  function getStep5Summary() {
    return [{ label: 'Ministries', value: selectedMinistries.join(', ') }];
  }
  function getStep6Summary() {
    return [
      { label: 'Membership', value: val('membershipProcess') },
      { label: 'Membership Class', value: val('membershipClass') },
      { label: 'Baptism Process', value: val('baptismProcess') },
      { label: 'Get Involved', value: val('getInvolved') },
      { label: 'Serve', value: val('serveOpportunities') },
    ];
  }
  function getStep7Summary() {
    return [
      { label: 'Prayer Receiver', value: val('prayerReceiver') },
      { label: 'Follow-up', value: document.getElementById('prayerFollowup')?.checked ? 'Yes' : 'No' },
      { label: 'Categories', value: selectedPrayerCategories.join(', ') },
    ];
  }
  function getStep8Summary() {
    const cards = document.querySelectorAll('.staff-card');
    const names = Array.from(cards).map(c => c.querySelector('.staff-name')?.value || '').filter(Boolean);
    return [{ label: 'Staff Members', value: names.join(', ') }];
  }
  function getStep9Summary() {
    return [
      { label: 'Data Storage', value: val('selectedStorage') },
      { label: 'Email Notifs', value: document.getElementById('emailNotifToggle')?.checked ? val('notifEmail') || 'Enabled' : 'Off' },
      { label: 'SMS Notifs', value: document.getElementById('smsNotifToggle')?.checked ? val('notifPhone') || 'Enabled' : 'Off' },
    ];
  }
  function getStep11Summary() {
    return [
      { label: 'Primary Color', value: document.getElementById('primaryColor')?.value },
      { label: 'Secondary Color', value: document.getElementById('secondaryColor')?.value },
    ];
  }

  // ===================== SUBMIT =====================
  function toggleSubmitBtn() {
    const checked = document.getElementById('confirmAccuracy')?.checked;
    document.getElementById('submitBtn').disabled = !checked;
  }

  function submitForm() {
    autoSave();
    document.getElementById('formArea').innerHTML = '';
    const success = document.getElementById('successState') || document.createElement('div');
    document.getElementById('formArea').appendChild(success);
    // Rebuild success state
    document.getElementById('formArea').innerHTML = `
      <div class="success-state visible" id="successState">
        <img src="https://paymegpt.com/objects/quick-uploads/189/148efeb9fd1a4937.png" alt="ChurchCompass" class="success-icon" />
        <h2>You're all set.</h2>
        <p>Thank you for completing your ChurchCompass onboarding. Our team will review your submission and be in touch within 1–2 business days to walk you through your custom agent setup. Keep an eye on your inbox.</p>
        <p class="success-tagline">Clarity. Care. Connection.</p>
      </div>
    `;
    document.getElementById('progressWrap').style.display = 'none';
    localStorage.removeItem('churchcompass_onboarding');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ===================== SAVE & RESTORE =====================
  function autoSave() {
    const data = {
      currentStep,
      churchName: val('churchName'),
      city: val('city'),
      state: val('state'),
      streetAddress: val('streetAddress'),
      websiteUrl: val('websiteUrl'),
      phoneNumber: val('phoneNumber'),
      contactEmail: val('contactEmail'),
      churchDescription: val('churchDescription'),
      missionStatement: val('missionStatement'),
      coreValues: val('coreValues'),
      selectedTone: val('selectedTone'),
      midweekServices: val('midweekServices'),
      visitorExperience: val('visitorExperience'),
      serviceLength: val('serviceLength'),
      dressStyle: val('dressStyle'),
      parkingInstructions: val('parkingInstructions'),
      firstVisitDirections: val('firstVisitDirections'),
      denomination: val('denomination'),
      statementOfFaith: val('statementOfFaith'),
      baptismBeliefs: val('baptismBeliefs'),
      communionPractices: val('communionPractices'),
      salvationExplanation: val('salvationExplanation'),
      selectedMinistries,
      membershipProcess: val('membershipProcess'),
      membershipClass: val('membershipClass'),
      baptismProcess: val('baptismProcess'),
      getInvolved: val('getInvolved'),
      serveOpportunities: val('serveOpportunities'),
      prayerReceiver: val('prayerReceiver'),
      followupSpeed: val('followupSpeed'),
      selectedPrayerCategories,
      selectedStorage: val('selectedStorage'),
      primaryColor: document.getElementById('primaryColor')?.value,
      secondaryColor: document.getElementById('secondaryColor')?.value,
    };
    localStorage.setItem('churchcompass_onboarding', JSON.stringify(data));
  }

  function saveLater() {
    autoSave();
    showToast('Your progress has been saved.');
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function loadFromStorage() {
    const raw = localStorage.getItem('churchcompass_onboarding');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      const setVal = (id, v) => { const el = document.getElementById(id); if (el && v !== undefined) el.value = v; };

      setVal('churchName', data.churchName);
      setVal('city', data.city);
      setVal('state', data.state);
      setVal('streetAddress', data.streetAddress);
      setVal('websiteUrl', data.websiteUrl);
      setVal('phoneNumber', data.phoneNumber);
      setVal('contactEmail', data.contactEmail);
      setVal('churchDescription', data.churchDescription);
      setVal('missionStatement', data.missionStatement);
      setVal('coreValues', data.coreValues);
      setVal('midweekServices', data.midweekServices);
      setVal('visitorExperience', data.visitorExperience);
      setVal('serviceLength', data.serviceLength);
      setVal('dressStyle', data.dressStyle);
      setVal('parkingInstructions', data.parkingInstructions);
      setVal('firstVisitDirections', data.firstVisitDirections);
      setVal('denomination', data.denomination);
      setVal('statementOfFaith', data.statementOfFaith);
      setVal('baptismBeliefs', data.baptismBeliefs);
      setVal('communionPractices', data.communionPractices);
      setVal('salvationExplanation', data.salvationExplanation);
      setVal('membershipProcess', data.membershipProcess);
      setVal('membershipClass', data.membershipClass);
      setVal('baptismProcess', data.baptismProcess);
      setVal('getInvolved', data.getInvolved);
      setVal('serveOpportunities', data.serveOpportunities);
      setVal('prayerReceiver', data.prayerReceiver);
      setVal('followupSpeed', data.followupSpeed);
      setVal('selectedStorage', data.selectedStorage);

      if (data.selectedTone) selectTone(data.selectedTone);
      if (data.selectedStorage) selectStorage(data.selectedStorage);

      if (data.selectedMinistries?.length) {
        data.selectedMinistries.forEach(m => {
          const pill = document.querySelector(`.pill-item[data-ministry="${m}"]`);
          if (pill) { pill.classList.add('selected'); selectedMinistries.push(m); }
        });
        rebuildMinistryAccordions();
      }
      if (data.selectedPrayerCategories?.length) {
        data.selectedPrayerCategories.forEach(c => {
          const pill = document.querySelector(`.pill-item[data-cat="${c}"]`);
          if (pill) { pill.classList.add('selected'); selectedPrayerCategories.push(c); }
        });
      }
      if (data.primaryColor) {
        document.getElementById('primaryColor').value = data.primaryColor;
        document.getElementById('primarySwatch').style.background = data.primaryColor;
        document.getElementById('primaryColorVal').textContent = data.primaryColor;
        document.getElementById('mockBubble1').style.background = data.primaryColor;
      }
      if (data.secondaryColor) {
        document.getElementById('secondaryColor').value = data.secondaryColor;
        document.getElementById('secondarySwatch').style.background = data.secondaryColor;
        document.getElementById('secondaryColorVal').textContent = data.secondaryColor;
        document.getElementById('mockBubble2').style.background = data.secondaryColor;
      }

      document.getElementById('restoreBanner').classList.remove('hidden');
    } catch(e) {}
  }

  // ===================== THEME TOGGLE =====================
  document.getElementById('themeToggle').addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');
    html.classList.toggle('dark', !isDark);
    document.getElementById('themeToggle').textContent = isDark ? '🌙' : '☀️';
  });

  // Auto-save on field changes
  document.addEventListener('input', () => { autoSave(); });
  document.addEventListener('change', () => { autoSave(); });