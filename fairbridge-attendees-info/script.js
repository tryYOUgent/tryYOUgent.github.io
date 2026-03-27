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
      xhr.open('GET','https://paymegpt.com/api/landing/context/'+encodeURIComponent(contactId)+'?page_id=2672');
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
  var slug='CLU5hJp';
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

// ====== DEMO RESPONSES ======
    const demoResponses = {
      remote: "Great question! I found 5 companies offering remote roles today — TechCorp (Booth #12, hiring engineers), NovaSoft (#7, product roles), DataFlow (#3, data analysts), CloudBase (#19, DevOps), and DesignCo (#4, UX designers). Want details on any of them?",
      tech: "The technology companies are clustered in Section B — Booths #7 through #19. TechCorp is at #12, NovaSoft at #7, and DataFlow at #3. That whole section is on the east side of the main hall, near the refreshments table!",
      benefits: "TechCorp offers full health, dental, and vision insurance, a 401k with 4% match, unlimited PTO, fully remote work options, a $3,000 annual learning budget, and stock options for all employees. Their HR contact is Jamie Lee — want me to share her email?",
      visa: "3 companies at today's fair offer visa sponsorship — TechCorp (case by case), NovaSoft (yes for engineering roles), and CloudBase (yes for all roles). I'd recommend starting with CloudBase — they're actively recruiting and have the most open roles for international candidates.",
      contact: "At Memorial Health (Booth #3), ask for Sarah Chen — she's the Nurse Recruiter and will be on-site all day. Her email is sarah.chen@memorialhealth.com. They're conducting on-the-spot interviews today for new grad RN roles — bring your license documentation!",
      grads: "7 companies today specifically welcome recent graduates — Memorial Health, TechCorp, DataFlow, DesignCo, CloudBase, CityWorks, and GreenEnergy. TechCorp and Memorial Health both have formal new grad programs with structured onboarding. Want me to help you prioritize your visits?"
    };

    const defaultResponse = "Hi! I'm your personal guide for today's fair. I know every company, every open role, and every apply link here. What are you looking for? 👋";

    // ====== CHIP DEMO ======
    const chips = document.querySelectorAll('.demo-chip');
    const demoBubble = document.getElementById('demoBubble');

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        demoBubble.classList.add('fade-out');
        setTimeout(() => {
          demoBubble.textContent = demoResponses[chip.dataset.key] || defaultResponse;
          demoBubble.classList.remove('fade-out');
        }, 300);
      });
    });

    // ====== FAQ ACCORDION ======
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
      item.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        faqItems.forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });

    // ====== EMAIL FORM ======
    const ctaSubmit = document.getElementById('ctaSubmit');
    const ctaEmail = document.getElementById('ctaEmail');
    const ctaForm = document.getElementById('ctaForm');
    const ctaSuccess = document.getElementById('ctaSuccess');

    ctaSubmit.addEventListener('click', () => {
      const emailVal = ctaEmail.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailVal)) {
        ctaEmail.classList.add('error');
        ctaEmail.focus();
        setTimeout(() => ctaEmail.classList.remove('error'), 600);
        return;
      }
      ctaForm.style.display = 'none';
      ctaSuccess.style.display = 'block';
    });

    ctaEmail.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') ctaSubmit.click();
    });

    // ====== DARK MODE ======
    function applyTheme(dark) {
      if (dark) {
        document.body.classList.add('dark');
        document.getElementById('themeToggle').textContent = '☀️';
      } else {
        document.body.classList.remove('dark');
        document.getElementById('themeToggle').textContent = '🌙';
      }
    }

    document.getElementById('themeToggle').addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark');
      applyTheme(!isDark);
      localStorage.setItem('fb_theme', isDark ? 'light' : 'dark');
    });

    // ====== MOBILE NAV ======
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');

    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
      hamburger.textContent = mobileNav.classList.contains('open') ? '✕' : '☰';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        hamburger.textContent = '☰';
      });
    });

    // ====== SCROLL ANIMATIONS ======
    const revealEls = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealEls.forEach(el => observer.observe(el));

    // ====== INIT ======
    document.addEventListener('DOMContentLoaded', () => {
      const saved = localStorage.getItem('fb_theme');
      if (saved === 'dark') {
        applyTheme(true);
      } else if (saved === 'light') {
        applyTheme(false);
      } else {
        // Default: light
        applyTheme(false);
      }
    });