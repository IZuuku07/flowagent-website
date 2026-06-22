function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
      throw new Error(payload?.error || `Request failed (${response.status})`);
    }
    return payload;
  });
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

// ============================================================================
// HEADER & FOOTER RENDERING
// ============================================================================
function renderHeader(settings) {
  const header = document.getElementById("siteHeader");
  if (!header) return;

  header.innerHTML = `
    <div class="container header-inner">
      <a class="brand" href="/">
        <img class="brand-logo" src="/${escapeHtml(settings.logoPath || 'flowagent-logo.png')}" alt="${escapeHtml(settings.brandName)}">
        <h2 class="brand-text">${escapeHtml(settings.brandName)}</h2>
      </a>
      
      <nav class="nav-links">
        <a href="/services">Services</a>
        <a href="/pricing">Pricing</a>
        <a href="/#caseStudySection">Case Studies</a>
        <a href="/faq">FAQ</a>
      </nav>
      
      <div class="header-actions">
        <a href="${escapeHtml(settings.bookingLink)}" class="btn btn-primary btn-sm">Book a Call</a>
      </div>
      
      <button class="mobile-toggle" aria-label="Toggle menu">☰</button>
    </div>
  `;

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
          <img class="brand-logo" src="/${escapeHtml(settings.logoPath || 'flowagent-logo.png')}" alt="${escapeHtml(settings.brandName)}">
          <h2 class="brand-text">${escapeHtml(settings.brandName)}</h2>
        </a>
        <p>${escapeHtml(settings.footerBlurb)}</p>
      </div>
      
      <div class="footer-links">
        <h4>Services</h4>
        <ul id="footerServicesList">
          <!-- Populated dynamically -->
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
          <input type="email" name="email" placeholder="Email address" required>
          <button type="submit" class="btn btn-primary btn-sm">Join</button>
        </form>
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

// ============================================================================
// HOMEPAGE RENDERING
// ============================================================================
function renderHome(data) {
  const { pageContent: { home }, services, pricingPlans, faqs, caseStudies, settings } = data;
  
  // 1. Hero Section
  const hero = document.getElementById("heroSection");
  if (hero) {
    hero.innerHTML = `
      <div class="hero-glow"></div>
      <div class="container">
        <div class="hero-content animate-fade-up">
          <span class="section-badge">AI Automation Agency</span>
          <h1 class="text-gradient">${escapeHtml(home.heroTitle)}</h1>
          <p class="hero-text">${escapeHtml(home.heroText)}</p>
          <div class="hero-actions">
            <a href="${escapeHtml(home.primaryCtaLink)}" class="btn btn-primary btn-lg">${escapeHtml(home.primaryCtaLabel)}</a>
            <a href="${escapeHtml(home.secondaryCtaLink)}" class="btn btn-secondary btn-lg">${escapeHtml(home.secondaryCtaLabel)}</a>
          </div>
          <div class="hero-trust">
            <div class="hero-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> No long-term contracts</div>
            <div class="hero-trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Built for Shopify</div>
          </div>
      </div>
    `;
  }

  // 2. Integration Strip
  const strip = document.getElementById("integrationStrip");
  if (strip) {
    strip.innerHTML = `
      <div class="container">
        <div class="integration-logos">
          <div class="integration-logo">Shopify</div>
          <div class="integration-logo">n8n</div>
          <div class="integration-logo">OpenAI</div>
          <div class="integration-logo">WhatsApp</div>
          <div class="integration-logo">Google Sheets</div>
          <div class="integration-logo">Stripe</div>
        </div>
      </div>
    `;
  }

  // 3. Problem Section
  const problem = document.getElementById("problemSection");
  if (problem) {
    problem.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <h2 class="text-gradient">${escapeHtml(home.benefitsTitle)}</h2>
          <p>${escapeHtml(home.benefitsIntro || "Manual operations block growth. Here is what happens when you automate.")}</p>
        </div>
        <div class="grid-3">
          <div class="card animate-fade-up delay-100">
            <div class="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
            <h3>Reduce Operational Cost</h3>
            <p>Replace expensive manual data entry, content creation, and customer support with AI agents that work 24/7 without a salary.</p>
          </div>
          <div class="card animate-fade-up delay-200">
            <div class="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
            <h3>Scale Output Volume</h3>
            <p>Publish 30 SEO articles a month or answer 10,000 customer inquiries a day without hiring a single new team member.</p>
          </div>
          <div class="card animate-fade-up delay-300">
            <div class="icon-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
            <h3>Consistent Quality</h3>
            <p>Automated systems execute exactly as programmed every single time. No off-days, no human error, no missed deadlines.</p>
          </div>
        </div>
      </div>
    `;
  }

  // 4. Services Section
  const servicesSec = document.getElementById("servicesSection");
  if (servicesSec) {
    const activeServices = services.filter(s => !s.legacy);
    
    // Update footer services list while we have them
    const footerSvc = document.getElementById("footerServicesList");
    if (footerSvc) {
      footerSvc.innerHTML = activeServices.map(s => `<li><a href="${serviceLink(s)}">${escapeHtml(s.title)}</a></li>`).join('');
    }

    servicesSec.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <span class="section-badge">Our Systems</span>
          <h2 class="text-gradient">Ready-to-deploy automation systems</h2>
          <p>Productized AI workflows built specifically for modern ecommerce brands.</p>
        </div>
        <div class="grid-2">
          ${activeServices.map((svc, i) => `
            <div class="card service-card animate-fade-up delay-${(i%2+1)*100} ${svc.featured ? 'featured' : ''}">
              <div class="service-header">
                ${svc.imageUrl ? `<div style="margin-bottom: 24px; border-radius: 12px; overflow: hidden; height: 200px; background: var(--surface-soft); border: 1px solid var(--line); position: relative;"><img src="${escapeHtml(svc.imageUrl)}" alt="${escapeHtml(svc.imageAlt || svc.title)}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"> <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 0.875rem; position: absolute; inset: 0;">Image unavailable</div></div>` : `<div style="margin-bottom: 24px; border-radius: 12px; overflow: hidden; height: 200px; background: var(--surface-soft); border: 1px dashed var(--line); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 0.875rem;">No image available</div>`}
                <h3>${escapeHtml(svc.title)}</h3>
                <div class="service-price">${escapeHtml(svc.price)}</div>
              </div>
              <p>${escapeHtml(svc.description)}</p>
              <ul class="service-features">
                ${svc.benefits.slice(0, 4).map(b => `
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>${escapeHtml(b)}</li>
                `).join('')}
              </ul>
              <div class="service-footer">
                <a href="${serviceLink(svc)}" class="btn btn-secondary">View System details</a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 5. How It Works
  const steps = document.getElementById("howItWorksSection");
  if (steps) {
    steps.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <h2 class="text-gradient">How we implement</h2>
          <p>From discovery to a fully automated operation.</p>
        </div>
        <div class="steps-container">
          <div class="step-card animate-fade-up delay-100">
            <div class="step-number">01</div>
            <h3>System Mapping</h3>
            <p>We analyze your current manual workflows and design the automation architecture.</p>
          </div>
          <div class="step-card animate-fade-up delay-200">
            <div class="step-number">02</div>
            <h3>Integration</h3>
            <p>We connect your applications (Shopify, CRM) with AI engines (OpenAI, Anthropic).</p>
          </div>
          <div class="step-card animate-fade-up delay-300">
            <div class="step-number">03</div>
            <h3>Testing</h3>
            <p>We run shadow testing to ensure the AI output matches your brand guidelines exactly.</p>
          </div>
          <div class="step-card animate-fade-up delay-400">
            <div class="step-number">04</div>
            <h3>Deployment</h3>
            <p>The system goes live, replacing manual labor with automated execution 24/7.</p>
          </div>
        </div>
      </div>
    `;
  }

    // 6. Workflow Demo
    const demo = document.getElementById("workflowDemo");
    if (demo) {
      demo.innerHTML = `
        <div class="container">
          <div class="section-header animate-fade-up">
            <h2 class="text-gradient">Workflow Demo</h2>
            <p>See our automated systems in action.</p>
          </div>
          <div style="background: var(--surface-soft); padding: 4rem 2rem; border-radius: 24px; border: 1px dashed var(--line); text-align: center;" class="animate-fade-up delay-100">
            <p style="color: var(--text-secondary); font-size: 1.25rem;">Interactive demo coming soon.</p>
            <a href="/contact" class="btn btn-secondary" style="margin-top: 1.5rem;">Request a live demo</a>
          </div>
        </div>
      `;
    }

    // 7. Case Study
  const caseStudySec = document.getElementById("caseStudySection");
  if (caseStudySec && caseStudies && caseStudies.length > 0) {
    const cs = caseStudies[0];
    caseStudySec.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <span class="section-badge">Case Study</span>
          <h2 class="text-gradient">Real business outcomes</h2>
        </div>
        <div class="card case-study-card animate-fade-up delay-100">
          <div>
            <span class="case-study-meta">${escapeHtml(cs.clientType)}</span>
            <h3 style="font-size: 2rem; margin-bottom: 24px;">${escapeHtml(cs.title)}</h3>
            <p style="margin-bottom: 24px;"><strong>The Challenge:</strong> ${escapeHtml(cs.challenge)}</p>
            <p style="margin-bottom: 32px;"><strong>The Solution:</strong> ${escapeHtml(cs.solution)}</p>
            <a href="${escapeHtml(cs.ctaLink)}" class="btn btn-primary">${escapeHtml(cs.ctaLabel)}</a>
          </div>
          <div class="case-study-results">
            <h4 style="color: var(--text); margin-bottom: 24px; font-size: 1.2rem;">The Results</h4>
            ${cs.results.map(r => `
              <div class="result-item">
                <div class="result-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                <div style="color: var(--text-secondary); font-size: 1.1rem;">${escapeHtml(r)}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // 9. Pricing
  const pricingSec = document.getElementById("pricingSection");
  if (pricingSec) {
    pricingSec.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <span class="section-badge">Pricing</span>
          <h2 class="text-gradient">Simple, transparent pricing</h2>
          <p>Choose the automation system that fits your brand.</p>
        </div>
        <div class="grid-3">
          ${pricingPlans.map((plan, i) => `
            <div class="card pricing-card animate-fade-up delay-${(i+1)*100} ${plan.highlight ? 'highlight' : ''}">
              ${plan.highlight ? '<span class="section-badge" style="position:absolute; top:-14px; left:50%; transform:translateX(-50%); margin:0; background:var(--accent); color:#fff; border:none;">Most Popular</span>' : ''}
              <div class="plan-name">${escapeHtml(plan.name)}</div>
              <div class="plan-price">${escapeHtml(plan.price)}</div>
              <div class="plan-summary">${escapeHtml(plan.summary)}</div>
              <ul class="pricing-features">
                ${plan.features.map(f => `
                  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> ${escapeHtml(f)}</li>
                `).join('')}
              </ul>
              <a href="/checkout.html?serviceId=${escapeHtml(plan.id)}" class="btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'}" style="width: 100%;">Get Started</a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 10. FAQ
  const faqSec = document.getElementById("faqSection");
  if (faqSec) {
    faqSec.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <h2 class="text-gradient">Frequently Asked Questions</h2>
        </div>
        <div class="faq-list">
          ${faqs.map((f, i) => `
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
    `;
  }

  // 11. Final CTA
  const finalCta = document.getElementById("finalCtaSection");
  if (finalCta) {
    finalCta.innerHTML = `
      <div class="final-cta-bg"></div>
      <div class="container relative z-10 animate-fade-up">
        <h2 class="text-gradient">${escapeHtml(home.finalCtaTitle)}</h2>
        <p>${escapeHtml(home.finalCtaText)}</p>
        <a href="${escapeHtml(home.finalCtaLink)}" class="btn btn-primary btn-lg">${escapeHtml(home.finalCtaLabel)}</a>
      </div>
    `;
  }

  setupAnimations();
}

// ============================================================================
// SERVICE DETAIL RENDERING
// ============================================================================
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
            <a href="/checkout.html?serviceId=${escapeHtml(service.id)}" class="btn btn-primary btn-lg">Checkout Now</a>
          </div>
        </div>
        <div class="hero-visual animate-fade-up delay-200">
          ${service.imageUrl ? `<div style="position: relative; width: 100%; aspect-ratio: 4/3; border-radius: 24px; overflow: hidden; border: 1px solid var(--line); box-shadow: 0 30px 60px rgba(0,0,0,0.2);"><img src="${escapeHtml(service.imageUrl)}" alt="${escapeHtml(service.imageAlt || service.title)}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"><div style="display: none; width: 100%; height: 100%; background: var(--surface-soft); align-items: center; justify-content: center; color: var(--text-secondary); position: absolute; inset: 0;">Image unavailable</div></div>` : `<div style="width: 100%; aspect-ratio: 4/3; border-radius: 24px; background: var(--surface-soft); border: 1px dashed var(--line); display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">No image available</div>`}
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
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  document.querySelectorAll('.animate-fade-up').forEach(el => observer.observe(el));
}


// ============================================================================
// CORE PAGES RENDERING
// ============================================================================
function renderServicesPage(data) {
  const container = document.getElementById("servicesPageGrid") || document.getElementById("servicesSection");
  if (!container) return;
  const activeServices = data.services.filter(s => !s.legacy);
  if (activeServices.length === 0) {
    container.innerHTML = '<div class="state-empty">No active services available.</div>';
    return;
  }
  const isOldDesign = container.id === "servicesSection";
  const cardsHtml = activeServices.map((svc, i) => `
    <div class="card service-card animate-fade-up delay-${(i%2+1)*100} ${svc.featured ? 'featured' : ''}">
      <div class="service-header">
        ${svc.imageUrl ? `<div style="margin-bottom: 24px; border-radius: 12px; overflow: hidden; height: 200px; background: var(--surface-soft); border: 1px solid var(--line); position: relative;"><img src="${escapeHtml(svc.imageUrl)}" alt="${escapeHtml(svc.imageAlt || svc.title)}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"> <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 0.875rem; position: absolute; inset: 0;">Image unavailable</div></div>` : `<div style="margin-bottom: 24px; border-radius: 12px; overflow: hidden; height: 200px; background: var(--surface-soft); border: 1px dashed var(--line); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 0.875rem;">No image available</div>`}
        <h3>${escapeHtml(svc.title)}</h3>
        <div class="service-price">${escapeHtml(svc.price)}</div>
      </div>
      <p>${escapeHtml(svc.description)}</p>
      <ul class="service-features">
        ${svc.benefits.slice(0, 4).map(b => `
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>${escapeHtml(b)}</li>
        `).join('')}
      </ul>
      <div class="service-footer">
        <a href="${serviceLink(svc)}" class="btn btn-secondary">View System details</a>
      </div>
    </div>
  `).join('');

  if (isOldDesign) {
    container.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">Our Services</h1>
          <p>Automated growth systems for ecommerce brands.</p>
        </div>
        <div class="grid-2">${cardsHtml}</div>
      </div>`;
  } else {
    container.innerHTML = cardsHtml;
  }
}

function renderPricingPage(data) {
  const intro = document.getElementById("pricingIntro");
  if (intro) {
    intro.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">Simple, Transparent Pricing</h1>
          <p>Choose the automation system that fits your brand.</p>
        </div>
      </div>
    `;
  }

  const compTable = document.getElementById("pricingComparisonTable");
  if (compTable) {
    compTable.innerHTML = `
      <div style="padding: 2rem; text-align: center;" class="animate-fade-up delay-100">
        <p>Full comparison matrix available during consultation to match your exact business needs.</p>
      </div>
    `;
  }

  const container = document.getElementById("pricingFullGrid") || document.getElementById("pricingSection");
  if (!container) return;
  if (!data.pricingPlans || data.pricingPlans.length === 0) {
    container.innerHTML = '<div class="state-empty">No pricing plans available.</div>';
    return;
  }
  const isOldDesign = container.id === "pricingSection";
  const cardsHtml = data.pricingPlans.map((plan, i) => `
    <div class="card pricing-card animate-fade-up delay-${(i%3+1)*100} ${plan.highlight ? 'featured' : ''}">
      <h3>${escapeHtml(plan.name)}</h3>
      <div class="pricing-price">${escapeHtml(plan.price)}</div>
      <p class="pricing-summary">${escapeHtml(plan.summary)}</p>
      <ul class="pricing-features">
        ${plan.features.map(f => `<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>${escapeHtml(f)}</li>`).join('')}
      </ul>
      <div class="pricing-footer">
        <a href="/checkout.html?serviceId=${plan.id}" class="btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'}" style="width: 100%">Get Started</a>
      </div>
    </div>
  `).join('');

  if (isOldDesign) {
    container.innerHTML = `
      <div class="container">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">Simple, Transparent Pricing</h1>
          <p>Choose the automation system that fits your brand.</p>
        </div>
        <div class="grid-3">${cardsHtml}</div>
      </div>`;
  } else {
    container.innerHTML = cardsHtml;
  }
}

function renderContactPage(data) {
  const contactSec = document.getElementById("contactForm")?.closest('.container') || document.getElementById("contactSection");
  if (!contactSec) return;
  const isOldDesign = contactSec.id === "contactSection";
  
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
          <div id="contactStatus" style="margin-top: 1rem; text-align: center; color: var(--primary); display: none; padding: 1rem; background: rgba(59,130,246,0.1); border-radius: 8px;">
            Message sent successfully! We will reach out soon.
          </div>
        </div>
      </div>
    `;
  }

  document.getElementById("contactForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    const originalText = btn.textContent;
    btn.textContent = "Sending...";
    btn.disabled = true;
    try {
      const formData = new FormData(e.target);
      const payload = Object.fromEntries(formData.entries());
      await api("/api/forms/contact", { method: "POST", body: JSON.stringify(payload) });
      e.target.reset();
      document.getElementById("contactStatus").style.display = "block";
    } catch (err) {
      alert("Failed to send message: " + err.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });

  document.getElementById("bookingForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    const originalText = btn.textContent;
    btn.textContent = "Booking...";
    btn.disabled = true;
    try {
      const formData = new FormData(e.target);
      const payload = Object.fromEntries(formData.entries());
      await api("/api/forms/booking", { method: "POST", body: JSON.stringify(payload) });
      e.target.reset();
      document.getElementById("bookingStatus").style.display = "block";
    } catch (err) {
      alert("Failed to request booking: " + err.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });
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
      <h2>Our Mission</h2>
      <p>${escapeHtml(aboutInfo.mission)}</p>
      <h2 style="margin-top: 2rem;">Why AI?</h2>
      <p>${escapeHtml(aboutInfo.whyAi)}</p>
    `;
  }
  const methodology = document.getElementById("aboutMethodology");
  if (methodology) {
    methodology.innerHTML = `
      <h2>Methodology</h2>
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
        <strong>Results:</strong>
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
          <p>Real outcomes from automated systems.</p>
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

    const pageType = document.body.dataset.page;
    
    console.log("🛠️ [DEBUG] Public Data Loaded:", Object.keys(publicData));
    
    

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
  } finally {
    if (typeof setupAnimations === 'function') setupAnimations();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  if (contactForm && !contactForm.innerHTML.trim()) {
    contactForm.innerHTML = `
      <div style="max-width: 500px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 1.5rem;">
          <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Name</label>
          <input type="text" name="name" required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);">
        </div>
        <div style="margin-bottom: 1.5rem;">
          <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Email</label>
          <input type="email" name="email" required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);">
        </div>
        <div style="margin-bottom: 1.5rem;">
          <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Message</label>
          <textarea name="message" required rows="5" style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);"></textarea>
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Send Message</button>
        <div id="contactStatus" style="margin-top: 1rem; text-align: center; color: var(--primary); display: none; padding: 1rem; background: rgba(59,130,246,0.1); border-radius: 8px;">
          Message sent successfully! We will reach out soon.
        </div>
      </div>
    `;
  }

  const bookingForm = document.getElementById("bookingForm");
  if (bookingForm && !bookingForm.innerHTML.trim()) {
    bookingForm.innerHTML = `
      <div style="max-width: 500px; margin: 0 auto; width: 100%;">
        <div style="margin-bottom: 1.5rem;">
          <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Name</label>
          <input type="text" name="name" required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);">
        </div>
        <div style="margin-bottom: 1.5rem;">
          <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Email</label>
          <input type="email" name="email" required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);">
        </div>
        <div style="margin-bottom: 1.5rem;">
          <label style="display:block;margin-bottom:0.5rem;font-size:0.9rem;font-weight:500;">Company</label>
          <input type="text" name="company" required style="width:100%;padding:0.75rem;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--text);">
        </div>
        <button type="submit" class="btn btn-primary" style="width: 100%;">Request Booking</button>
        <div id="bookingStatus" style="margin-top: 1rem; text-align: center; color: var(--primary); display: none; padding: 1rem; background: rgba(59,130,246,0.1); border-radius: 8px;">
          Booking requested successfully! We will reach out soon.
        </div>
      </div>
    `;
  }

  bootPublic();
});

