const adminState = {
  data: null
};

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function nlJoin(items) {
  return Array.isArray(items) ? items.join("\n") : "";
}

function splitLines(value) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
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

function stars(count) {
  return "★".repeat(Math.max(1, Math.min(5, Number(count || 5))));
}

function serviceLink(service) {
  return `/services/${service.slug}`;
}

function blogLink(post) {
  return `/blog/${post.slug}`;
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

function normalizePathname(pathname) {
  if (!pathname || pathname === "/index.html") {
    return "/";
  }
  return pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "") || "/";
}

function isActivePath(currentPath, href) {
  const current = normalizePathname(currentPath);
  const target = normalizePathname(href);

  if (target === "/") {
    return current === "/";
  }

  return current === target || current.startsWith(`${target}/`);
}

function renderSiteNav() {
  const currentPath = window.location.pathname;
  const links = [
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" },
    { href: "/case-studies", label: "Case Studies" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" }
  ];

  return links
    .map(
      ({ href, label }) =>
        `<a href="${href}"${isActivePath(currentPath, href) ? ' aria-current="page"' : ""}>${label}</a>`
    )
    .join("");
}

function renderHeader(settings) {
  const header = document.getElementById("siteHeader");
  if (!header) {
    return;
  }

  header.innerHTML = `
    <a class="brand" href="/">
      <img class="brand-logo" src="/${escapeHtml(settings.logoPath || "flowagent-logo.png")}" alt="${escapeHtml(settings.brandName)} logo">
      <span class="brand-lockup">
        <span class="brand-text">${escapeHtml(settings.brandName)}</span>
        <span class="brand-tagline">${escapeHtml(settings.tagline)}</span>
      </span>
    </a>
    <nav class="site-nav">${renderSiteNav()}</nav>
    <div class="header-actions">
      <a class="button button-small" href="${escapeHtml(settings.bookingLink || "/contact")}">Book a Call</a>
    </div>
  `;
}

function renderAdminHeader() {
  const header = document.getElementById("siteHeader");
  if (!header) {
    return;
  }

  header.innerHTML = `
    <a class="brand" href="/">
      <img class="brand-logo" src="/flowagent-logo.png" alt="FlowAgent logo">
      <span class="brand-lockup">
        <span class="brand-text">FlowAgent Admin</span>
        <span class="brand-tagline">Manage the site without touching code</span>
      </span>
    </a>
    <div class="header-actions">
      <a class="button button-ghost button-small" href="/">View Website</a>
      <button class="button button-ghost button-small" id="logoutButton" type="button">Logout</button>
    </div>
  `;
}

function renderFooter(settings) {
  const footer = document.getElementById("siteFooter");
  if (!footer) {
    return;
  }

  footer.className = "section";
  footer.innerHTML = `
    <div class="glass-card footer-card">
      <div class="results-layout">
        <div class="panel-stack">
          <p class="eyebrow">FlowAgent</p>
          <h3 class="card-title">${escapeHtml(settings.tagline)}</h3>
          <p class="muted-copy">${escapeHtml(settings.footerBlurb)}</p>
          <div class="inline-actions">
            <a class="button button-small" href="/contact">Start a Project</a>
            <a class="button button-ghost button-small" href="/pricing">See Pricing</a>
          </div>
        </div>
        <div class="footer-grid">
          <div>
            <strong>Navigation</strong>
            <a href="/">Home</a>
            <a href="/services">Services</a>
            <a href="/pricing">Pricing</a>
            <a href="/blog">Blog</a>
          </div>
          <div>
            <strong>Company</strong>
            <a href="/about">About</a>
            <a href="/case-studies">Case Studies</a>
            <a href="/testimonials">Testimonials</a>
            <a href="/faq">FAQ</a>
          </div>
          <div>
            <strong>Contact</strong>
            <a href="mailto:${escapeHtml(settings.businessEmail)}">${escapeHtml(settings.businessEmail)}</a>
            <span>${escapeHtml(settings.whatsapp || "WhatsApp not added yet")}</span>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </div>
      <div class="footer-newsletter">
        <div>
          <strong>${escapeHtml(settings.newsletterTitle)}</strong>
          <p class="muted-copy">${escapeHtml(settings.newsletterText)}</p>
        </div>
        <form id="newsletterForm" class="newsletter-form">
          <input type="email" name="email" placeholder="Your email" required>
          <button class="button button-small" type="submit">Subscribe</button>
        </form>
      </div>
    </div>
  `;

  const newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm && newsletterForm.dataset.bound !== "true") {
    newsletterForm.dataset.bound = "true";
    newsletterForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        const formData = new FormData(newsletterForm);
        await api("/api/forms/newsletter", {
          method: "POST",
          body: JSON.stringify({ email: String(formData.get("email") || "").trim() })
        });
        newsletterForm.reset();
      } catch (error) {
        console.error(error);
      }
    });
  }
}

function renderServiceCards(services, settings, targetId) {
  const grid = document.getElementById(targetId);
  if (!grid) {
    return;
  }

  grid.innerHTML = services
    .map((service) => `
      <article class="service-card ${service.featured ? "featured-card" : ""}">
        ${service.featured ? '<p class="card-tag">Featured service</p>' : ""}
        <div class="service-card-head">
          <h3 class="card-title">${escapeHtml(service.title)}</h3>
          <div class="price-line">${escapeHtml(service.price)}</div>
        </div>
        <p>${escapeHtml(service.description)}</p>
        <ul>${service.benefits.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <div class="service-card-actions">
          <a class="button button-small" href="${serviceLink(service)}">View Service</a>
          <a class="button button-ghost button-small" href="/contact">Request Quote</a>
        </div>
        ${paymentButtons(service, settings)}
      </article>
    `)
    .join("");
}

function paymentButtons(item, settings) {
  const stripeLink = item.stripeLink || settings.defaultStripeLink;
  const paypalLink = item.paypalLink || settings.defaultPaypalLink;

  if (!stripeLink && !paypalLink) {
    return '';
  }

  return `
    <div class="payment-actions">
      ${stripeLink ? `<a class="button button-small" target="_blank" rel="noreferrer" href="${escapeHtml(stripeLink)}">Pay by Card</a>` : ""}
      ${paypalLink ? `<a class="button button-ghost button-small" target="_blank" rel="noreferrer" href="${escapeHtml(paypalLink)}">Pay with PayPal</a>` : ""}
    </div>
  `;
}

function renderPricingCards(plans, settings, targetId) {
  const grid = document.getElementById(targetId);
  if (!grid) {
    return;
  }

  grid.innerHTML = plans
    .map((plan) => `
      <article class="package-card ${plan.highlight ? "highlight-card" : ""}">
        ${plan.highlight ? '<p class="card-tag">Recommended</p>' : ""}
        <div class="package-card-head">
          <h3 class="card-title">${escapeHtml(plan.name)}</h3>
          <div class="price-display">${escapeHtml(plan.price)}</div>
        </div>
        <p>${escapeHtml(plan.summary)}</p>
        <ul>${plan.features.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        ${paymentButtons(plan, settings)}
      </article>
    `)
    .join("");
}

function renderCaseStudies(caseStudies, targetId) {
  const grid = document.getElementById(targetId);
  if (!grid) {
    return;
  }

  grid.innerHTML = caseStudies
    .map((item) => `
      <article class="package-card">
        <p class="card-tag">${escapeHtml(item.clientType)}</p>
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p><strong>Challenge:</strong> ${escapeHtml(item.challenge)}</p>
        <p><strong>Solution:</strong> ${escapeHtml(item.solution)}</p>
        <ul>${item.results.map((result) => `<li>${escapeHtml(result)}</li>`).join("")}</ul>
        <a class="button button-small" href="${escapeHtml(item.ctaLink)}">${escapeHtml(item.ctaLabel)}</a>
      </article>
    `)
    .join("");
}

function renderTestimonials(testimonials, targetId) {
  const grid = document.getElementById(targetId);
  if (!grid) {
    return;
  }

  grid.innerHTML = testimonials
    .map((item) => `
      <article class="package-card">
        <p class="card-tag">${stars(item.rating)}</p>
        <h3 class="card-title">${escapeHtml(item.name)}</h3>
        <p class="muted-copy">${escapeHtml(item.role)} • ${escapeHtml(item.company)}</p>
        <p>${escapeHtml(item.quote)}</p>
        <p><strong>Result:</strong> ${escapeHtml(item.result)}</p>
      </article>
    `)
    .join("");
}

function renderFaqs(faqs, targetId, limit = null) {
  const container = document.getElementById(targetId);
  if (!container) {
    return;
  }

  const items = limit ? faqs.slice(0, limit) : faqs;
  container.innerHTML = items
    .map((faq) => `
      <article class="faq-card">
        <h3 class="card-title">${escapeHtml(faq.question)}</h3>
        <p>${escapeHtml(faq.answer)}</p>
      </article>
    `)
    .join("");
}

function renderBlogCards(posts, targetId) {
  const grid = document.getElementById(targetId);
  if (!grid) {
    return;
  }

  grid.innerHTML = posts
    .map((post) => `
      <article class="package-card">
        <p class="card-tag">${escapeHtml(post.category)}</p>
        <h3 class="card-title">${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.excerpt)}</p>
        <p class="muted-copy">${escapeHtml(post.publishedAt)} • ${escapeHtml(post.author)}</p>
        <a class="button button-small" href="${blogLink(post)}">Read Article</a>
      </article>
    `)
    .join("");
}

function renderHome(publicData) {
  const { settings, pageContent, services, caseStudies, testimonials, pricingPlans, faqs } = publicData;
  const hero = document.getElementById("homeHero");
  const trustStrip = document.getElementById("trustStrip");
  const benefitsHeading = document.getElementById("benefitsHeading");
  const benefitCards = document.getElementById("benefitCards");
  const processGrid = document.getElementById("processGrid");
  const finalCta = document.getElementById("finalCtaSection");

  hero.innerHTML = `
    <div class="hero-copy">
      <p class="eyebrow">${escapeHtml(settings.brandName)}</p>
      <h1>${escapeHtml(pageContent.home.heroTitle)}</h1>
      <p class="hero-text">${escapeHtml(pageContent.home.heroText)}</p>
      <div class="hero-actions">
        <a class="button" href="${escapeHtml(pageContent.home.primaryCtaLink)}">${escapeHtml(pageContent.home.primaryCtaLabel)}</a>
        <a class="button button-ghost" href="${escapeHtml(pageContent.home.secondaryCtaLink)}">${escapeHtml(pageContent.home.secondaryCtaLabel)}</a>
      </div>
      <ul class="hero-points">
        <li>Automate operations and lead flow</li>
        <li>Scale premium AI content systems</li>
        <li>Deploy business-ready AI agents</li>
      </ul>
    </div>
    <div class="hero-panel">
      <div class="hero-logo-card glass-card">
        <img src="/${escapeHtml(settings.logoPath)}" alt="${escapeHtml(settings.brandName)} logo">
      </div>
      <div class="dashboard-preview glass-card">
        <div class="preview-head">
          <span class="pill">Built for growth</span>
          <strong>What FlowAgent helps businesses do</strong>
        </div>
        <div class="preview-grid">
          <article><h3>Save time</h3><p>Remove repetitive work and shorten response times across your business.</p></article>
          <article><h3>Increase efficiency</h3><p>Replace scattered manual tasks with cleaner systems and clearer execution.</p></article>
          <article><h3>Scale intelligently</h3><p>Turn AI into a practical operating advantage, not just a trend.</p></article>
        </div>
      </div>
    </div>
  `;

  trustStrip.innerHTML = `
    <div>AI automation architecture</div>
    <div>Premium AI video systems</div>
    <div>RAG chatbot implementation</div>
    <div>Lead and CRM automation</div>
  `;

  benefitsHeading.innerHTML = `
    <p class="eyebrow">Why Choose Us</p>
    <h2>${escapeHtml(pageContent.home.benefitsTitle)}</h2>
    <p>${escapeHtml(pageContent.home.benefitsIntro)}</p>
  `;

  benefitCards.innerHTML = [
    ["Business-first thinking", "We build around revenue, operations, response times, and delivery quality."],
    ["Premium implementation", "Your systems should feel clean, reliable, and trustworthy for business use."],
    ["Multi-channel leverage", "We connect AI across content, lead flow, support, and internal operations."],
    ["Modern client experience", "Visitors should feel that FlowAgent can modernize how their business works."]
  ]
    .map(([title, text]) => `<article class="stat-box"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(text)}</span></article>`)
    .join("");

  processGrid.innerHTML = [
    ["01", "Audit the opportunity", "We identify the highest-value AI use cases in your current workflow."],
    ["02", "Design the system", "We map the process, data flow, messaging, and automation logic."],
    ["03", "Implement cleanly", "We build the workflow, content engine, or AI agent with business use in mind."],
    ["04", "Launch and optimize", "We help you move from setup to operational leverage with less friction."]
  ]
    .map(([step, title, text]) => `<article><span>${step}</span><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`)
    .join("");

  renderServiceCards(services.slice(0, 6), settings, "serviceGrid");
  renderCaseStudies(caseStudies, "featuredCaseStudies");
  renderTestimonials(testimonials, "testimonialGrid");
  renderPricingCards(pricingPlans.slice(0, 3), settings, "pricingPlanGrid");
  renderFaqs(faqs, "faqPreviewList", 4);

  finalCta.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Ready</p>
      <h2>${escapeHtml(pageContent.home.finalCtaTitle)}</h2>
      <p>${escapeHtml(pageContent.home.finalCtaText)}</p>
      <a class="button" href="${escapeHtml(pageContent.home.finalCtaLink)}">${escapeHtml(pageContent.home.finalCtaLabel)}</a>
    </div>
  `;
}

function renderServicesPage(publicData) {
  renderServiceCards(publicData.services, publicData.settings, "servicesPageGrid");
}

function renderAboutPage(publicData) {
  const aboutHero = document.getElementById("aboutHero");
  const aboutMission = document.getElementById("aboutMission");
  const aboutCredibility = document.getElementById("aboutCredibility");
  const aboutMethodology = document.getElementById("aboutMethodology");
  const about = publicData.pageContent.about;

  aboutHero.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">About</p>
      <h2>${escapeHtml(about.headline)}</h2>
      <p>${escapeHtml(about.intro)}</p>
    </div>
  `;

  aboutMission.innerHTML = `
    <p><strong>Mission:</strong> ${escapeHtml(about.mission)}</p>
    <p><strong>Why AI matters:</strong> ${escapeHtml(about.whyAi)}</p>
  `;

  aboutCredibility.innerHTML = about.credibility
    .map((item) => `<article class="stat-box"><strong>${escapeHtml(item)}</strong><span>FlowAgent is positioned to help modern businesses implement AI with clarity and trust.</span></article>`)
    .join("");

  aboutMethodology.innerHTML = about.methodology
    .map((item, index) => `<article><span>0${index + 1}</span><h3>${escapeHtml(item)}</h3><p>FlowAgent uses this principle to keep projects grounded in business value.</p></article>`)
    .join("");
}

function renderPricingPage(publicData) {
  const intro = document.getElementById("pricingIntro");
  const comparison = document.getElementById("pricingComparisonTable");
  const bookingForm = document.getElementById("bookingForm");
  const page = publicData.pageContent.pricing;

  intro.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Pricing</p>
      <h2>${escapeHtml(page.headline)}</h2>
      <p>${escapeHtml(page.intro)}</p>
    </div>
  `;

  renderPricingCards(publicData.pricingPlans, publicData.settings, "pricingFullGrid");

  comparison.innerHTML = `
    <table class="comparison-table">
      <thead><tr><th>Offer</th><th>Ideal for</th><th>Starting price</th></tr></thead>
      <tbody>
        ${publicData.pricingPlans
          .map((plan) => `<tr><td>${escapeHtml(plan.name)}</td><td>${escapeHtml(plan.comparisonLabel)}</td><td>${escapeHtml(plan.price)}</td></tr>`)
          .join("")}
      </tbody>
    </table>
  `;

  bookingForm.innerHTML = `
    <div class="form-grid">
      <label>Name<input type="text" name="name" required></label>
      <label>Email<input type="email" name="email" required></label>
      <label>Phone / WhatsApp<input type="text" name="phone"></label>
      <label>Company<input type="text" name="company"></label>
      <label>Service of interest<select name="service">${publicData.services.map((service) => `<option value="${escapeHtml(service.title)}">${escapeHtml(service.title)}</option>`).join("")}</select></label>
      <label>Preferred date<input type="date" name="preferredDate"></label>
      <label>Preferred time<input type="text" name="preferredTime" placeholder="Example: 2 PM"></label>
    </div>
    <label>Project context<textarea name="message" rows="5" placeholder="Tell us what you want to improve, automate, or launch."></textarea></label>
    <button class="button" type="submit">Request Consultation</button>
    <p class="form-note" id="bookingMessage">Booking requests are saved in the admin dashboard.</p>
  `;

  bindBookingForm();
}

function renderCaseStudiesPage(publicData) {
  renderCaseStudies(publicData.caseStudies, "caseStudyGrid");
}

function renderTestimonialsPage(publicData) {
  renderTestimonials(publicData.testimonials, "testimonialPageGrid");
}

function renderBlogPage(publicData) {
  const intro = document.getElementById("blogIntro");
  const posts = publicData.blogPosts;
  intro.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Blog</p>
      <h2>${escapeHtml(publicData.pageContent.blog.headline)}</h2>
      <p>${escapeHtml(publicData.pageContent.blog.intro)}</p>
    </div>
  `;

  renderBlogCards(posts, "blogGrid");
  const search = document.getElementById("blogSearch");
  if (search && search.dataset.bound !== "true") {
    search.dataset.bound = "true";
    search.addEventListener("input", () => {
      const query = search.value.trim().toLowerCase();
      const filtered = posts.filter((post) =>
        [post.title, post.excerpt, post.category, ...(post.tags || [])].join(" ").toLowerCase().includes(query)
      );
      renderBlogCards(filtered, "blogGrid");
    });
  }
}

function renderBlogPostPage(publicData) {
  const slug = window.location.pathname.split("/").pop();
  const post = publicData.blogPosts.find((item) => item.slug === slug) || publicData.blogPosts[0];
  const container = document.getElementById("blogPostContainer");
  if (!container || !post) {
    return;
  }

  document.title = `${post.title} | FlowAgent`;
  container.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">${escapeHtml(post.category)}</p>
      <h2>${escapeHtml(post.title)}</h2>
      <p>${escapeHtml(post.excerpt)}</p>
      <p class="muted-copy">${escapeHtml(post.publishedAt)} • ${escapeHtml(post.author)}</p>
    </div>
    <article class="glass-card dashboard-panel blog-article">${post.contentHtml}</article>
  `;
}

function renderContactPage(publicData) {
  const intro = document.getElementById("contactIntro");
  const details = document.getElementById("contactDetailsCard");
  const form = document.getElementById("contactForm");

  intro.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Contact</p>
      <h2>${escapeHtml(publicData.pageContent.contact.headline)}</h2>
      <p>${escapeHtml(publicData.pageContent.contact.intro)}</p>
    </div>
  `;

  details.innerHTML = `
    <h3>Contact details</h3>
    <ul>
      <li>Email: ${escapeHtml(publicData.settings.businessEmail)}</li>
      <li>WhatsApp: ${escapeHtml(publicData.settings.whatsapp || "Add your WhatsApp number in admin")}</li>
      <li>Country / market: ${escapeHtml(publicData.settings.country)}</li>
      <li>Address: ${escapeHtml(publicData.settings.address)}</li>
    </ul>
  `;

  form.innerHTML = `
    <div class="form-grid">
      <label>Name<input type="text" name="name" required></label>
      <label>Email<input type="email" name="email" required></label>
      <label>Phone / WhatsApp<input type="text" name="phone"></label>
      <label>Company<input type="text" name="company"></label>
      <label>Service<select name="service">${publicData.services.map((service) => `<option value="${escapeHtml(service.title)}">${escapeHtml(service.title)}</option>`).join("")}</select></label>
      <label>Budget<select name="budget"><option value="">Select budget</option><option>$500 - $1,500</option><option>$1,500 - $5,000</option><option>$5,000+</option></select></label>
      <label>Preferred contact<select name="preferredContact"><option>Email</option><option>WhatsApp</option><option>Phone</option></select></label>
    </div>
    <label>Message<textarea name="message" rows="6" required placeholder="Tell us what you want to automate, build, or improve."></textarea></label>
    <button class="button" type="submit">Send Request</button>
    <p class="form-note" id="contactMessage">Your message will appear in the admin dashboard.</p>
  `;

  bindContactForm();
}

function renderFaqPage(publicData) {
  const intro = document.getElementById("faqIntro");
  intro.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">FAQ</p>
      <h2>${escapeHtml(publicData.pageContent.faq.headline)}</h2>
      <p>${escapeHtml(publicData.pageContent.faq.intro)}</p>
    </div>
  `;
  renderFaqs(publicData.faqs, "faqFullList");
}

function renderServiceDetailPage(publicData) {
  const slug = document.body.dataset.serviceSlug;
  const service = publicData.services.find((item) => item.slug === slug);
  const container = document.getElementById("serviceDetailContainer");
  if (!container || !service) {
    return;
  }

  document.title = `${service.title} | FlowAgent`;
  container.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Service Detail</p>
      <h2>${escapeHtml(service.title)}</h2>
      <p>${escapeHtml(service.description)}</p>
    </div>
    <div class="results-layout">
      <div class="glass-card dashboard-panel">
        <p><strong>Who it is for:</strong> ${escapeHtml(service.audience)}</p>
        <h3>Benefits</h3>
        <ul>${service.benefits.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <h3>Deliverables</h3>
        <ul>${service.deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
      <div class="glass-card dashboard-panel">
        <p class="eyebrow">Expected outcomes</p>
        <ul>${service.outcomes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        <p class="eyebrow">Use cases</p>
        <ul>${service.useCases.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        ${paymentButtons(service, publicData.settings)}
        <a class="button button-small" href="/contact">Request This Service</a>
      </div>
    </div>
    <section class="section">
      <div class="section-heading">
        <p class="eyebrow">FAQ</p>
        <h2>Questions about ${escapeHtml(service.title)}</h2>
      </div>
      <div class="list-stack">
        ${service.faq.map((item) => `<article class="faq-card"><h3 class="card-title">${escapeHtml(item.question)}</h3><p>${escapeHtml(item.answer)}</p></article>`).join("")}
      </div>
    </section>
    <section class="section">
      <div class="order-layout">
        <form class="order-form glass-card" id="quoteForm"></form>
        <aside class="contact-card">
          <div class="glass-card panel-stack">
            <h3>Ideal clients</h3>
            <p>${escapeHtml(service.audience)}</p>
          </div>
        </aside>
      </div>
    </section>
  `;

  const quoteForm = document.getElementById("quoteForm");
  if (quoteForm) {
    quoteForm.innerHTML = `
      <div class="form-grid">
        <label>Name<input type="text" name="name" required></label>
        <label>Email<input type="email" name="email" required></label>
        <label>Phone / WhatsApp<input type="text" name="phone"></label>
        <label>Company<input type="text" name="company"></label>
        <label>Budget<select name="budget"><option value="">Select budget</option><option>$500 - $1,500</option><option>$1,500 - $5,000</option><option>$5,000+</option></select></label>
        <label>Preferred contact<select name="preferredContact"><option>Email</option><option>WhatsApp</option><option>Phone</option></select></label>
      </div>
      <input type="hidden" name="service" value="${escapeHtml(service.title)}">
      <label>Project details<textarea name="message" rows="6" placeholder="Describe the system or outcome you want." required></textarea></label>
      <button class="button" type="submit">Request a Quote</button>
      <p class="form-note" id="quoteMessage">Your quote request will appear in the admin dashboard.</p>
    `;
    bindQuoteForm();
  }
}

function bindContactForm() {
  const form = document.getElementById("contactForm");
  const message = document.getElementById("contactMessage");
  if (!form || !message || form.dataset.bound === "true") {
    return;
  }
  form.dataset.bound = "true";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(form);
      await api("/api/forms/contact", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      form.reset();
      message.textContent = "Message sent successfully!";
      message.style.color = "var(--success)";
    } catch (error) {
      message.textContent = "Something went wrong. Please try again.";
      message.style.color = "var(--danger)";
    }
  });
}

function bindQuoteForm() {
  const form = document.getElementById("quoteForm");
  const message = document.getElementById("quoteMessage");
  if (!form || !message || form.dataset.bound === "true") {
    return;
  }
  form.dataset.bound = "true";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(form);
      await api("/api/forms/quote", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      form.reset();
      message.textContent = "Quote request sent successfully!";
      message.style.color = "var(--success)";
    } catch (error) {
      message.textContent = "Something went wrong. Please try again.";
      message.style.color = "var(--danger)";
    }
  });
}

function bindBookingForm() {
  const form = document.getElementById("bookingForm");
  const message = document.getElementById("bookingMessage");
  if (!form || !message || form.dataset.bound === "true") {
    return;
  }
  form.dataset.bound = "true";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(form);
      await api("/api/forms/booking", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      form.reset();
      message.textContent = "Booking request sent successfully!";
      message.style.color = "var(--success)";
    } catch (error) {
      message.textContent = "Something went wrong. Please try again.";
      message.style.color = "var(--danger)";
    }
  });
}

function renderOverviewCards(data) {
  const target = document.getElementById("overviewCards");
  if (!target) {
    return;
  }
  target.innerHTML = `
    <article class="overview-card"><strong>${data.services.length}</strong><span class="muted-copy">Services</span></article>
    <article class="overview-card"><strong>${data.pricingPlans.length}</strong><span class="muted-copy">Pricing plans</span></article>
    <article class="overview-card"><strong>${data.leads.length}</strong><span class="muted-copy">Leads</span></article>
    <article class="overview-card"><strong>${data.bookings.length}</strong><span class="muted-copy">Bookings</span></article>
  `;
}

function bindLogin() {
  const form = document.getElementById("loginForm");
  const message = document.getElementById("loginMessage");
  if (!form || form.dataset.bound === "true") {
    return;
  }
  form.dataset.bound = "true";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    try {
      await api("/api/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(formData.entries()))
      });
      message.textContent = "Login successful.";
      await refreshAdmin();
    } catch (error) {
      message.textContent = error.message;
    }
  });
}

function showAdmin(loggedIn) {
  const app = document.getElementById("adminApp");
  const login = document.getElementById("adminLoginView");
  if (app) app.classList.toggle("hidden", !loggedIn);
  if (login) login.classList.toggle("hidden", loggedIn);
}

function renderAdminForms(data) {
  adminState.data = data;
  let storageNote=document.getElementById('storageNote');
  if(!storageNote){storageNote=document.createElement('p');storageNote.id='storageNote';storageNote.setAttribute('role','status');document.getElementById('dashboardTab').prepend(storageNote);}
  storageNote.textContent=data.storage?.mode==='database'?'Database connected. Saved edits are kept outside Render.':data.storage?.hosted&&!data.storage?.persistent?'Database not connected. Edits on Render Free can be lost after a restart.':'Local preview. Edits are saved on this computer.';

  renderOverviewCards(data);
  renderSettingsForm(data.settings);
  renderPageContentForm(data.pageContent);
  renderSeoForm(data.seo);
  if(data.orders) renderOrderAdmin(data.orders);
  renderServiceAdmin(data.services);
  renderPricingAdmin(data.pricingPlans);
  renderTestimonialsAdmin(data.testimonials);
  renderCaseStudiesAdmin(data.caseStudies);
  renderFaqAdmin(data.faqs);
  renderBlogAdmin(data.blogPosts);
  renderMediaAdmin(data.media);
  renderLeadAdmin(data.leads);
  renderBookingAdmin(data.bookings);
  renderNewsletterAdmin(data.newsletterSubscribers);
  renderPasswordForm();
  bindAdminActions();
}

function renderSettingsForm(settings) {
  const form = document.getElementById("settingsForm");
  if (!form) return;
  form.innerHTML = `
    <div class="form-grid">
      <label>Brand Name<input name="brandName" value="${escapeHtml(settings.brandName)}"></label>
      <label>Tagline<input name="tagline" value="${escapeHtml(settings.tagline)}"></label>
      <label>Business Email<input name="businessEmail" value="${escapeHtml(settings.businessEmail)}"></label>
      <label>Admin Email<input name="adminEmail" value="${escapeHtml(settings.adminEmail)}"></label>
      <label>WhatsApp<input name="whatsapp" value="${escapeHtml(settings.whatsapp)}"></label>
      <label>Phone<input name="phone" value="${escapeHtml(settings.phone)}"></label>
      <label>Booking Link<input name="bookingLink" value="${escapeHtml(settings.bookingLink)}"></label>
      <label>Currency<input name="currency" value="${escapeHtml(settings.currency)}"></label>
      <label>Country<input name="country" value="${escapeHtml(settings.country)}"></label>
      <label>Logo Path<input name="logoPath" value="${escapeHtml(settings.logoPath)}"></label>
      <label>Stripe Link<input name="defaultStripeLink" value="${escapeHtml(settings.defaultStripeLink)}"></label>
      <label>PayPal account email<input type="email" name="paypalEmail" value="${escapeHtml(settings.paypalEmail)}"></label><label>PayPal payment link (optional)<input name="defaultPaypalLink" value="${escapeHtml(settings.defaultPaypalLink)}"></label>
      <p class="form-note">Your PayPal email identifies your account. Automatic checkout also needs PayPal API credentials configured on your hosting server.</p><label>Bank Name<input name="bankName" value="${escapeHtml(settings.bankName)}"></label>
      <label>Account Holder<input name="accountHolder" value="${escapeHtml(settings.accountHolder)}"></label>
      <label>Account Number<input name="accountNumber" value="${escapeHtml(settings.accountNumber)}"></label>
      <label>IBAN<input name="iban" value="${escapeHtml(settings.iban)}"></label>
      <label>SWIFT<input name="swift" value="${escapeHtml(settings.swift)}"></label>
      <label>Address<input name="address" value="${escapeHtml(settings.address)}"></label>
      <label>Newsletter Title<input name="newsletterTitle" value="${escapeHtml(settings.newsletterTitle)}"></label>
    </div>
    <label>Newsletter Text<textarea name="newsletterText" rows="2">${escapeHtml(settings.newsletterText)}</textarea></label>
    <label>Footer Blurb<textarea name="footerBlurb" rows="3">${escapeHtml(settings.footerBlurb)}</textarea></label>
    <label>Bank Instructions<textarea name="bankInstructions" rows="3">${escapeHtml(settings.bankInstructions)}</textarea></label>
    <button class="button button-small" type="submit">Save Settings</button>
    <p class="form-note" id="settingsMessage"></p>
  `;
}

function renderPageContentForm(pageContent) {
 const form=document.getElementById('pageContentForm');
 const label=k=>k.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
 const fields=(obj,path=[])=>Object.entries(obj).map(([key,value])=>typeof value==='string'?`<label>${escapeHtml(label(key))}<textarea data-content-path="${escapeHtml(JSON.stringify([...path,key]))}">${escapeHtml(value)}</textarea></label>`:(value&&typeof value==='object'&&!Array.isArray(value)?`<fieldset class="editor-group"><legend>${escapeHtml(label(key))}</legend>${fields(value,[...path,key])}</fieldset>`:'')).join('');
 form.innerHTML=fields(pageContent)+'<button class="button" type="submit">Save page content</button><p id="pageContentMessage" role="status"></p>';
}
function renderSeoForm(seo) {
 const paths=new Set([...Object.keys(seo.pages||{}),...adminState.data.services.filter(s=>!s.legacy).map(s=>'/services/'+s.slug),...adminState.data.blogPosts.map(p=>'/blog/'+p.slug)]);
 document.getElementById('seoForm').innerHTML=`<label>Website URL<input name="siteUrl" type="url" required value="${escapeHtml(seo.siteUrl)}"></label><label>Default search title<input name="defaultTitle" value="${escapeHtml(seo.defaultTitle)}"></label><label>Default description<textarea name="defaultDescription">${escapeHtml(seo.defaultDescription)}</textarea></label><input type="hidden" name="twitterHandle" value="${escapeHtml(seo.twitterHandle)}"><p>Edit how each page appears in search and link previews. Google may choose a different snippet.</p>`+[...paths].map(path=>`<fieldset class="editor-group" data-seo-path="${escapeHtml(path)}"><legend>${escapeHtml(path)}</legend><label>Search title<input data-seo-title value="${escapeHtml(seo.pages?.[path]?.title||'')}"></label><label>Search description<textarea data-seo-description>${escapeHtml(seo.pages?.[path]?.description||'')}</textarea></label></fieldset>`).join('')+'<button class="button" type="submit">Save search settings</button><p id="seoMessage" role="status"></p>';
}

function renderCollectionList(targetId, items, labelGetter, editAttr, deleteAttr) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = items
    .map((item) => `
      <article class="admin-item">
        <div class="admin-item-head">
          <div><h4 class="card-title">${escapeHtml(labelGetter(item))}</h4></div>
          <div class="inline-actions">
            <button class="button button-ghost button-small" type="button" ${editAttr}="${escapeHtml(item.id)}">Edit</button>
            <button class="button button-danger button-small" type="button" ${deleteAttr}="${escapeHtml(item.id)}">Delete</button>
          </div>
        </div>
      </article>
    `)
    .join("");
}

function renderServiceAdmin(services) {
  const form = document.getElementById("serviceForm");
  if (form) {
    form.innerHTML = `
      <input type="hidden" name="id">
      <div class="form-grid">
        <label>Slug<input name="slug"></label>
        <label>Title<input name="title"></label><p>Search & sharing page overrides take priority over these service defaults.</p><label>Search title<input name="seoTitle" maxlength="120"></label><label>Search description<textarea name="seoDescription" maxlength="320"></textarea></label>
        <label>Price<input name="price"></label><label>Category<select name="category"><option>Content & Publishing</option><option>Sales & Bookings</option><option>Customer Support</option><option>Business Operations</option></select></label><label><input type="checkbox" name="quoteOnly"> Confirm scope and price before payment</label>
        <label>Audience<input name="audience"></label>
        <label>Stripe Link<input name="stripeLink"></label>
        <label>PayPal Link<input name="paypalLink"></label>
      </div>
      
      <div class="dashboard-panel" style="margin-top: 16px; margin-bottom: 16px; border: 1px solid var(--line); padding: 16px;">
        <h4 style="margin-bottom: 4px;">Service Image</h4>
        <p class="form-note" style="margin-bottom: 16px;">Paste a direct image URL or an image hosted on your website.</p>
        <div class="form-grid">
          <label>Image URL<input name="imageUrl" id="serviceImageUrlInput" placeholder="e.g. /media/service.jpg"></label>
          <label>Image Alt Text<input name="imageAlt" placeholder="Brief description for SEO"></label>
        </div>
        <div style="margin-top: 16px; position: relative;">
          <style>@keyframes adminSpin { to { transform: rotate(360deg); } }</style>
          <img id="serviceImagePreview" src="" alt="Preview" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; display: none; border: 1px solid var(--line);">
          
          <div id="serviceImagePlaceholder" style="width: 100%; height: 200px; border: 1px dashed var(--line); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 0.875rem;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 24px; height: 24px; margin-bottom: 8px; opacity: 0.5;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            <strong id="serviceImagePlaceholderText" style="color: var(--text);">No image selected</strong>
            <span id="serviceImageHelperText" style="font-size: 0.75rem; opacity: 0.7; margin-top: 4px;">Paste an image URL above to preview it here.</span>
          </div>

          <div id="serviceImageLoading" style="width: 100%; height: 200px; border: 1px dashed var(--line); border-radius: 8px; display: none; flex-direction: column; align-items: center; justify-content: center; color: var(--text-secondary);">
            <div style="width: 24px; height: 24px; border: 2px solid var(--line-strong); border-top-color: var(--accent); border-radius: 50%; animation: adminSpin 0.8s linear infinite; margin-bottom: 8px;"></div>
            <span style="font-size: 0.875rem;">Loading...</span>
          </div>
        </div>
        <div style="margin-top: 16px; display: flex; gap: 8px;">
          <button type="button" class="button button-ghost button-small" id="clearServiceImageBtn" style="display: none;">Clear Image</button>
          <a id="openServiceImageBtn" href="#" target="_blank" class="button button-ghost button-small" style="display: none;">Open Image</a>
        </div>
      </div>

      <label>Description<textarea name="description" rows="3"></textarea></label>
      <label>Benefits<textarea name="benefits" rows="4" placeholder="One per line"></textarea></label>
      <label>Deliverables<textarea name="deliverables" rows="4" placeholder="One per line"></textarea></label>
      <label>Use Cases<textarea name="useCases" rows="4" placeholder="One per line"></textarea></label>
      <label>Outcomes<textarea name="outcomes" rows="4" placeholder="One per line"></textarea></label>
      <label>FAQ JSON<textarea name="faqJson" rows="5" placeholder='[{"question":"...","answer":"..."}]'></textarea></label>
      <label class="checkbox-line"><input type="checkbox" name="featured">Featured service</label>
      <div class="inline-actions"><button class="button button-small" type="submit">Save Service</button><button class="button button-ghost button-small" type="button" id="clearServiceForm">Clear</button></div>
      <p class="form-note" id="serviceMessage"></p>
    `;

    const imgInput = document.getElementById("serviceImageUrlInput");
    const preview = document.getElementById("serviceImagePreview");
    const placeholder = document.getElementById("serviceImagePlaceholder");
    const placeholderText = document.getElementById("serviceImagePlaceholderText");
    const helperText = document.getElementById("serviceImageHelperText");
    const loading = document.getElementById("serviceImageLoading");
    const clearBtn = document.getElementById("clearServiceImageBtn");
    const openBtn = document.getElementById("openServiceImageBtn");

    const updatePreview = () => {
      const url = imgInput.value.trim();
      if (url) {
        preview.style.display = "none";
        placeholder.style.display = "none";
        loading.style.display = "flex";
        
        clearBtn.style.display = "inline-flex";
        openBtn.style.display = "inline-flex";
        openBtn.href = url;

        preview.src = url;
      } else {
        preview.style.display = "none";
        loading.style.display = "none";
        placeholder.style.display = "flex";
        placeholderText.textContent = "No image selected";
        helperText.textContent = "Paste an image URL above to preview it here.";
        
        clearBtn.style.display = "none";
        openBtn.style.display = "none";
      }
    };

    imgInput.addEventListener("input", updatePreview);
    preview.addEventListener("error", () => {
      preview.style.display = "none";
      loading.style.display = "none";
      placeholder.style.display = "flex";
      placeholderText.textContent = "Could not load this image";
      helperText.textContent = "Check that the link is public and points directly to an image.";
    });
    preview.addEventListener("load", () => {
      loading.style.display = "none";
      preview.style.display = "block";
      placeholder.style.display = "none";
    });

    clearBtn.addEventListener("click", () => {
      imgInput.value = "";
      document.querySelector('input[name="imageAlt"]').value = "";
      updatePreview();
    });
  }
  renderCollectionList("serviceAdminList", services, (item) => `${item.title} • ${item.price}`, "data-edit-service", "data-delete-service");
}

function renderPricingAdmin(plans) {
  const form = document.getElementById("pricingForm");
  if (form) {
    form.innerHTML = `
      <input type="hidden" name="id">
      <div class="form-grid">
        <label>Name<input name="name"></label>
        <label>Price<input name="price"></label>
        <label>Comparison Label<input name="comparisonLabel"></label>
        <label>Stripe Link<input name="stripeLink"></label>
        <label>PayPal Link<input name="paypalLink"></label>
      </div>
      <label>Summary<textarea name="summary" rows="3"></textarea></label>
      <label>Features<textarea name="features" rows="4" placeholder="One per line"></textarea></label>
      <label class="checkbox-line"><input type="checkbox" name="highlight">Highlight this plan</label>
      <div class="inline-actions"><button class="button button-small" type="submit">Save Pricing Plan</button><button class="button button-ghost button-small" type="button" id="clearPricingForm">Clear</button></div>
      <p class="form-note" id="pricingMessage"></p>
    `;
  }
  renderCollectionList("pricingAdminList", plans, (item) => `${item.name} • ${item.price}`, "data-edit-plan", "data-delete-plan");
}

function renderTestimonialsAdmin(testimonials) {
  const form = document.getElementById("testimonialForm");
  if (form) {
    form.innerHTML = `
      <input type="hidden" name="id">
      <div class="form-grid">
        <label>Name<input name="name"></label>
        <label>Role<input name="role"></label>
        <label>Company<input name="company"></label>
        <label>Rating<input name="rating" type="number" min="1" max="5"></label>
      </div>
      <label>Quote<textarea name="quote" rows="4"></textarea></label>
      <label>Result<textarea name="result" rows="2"></textarea></label>
      <div class="inline-actions"><button class="button button-small" type="submit">Save Testimonial</button><button class="button button-ghost button-small" type="button" id="clearTestimonialForm">Clear</button></div>
      <p class="form-note" id="testimonialMessage"></p>
    `;
  }
  renderCollectionList("testimonialAdminList", testimonials, (item) => `${item.name} • ${item.company}`, "data-edit-testimonial", "data-delete-testimonial");
}

function renderCaseStudiesAdmin(items) {
  const form = document.getElementById("caseStudyForm");
  if (form) {
    form.innerHTML = `
      <input type="hidden" name="id">
      <div class="form-grid">
        <label>Slug<input name="slug"></label>
        <label>Title<input name="title"></label>
        <label>Client Type<input name="clientType"></label>
        <label>CTA Label<input name="ctaLabel"></label>
        <label>CTA Link<input name="ctaLink"></label>
      </div>
      <label>Challenge<textarea name="challenge" rows="3"></textarea></label>
      <label>Solution<textarea name="solution" rows="3"></textarea></label>
      <label>Results<textarea name="results" rows="4" placeholder="One per line"></textarea></label>
      <div class="inline-actions"><button class="button button-small" type="submit">Save Case Study</button><button class="button button-ghost button-small" type="button" id="clearCaseStudyForm">Clear</button></div>
      <p class="form-note" id="caseStudyMessage"></p>
    `;
  }
  renderCollectionList("caseStudyAdminList", items, (item) => item.title, "data-edit-case-study", "data-delete-case-study");
}

function renderFaqAdmin(items) {
  const form = document.getElementById("faqForm");
  if (form) {
    form.innerHTML = `
      <input type="hidden" name="id">
      <div class="form-grid">
        <label>Category<input name="category"></label>
        <label>Question<input name="question"></label>
      </div>
      <label>Answer<textarea name="answer" rows="4"></textarea></label>
      <div class="inline-actions"><button class="button button-small" type="submit">Save FAQ</button><button class="button button-ghost button-small" type="button" id="clearFaqForm">Clear</button></div>
      <p class="form-note" id="faqMessage"></p>
    `;
  }
  renderCollectionList("faqAdminList", items, (item) => item.question, "data-edit-faq", "data-delete-faq");
}

function renderBlogAdmin(items) {
  const form = document.getElementById("blogForm");
  if (form) {
    form.innerHTML = `
      <input type="hidden" name="id">
      <div class="form-grid">
        <label>Slug<input name="slug"></label>
        <label>Title<input name="title"></label>
        <label>Category<input name="category"></label>
        <label>Author<input name="author"></label>
        <label>Published At<input name="publishedAt"></label>
      </div>
      <label>Excerpt<textarea name="excerpt" rows="3"></textarea></label>
      <label>Tags<textarea name="tags" rows="2" placeholder="One per line"></textarea></label>
      <label>Meta Description<textarea name="metaDescription" rows="3"></textarea></label>
      <label>Content HTML<textarea name="contentHtml" rows="10"></textarea></label>
      <div class="inline-actions"><button class="button button-small" type="submit">Save Blog Post</button><button class="button button-ghost button-small" type="button" id="clearBlogForm">Clear</button></div>
      <p class="form-note" id="blogMessage"></p>
    `;
  }
  renderCollectionList("blogAdminList", items, (item) => item.title, "data-edit-blog", "data-delete-blog");
}

function renderMediaAdmin(items) {
  const form = document.getElementById("mediaForm");
  if (form) {
    form.innerHTML = `
      <input type="hidden" name="id">
      <div class="form-grid">
        <label>Name<input name="name"></label>
        <label>URL<input name="url"></label>
        <label>Alt Text<input name="alt"></label>
      </div>
      <div class="inline-actions"><button class="button button-small" type="submit">Save Media Item</button><button class="button button-ghost button-small" type="button" id="clearMediaForm">Clear</button></div>
      <p class="form-note" id="mediaMessage"></p>
    `;
  }
  renderCollectionList("mediaAdminList", items, (item) => item.name, "data-edit-media", "data-delete-media");
}

// --- ORDERS ADMIN ---
function renderOrderAdmin(orders) {
  const tbody = document.getElementById("ordersTableBody");
  if (!tbody) return;

  const statusFilter = document.getElementById("orderStatusFilter").value;
  const paymentFilter = document.getElementById("orderPaymentFilter").value;

  let filtered = [...orders];
  if (statusFilter !== "all") filtered = filtered.filter(o => o.status === statusFilter);
  if (paymentFilter !== "all") filtered = filtered.filter(o => o.paymentMethod === paymentFilter);

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No orders found</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td>${new Date(o.createdAt).toLocaleDateString()}</td>
      <td>
        <strong>${escapeHtml(o.clientName)}</strong><br>
        <span style="font-size:0.8rem; color:var(--text-secondary)">${escapeHtml(o.clientEmail)}</span>
      </td>
      <td>${escapeHtml(o.serviceName)}</td>
      <td>${o.price} ${o.currency}</td>
      <td>
        <span class="badge ${o.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}">
          ${o.paymentMethod.toUpperCase()} - ${o.paymentStatus.toUpperCase()}
        </span>
      </td>
      <td>
        <span class="badge badge-info">${o.status.toUpperCase()}</span>
      </td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="updateOrderStatus('${o.id}', 'mark_paid')" ${o.paymentStatus === 'paid' ? 'disabled' : ''}>Mark Paid</button>
        <button class="btn btn-sm btn-primary" onclick="updateOrderStatus('${o.id}', 'mark_completed')" ${o.status === 'completed' ? 'disabled' : ''}>Complete</button>
        <button class="btn btn-sm btn-danger" onclick="updateOrderStatus('${o.id}', 'cancel')" ${o.status === 'cancelled' ? 'disabled' : ''}>Cancel</button>
      </td>
    </tr>
  `).join("");
}

window.updateOrderStatus = async function(id, action) {
  if (!confirm("Are you sure you want to perform this action?")) return;
  try {
    await api("/api/orders/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    refreshAdmin();
  } catch (err) {
    alert("Action failed: " + err.message);
  }
};

document.getElementById("orderStatusFilter")?.addEventListener("change", () => renderOrderAdmin(adminState.data.orders || []));
document.getElementById("orderPaymentFilter")?.addEventListener("change", () => renderOrderAdmin(adminState.data.orders || []));
// --- END ORDERS ADMIN ---

function renderLeadAdmin(items) {
  const target = document.getElementById("leadList");
  if (!target) return;
  target.innerHTML = items.length
    ? items.map((lead) => `
      <article class="order-card">
        <div class="order-card-head"><div><h4 class="order-title">${escapeHtml(lead.name)}</h4><p class="muted-copy">${escapeHtml(lead.type)} • ${escapeHtml(lead.company || "No company")}</p></div><span class="status-badge status-${escapeHtml(lead.status)}">${escapeHtml(lead.status)}</span></div>
        <div class="order-card-body">
          <div class="order-meta-grid">
            <div class="order-meta"><strong>Email</strong><span>${escapeHtml(lead.email)}</span></div>
            <div class="order-meta"><strong>Service</strong><span>${escapeHtml(lead.service)}</span></div>
            <div class="order-meta"><strong>Budget</strong><span>${escapeHtml(lead.budget)}</span></div>
            <div class="order-meta"><strong>Preferred Contact</strong><span>${escapeHtml(lead.preferredContact || "")}</span></div>
          </div>
          <div class="order-meta"><strong>Message</strong><span>${escapeHtml(lead.message)}</span></div>
        </div>
        <div class="order-card-foot"><select data-update-lead="${escapeHtml(lead.id)}" class="status-select">${["new","contacted","in-progress","complete"].map((s)=>`<option value="${s}" ${lead.status===s?"selected":""}>${s}</option>`).join("")}</select><button class="button button-danger button-small" type="button" data-delete-lead="${escapeHtml(lead.id)}">Delete</button></div>
      </article>
    `).join("")
    : '<div class="empty-state">No leads yet.</div>';
}

function renderBookingAdmin(items) {
  const target = document.getElementById("bookingList");
  if (!target) return;
  target.innerHTML = items.length
    ? items.map((booking) => `
      <article class="order-card">
        <div class="order-card-head"><div><h4 class="order-title">${escapeHtml(booking.name)}</h4><p class="muted-copy">${escapeHtml(booking.company || "No company")}</p></div><span class="status-badge status-${escapeHtml(booking.status)}">${escapeHtml(booking.status)}</span></div>
        <div class="order-card-body">
          <div class="order-meta-grid">
            <div class="order-meta"><strong>Email</strong><span>${escapeHtml(booking.email)}</span></div>
            <div class="order-meta"><strong>Service</strong><span>${escapeHtml(booking.service)}</span></div>
            <div class="order-meta"><strong>Date</strong><span>${escapeHtml(booking.preferredDate)}</span></div>
            <div class="order-meta"><strong>Time</strong><span>${escapeHtml(booking.preferredTime)}</span></div>
          </div>
          <div class="order-meta"><strong>Message</strong><span>${escapeHtml(booking.message)}</span></div>
        </div>
        <div class="order-card-foot"><select data-update-booking="${escapeHtml(booking.id)}" class="status-select">${["new","contacted","in-progress","complete"].map((s)=>`<option value="${s}" ${booking.status===s?"selected":""}>${s}</option>`).join("")}</select><button class="button button-danger button-small" type="button" data-delete-booking="${escapeHtml(booking.id)}">Delete</button></div>
      </article>
    `).join("")
    : '<div class="empty-state">No bookings yet.</div>';
}

function renderNewsletterAdmin(items) {
  const target = document.getElementById("newsletterList");
  if (!target) return;
  target.innerHTML = items.length
    ? items.map((item) => `<article class="admin-item"><div class="admin-item-head"><div><h4 class="card-title">${escapeHtml(item.email)}</h4><p class="muted-copy">${escapeHtml(item.submittedAt)}</p></div></div></article>`).join("")
    : '<div class="empty-state">No subscribers yet.</div>';
}

function renderPasswordForm() {
  const form = document.getElementById("passwordForm");
  if (!form) return;
  form.innerHTML = `
    <label>Current Password<input type="password" name="currentPassword"></label>
    <label>New Password<input type="password" name="nextPassword"></label>
    <button class="button button-small" type="submit">Change Password</button>
    <p class="form-note" id="passwordMessage"></p>
  `;
}

function bindAdminActions() {
  bindSimpleSubmit("settingsForm", async (form) => {
    await api("/api/settings", { method: "PUT", body: JSON.stringify(Object.fromEntries(new FormData(form).entries())) });
  }, "settingsMessage");

  bindSimpleSubmit('pageContentForm',async(form)=>{
 const content=JSON.parse(JSON.stringify(adminState.data.pageContent));
 form.querySelectorAll('[data-content-path]').forEach(input=>{const path=JSON.parse(input.dataset.contentPath);let target=content;for(const key of path.slice(0,-1))target=target[key];target[path.at(-1)]=input.value;});
 await api('/api/page-content',{method:'PUT',body:JSON.stringify(content)});
 },'pageContentMessage');

  bindSimpleSubmit("seoForm", async (form) => {
    const fd = new FormData(form);
    await api("/api/seo", {
      method: "PUT",
      body: JSON.stringify({
        defaultTitle: fd.get("defaultTitle"),
        defaultDescription: fd.get("defaultDescription"),
        siteUrl: fd.get("siteUrl"),
        twitterHandle: fd.get("twitterHandle"),
        pages: Object.fromEntries([...form.querySelectorAll('[data-seo-path]')].map(row=>[row.dataset.seoPath,{title:row.querySelector('[data-seo-title]').value,description:row.querySelector('[data-seo-description]').value}]))
      })
    });
  }, "seoMessage");

  bindCollectionForm("serviceForm", "services", (fd) => ({
    id: fd.get("id"),
    slug: fd.get("slug"),
    title: fd.get("title"),
    seoTitle: fd.get("seoTitle"),
    seoDescription: fd.get("seoDescription"),
    price: fd.get("price"),
    category: fd.get("category"),
    quoteOnly: fd.get("quoteOnly") === "on",
    audience: fd.get("audience"),
    stripeLink: fd.get("stripeLink"),
    paypalLink: fd.get("paypalLink"),
    imageUrl: fd.get("imageUrl"),
    imageAlt: fd.get("imageAlt"),
    description: fd.get("description"),
    benefits: splitLines(fd.get("benefits")),
    deliverables: splitLines(fd.get("deliverables")),
    useCases: splitLines(fd.get("useCases")),
    outcomes: splitLines(fd.get("outcomes")),
    faq: JSON.parse(String(fd.get("faqJson") || "[]")),
    featured: fd.get("featured") === "on"
  }), "serviceMessage");

  bindCollectionForm("pricingForm", "pricing-plans", (fd) => ({
    id: fd.get("id"),
    name: fd.get("name"),
    price: fd.get("price"),
    summary: fd.get("summary"),
    comparisonLabel: fd.get("comparisonLabel"),
    stripeLink: fd.get("stripeLink"),
    paypalLink: fd.get("paypalLink"),
    features: splitLines(fd.get("features")),
    highlight: fd.get("highlight") === "on"
  }), "pricingMessage");

  bindCollectionForm("testimonialForm", "testimonials", (fd) => ({
    id: fd.get("id"),
    name: fd.get("name"),
    role: fd.get("role"),
    company: fd.get("company"),
    rating: Number(fd.get("rating") || 5),
    quote: fd.get("quote"),
    result: fd.get("result")
  }), "testimonialMessage");

  bindCollectionForm("caseStudyForm", "case-studies", (fd) => ({
    id: fd.get("id"),
    slug: fd.get("slug"),
    title: fd.get("title"),
    clientType: fd.get("clientType"),
    challenge: fd.get("challenge"),
    solution: fd.get("solution"),
    results: splitLines(fd.get("results")),
    ctaLabel: fd.get("ctaLabel"),
    ctaLink: fd.get("ctaLink")
  }), "caseStudyMessage");

  bindCollectionForm("faqForm", "faqs", (fd) => ({
    id: fd.get("id"),
    category: fd.get("category"),
    question: fd.get("question"),
    answer: fd.get("answer")
  }), "faqMessage");

  bindCollectionForm("blogForm", "blog-posts", (fd) => ({
    id: fd.get("id"),
    slug: fd.get("slug"),
    title: fd.get("title"),
    category: fd.get("category"),
    author: fd.get("author"),
    publishedAt: fd.get("publishedAt"),
    excerpt: fd.get("excerpt"),
    tags: splitLines(fd.get("tags")),
    metaDescription: fd.get("metaDescription"),
    contentHtml: fd.get("contentHtml")
  }), "blogMessage");

  bindCollectionForm("mediaForm", "media", (fd) => ({
    id: fd.get("id"),
    name: fd.get("name"),
    url: fd.get("url"),
    alt: fd.get("alt")
  }), "mediaMessage");

  bindSimpleSubmit("passwordForm", async (form) => {
    await api("/api/account/password", {
      method: "POST",
      body: JSON.stringify(Object.fromEntries(new FormData(form).entries()))
    });
  }, "passwordMessage");

  bindAdminButtons();
}

function bindSimpleSubmit(formId, handler, messageId) {
  const form = document.getElementById(formId);
  if (!form || form.dataset.bound === "true") {
    return;
  }
  form.dataset.bound = "true";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const currentForm = event.target;
    const submitBtn = currentForm.querySelector('button[type="submit"]');
    const message = document.getElementById(messageId);
    const originalText = submitBtn ? submitBtn.textContent : "Save";

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Saving...";
      }
      if (message) {
        message.textContent = "";
      }

      await handler(currentForm);
      await refreshAdmin();

      const newMessage = document.getElementById(messageId);
      const newBtn = document.getElementById(formId)?.querySelector('button[type="submit"]');
      if (newMessage) {
        newMessage.textContent = "Saved successfully.";
        newMessage.style.color = "var(--success)";
      }
      if (newBtn) {
        newBtn.disabled = false;
        newBtn.textContent = originalText;
      }
    } catch (error) {
      const errMessage = document.getElementById(messageId);
      const errBtn = document.getElementById(formId)?.querySelector('button[type="submit"]');
      if (errMessage) {
        errMessage.textContent = error.message;
        errMessage.style.color = "var(--danger)";
      }
      if (errBtn) {
        errBtn.disabled = false;
        errBtn.textContent = originalText;
      }
    }
  });
}

function bindCollectionForm(formId, collectionSegment, payloadBuilder, messageId) {
  bindSimpleSubmit(formId, async (form) => {
    const fd = new FormData(form);
    const payload = payloadBuilder(fd);
    const id = String(payload.id || "").trim();
    delete payload.id;
    await api(id ? `/api/collections/${collectionSegment}/${id}` : `/api/collections/${collectionSegment}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    form.reset();
    if (form.elements.id) {
      form.elements.id.value = "";
    }
  }, messageId);
}

function fillForm(formId, values) {
  const form = document.getElementById(formId);
  if (!form) return;
  Object.entries(values).forEach(([key, value]) => {
    if (!form.elements[key]) return;
    if (form.elements[key].type === "checkbox") {
      form.elements[key].checked = Boolean(value);
    } else {
      form.elements[key].value = value ?? "";
    }
  });
}

function bindAdminButtons() {
  if (document.body.dataset.adminButtonsBound === "true") {
    return;
  }
  document.body.dataset.adminButtonsBound = "true";

  document.body.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.id === "clearServiceForm") {
      fillForm("serviceForm", { id: "", slug: "", title: "", seoTitle: "", seoDescription: "", price: "", audience: "", stripeLink: "", paypalLink: "", imageUrl: "", imageAlt: "", description: "", benefits: "", deliverables: "", useCases: "", outcomes: "", faqJson: "", featured: false });
      const imgInput = document.getElementById("serviceImageUrlInput");
      if(imgInput) imgInput.dispatchEvent(new Event("input"));
    }
    if (target.id === "clearPricingForm") fillForm("pricingForm", { id: "", name: "", price: "", summary: "", comparisonLabel: "", stripeLink: "", paypalLink: "", features: "", highlight: false });
    if (target.id === "clearTestimonialForm") fillForm("testimonialForm", { id: "", name: "", role: "", company: "", rating: 5, quote: "", result: "" });
    if (target.id === "clearCaseStudyForm") fillForm("caseStudyForm", { id: "", slug: "", title: "", clientType: "", challenge: "", solution: "", results: "", ctaLabel: "", ctaLink: "" });
    if (target.id === "clearFaqForm") fillForm("faqForm", { id: "", category: "", question: "", answer: "" });
    if (target.id === "clearBlogForm") fillForm("blogForm", { id: "", slug: "", title: "", category: "", author: "", publishedAt: "", excerpt: "", tags: "", metaDescription: "", contentHtml: "" });
    if (target.id === "clearMediaForm") fillForm("mediaForm", { id: "", name: "", url: "", alt: "" });

    if (target.dataset.editService) {
      const item = adminState.data.services.find((entry) => entry.id === target.dataset.editService);
      if (item) {
        fillForm("serviceForm", { ...item, benefits: nlJoin(item.benefits), deliverables: nlJoin(item.deliverables), useCases: nlJoin(item.useCases), outcomes: nlJoin(item.outcomes), faqJson: JSON.stringify(item.faq, null, 2) });
        const imgInput = document.getElementById("serviceImageUrlInput");
        if(imgInput) imgInput.dispatchEvent(new Event("input"));
      }
    }
    if (target.dataset.deleteService) await deleteCollectionItem("services", target.dataset.deleteService);

    if (target.dataset.editPlan) {
      const item = adminState.data.pricingPlans.find((entry) => entry.id === target.dataset.editPlan);
      if (item) fillForm("pricingForm", { ...item, features: nlJoin(item.features) });
    }
    if (target.dataset.deletePlan) await deleteCollectionItem("pricing-plans", target.dataset.deletePlan);

    if (target.dataset.editTestimonial) {
      const item = adminState.data.testimonials.find((entry) => entry.id === target.dataset.editTestimonial);
      if (item) fillForm("testimonialForm", item);
    }
    if (target.dataset.deleteTestimonial) await deleteCollectionItem("testimonials", target.dataset.deleteTestimonial);

    if (target.dataset.editCaseStudy) {
      const item = adminState.data.caseStudies.find((entry) => entry.id === target.dataset.editCaseStudy);
      if (item) fillForm("caseStudyForm", { ...item, results: nlJoin(item.results) });
    }
    if (target.dataset.deleteCaseStudy) await deleteCollectionItem("case-studies", target.dataset.deleteCaseStudy);

    if (target.dataset.editFaq) {
      const item = adminState.data.faqs.find((entry) => entry.id === target.dataset.editFaq);
      if (item) fillForm("faqForm", item);
    }
    if (target.dataset.deleteFaq) await deleteCollectionItem("faqs", target.dataset.deleteFaq);

    if (target.dataset.editBlog) {
      const item = adminState.data.blogPosts.find((entry) => entry.id === target.dataset.editBlog);
      if (item) fillForm("blogForm", { ...item, tags: nlJoin(item.tags) });
    }
    if (target.dataset.deleteBlog) await deleteCollectionItem("blog-posts", target.dataset.deleteBlog);

    if (target.dataset.editMedia) {
      const item = adminState.data.media.find((entry) => entry.id === target.dataset.editMedia);
      if (item) fillForm("mediaForm", item);
    }
    if (target.dataset.deleteMedia) await deleteCollectionItem("media", target.dataset.deleteMedia);

    if (target.dataset.deleteLead) {
      await api(`/api/leads/${target.dataset.deleteLead}`, { method: "DELETE" });
      await refreshAdmin();
    }
    if (target.dataset.deleteBooking) {
      await api(`/api/bookings/${target.dataset.deleteBooking}`, { method: "DELETE" });
      await refreshAdmin();
    }
  });

  document.body.addEventListener("change", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (target.dataset.updateLead) {
      await api(`/api/leads/${target.dataset.updateLead}`, { method: "PATCH", body: JSON.stringify({ status: target.value }) });
      await refreshAdmin();
    }
    if (target.dataset.updateBooking) {
      await api(`/api/bookings/${target.dataset.updateBooking}`, { method: "PATCH", body: JSON.stringify({ status: target.value }) });
      await refreshAdmin();
    }
  });

  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton && logoutButton.dataset.bound !== "true") {
    logoutButton.dataset.bound = "true";
    logoutButton.addEventListener("click", async () => {
      await api("/api/logout", { method: "POST" });
      showAdmin(false);
    });
  }
}

async function deleteCollectionItem(segment, id) {
  await api(`/api/collections/${segment}/${id}`, { method: "DELETE" });
  await refreshAdmin();
}

async function refreshAdmin() {
  try {
    const data = await api("/api/admin-data");
    showAdmin(true);
    renderAdminForms(data);
  } catch {
    showAdmin(false);
  }
}

async function bootPublic() {
  const publicData = await api("/api/public-data");
  updateSeo(publicData);
  renderHeader(publicData.settings);
  renderFooter(publicData.settings);

  switch (document.body.dataset.page) {
    case "home":
      renderHome(publicData);
      break;
    case "services":
      renderServicesPage(publicData);
      break;
    case "about":
      renderAboutPage(publicData);
      break;
    case "pricing":
      renderPricingPage(publicData);
      break;
    case "case-studies":
      renderCaseStudiesPage(publicData);
      break;
    case "testimonials":
      renderTestimonialsPage(publicData);
      break;
    case "blog":
      renderBlogPage(publicData);
      break;
    case "blog-post":
      renderBlogPostPage(publicData);
      break;
    case "contact":
      renderContactPage(publicData);
      break;
    case "faq":
      renderFaqPage(publicData);
      break;
    case "service-detail":
      renderServiceDetailPage(publicData);
      break;
    default:
      break;
  }
}

async function bootAdmin() {
  renderAdminHeader();
  bindLogin();
  await refreshAdmin();
}

async function boot() {
  const page = document.body.dataset.page;
  if (page === "admin") {
    await bootAdmin();
    return;
  }
  await bootPublic();
}

boot().catch((error) => {
  console.error(error);
  const main = document.querySelector("main");
  if (main) {
    main.innerHTML = '<section class="section"><div class="glass-card" style="text-align:center;padding:3rem"><h2>Something went wrong</h2><p>Please refresh the page or try again later.</p></div></section>';
  }
});

function selectAdminPanel(id){
 const panel=document.getElementById(id);if(!panel?.classList.contains('admin-panel'))return;
 document.querySelectorAll('.admin-panel').forEach(p=>p.hidden=p.id!==id);
 document.querySelectorAll('.admin-nav-link').forEach(a=>{a.classList.toggle('active',a.dataset.target===id);if(a.dataset.target===id)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
}
document.querySelectorAll('.admin-nav-link').forEach(a=>a.addEventListener('click',()=>selectAdminPanel(a.dataset.target)));
window.addEventListener('hashchange',()=>selectAdminPanel(location.hash.slice(1)));
selectAdminPanel(location.hash.slice(1)||'dashboardTab');
for(const id of ['orderStatusFilter','orderPaymentFilter'])document.getElementById(id)?.addEventListener('change',()=>renderOrderAdmin(adminState.data?.orders||[]));
