function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// ============================================================================
// WEB3FORMS CONFIGURATION
// ============================================================================
const WEB3FORMS_KEY = "568f9ad8-212f-4c5a-9f19-935af8febe2c";

function sendWeb3Form(subject, fields) {
  return fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_key: WEB3FORMS_KEY,
      subject: subject,
      ...fields
    })
  }).then(res => res.json()).then(data => {
    if (!data.success) throw new Error(data.message || "Email failed");
    return data;
  });
}

function api(path, options = {}) {
  return fetch(path, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  }).then(async (response) => {
    const isJson = (response.headers.get("content-type") || "").includes("application/json");
    const payload = isJson ? await response.json() : null;
    if (!response.ok) {
      const error = new Error(payload?.error || `Request failed (${response.status})`);
      error.status = response.status;
      throw error;
    }
    return payload;
  });
}

async function submitFormAndNotify(path, subject, payload, emailFields = payload) {
  let serverResult = null;
  let serverError = null;

  try {
    serverResult = await api(path, { method: "POST", body: JSON.stringify(payload) });
  } catch (err) {
    serverError = err;
  }

  if (serverError && serverError.status && ![404, 405, 500, 502, 503, 504].includes(serverError.status)) {
    throw serverError;
  }

  if (!serverResult?.emailSent) {
    await sendWeb3Form(subject, emailFields);
  }

  return serverResult || { success: true, emailSent: true, fallback: true };
}

function updateSeo(publicData) {
  const pathname = window.location.pathname === "/index.html" ? "/" : window.location.pathname.replace(/\.html$/, "");
  const seo = publicData.seo;
  const current = seo.pages[pathname] || seo.pages["/"] || {};
  const title = current.title || seo.defaultTitle;
  const description = current.description || seo.defaultDescription;
  document.title = title;

  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", description);
  }
}

function serviceLink(service) {
  return `/services/${service.slug}`;
}

function renderServiceMedia(service, className = "service-media") {
  if (!service.imageUrl && service.workflowSteps) {
    return `<div class="service-build-note"><span class="eyebrow">WORKFLOW OUTLINE</span><ol>${service.workflowSteps.map(step=>`<li>${escapeHtml(step)}</li>`).join('')}</ol></div>`;
  }
  if (!service.imageUrl) {
    return `
      <div class="${className} service-media-empty">
        Workflow built around your tools
      </div>
    `;
  }

  return `
    <div class="${className}">
      <img
        src="${escapeHtml(service.imageUrl)}"
        alt="${escapeHtml(service.imageAlt || service.title)}"
        loading="lazy"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"
      >
      <div class="service-media-error">Image unavailable</div>
    </div>
  `;
}

// ============================================================================
// HEADER & FOOTER RENDERING
// ============================================================================
function renderHeader(settings) {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  header.innerHTML = `
    <div class="container header-inner">
      <a class="brand" href="/">
        <img class="flowagent-brand-logo" src="/flowagent-logo.png" alt="FlowAgent" width="72" height="72">
      </a>
      
      <nav class="nav-links" id="mainNavigation" aria-label="Main navigation">
        <a href="/">Home</a>
        <a href="/services">Services</a>
        <a href="/pricing">Plans</a>
        <a href="/faq">FAQ</a>
      </nav>
      
      <div class="header-actions">
        <a href="/contact" class="btn btn-primary btn-sm">Let's talk ↗</a>
      </div>
      
      <button class="mobile-toggle" aria-label="Toggle menu" aria-expanded="false" aria-controls="mainNavigation">☰</button>
    </div>
  `;

  const menuButton = header.querySelector('.mobile-toggle');
  const navigation = header.querySelector('.nav-links');
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    navigation.classList.toggle('menu-open', open);
  });
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('menu-open');
      menuButton.focus();
    }
  });
  // Header scroll effect
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

function renderFooter(settings) {
  const footer = document.getElementById("siteFooter");
  if (!footer) return;

  footer.innerHTML = `
    <div class="container footer-grid">
      <div class="footer-brand">
        <a class="brand" href="/">
          <img class="flowagent-brand-logo" src="/flowagent-logo.png" alt="FlowAgent" width="72" height="72">
        </a>
        <p>AI content, customer support and automation, built around your business.</p>
      </div>
      
      <div class="footer-links">
        <h4>Services</h4>
        <ul id="footerServicesList">
          <li><a href="/services/whatsapp-chat-bot">WhatsApp automation</a></li><li><a href="/services/shopify-seo-blog-automation">Shopify content</a></li><li><a href="/services/custom-n8n-automation">Custom workflows</a></li><li><a href="/services">All services</a></li>
        </ul>
      </div>
      
      <div class="footer-links">
        <h4>Company</h4>
        <ul>
          <li><a href="/about">About Us</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
      
      <div class="footer-links">
        <h4>${escapeHtml(settings.newsletterTitle)}</h4>
        <p style="font-size: 0.9rem; margin-bottom: 12px;">${escapeHtml(settings.newsletterText)}</p>
        <form class="newsletter-form" id="newsletterForm">
          <input type="email" name="email" placeholder="Email address" aria-label="Email address for newsletter" required>
          <button type="submit" class="btn btn-primary btn-sm">Join</button>
        </form>
        <div id="newsletterStatus" style="margin-top: 8px; font-size: 0.85rem; color: var(--accent-light); display: none;">
          Thanks, you are on the list.
        </div>
      </div>
    </div>
    
    <div class="container footer-bottom">
      <p>&copy; ${new Date().getFullYear()} ${escapeHtml(settings.brandName)}. All rights reserved.</p>
      <div class="footer-social">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
      </div>
    </div>
  `;
}

function setupNewsletterForm() {
  const newsletterForm = document.getElementById("newsletterForm");
  if (!newsletterForm || newsletterForm.dataset.bound === "true") return;

  newsletterForm.dataset.bound = "true";
  newsletterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submittedForm = e.currentTarget || e.target;
    const btn = submittedForm.querySelector("button");
    const originalText = btn.textContent;
    btn.textContent = "Joining...";
    btn.disabled = true;
    try {
      const formData = new FormData(submittedForm);
      const payload = Object.fromEntries(formData.entries());
      await submitFormAndNotify("/api/forms/newsletter", "New Newsletter Signup", payload, {
        email: payload.email || "no-email@provided.com",
        message: "Newsletter signup from " + (payload.email || "unknown email")
      });
      submittedForm.reset();
      const status = document.getElementById("newsletterStatus");
      if (status) status.style.display = "block";
    } catch (err) {
      alert("Failed to join newsletter: " + err.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
}

// ============================================================================
// HOMEPAGE RENDERING
// ============================================================================
function renderHome(data) {
  const home=data.pageContent.home;
  const put=(id,html)=>{const element=document.getElementById(id);if(element)element.innerHTML=html;};
  const offers=[{"slug":"social-media-automation","number":"01","category":"SOCIAL CONTENT","title":"Your content.<br>Published on schedule.","text":"Connect your UGC assets, captions, review, and publishing. Keep your social accounts moving from one content queue.","tools":"n8n / Media assets / Publishing APIs","label":"Explore social media publishing"},{"slug":"shopify-seo-blog-automation","number":"02","category":"BLOG PUBLISHING","title":"From topic<br>to published article.","text":"Generate drafts from your topics and business information, add a review step, and publish through a connected schedule.","tools":"n8n / AI / Shopify or CMS","label":"Explore blog writing and publishing"},{"slug":"whatsapp-chat-bot","number":"03","category":"WHATSAPP SUPPORT","title":"Answer questions.<br>Keep the conversation.","text":"Use your business information to answer common questions, collect enquiry details, and bring in a person when needed.","tools":"n8n / WhatsApp / AI","label":"Explore the WhatsApp AI chatbot"}];
  put('heroSection',`<div class="container home-hero-layout">
    <div class="hero-kicker"><span class="status-dot" aria-hidden="true"></span> CONTENT · SALES · SUPPORT · OPERATIONS <span class="hero-kicker-end">BUILT BY FLOWAGENT ↙</span></div>
    <div class="home-hero-copy"><h1>${escapeHtml(home.heroTitle).replace('Less busywork.','<span>Less busywork.</span>')}</h1><p class="hero-text">${escapeHtml(home.heroText)}</p><div class="hero-actions"><a class="btn btn-primary btn-lg" href="${escapeHtml(home.primaryCtaLink)}">${escapeHtml(home.primaryCtaLabel)} <span aria-hidden="true">↗</span></a><a class="text-link" href="${escapeHtml(home.secondaryCtaLink)}">${escapeHtml(home.secondaryCtaLabel)} <span aria-hidden="true">→</span></a></div><p class="hero-footnote">30 videos. 30 images. Your approval before publishing.</p></div>
    <figure class="hero-photo"><img src="/media/ecommerce-workspace.jpg" alt="An online store owner packing an order at a worktable" width="1400" height="935" fetchpriority="high"><figcaption><span>FOR THE WORK BEHIND<br>YOUR BUSINESS.</span><span class="photo-caption-arrow" aria-hidden="true">↗</span></figcaption><a class="hero-price-note" href="/pricing"><span>SOCIAL CONTENT</span><strong>60<small>posts</small></strong><span>EXPLORE THE PACKAGES ↗</span></a></figure>
    <div class="hero-bottom"><span>YOUR BUSINESS NEEDS YOU.<br>THE COPY-PASTE DOESN’T.</span><a href="#servicesSection">See what we automate <span aria-hidden="true">↓</span></a></div>
  </div>`);
  put('integrationStrip','<div class="container integration-row"><span class="integration-label">WORKS WITH YOUR STACK</span><div class="integration-logos"><span>Shopify</span><span>WhatsApp</span><span>n8n</span><span>OpenAI</span><span>Google Sheets</span></div></div>');
  put('servicesSection',`<div class="container"><div class="section-header section-header-split"><div><span class="eyebrow">01 / WHAT WE AUTOMATE</span><h2>Take the repeat<br>out of your day.</h2></div><p>Start with content and conversations.<br>Then connect the rest of your business.</p></div><div class="offer-grid">${offers.map(o=>`<a class="offer-card" href="/services/${o.slug}" aria-label="${o.label}"><span class="offer-number">${o.number}</span><div class="offer-heading"><span class="eyebrow">${o.category}</span><h3>${o.title}</h3></div><div class="offer-description"><p>${o.text}</p><span class="offer-tools">${o.tools}</span></div><span class="offer-arrow" aria-hidden="true">↗</span></a>`).join('')}</div><div class="catalog-footer"><p>Also: lead follow-up, bookings, inbox sorting, invoices, and reporting.</p><a class="text-link" href="/services">Explore the full service list ↗</a></div></div>`);
  put('workflowDemo',`<div class="container demo-callout"><div class="demo-label"><span class="eyebrow">02 / TAKE A LOOK</span><span class="demo-example-tag">SCRIPTED EXAMPLE</span></div><div><h2>Try the conversation.<br><span>Then picture it in your store.</span></h2><p>Walk through an order question, a product recommendation, or a handoff to a person. Sample data and preset replies. No live orders or messages.</p><a class="btn btn-primary" href="/whatsapp-demo.html">Try the WhatsApp example <span aria-hidden="true">↗</span></a></div><span class="demo-big-arrow" aria-hidden="true">↗</span></div>`);
  put('howItWorksSection',`<div class="container"><div class="section-header section-header-split"><div><span class="eyebrow">03 / THE PROCESS</span><h2>We build it.<br>You keep moving.</h2></div><p>A clear scope, connected tools, and a test run before the workflow becomes part of your day.</p></div><div class="steps-container">${[['Map the job.','Choose one task. Define the inputs, monthly volume, and what a good result looks like.'],['Connect the dots.','Bring together the tools, approved information, and permissions the workflow needs.'],['Test the awkward bits.','Check typical requests, missing information, and the moments that need a person.'],['Put it to work.','Launch the agreed system and decide how handoff, monitoring, and support will work.']].map((s,i)=>`<article class="step-card"><div class="step-number">0${i+1} <span aria-hidden="true">→</span></div><h3>${s[0]}</h3><p>${s[1]}</p></article>`).join('')}</div></div>`);
  const cs=data.caseStudies[0];
  put('caseStudySection',cs?`<div class="container implementation-layout"><div><span class="eyebrow">04 / INSIDE A WORKFLOW</span><h2>A product list.<br>A publishing routine.</h2><p>${escapeHtml(cs.challenge)}</p><p>The system connects a topic queue, article generation, images, and Shopify publishing. Completed and pending topics stay tracked in the sheet.</p><a class="text-link" href="/services/shopify-seo-blog-automation">See the Shopify SEO system ↗</a></div><div class="implementation-detail"><div class="implementation-heading"><span>PRODUCT → ARTICLE</span><span>WORKFLOW EXAMPLE</span></div><ol class="editorial-flow"><li><span>01</span><div><strong>Choose the product & topic</strong><p>Catalogue, keywords, and audience.</p></div></li><li><span>02</span><div><strong>Generate the article</strong><p>Structure, product references, and images.</p></div></li><li><span>03</span><div><strong>Review before publishing</strong><p>An approval step can be included.</p></div></li><li><span>04</span><div><strong>Publish & update the queue</strong><p>Shopify and topic tracking stay connected.</p></div></li></ol><p class="scope-note">An implementation example, not a promise of traffic or sales.</p></div></div>`:'');
  put('pricingSection',`<div class="container"><div class="section-header section-header-split"><div><span class="eyebrow">SOCIAL MEDIA PACKAGES</span><h2>Every day.<br>Your way.</h2></div><p>Choose a video format. Both packages include 30 image posts. Pilot pricing is being finalized.</p></div><div class="offer-grid"><article class="offer-card"><span class="offer-number">01</span><div class="offer-heading"><span class="eyebrow">EVERYDAY</span><h3>Short videos.<br>Steady presence.</h3></div><div class="offer-description"><p>30 ten-second videos with Gemini Omni. 30 branded image posts. Review and approve your content in the Studio.</p><a class="text-link" href="/studio">Open Studio ↗</a></div></article><article class="offer-card"><span class="offer-number">02</span><div class="offer-heading"><span class="eyebrow">PREMIUM</span><h3>More time.<br>More story.</h3></div><div class="offer-description"><p>30 twenty-second videos with Seedance 2.5. 30 branded image posts. The same content review workflow.</p><a class="text-link" href="/studio">Open Studio ↗</a></div></article></div><p class="pricing-scope">Early access. Generation requires connected providers. Social publishing and message replies require account setup and validation.</p></div>`);
  put('faqSection',`<div class="container faq-compact"><div><span class="eyebrow">06 / GOOD QUESTIONS</span><h2>Before we<br>get into it.</h2><a class="text-link" href="/faq">All the FAQs ↗</a></div><div class="faq-list">${data.faqs.filter(f=>['faq-002','faq-003','faq-006','faq-009','faq-scope'].includes(f.id)).map(f=>`<details class="faq-item"><summary class="faq-summary">${escapeHtml(f.question)}<span aria-hidden="true">+</span></summary><div class="faq-answer">${escapeHtml(f.answer)}</div></details>`).join('')}</div></div>`);
  put('finalCtaSection',`<div class="container final-editorial"><span class="eyebrow">START WITH THE TASK YOU KEEP PUTTING OFF.</span><h2>Let’s take it<br><span>off your plate.</span></h2><div class="final-editorial-bottom"><p>Tell us what your business does manually.<br>We’ll talk through what can be automated.</p><a class="btn btn-primary btn-lg" href="/contact">Tell us about your workflow ↗</a></div></div>`);
}
function renderServiceDetailPage(data) {
  const serviceSlug = window.location.pathname.split("/").pop().replace(".html", "");
  const service = data.services.find(s => s.slug === serviceSlug);

  if (!service) {
    document.querySelector("main").innerHTML = `
      <div class="section"><div class="container" style="text-align:center;">
        <h2>Service Not Found</h2>
        <a href="/#servicesSection" class="btn btn-primary" style="margin-top:24px;">View All Services</a>
      </div></div>
    `;
    return;
  }

  document.title = `${service.title} | FlowAgent`;

  document.querySelector("main").innerHTML = `
    <section class="hero" style="min-height: 60vh;">
      <div class="hero-glow"></div>
      <div class="container grid-2" style="align-items: center; gap: 64px;">
        <div class="hero-content animate-fade-up">
          <a href="/#servicesSection" style="color:var(--accent-light); font-weight:600; font-size:0.9rem; margin-bottom:16px; display:inline-block;">← Back to Services</a>
          <h1 class="text-gradient">${escapeHtml(service.title)}</h1>
          <p class="hero-text" style="font-size: 1.5rem; color:var(--text);">${escapeHtml(service.price)}</p>
          <p class="hero-text">${escapeHtml(service.description)}</p>
          <div class="hero-actions" style="margin-top:40px; justify-content: flex-start;">
            <a href="${service.quoteOnly ? '/contact' : '/checkout.html?serviceId='+escapeHtml(service.id)}" class="btn btn-primary btn-lg">${service.quoteOnly ? 'Discuss this workflow' : 'Checkout Now'}</a>
          </div>
        </div>
        <div class="hero-visual animate-fade-up delay-200">
          ${renderServiceMedia(service, "service-detail-media")}
        </div>
      </div>
    </section>

    <section class="section" style="background: var(--surface-soft); border-top:1px solid var(--line);">
      <div class="container">
        <div class="grid-2">
          <div class="card animate-fade-up">
            <h3 style="margin-bottom: 24px;">System Benefits</h3>
            <ul class="service-features" style="margin-top:0;">
              ${service.benefits.map(b => `
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>${escapeHtml(b)}</li>
              `).join('')}
            </ul>
          </div>
          <div class="card animate-fade-up delay-100">
            <h3 style="margin-bottom: 24px;">Deliverables</h3>
            <ul class="service-features" style="margin-top:0;">
              ${service.deliverables.map(b => `
                <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>${escapeHtml(b)}</li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header animate-fade-up">
          <h2 class="text-gradient">Service FAQ</h2>
        </div>
        <div class="faq-list">
          ${(service.faq || []).map((f, i) => `
            <details class="faq-item animate-fade-up delay-${(i%5)*100}">
              <summary class="faq-summary">
                ${escapeHtml(f.question)}
                <svg class="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </summary>
              <div class="faq-answer">${escapeHtml(f.answer)}</div>
            </details>
          `).join('')}
        </div>
      </div>
    </section>
  `;

  setupAnimations();
}

// ============================================================================
// UTILITIES
// ============================================================================
function setupAnimations() {
  const animatedItems = document.querySelectorAll('.animate-fade-up');
  if (!("IntersectionObserver" in window)) {
    animatedItems.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  animatedItems.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('visible');
      return;
    }
    observer.observe(el);
  });
}


// ============================================================================
// CORE PAGES RENDERING
// ============================================================================
function renderServicesPage(data) {
  const container=document.getElementById('servicesPageGrid')||document.getElementById('servicesSection');
  if(!container)return;
  const groups=['Content & Publishing','Sales & Bookings','Customer Support','Business Operations'];
  const active=data.services.filter(s=>!s.legacy);
  container.innerHTML='<nav class="catalogue-nav" aria-label="Service categories">'+groups.map((g,i)=>`<a href="#service-group-${i}">${escapeHtml(g)}</a>`).join('')+'</nav>'+groups.map((g,i)=>`<section class="catalogue-group" id="service-group-${i}"><h2>${escapeHtml(g)}</h2><div class="catalogue-items">${active.filter(s=>s.category===g).map(s=>`<article class="catalogue-item"><span class="eyebrow">${s.quoteOnly?'BUILD TO YOUR REQUIREMENTS':escapeHtml(s.price)}</span><h3>${escapeHtml(s.title)}</h3><p>${escapeHtml(s.description)}</p><a class="text-link" href="${serviceLink(s)}">${s.quoteOnly?'Explore this workflow':'View service details'} ↗</a></article>`).join('')}</div></section>`).join('');
}

function renderPricingPage(data) {
 const intro=document.getElementById('pricingIntro');if(intro)intro.innerHTML='<div class="container"><div class="section-header"><span class="eyebrow">SOCIAL MEDIA PACKAGES / EARLY ACCESS</span><h1>Show up.<br>Every day.</h1><p>Two video options. One place to review your content.<br>Customer pricing will be confirmed after the pilot.</p></div></div>';
 const grid=document.getElementById('pricingFullGrid');if(grid)grid.innerHTML=[['Everyday','10 seconds','Gemini Omni','30 short videos for everyday posts.'],['Premium','20 seconds','Seedance 2.5','30 longer videos generated in one pass.']].map(p=>`<article class="card pricing-card"><span class="eyebrow">${p[0]}</span><h2>${p[1]}</h2><p>${p[3]}</p><ul class="pricing-features"><li>${p[2]} video generation</li><li>30 branded image posts per month</li><li>Content approval workspace</li><li>Publishing setup for agreed channels</li></ul><p class="scope-note">Pilot pricing to be confirmed. Social publishing and replies require separate account connections.</p><a class="btn btn-primary" href="/studio">Open Content Studio ↗</a></article>`).join('');
 const table=document.getElementById('pricingComparisonTable');if(table)table.innerHTML='<div class="pricing-table-wrap"><table class="scope-table"><thead><tr><th>Included</th><th>Everyday</th><th>Premium</th></tr></thead><tbody><tr><th>Videos / month</th><td>30 × 10 seconds</td><td>30 × 20 seconds</td></tr><tr><th>Images / month</th><td>30</td><td>30</td></tr><tr><th>Video model</th><td>Gemini Omni</td><td>Seedance 2.5</td></tr><tr><th>Human approval</th><td>Included</td><td>Included</td></tr></tbody></table></div>';
}
function renderContactPage(data) {
  const contactInfo = data.pageContent.contact || {};
  const settings = data.settings || {};
  const contactIntro = document.getElementById("contactIntro");
  const contactDetails = document.getElementById("contactDetailsCard");
  const contactEmail = settings.businessEmail || "jotaroe007@gmail.com";
  const whatsapp = settings.whatsapp || "+212 710010126";
  const whatsappDigits = String(whatsapp).replace(/\D/g, "");
  let contactForm = document.getElementById("contactForm");
  const contactSec = contactForm?.closest(".container") || document.getElementById("contactSection");
  const isOldDesign = contactSec?.id === "contactSection";

  if (contactIntro) {
    contactIntro.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">${escapeHtml(contactInfo.headline || "Let's talk about your automation")}</h1>
          <p>${escapeHtml(contactInfo.intro || "Tell us what your brand does manually today.")}</p>
        </div>
      </div>
    `;
  }

  if (contactDetails) {
    contactDetails.innerHTML = `
      <p class="accent-label">Contact</p>
      <h3>FlowAgent</h3>
      <p>Email: <a href="mailto:${escapeHtml(contactEmail)}">${escapeHtml(contactEmail)}</a></p>
      <p>WhatsApp: <a href="https://wa.me/${escapeHtml(whatsappDigits)}">${escapeHtml(whatsapp)}</a></p>
    `;
  }
  
  if (isOldDesign) {
    contactSec.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">Contact Us</h1>
          <p>Tell us what your brand does manually today.</p>
        </div>
        <div style="max-width: 600px; margin: 0 auto; background: var(--surface); padding: 2rem; border-radius: 12px; border: 1px solid var(--line);" class="animate-fade-up delay-100">
          <form id="contactForm" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Name</label>
              <input type="text" name="name" required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);">
            </div>
            <div>
              <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Email</label>
              <input type="email" name="email" required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);">
            </div>
            <div>
              <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Message</label>
              <textarea name="message" required rows="5" style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);"></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="margin-top: 1rem;">Send Message</button>
          </form>
          <div id="contactStatus" class="form-status" role="status" aria-live="polite">
            Message sent successfully! We will reach out soon.
          </div>
        </div>
      </div>
    `;
    contactForm = document.getElementById("contactForm");
  }

  if (contactForm && contactForm.dataset.bound !== "true") {
    contactForm.dataset.bound = "true";
    contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submittedForm = e.currentTarget || e.target;
    const btn = submittedForm.querySelector("button");
    const originalText = btn.textContent;
    btn.textContent = "Sending...";
    btn.disabled = true;
    try {
      const formData = new FormData(submittedForm);
      const payload = Object.fromEntries(formData.entries());
      await submitFormAndNotify("/api/forms/contact", "New Contact Form: " + (payload.name || "Website Visitor"), payload, {
        name: payload.name || "Website Visitor",
        email: payload.email || "no-email@provided.com",
        phone: payload.phone || "",
        company: payload.company || "",
        service: payload.service || "",
        preferredContact: payload.preferredContact || "",
        message: payload.message || "No message provided"
      });
      submittedForm.reset();
      const status = document.getElementById("contactStatus");
      if (status) status.style.display = "block";
    } catch (err) {
      alert("Failed to send message: " + err.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
  }

}

function setupBookingForm() {
  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm && bookingForm.dataset.bound !== "true") {
    bookingForm.dataset.bound = "true";
    bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const submittedForm = e.currentTarget || e.target;
    const btn = submittedForm.querySelector("button");
    const originalText = btn.textContent;
    btn.textContent = "Sending request...";
    btn.disabled = true;
    try {
      const formData = new FormData(submittedForm);
      const payload = Object.fromEntries(formData.entries());
      await submitFormAndNotify("/api/forms/booking", "New Booking Request: " + (payload.name || "Website Visitor"), payload, {
        name: payload.name || "Website Visitor",
        email: payload.email || "no-email@provided.com",
        phone: payload.phone || "",
        company: payload.company || "Not specified",
        service: payload.service || "",
        preferredDate: payload.preferredDate || "",
        preferredTime: payload.preferredTime || "",
        message: payload.message || "Booking request from " + (payload.name || "unknown") + " at " + (payload.company || "unknown company")
      });
      submittedForm.reset();
      const status = document.getElementById("bookingStatus");
      if (status) status.style.display = "block";
    } catch (err) {
      alert("Failed to request booking: " + err.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
  }
}

function renderAboutPage(data) {
  const aboutInfo = data.pageContent.about;
  const hero = document.getElementById("aboutHero");
  if (hero) {
    hero.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">${escapeHtml(aboutInfo.headline)}</h1>
          <p>${escapeHtml(aboutInfo.intro)}</p>
        </div>
      </div>
    `;
  }
  const mission = document.getElementById("aboutMission");
  if (mission) {
    mission.innerHTML = `
      <h2>The work we focus on</h2>
      <p>${escapeHtml(aboutInfo.mission)}</p>
      <h2 style="margin-top: 2rem;">Where AI fits</h2>
      <p>${escapeHtml(aboutInfo.whyAi)}</p>
    `;
  }
  const methodology = document.getElementById("aboutMethodology");
  if (methodology) {
    methodology.innerHTML = `
      <h2>How the work is scoped</h2>
      <ul style="list-style: none; padding: 0;">
        ${aboutInfo.methodology.map(m => `<li style="margin-bottom: 0.5rem;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 8px; display: inline-block; vertical-align: middle;"><polyline points="20 6 9 17 4 12"></polyline></svg>${escapeHtml(m)}</li>`).join("")}
      </ul>
    `;
  } else if (mission) {
    mission.innerHTML += `
      <h2 style="margin-top: 2rem;">Methodology</h2>
      <ul style="list-style: none; padding: 0;">
        ${aboutInfo.methodology.map(m => `<li style="margin-bottom: 0.5rem;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 8px; display: inline-block; vertical-align: middle;"><polyline points="20 6 9 17 4 12"></polyline></svg>${escapeHtml(m)}</li>`).join("")}
      </ul>
    `;
  }
  const credibility = document.getElementById("aboutCredibility");
  if (credibility) {
    credibility.innerHTML = `
      ${aboutInfo.credibility.map(c => `
        <div class="glass-card" style="padding: 1.5rem;">
          <p style="margin: 0; font-weight: 500;">${escapeHtml(c)}</p>
        </div>
      `).join("")}
    `;
  }
}

function renderCaseStudiesPage(data) {
  const container = document.getElementById("caseStudyGrid") || document.getElementById("caseStudySection");
  if (!container) return;
  if (!data.caseStudies || data.caseStudies.length === 0) {
    container.innerHTML = '<div class="state-empty">No case studies available.</div>';
    return;
  }
  const isOldDesign = container.id === "caseStudySection";
  const cardsHtml = data.caseStudies.map((cs, i) => `
    <div class="card animate-fade-up delay-${(i%2+1)*100}">
      <div class="eyebrow">${escapeHtml(cs.clientType)}</div>
      <h3 style="margin: 0.5rem 0 1.5rem 0;">${escapeHtml(cs.title)}</h3>
      <div style="margin-bottom: 1.5rem;">
        <strong>Challenge:</strong>
        <p style="margin-top: 0.5rem;">${escapeHtml(cs.challenge)}</p>
      </div>
      <div style="margin-bottom: 1.5rem;">
        <strong>Solution:</strong>
        <p style="margin-top: 0.5rem;">${escapeHtml(cs.solution)}</p>
      </div>
      <div>
        <strong>Workflow output:</strong>
        <ul style="margin-top: 0.5rem; padding-left: 1.5rem; color: var(--text-secondary);">
          ${cs.results.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
        </ul>
      </div>
      <div style="margin-top: 2rem;">
        <a href="${escapeHtml(cs.ctaLink)}" class="btn btn-secondary">${escapeHtml(cs.ctaLabel)}</a>
      </div>
    </div>
  `).join('');

  if (isOldDesign) {
    container.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">Case Studies</h1>
          <p>Examples of how the workflows are structured.</p>
        </div>
        <div class="grid-2">${cardsHtml}</div>
      </div>`;
  } else {
    container.innerHTML = cardsHtml;
  }
}

function renderFaqPage(data) {
  const intro = document.getElementById("faqIntro");
  if (intro) {
    intro.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">${escapeHtml(data.pageContent.faq.headline)}</h1>
          <p>${escapeHtml(data.pageContent.faq.intro)}</p>
        </div>
      </div>
    `;
  }
  const faqList = document.getElementById("faqFullList") || document.getElementById("faqSection");
  if (!faqList) return;
  if (!data.faqs || data.faqs.length === 0) {
    faqList.innerHTML = '<div class="state-empty">No FAQs available.</div>';
    return;
  }
  const isOldDesign = faqList.id === "faqSection";
  const faqsHtml = `
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      ${data.faqs.map(faq => `
        <details style="background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 1rem;">
          <summary style="font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            ${escapeHtml(faq.question)}
          </summary>
          <p style="margin-top: 1rem; color: var(--text-secondary); line-height: 1.6;">${escapeHtml(faq.answer)}</p>
        </details>
      `).join("")}
    </div>
  `;

  if (isOldDesign) {
    faqList.innerHTML = `
      <div class="container" style="max-width: 800px;">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">Frequently Asked Questions</h1>
        </div>
        ${faqsHtml}
      </div>`;
  } else {
    faqList.innerHTML = faqsHtml;
  }
}

function renderTestimonialsPage(data) {
  const grid = document.getElementById("testimonialPageGrid");
  if (!grid) return;
  if (!data.testimonials || data.testimonials.length === 0) {
    grid.innerHTML = '<div class="state-empty">No verified testimonials yet.</div>';
    return;
  }
}

// ============================================================================
// BOOTSTRAP
// ============================================================================
async function bootPublic() {
  try {
    const publicData = await api("/api/public-data");
    updateSeo(publicData);
    renderHeader(publicData.settings);
    renderFooter(publicData.settings);
    setupNewsletterForm();
    setupBookingForm();

    const pageType = document.body.dataset.page;

    if (pageType === "home") {
      renderHome(publicData);
    } else if (pageType === "service-detail") {
      renderServiceDetailPage(publicData);
    } else if (pageType === "services") {
      
      renderServicesPage(publicData);
    } else if (pageType === "pricing") {
      
      renderPricingPage(publicData);
    } else if (pageType === "contact") {
      
      renderContactPage(publicData);
    } else if (pageType === "about") {
      
      renderAboutPage(publicData);
    } else if (pageType === "faq") {
      
      renderFaqPage(publicData);
    } else if (pageType === "testimonials") {
      
      renderTestimonialsPage(publicData);
    } else if (pageType === "case-studies") {
      
      renderCaseStudiesPage(publicData);
    }
  } catch (err) {
    console.error("Failed to boot public app:", err);
    const main = document.querySelector('main');
    if (main && !main.textContent.trim()) {
      main.innerHTML = '<section class="section"><div class="container"><h1>FlowAgent</h1><p>We could not load the page. Please try again.</p><a class="btn btn-primary" href="/">Reload homepage</a></div></section>';
    }
  } finally {
    if (typeof setupAnimations === 'function') setupAnimations();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  if (contactForm && !contactForm.innerHTML.trim()) {
    contactForm.innerHTML = `
      <div class="order-form-shell">
        <h3>Tell us what you want to automate</h3>
        <div class="field-stack">
          <label>Name<input type="text" name="name" required></label>
        </div>
        <div class="field-stack">
          <label>Email<input type="email" name="email" required></label>
        </div>
        <div class="field-stack">
          <label>Message<textarea name="message" required rows="5"></textarea></label>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Send Message</button>
        <div id="contactStatus" class="form-status" role="status" aria-live="polite">
          Message sent successfully! We will reach out soon.
        </div>
      </div>
    `;
  }

  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm && !bookingForm.innerHTML.trim()) {
    bookingForm.innerHTML = `
      <div class="order-form-shell">
        <div class="field-stack">
          <label>Name<input type="text" name="name" required></label>
        </div>
        <div class="field-stack">
          <label>Email<input type="email" name="email" required></label>
        </div>
        <div class="field-stack">
          <label>Company<input type="text" name="company" required></label>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Request a Call</button>
        <div id="bookingStatus" class="form-status" role="status" aria-live="polite">
          Booking requested successfully! We will reach out soon.
        </div>
      </div>
    `;
  }

  bootPublic();
});

