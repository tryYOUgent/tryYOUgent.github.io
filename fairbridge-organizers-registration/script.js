(function(){
  var params=new URLSearchParams(window.location.search);
  var fields={};
  var paramMap={
    'first_name':'firstName','last_name':'lastName','full_name':'fullName',
    'email':'email','phone':'phone','company':'company',
    'city':'city','state':'state','country':'country'
  };
  var skipTags={'SCRIPT':1,'STYLE':1,'NOSCRIPT':1,'TEXTAREA':1,'CODE':1,'PRE':1};
  var hasUrlFields=false;
  for(var p in paramMap){
    var v=params.get(p);
    if(v){fields[paramMap[p]]=v;hasUrlFields=true;}
  }
  var contactId=params.get('contact_id');
  function esc(s){
    if(!s)return s;
    var d=document.createElement('div');
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }
  function doReplace(data){
    var r={};
    r['{{full_name}}']=esc(((data.firstName||'')+' '+(data.lastName||'')).trim()||((data.fullName||data.name)||''));
    r['{{first_name}}']=esc(data.firstName||(data.name?data.name.split(' ')[0]:'')||'');
    r['{{last_name}}']=esc(data.lastName||(data.name&&data.name.indexOf(' ')>-1?data.name.substring(data.name.indexOf(' ')+1):'')||'');
    r['{{email}}']=esc(data.email||'');
    r['{{phone}}']=esc(data.phone||'');
    r['{{company}}']=esc(data.company||'');
    r['{{city}}']=esc(data.city||'');
    r['{{state}}']=esc(data.state||'');
    r['{{country}}']=esc(data.country||'');
    r['{{date}}']=new Date().toLocaleDateString();
    r['{{time}}']=new Date().toLocaleTimeString();
    r['{{location}}']=[data.city,data.state,data.country].filter(Boolean).join(', ');
    r['{{tracking_id}}']=esc(data.trackingId||'');
    r['{{lastClickedProduct}}']=esc(data.lastClickedProduct||'');
    r['{{lastProductClickDate}}']=esc(data.lastProductClickDate||'');
    r['{{lastClickedProductPrice}}']=esc(data.lastClickedProductPrice||'');
    r['{{lastClickedProductURL}}']=esc(data.lastClickedProductURL||'');
    r['{{productsClickedCount}}']=esc(data.productsClickedCount||'0');
    r['{{ip_address}}']=esc(data.ipAddress||'');
    r['{{ip}}']=esc(data.ipAddress||'');
    if(data.customFields){
      for(var k in data.customFields){
        r['{{'+k+'}}']=esc(String(data.customFields[k]||''));
      }
    }
    params.forEach(function(v,k){
      if(!paramMap[k]&&k!=='contact_id'&&k!=='page_id'&&k.indexOf('utm_')!==0){
        r['{{'+k+'}}']=esc(v);
      }
    });
    var hasValues=false;
    for(var key in r){if(r[key]){hasValues=true;break;}}
    if(!hasValues)return;
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
      acceptNode:function(n){
        var p=n.parentNode;
        if(p&&skipTags[p.nodeName])return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while(node=walker.nextNode()){
      var txt=node.nodeValue;
      if(txt&&txt.indexOf('{{')>-1){
        var changed=txt;
        for(var ph in r){
          if(r[ph]&&changed.indexOf(ph)>-1){
            changed=changed.split(ph).join(r[ph]);
          }
        }
        if(changed!==txt)node.nodeValue=changed;
      }
    }
    var attrs=['value','placeholder','content','alt','title'];
    attrs.forEach(function(attr){
      var els=document.querySelectorAll('['+attr+'*="{{"]');
      for(var i=0;i<els.length;i++){
        var tag=els[i].tagName;
        if(skipTags[tag])continue;
        var val=els[i].getAttribute(attr);
        if(val){
          var nv=val;
          for(var ph in r){
            if(r[ph]&&nv.indexOf(ph)>-1){
              nv=nv.split(ph).join(r[ph]);
            }
          }
          if(nv!==val)els[i].setAttribute(attr,nv);
        }
      }
    });
  }
  function run(){
    if(contactId){
      var xhr=new XMLHttpRequest();
      xhr.open('GET','https://paymegpt.com/api/landing/context/'+encodeURIComponent(contactId)+'?page_id=2671');
      xhr.onload=function(){
        if(xhr.status===200){
          try{
            var resp=JSON.parse(xhr.responseText);
            if(resp.success&&resp.contact){
              var merged=resp.contact;
              for(var k in fields){merged[k]=fields[k];}
              doReplace(merged);
              return;
            }
          }catch(e){}
        }
        if(hasUrlFields)doReplace(fields);
      };
      xhr.onerror=function(){if(hasUrlFields)doReplace(fields);};
      xhr.send();
    }else if(hasUrlFields){
      doReplace(fields);
    }
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}
  else{run();}
})();

(function(){
  var slug='QPXcwFcaRa';
  var apiBase='https://paymegpt.com';
  function findEmail(){
    var ids=['email','emailAddress','buyer-email','buyerEmail','user-email','userEmail','checkout-email','customer-email','contact-email'];
    for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el&&el.value&&el.value.includes('@'))return el.value.trim();}
    var inputs=document.querySelectorAll('input[type="email"],input[name*="email"],input[placeholder*="email"],input[placeholder*="Email"]');
    for(var j=0;j<inputs.length;j++){if(inputs[j].value&&inputs[j].value.includes('@'))return inputs[j].value.trim();}
    return '';
  }
  function findName(){
    var ids=['name','fullName','full-name','buyer-name','buyerName','customer-name','userName','user-name'];
    for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el&&el.value)return el.value.trim();}
    var inputs=document.querySelectorAll('input[name*="name"]:not([name*="email"]):not([type="email"]),input[placeholder*="name"]:not([placeholder*="email"]):not([type="email"]),input[placeholder*="Name"]:not([type="email"])');
    for(var j=0;j<inputs.length;j++){if(inputs[j].value)return inputs[j].value.trim();}
    return '';
  }
  var __realProcessPayment=function(a,b,c,d,e){
    var amountCents,email,productName,productDescription,customerName,quantity;
    if(a&&typeof a==='object'){
      amountCents=a.amountCents;email=a.email;productName=a.productName;
      productDescription=a.productDescription||'';customerName=a.name||'';quantity=a.quantity||1;
    }else{
      amountCents=typeof a==='number'?a:0;productName=typeof b==='string'?b:'';
      productDescription=typeof c==='string'?c:'';email='';customerName='';quantity=1;
    }
    if(!email)email=findEmail();
    if(!customerName)customerName=findName();
    if(!productName){alert('Product name is required.');return Promise.reject('no_product_name');}
    if(!amountCents||amountCents<100){alert('Amount must be at least $1.00');return Promise.reject('invalid_amount');}
    if(!email){alert('Please enter your email address.');return Promise.reject('no_email');}
    var successBase=window.location.href.split('?')[0];
    return fetch(apiBase+'/api/landing-pages/public/'+slug+'/payment/checkout',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email:email,name:customerName,amountCents:amountCents,productName:productName,productDescription:productDescription,quantity:quantity,successUrl:successBase+'?payment=success&product='+encodeURIComponent(productName)+'&session_id={CHECKOUT_SESSION_ID}',cancelUrl:successBase+'?payment=cancelled'})
    }).then(function(r){return r.json();}).then(function(d){
      if(d.checkoutUrl){window.location.href=d.checkoutUrl;}
      else{alert(d.error||'Failed to process payment');throw new Error(d.error);}
    });
  };
  Object.defineProperty(window,'__processPayment',{value:__realProcessPayment,writable:false,configurable:false});
  document.addEventListener('DOMContentLoaded',function(){
    var urlParams=new URLSearchParams(window.location.search);
    if(urlParams.get('payment')==='success'){
      var pName=urlParams.get('product')||'your item';
      var overlay=document.createElement('div');overlay.id='payment-success-overlay';
      overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;font-family:system-ui,-apple-system,sans-serif;';
      overlay.innerHTML='<div style="background:white;border-radius:16px;padding:40px;max-width:420px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.15);"><div style="width:64px;height:64px;border-radius:50%;background:#dcfce7;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div><h2 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111827;">Payment Successful!</h2><p style="margin:0 0 24px;color:#6b7280;font-size:16px;">Thank you for purchasing '+pName.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'.</p><button onclick="document.getElementById(\'payment-success-overlay\').remove();window.history.replaceState({},\'\',window.location.pathname);" style="padding:12px 32px;font-size:16px;font-weight:600;background:#16a34a;color:white;border:none;border-radius:8px;cursor:pointer;">Continue</button></div>';
      document.body.appendChild(overlay);
    }
  });
})();

// ===== STATE =====
    let selectedPlan = 'free';
    let billingCycle = 'per-event';

    // ===== DARK MODE =====
    function toggleDarkMode() {
      document.body.classList.toggle('dark');
      const isDark = document.body.classList.contains('dark');
      localStorage.setItem('fb_theme', isDark ? 'dark' : 'light');
      document.getElementById('theme-icon').textContent = isDark ? '☀️' : '🌙';
    }

    function loadTheme() {
      const saved = localStorage.getItem('fb_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefersDark)) {
        document.body.classList.add('dark');
        document.getElementById('theme-icon').textContent = '☀️';
      }
    }

    // ===== PLAN SELECTION =====
    function selectPlan(plan) {
      selectedPlan = plan;

      const badges = {
        free: billingCycle === 'per-event' ? '🎪 Free Plan — $0' : '🎪 Free Plan — $0',
        growth: billingCycle === 'per-event' ? '🎪 Growth Plan — $49/event' : '🎪 Growth Annual — $199/year',
        pro: billingCycle === 'per-event' ? '🚀 Pro Plan — $199/event' : '🚀 Pro Annual — $599/year'
      };

      const badge = document.getElementById('plan-badge');
      if (badge) badge.textContent = badges[plan];

      updateSubmitBtn();
      updatePricingSummary();
      updateLockOverlays();
      updateStepIcons();
      updateReviewPlan();
    }

    function updateLockOverlays() {
      const s4Lock = document.getElementById('s4-lock');
      const s5Lock = document.getElementById('s5-lock');
      const stripeFull = document.getElementById('stripe-full-setup');
      const stripeFree = document.getElementById('stripe-free-note');

      if (s4Lock) s4Lock.classList.toggle('hidden', selectedPlan === 'growth' || selectedPlan === 'pro');
      if (s5Lock) s5Lock.classList.toggle('hidden', selectedPlan === 'pro');

      if (stripeFull) stripeFull.style.display = selectedPlan === 'free' ? 'none' : 'block';
      if (stripeFree) stripeFree.style.display = selectedPlan === 'free' ? 'block' : 'none';
    }

    function updateStepIcons() {
      const step4 = document.getElementById('step-4');
      const step5 = document.getElementById('step-5');
      if (!step4 || !step5) return;
      step4.textContent = (selectedPlan === 'free') ? '🔒' : '4';
      step5.textContent = (selectedPlan === 'pro') ? '5' : '🔒';
    }

    function updateSubmitBtn() {
      const btn = document.getElementById('submit-btn');
      if (!btn) return;
      if (selectedPlan === 'free') {
        btn.textContent = 'Create My Free Account →';
      } else if (billingCycle === 'per-event') {
        btn.textContent = 'Create Account & Continue to Payment →';
      } else {
        btn.textContent = 'Create Account & Start Annual Plan →';
      }
    }

    function updatePricingSummary() {
      const el = document.getElementById('pricing-summary');
      if (!el) return;
      let html = '';
      if (selectedPlan === 'free') {
        html = `
          <div class="price-line">FairBridge Plan: FREE — $0</div>
          <div style="color:var(--text-muted); font-size:13px; margin-top:6px;">Your booth fee: set by you, collected by FairBridge</div>
          <div style="color:var(--text-muted); font-size:13px;">FairBridge platform fee: charged to vendors, not you</div>
        `;
      } else if (selectedPlan === 'growth' && billingCycle === 'per-event') {
        html = `
          <div class="price-line" style="color:var(--primary);">FairBridge Plan: Growth — $49/event</div>
          <div style="color:var(--text-muted); font-size:13px; margin-top:6px;">Billed per event you create</div>
          <div style="font-size:13px; margin-top:8px;">🔒 Secure payment powered by Stripe</div>
        `;
      } else if (selectedPlan === 'growth' && billingCycle === 'annual') {
        html = `
          <div class="price-line" style="color:var(--primary);">FairBridge Plan: Growth Annual — $199/year</div>
          <div style="color:var(--text-muted); font-size:13px; margin-top:6px;">Unlimited events · Billed once per year</div>
          <div style="font-size:13px; margin-top:8px;">🔒 Secure payment powered by Stripe</div>
        `;
      } else if (selectedPlan === 'pro' && billingCycle === 'per-event') {
        html = `
          <div class="price-line" style="color:var(--secondary);">FairBridge Plan: Pro — $199/event</div>
          <div style="color:var(--text-muted); font-size:13px; margin-top:6px;">Includes 30-min onboarding call</div>
          <div style="font-size:13px; margin-top:8px;">🔒 Secure payment powered by Stripe</div>
        `;
      } else if (selectedPlan === 'pro' && billingCycle === 'annual') {
        html = `
          <div class="price-line" style="color:var(--secondary);">FairBridge Plan: Pro Annual — $599/year</div>
          <div style="color:var(--text-muted); font-size:13px; margin-top:6px;">Unlimited events · Includes onboarding call</div>
          <div style="font-size:13px; margin-top:8px;">🔒 Secure payment powered by Stripe</div>
        `;
      }
      el.innerHTML = html;
    }

    function updateReviewPlan() {
      const planEl = document.getElementById('review-plan');
      const billingEl = document.getElementById('review-billing');
      if (!planEl || !billingEl) return;

      const planNames = { free: 'Free', growth: 'Growth', pro: 'Pro' };
      planEl.textContent = planNames[selectedPlan] || 'Free';
      billingEl.textContent = billingCycle === 'annual' ? 'Annual' : 'Per Event';
    }

    // ===== BILLING TOGGLE =====
    function toggleBilling() {
      billingCycle = document.getElementById('billing-toggle').checked ? 'annual' : 'per-event';
      document.body.classList.toggle('annual-mode', billingCycle === 'annual');
      selectPlan(selectedPlan);
    }

    // ===== VIEW SWITCHING =====
    function showForm() {
      document.getElementById('view-plans').classList.add('hidden');
      const form = document.getElementById('view-form');
      form.classList.remove('hidden');
      form.style.opacity = '0';
      setTimeout(() => { form.style.opacity = '1'; form.style.transition = 'opacity 0.3s'; }, 10);

      document.getElementById('form-header-center').style.display = 'flex';
      document.getElementById('form-progress-header').style.display = 'block';
      document.getElementById('progress-steps').style.display = 'flex';

      window.scrollTo({ top: 0, behavior: 'smooth' });
      updateLockOverlays();
      updateStepIcons();
      updateProgress();
    }

    function showPlans() {
      document.getElementById('view-form').classList.add('hidden');
      const plans = document.getElementById('view-plans');
      plans.classList.remove('hidden');
      plans.style.opacity = '0';
      setTimeout(() => { plans.style.opacity = '1'; plans.style.transition = 'opacity 0.3s'; }, 10);

      document.getElementById('form-header-center').style.display = 'none';
      document.getElementById('form-progress-header').style.display = 'none';
      document.getElementById('progress-steps').style.display = 'none';

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===== SECTION COLLAPSE =====
    function toggleSection(id) {
      const section = document.getElementById(id);
      if (section) section.classList.toggle('collapsed');
    }

    function scrollToSection(id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ===== COMPARE TABLE =====
    function toggleCompare() {
      const table = document.getElementById('compare-table');
      const btn = document.getElementById('compare-btn');
      table.classList.toggle('open');
      btn.textContent = table.classList.contains('open') ? 'Hide comparison ▴' : 'Compare all features ▾';
    }

    // ===== FAQ =====
    function toggleFaq(item) {
      item.classList.toggle('open');
    }

    // ===== PROGRESS =====
    function updateProgress() {
      const requiredFields = [
        'first-name', 'last-name', 'organizer-email', 'job-title',
        'org-name', 'org-type', 'event-name', 'event-date',
        'event-start', 'venue-name', 'venue-address', 'city', 'state', 'booth-fee'
      ];

      let filled = 0;
      requiredFields.forEach(id => {
        const el = document.getElementById(id);
        if (el && el.value.trim()) filled++;
      });

      const pct = Math.round((filled / requiredFields.length) * 100);
      const fill = document.getElementById('progress-fill');
      const pctEl = document.getElementById('progress-pct');
      if (fill) fill.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';

      // Section completion checks
      const s1Fields = ['first-name', 'last-name', 'organizer-email', 'job-title', 'org-name', 'org-type'];
      const s2Fields = ['event-name', 'event-date', 'event-start', 'venue-name', 'venue-address', 'city', 'state'];

      checkSectionDone('s1-check', s1Fields);
      checkSectionDone('s2-check', s2Fields);

      // Update step circles
      updateStepCircles();
    }

    function checkSectionDone(checkId, fields) {
      const check = document.getElementById(checkId);
      if (!check) return;
      const done = fields.every(id => {
        const el = document.getElementById(id);
        return el && el.value.trim();
      });
      check.classList.toggle('done', done);
      check.textContent = done ? '✓' : check.textContent.replace('✓', '');
      if (!done) {
        const num = checkId.replace('s', '').replace('-check', '');
        check.textContent = num;
      }
    }

    function updateStepCircles() {
      const s1Fields = ['first-name', 'last-name', 'organizer-email', 'job-title', 'org-name', 'org-type'];
      const s2Fields = ['event-name', 'event-date', 'event-start', 'venue-name', 'venue-address', 'city', 'state'];

      const s1Done = s1Fields.every(id => { const el = document.getElementById(id); return el && el.value.trim(); });
      const s2Done = s2Fields.every(id => { const el = document.getElementById(id); return el && el.value.trim(); });

      const step1 = document.getElementById('step-1');
      const step2 = document.getElementById('step-2');
      if (step1) { step1.classList.toggle('done', s1Done); step1.textContent = s1Done ? '✓' : '1'; }
      if (step2) { step2.classList.toggle('done', s2Done); step2.textContent = s2Done ? '✓' : '2'; }
    }

    // ===== CHAR COUNTER =====
    function updateCharCount(inputId, counterId, max) {
      const input = document.getElementById(inputId);
      const counter = document.getElementById(counterId);
      if (!input || !counter) return;
      const len = input.value.length;
      counter.textContent = len + ' / ' + max;
      counter.classList.toggle('warn', len >= max - 30);
    }

    // ===== IMAGE PREVIEW =====
    function previewImage(input, previewId) {
      const preview = document.getElementById(previewId);
      if (!preview) return;
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => {
          preview.src = e.target.result;
          preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
      }
    }

    // ===== PASSWORD TOGGLE =====
    function togglePassword(inputId, btn) {
      const input = document.getElementById(inputId);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁️' : '🙈';
    }

    function checkPasswordMatch() {
      const pw = document.getElementById('password');
      const cpw = document.getElementById('confirm-password');
      const err = document.getElementById('err-confirm-password');
      if (!pw || !cpw || !err) return;
      if (cpw.value && pw.value !== cpw.value) {
        cpw.classList.add('field-error');
        err.classList.add('show');
      } else {
        cpw.classList.remove('field-error');
        err.classList.remove('show');
      }
    }

    // ===== VALIDATION =====
    function validateForm() {
      let firstError = null;

      function checkField(id, errId, condition) {
        const el = document.getElementById(id);
        const err = document.getElementById(errId);
        if (!el) return;
        const invalid = condition ? condition(el) : !el.value.trim();
        el.classList.toggle('field-error', invalid);
        if (err) err.classList.toggle('show', invalid);
        if (invalid && !firstError) firstError = el;
        return !invalid;
      }

      checkField('first-name', 'err-first-name');
      checkField('last-name', 'err-last-name');
      checkField('organizer-email', 'err-email', el => !el.value.trim() || !el.value.includes('@'));
      checkField('job-title', 'err-job-title');
      checkField('org-name', 'err-org-name');
      checkField('org-type', 'err-org-type');
      checkField('event-name', 'err-event-name');
      checkField('event-date', 'err-event-date');
      checkField('event-start', 'err-event-start');
      checkField('venue-name', 'err-venue-name');
      checkField('venue-address', 'err-venue-address');
      checkField('city', 'err-city');
      checkField('state', 'err-state');
      checkField('booth-fee', 'err-booth-fee', el => el.value === '');
      checkField('password', 'err-password', el => el.value.length < 8);

      // Password match
      const pw = document.getElementById('password');
      const cpw = document.getElementById('confirm-password');
      const errCpw = document.getElementById('err-confirm-password');
      if (pw && cpw && pw.value !== cpw.value) {
        cpw.classList.add('field-error');
        if (errCpw) errCpw.classList.add('show');
        if (!firstError) firstError = cpw;
      } else if (cpw) {
        cpw.classList.remove('field-error');
        if (errCpw) errCpw.classList.remove('show');
      }

      // Terms
      const terms = document.getElementById('terms-check');
      const errTerms = document.getElementById('err-terms');
      if (terms && !terms.checked) {
        if (errTerms) errTerms.classList.add('show');
        if (!firstError) firstError = terms;
      } else if (errTerms) {
        errTerms.classList.remove('show');
      }

      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      showSuccessModal();
    }

    // ===== SUCCESS MODAL =====
    function showSuccessModal() {
      const firstName = (document.getElementById('first-name') || {}).value || 'there';
      const modal = document.getElementById('success-modal');
      const title = document.getElementById('modal-title');
      const msg = document.getElementById('modal-msg');
      const btn = document.getElementById('modal-primary-btn');

      let titleText, msgText, btnText;

      if (selectedPlan === 'free') {
        titleText = 'Your account is live! 🎉';
        msgText = `Welcome to FairBridge, ${firstName}! Your organizer account is ready. Head to your dashboard to set up your event, copy your vendor invite link, and start collecting registrations.`;
        btnText = 'Go to My Dashboard →';
      } else if (selectedPlan === 'growth' && billingCycle === 'per-event') {
        titleText = 'Account created! 🎉';
        msgText = `Welcome to FairBridge Growth! You will now be redirected to Stripe to complete your first event payment. Once done, your event dashboard will be ready.`;
        btnText = 'Continue to Payment →';
      } else if (selectedPlan === 'growth' && billingCycle === 'annual') {
        titleText = 'Welcome to Growth Annual! 🎉';
        msgText = `Your annual plan is being activated. You will now be redirected to Stripe to complete your subscription. Then run unlimited events all year!`;
        btnText = 'Activate Annual Plan →';
      } else if (selectedPlan === 'pro' && billingCycle === 'per-event') {
        titleText = "You're going Pro! 🚀";
        msgText = `Welcome to FairBridge Pro, ${firstName}! Your account is being set up. Our team will reach out within 24 hours to schedule your 30-minute onboarding call and configure your Event AI Agent.`;
        btnText = 'Continue to Payment →';
      } else if (selectedPlan === 'pro' && billingCycle === 'annual') {
        titleText = "Pro Annual — Let's go! 🚀";
        msgText = `Welcome to FairBridge Pro Annual! Unlimited events, your own Event AI Agent, and a dedicated FairBridge team behind you. We will reach out within 24 hours to schedule your onboarding call.`;
        btnText = 'Activate Annual Plan →';
      }

      if (title) title.textContent = titleText;
      if (msg) msg.textContent = msgText;
      if (btn) btn.textContent = btnText;

      modal.classList.add('open');
      launchConfetti();

      if (selectedPlan !== 'free') {
        const email = (document.getElementById('organizer-email') || {}).value || '';
        const name = firstName + ' ' + ((document.getElementById('last-name') || {}).value || '');
        const planPrices = {
          growth: billingCycle === 'per-event' ? 4900 : 19900,
          pro: billingCycle === 'per-event' ? 19900 : 59900
        };
        const planNames = {
          growth: billingCycle === 'per-event' ? 'FairBridge Growth — Per Event' : 'FairBridge Growth Annual',
          pro: billingCycle === 'per-event' ? 'FairBridge Pro — Per Event' : 'FairBridge Pro Annual'
        };
        if (typeof window.__processPayment === 'function') {
          btn.onclick = () => {
            window.__processPayment({
              amountCents: planPrices[selectedPlan],
              email: email,
              productName: planNames[selectedPlan],
              productDescription: 'FairBridge Organizer Plan',
              name: name,
              quantity: 1
            });
          };
        }
      }
    }

    function closeModal() {
      document.getElementById('success-modal').classList.remove('open');
      document.getElementById('confetti-container').innerHTML = '';
    }

    // ===== CONFETTI =====
    function launchConfetti() {
      const container = document.getElementById('confetti-container');
      if (!container) return;
      container.innerHTML = '';
      const colors = ['#F5A623', '#38BDF8', '#10B981', '#EF4444', '#8B5CF6', '#F472B6'];
      for (let i = 0; i < 80; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.cssText = `
          left: ${Math.random() * 100}%;
          background: ${colors[Math.floor(Math.random() * colors.length)]};
          animation-duration: ${1.5 + Math.random() * 2}s;
          animation-delay: ${Math.random() * 0.5}s;
          transform: rotate(${Math.random() * 360}deg);
          width: ${6 + Math.random() * 8}px;
          height: ${6 + Math.random() * 8}px;
          border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        `;
        container.appendChild(piece);
      }
    }

    // ===== AUTO-SAVE DRAFT =====
    function saveDraft() {
      const data = { selectedPlan, billingCycle };
      const fields = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], input[type="number"], input[type="date"], input[type="time"], select, textarea');
      fields.forEach(el => {
        if (el.id) data[el.id] = el.value;
      });
      localStorage.setItem('fb_organizer_draft', JSON.stringify(data));
      showToast('Draft saved ✓');
    }

    function restoreDraft() {
      try {
        const saved = localStorage.getItem('fb_organizer_draft');
        if (!saved) return;
        const data = JSON.parse(saved);

        if (data.selectedPlan) selectedPlan = data.selectedPlan;
        if (data.billingCycle) billingCycle = data.billingCycle;

        Object.keys(data).forEach(key => {
          if (key === 'selectedPlan' || key === 'billingCycle') return;
          const el = document.getElementById(key);
          if (el && el.tagName !== 'INPUT' || (el && el.type !== 'checkbox' && el.type !== 'radio' && el.type !== 'file')) {
            if (el) el.value = data[key];
          }
        });

        if (billingCycle === 'annual') {
          const toggle = document.getElementById('billing-toggle');
          if (toggle) toggle.checked = true;
          document.body.classList.add('annual-mode');
        }

        showToast('Draft restored ✓');
      } catch(e) {}
    }

    function showToast(msg) {
      const toast = document.getElementById('toast');
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ===== LIVE REVIEW UPDATES =====
    function setupLiveUpdates() {
      const fields = [
        ['first-name', null, updateReviewName],
        ['last-name', null, updateReviewName],
        ['org-name', 'review-org', null],
        ['organizer-email', 'review-email', null],
        ['event-name', 'review-event', null],
      ];

      fields.forEach(([inputId, outputId, fn]) => {
        const el = document.getElementById(inputId);
        if (!el) return;
        el.addEventListener('input', () => {
          if (fn) fn();
          else {
            const out = document.getElementById(outputId);
            if (out) out.textContent = el.value || '—';
          }
          updateProgress();
          saveDraftDebounced();
        });
      });

      function updateReviewName() {
        const fn = (document.getElementById('first-name') || {}).value || '';
        const ln = (document.getElementById('last-name') || {}).value || '';
        const el = document.getElementById('review-name');
        if (el) el.textContent = (fn + ' ' + ln).trim() || '—';
      }

      // All other inputs
      document.querySelectorAll('input, select, textarea').forEach(el => {
        el.addEventListener('input', () => {
          updateProgress();
          saveDraftDebounced();
        });
        el.addEventListener('change', () => {
          updateProgress();
          saveDraftDebounced();
        });
      });
    }

    let draftTimer = null;
    function saveDraftDebounced() {
      clearTimeout(draftTimer);
      draftTimer = setTimeout(saveDraft, 1500);
    }

    // ===== INIT =====
    document.addEventListener('DOMContentLoaded', () => {
      loadTheme();
      restoreDraft();
      selectPlan(selectedPlan);
      setupLiveUpdates();
      updateProgress();
      updatePricingSummary();
      updateReviewPlan();
      setInterval(saveDraft, 30000);
    });