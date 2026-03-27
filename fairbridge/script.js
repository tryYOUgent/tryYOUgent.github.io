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
      xhr.open('GET','https://paymegpt.com/api/landing/context/'+encodeURIComponent(contactId)+'?page_id=2632');
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
  var slug='aBdH3n';
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

// THEME TOGGLE
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');

    function applyTheme(isDark) {
      if (isDark) {
        body.classList.add('dark');
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      } else {
        body.classList.remove('dark');
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      }
    }

    const savedTheme = localStorage.getItem('fairbridge-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(savedTheme === 'dark' || (!savedTheme && prefersDark));

    themeToggle.addEventListener('click', () => {
      const isDark = !body.classList.contains('dark');
      applyTheme(isDark);
      localStorage.setItem('fairbridge-theme', isDark ? 'dark' : 'light');
    });

    // HAMBURGER MENU
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });
    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      });
    });

    // SCROLL ANIMATIONS
    const animatedEls = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    animatedEls.forEach(el => observer.observe(el));

    // NAV SCROLL SHADOW
    const mainNav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
      mainNav.style.boxShadow = window.scrollY > 20 ? '0 4px 24px rgba(0,0,0,0.08)' : 'none';
    }, { passive: true });

    // VENDOR MODAL
    let currentVendorPlan = { name: '', price: 0 };

    function openVendorModal(planName, amountCents) {
      currentVendorPlan = { name: planName, price: amountCents };
      document.getElementById('vendorPlanName').textContent = planName + ' Tier';
      document.getElementById('vendorPlanPrice').textContent = '$' + (amountCents / 100) + ' FairBridge fee';
      document.getElementById('vendorModal').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeVendorModal() {
      document.getElementById('vendorModal').classList.remove('open');
      document.body.style.overflow = '';
    }

    document.getElementById('vendorModal').addEventListener('click', function(e) {
      if (e.target === this) closeVendorModal();
    });

    function submitVendorPurchase(e) {
      e.preventDefault();
      const name = document.getElementById('vendorName').value.trim();
      const email = document.getElementById('vendorEmail').value.trim();
      const company = document.getElementById('vendorCompany').value.trim();
      const btn = document.getElementById('vendorSubmitBtn');
      if (!name || !email || !company) return;
      btn.textContent = 'Redirecting to Stripe...';
      btn.disabled = true;
      if (typeof window.__processPayment === 'function') {
        window.__processPayment({
          amountCents: currentVendorPlan.price,
          email: email,
          productName: 'FairBridge Vendor — ' + currentVendorPlan.name + ' Tier',
          productDescription: 'FairBridge AI-powered vendor presence at job fair — ' + currentVendorPlan.name + ' tier for ' + company,
          name: name,
          quantity: 1
        });
      } else {
        setTimeout(() => {
          closeVendorModal();
          btn.textContent = 'Proceed to Checkout →';
          btn.disabled = false;
          alert('Thank you, ' + name + '! Your ' + currentVendorPlan.name + ' registration for ' + company + ' has been received. Check ' + email + ' for next steps.');
        }, 900);
      }
    }

    // ORGANIZER MODAL
    function openOrgModal() {
      document.getElementById('orgModal').classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeOrgModal() {
      document.getElementById('orgModal').classList.remove('open');
      document.body.style.overflow = '';
    }

    document.getElementById('orgModal').addEventListener('click', function(e) {
      if (e.target === this) closeOrgModal();
    });

    function submitOrgSignup(e) {
      e.preventDefault();
      const name = document.getElementById('orgName').value.trim();
      const email = document.getElementById('orgEmail').value.trim();
      const eventName = document.getElementById('orgEventName').value.trim();
      const btn = document.getElementById('orgSubmitBtn');
      if (!name || !email || !eventName) return;
      btn.textContent = 'Submitting...';
      btn.disabled = true;
      setTimeout(() => {
        closeOrgModal();
        btn.textContent = 'Create My Event Free →';
        btn.disabled = false;
        const form = document.getElementById('notifyForm');
        form.innerHTML = '<div style="text-align:center;padding:1rem 2rem;background:var(--bg);border:1px solid var(--border);border-radius:10px;font-size:0.95rem;color:var(--text);font-weight:600;">🎉 You\'re on the list! We\'ll reach out within 24 hours.</div>';
      }, 800);
    }

    // ESCAPE KEY
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { closeVendorModal(); closeOrgModal(); }
    });

    // NOTIFY ME
    function handleNotify() {
      const emailInput = document.getElementById('notifyEmail');
      const email = emailInput.value.trim();
      if (!email || !email.includes('@')) {
        emailInput.style.borderColor = '#EF4444';
        emailInput.focus();
        setTimeout(() => { emailInput.style.borderColor = ''; }, 2000);
        return;
      }
      const form = document.getElementById('notifyForm');
      form.innerHTML = '<div style="text-align:center;padding:1rem 2rem;background:var(--bg);border:1px solid var(--border);border-radius:10px;font-size:0.95rem;color:var(--text);font-weight:600;">🎉 You\'re on the list! We\'ll be in touch soon.</div>';
    }

    // CHAT UI
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');

    const aiResponses = {
      default: "Great question! FairBridge is designed so every attendee gets a personalized experience. Want to know about a specific company at today's fair, or can I help you find roles that match your background?",
      engineer: "I found 4 companies actively hiring engineers today: TechCorp (Booth #12) — remote-friendly, NovaSoft (#7) — Series B startup, DataFlow (#3) — data engineering focus, and CloudBase (#19) — infrastructure roles. Which sounds most interesting?",
      designer: "3 companies are hiring designers today! TechCorp (Booth #12) has a Product Designer role, CreativeStudio (#5) is looking for a UX Lead, and StartupX (#22) needs a Brand Designer. Want details on any of them?",
      remote: "Great news — 6 companies today offer remote or hybrid roles. TechCorp, NovaSoft, DataFlow, CloudBase, FinTech Co, and GreenTech all list remote-friendly positions. I can tell you more about any of them!",
      techcorp: "TechCorp (Booth #12) is a 500-person SaaS company. They're hiring a Software Engineer, Product Designer, and Data Analyst. All roles are remote-eligible with competitive equity. Their HR contact is Sarah M. — she's at the booth now! Want the apply link?",
      apply: "Absolutely! I can pull up direct apply links for any role. Just tell me which company or role you're interested in and I'll get you the link plus the HR contact if available.",
      summary: "After the fair ends, I'll send a complete summary to your email — every company you visited, every role you showed interest in, and every apply link. You won't miss a single opportunity!",
      salary: "Most companies here are offering competitive market-rate salaries. For specific ranges, I'd recommend asking at the booth or checking the apply link — some listings include salary bands. Want me to flag which companies are most transparent about compensation?",
    };

    function getAIResponse(message) {
      const msg = message.toLowerCase();
      if (msg.includes('engineer') || msg.includes('developer') || msg.includes('software') || msg.includes('coding')) return aiResponses.engineer;
      if (msg.includes('design') || msg.includes('ux') || msg.includes('ui') || msg.includes('creative')) return aiResponses.designer;
      if (msg.includes('remote') || msg.includes('hybrid') || msg.includes('work from home')) return aiResponses.remote;
      if (msg.includes('techcorp') || msg.includes('tech corp') || msg.includes('booth 12') || msg.includes('booth #12')) return aiResponses.techcorp;
      if (msg.includes('apply') || msg.includes('application') || msg.includes('link')) return aiResponses.apply;
      if (msg.includes('summary') || msg.includes('email') || msg.includes('after')) return aiResponses.summary;
      if (msg.includes('salary') || msg.includes('pay') || msg.includes('compensation') || msg.includes('money')) return aiResponses.salary;
      return aiResponses.default;
    }

    function addChatMessage(text, isUser) {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'chat-msg ' + (isUser ? 'chat-msg-user' : 'chat-msg-agent');
      const label = document.createElement('div');
      label.className = 'chat-msg-label';
      label.textContent = isUser ? 'You' : 'FairBridge AI';
      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble ' + (isUser ? 'chat-bubble-user' : 'chat-bubble-agent');
      bubble.innerHTML = text;
      msgDiv.appendChild(label);
      msgDiv.appendChild(bubble);
      chatMessages.appendChild(msgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sendChatMessage() {
      const text = chatInput.value.trim();
      if (!text) return;
      addChatMessage(text, true);
      chatInput.value = '';
      const typingDiv = document.createElement('div');
      typingDiv.className = 'chat-msg chat-msg-agent';
      typingDiv.id = 'typing';
      typingDiv.innerHTML = '<div class="chat-msg-label">FairBridge AI</div><div class="chat-bubble chat-bubble-agent" style="color:var(--text-light);font-style:italic;">Typing...</div>';
      chatMessages.appendChild(typingDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      setTimeout(() => {
        const typing = document.getElementById('typing');
        if (typing) typing.remove();
        addChatMessage(getAIResponse(text), false);
      }, 850);
    }

    chatSend.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatMessage(); });