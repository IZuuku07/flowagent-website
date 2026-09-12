const fs = require('fs');

let script = fs.readFileSync('script.js', 'utf8');

const replacement = `
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
  const cardsHtml = activeServices.map((svc, i) => \`
    <div class="card service-card animate-fade-up delay-\${(i%2+1)*100} \${svc.featured ? 'featured' : ''}">
      <div class="service-header">
        \${svc.imageUrl ? \`<div style="margin-bottom: 24px; border-radius: 12px; overflow: hidden; height: 200px; background: var(--surface-soft); border: 1px solid var(--line); position: relative;"><img src="\${escapeHtml(svc.imageUrl)}" alt="\${escapeHtml(svc.imageAlt || svc.title)}" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'"> <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 0.875rem; position: absolute; inset: 0;">Image unavailable</div></div>\` : \`<div style="margin-bottom: 24px; border-radius: 12px; overflow: hidden; height: 200px; background: var(--surface-soft); border: 1px dashed var(--line); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); font-size: 0.875rem;">No image available</div>\`}
        <h3>\${escapeHtml(svc.title)}</h3>
        <div class="service-price">\${escapeHtml(svc.price)}</div>
      </div>
      <p>\${escapeHtml(svc.description)}</p>
      <ul class="service-features">
        \${svc.benefits.slice(0, 4).map(b => \`
          <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>\${escapeHtml(b)}</li>
        \`).join('')}
      </ul>
      <div class="service-footer">
        <a href="\${serviceLink(svc)}" class="btn btn-secondary">View System details</a>
      </div>
    </div>
  \`).join('');

  if (isOldDesign) {
    container.innerHTML = \`
      <div class="container">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">Our Services</h1>
          <p>Automated growth systems for ecommerce brands.</p>
        </div>
        <div class="grid-2">\${cardsHtml}</div>
      </div>\`;
  } else {
    container.innerHTML = cardsHtml;
  }
}

function renderPricingPage(data) {
  const container = document.getElementById("pricingFullGrid") || document.getElementById("pricingSection");
  if (!container) return;
  if (!data.pricingPlans || data.pricingPlans.length === 0) {
    container.innerHTML = '<div class="state-empty">No pricing plans available.</div>';
    return;
  }
  const isOldDesign = container.id === "pricingSection";
  const cardsHtml = data.pricingPlans.map((plan, i) => \`
    <div class="card pricing-card animate-fade-up delay-\${(i%3+1)*100} \${plan.highlight ? 'featured' : ''}">
      <h3>\${escapeHtml(plan.name)}</h3>
      <div class="pricing-price">\${escapeHtml(plan.price)}</div>
      <p class="pricing-summary">\${escapeHtml(plan.summary)}</p>
      <ul class="pricing-features">
        \${plan.features.map(f => \`<li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>\${escapeHtml(f)}</li>\`).join('')}
      </ul>
      <div class="pricing-footer">
        <a href="/checkout.html?serviceId=\${plan.id}" class="btn \${plan.highlight ? 'btn-primary' : 'btn-secondary'}" style="width: 100%">Get Started</a>
      </div>
    </div>
  \`).join('');

  if (isOldDesign) {
    container.innerHTML = \`
      <div class="container">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">Simple, Transparent Pricing</h1>
          <p>Choose the automation system that fits your brand.</p>
        </div>
        <div class="grid-3">\${cardsHtml}</div>
      </div>\`;
  } else {
    container.innerHTML = cardsHtml;
  }
}

function renderContactPage(data) {
  const contactSec = document.getElementById("contactForm")?.closest('.container') || document.getElementById("contactSection");
  if (!contactSec) return;
  const isOldDesign = contactSec.id === "contactSection";
  
  if (isOldDesign) {
    contactSec.innerHTML = \`
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
    \`;
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
    hero.innerHTML = \`
      <div class="container">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">\${escapeHtml(aboutInfo.headline)}</h1>
          <p>\${escapeHtml(aboutInfo.intro)}</p>
        </div>
      </div>
    \`;
  }
  const mission = document.getElementById("aboutMission");
  if (mission) {
    mission.innerHTML = \`
      <h2>Our Mission</h2>
      <p>\${escapeHtml(aboutInfo.mission)}</p>
      <h2 style="margin-top: 2rem;">Why AI?</h2>
      <p>\${escapeHtml(aboutInfo.whyAi)}</p>
      <h2 style="margin-top: 2rem;">Methodology</h2>
      <ul style="list-style: none; padding: 0;">
        \${aboutInfo.methodology.map(m => \`<li style="margin-bottom: 0.5rem;"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px; margin-right: 8px; display: inline-block; vertical-align: middle;"><polyline points="20 6 9 17 4 12"></polyline></svg>\${escapeHtml(m)}</li>\`).join("")}
      </ul>
    \`;
  }
  const credibility = document.getElementById("aboutCredibility");
  if (credibility) {
    credibility.innerHTML = \`
      \${aboutInfo.credibility.map(c => \`
        <div class="glass-card" style="padding: 1.5rem;">
          <p style="margin: 0; font-weight: 500;">\${escapeHtml(c)}</p>
        </div>
      \`).join("")}
    \`;
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
  const cardsHtml = data.caseStudies.map((cs, i) => \`
    <div class="card animate-fade-up delay-\${(i%2+1)*100}">
      <div class="eyebrow">\${escapeHtml(cs.clientType)}</div>
      <h3 style="margin: 0.5rem 0 1.5rem 0;">\${escapeHtml(cs.title)}</h3>
      <div style="margin-bottom: 1.5rem;">
        <strong>Challenge:</strong>
        <p style="margin-top: 0.5rem;">\${escapeHtml(cs.challenge)}</p>
      </div>
      <div style="margin-bottom: 1.5rem;">
        <strong>Solution:</strong>
        <p style="margin-top: 0.5rem;">\${escapeHtml(cs.solution)}</p>
      </div>
      <div>
        <strong>Results:</strong>
        <ul style="margin-top: 0.5rem; padding-left: 1.5rem; color: var(--text-secondary);">
          \${cs.results.map(r => \`<li>\${escapeHtml(r)}</li>\`).join('')}
        </ul>
      </div>
      <div style="margin-top: 2rem;">
        <a href="\${escapeHtml(cs.ctaLink)}" class="btn btn-secondary">\${escapeHtml(cs.ctaLabel)}</a>
      </div>
    </div>
  \`).join('');

  if (isOldDesign) {
    container.innerHTML = \`
      <div class="container">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">Case Studies</h1>
          <p>Real outcomes from automated systems.</p>
        </div>
        <div class="grid-2">\${cardsHtml}</div>
      </div>\`;
  } else {
    container.innerHTML = cardsHtml;
  }
}

function renderFaqPage(data) {
  const intro = document.getElementById("faqIntro");
  if (intro) {
    intro.innerHTML = \`
      <div class="container">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">\${escapeHtml(data.pageContent.faq.headline)}</h1>
          <p>\${escapeHtml(data.pageContent.faq.intro)}</p>
        </div>
      </div>
    \`;
  }
  const faqList = document.getElementById("faqFullList") || document.getElementById("faqSection");
  if (!faqList) return;
  if (!data.faqs || data.faqs.length === 0) {
    faqList.innerHTML = '<div class="state-empty">No FAQs available.</div>';
    return;
  }
  const isOldDesign = faqList.id === "faqSection";
  const faqsHtml = \`
    <div style="display: flex; flex-direction: column; gap: 1rem;">
      \${data.faqs.map(faq => \`
        <details style="background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 1rem;">
          <summary style="font-weight: 600; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            \${escapeHtml(faq.question)}
          </summary>
          <p style="margin-top: 1rem; color: var(--text-secondary); line-height: 1.6;">\${escapeHtml(faq.answer)}</p>
        </details>
      \`).join("")}
    </div>
  \`;

  if (isOldDesign) {
    faqList.innerHTML = \`
      <div class="container" style="max-width: 800px;">
        <div class="section-header animate-fade-up">
          <h1 class="text-gradient">Frequently Asked Questions</h1>
        </div>
        \${faqsHtml}
      </div>\`;
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
    console.log("🛠️ [DEBUG] Detected Page:", pageType);
    console.log("🛠️ [DEBUG] Public Data Loaded:", Object.keys(publicData));
    console.log("🛠️ [DEBUG] Services Count:", publicData.services?.length || 0);
    console.log("🛠️ [DEBUG] Pricing Count:", publicData.pricingPlans?.length || 0);

    if (pageType === "home") {
      renderHome(publicData);
    } else if (pageType === "service-detail") {
      renderServiceDetailPage(publicData);
    } else if (pageType === "services") {
      console.log("🛠️ [DEBUG] Calling renderServicesPage...");
      renderServicesPage(publicData);
    } else if (pageType === "pricing") {
      console.log("🛠️ [DEBUG] Calling renderPricingPage...");
      renderPricingPage(publicData);
    } else if (pageType === "contact") {
      console.log("🛠️ [DEBUG] Calling renderContactPage...");
      renderContactPage(publicData);
    } else if (pageType === "about") {
      console.log("🛠️ [DEBUG] Calling renderAboutPage...");
      renderAboutPage(publicData);
    } else if (pageType === "faq") {
      console.log("🛠️ [DEBUG] Calling renderFaqPage...");
      renderFaqPage(publicData);
    } else if (pageType === "testimonials") {
      console.log("🛠️ [DEBUG] Calling renderTestimonialsPage...");
      renderTestimonialsPage(publicData);
    } else if (pageType === "case-studies") {
      console.log("🛠️ [DEBUG] Calling renderCaseStudiesPage...");
      renderCaseStudiesPage(publicData);
    }
  } catch (err) {
    console.error("Failed to boot public app:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  bootPublic();
});
`;

const startIndex = script.indexOf('// ============================================================================');
const targetStart = script.indexOf('// CORE PAGES RENDERING', startIndex + 50);
const realStart = script.lastIndexOf('// ============================================================================', targetStart);

if (realStart > -1) {
  const newScript = script.substring(0, realStart) + replacement;
  fs.writeFileSync('script.js', newScript);
  console.log("Successfully replaced script.js renderers");
} else {
  console.error("Could not find start index");
}
