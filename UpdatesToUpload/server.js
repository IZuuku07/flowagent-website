const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const rootDir = __dirname;
const publicContentPath = path.join(rootDir, "data", "public-content.json");
const privateRuntimePath = path.join(rootDir, "data", "private-runtime.json");
const configPath = path.join(rootDir, "server-config.json");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

const collectionMap = {
  services: "services",
  "pricing-plans": "pricingPlans",
  testimonials: "testimonials",
  "case-studies": "caseStudies",
  faqs: "faqs",
  "blog-posts": "blogPosts",
  media: "media"
};

let configCache;

// --- Public settings keys (safe to commit in public-content.json) ---
const PUBLIC_SETTINGS_KEYS = [
  "brandName", "tagline", "businessEmail", "whatsapp", "phone",
  "bookingLink", "currency", "country", "address", "logoPath",
  "defaultStripeLink", "defaultPaypalLink",
  "newsletterTitle", "newsletterText", "footerBlurb"
];

// --- Private settings keys (never committed, gitignored in private-runtime.json) ---
const PRIVATE_SETTINGS_KEYS = [
  "adminEmail", "bankName", "accountHolder", "accountNumber",
  "iban", "swift", "bankInstructions"
];

async function loadConfig() {
  if (configCache) {
    return configCache;
  }
  let fileConfig = {};
  try {
    const raw = await fs.readFile(configPath, "utf8");
    fileConfig = JSON.parse(raw);
  } catch {
    // No config file — fall back entirely to environment variables
  }
  configCache = {
    port: process.env.PORT || fileConfig.port || 3000,
    adminUsername: process.env.ADMIN_USERNAME || fileConfig.adminUsername || "",
    adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || fileConfig.adminPasswordHash || "",
    adminPasswordSalt: process.env.ADMIN_PASSWORD_SALT || fileConfig.adminPasswordSalt || "",
    passwordIterations: parseInt(process.env.ADMIN_PASSWORD_ITERATIONS || fileConfig.passwordIterations || 120000, 10),
    sessionSecret: process.env.SESSION_SECRET || fileConfig.sessionSecret || "",
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || fileConfig.stripePublishableKey || "",
    paypalClientId: process.env.PAYPAL_CLIENT_ID || fileConfig.paypalClientId || "",
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET || fileConfig.paypalClientSecret || "",
    n8nCheckoutWebhookUrl: process.env.N8N_CHECKOUT_WEBHOOK_URL || fileConfig.n8nCheckoutWebhookUrl || "",
    baseUrl: process.env.BASE_URL || fileConfig.baseUrl || "http://localhost:3000"
  };
  return configCache;
}

// --- Data file helpers ---

function createDefaultPrivateRuntime() {
  return {
    settings: {
      adminEmail: "",
      bankName: "",
      accountHolder: "",
      accountNumber: "",
      iban: "",
      swift: "",
      bankInstructions: ""
    },
    leads: [],
    bookings: [],
    newsletterSubscribers: [],
    orders: []
  };
}

async function readPublicContent() {
  const raw = await fs.readFile(publicContentPath, "utf8");
  return JSON.parse(raw);
}

async function readPrivateRuntime() {
  try {
    const raw = await fs.readFile(privateRuntimePath, "utf8");
    return JSON.parse(raw);
  } catch {
    const defaults = createDefaultPrivateRuntime();
    await fs.writeFile(privateRuntimePath, JSON.stringify(defaults, null, 2));
    return defaults;
  }
}

async function readStore() {
  const pub = await readPublicContent();
  const priv = await readPrivateRuntime();
  return {
    settings: { ...pub.settings, ...priv.settings },
    pageContent: pub.pageContent,
    seo: pub.seo,
    services: pub.services,
    pricingPlans: pub.pricingPlans,
    caseStudies: pub.caseStudies,
    testimonials: pub.testimonials,
    faqs: pub.faqs,
    blogPosts: pub.blogPosts,
    media: pub.media,
    leads: priv.leads || [],
    bookings: priv.bookings || [],
    newsletterSubscribers: priv.newsletterSubscribers || [],
    orders: priv.orders || []
  };
}

function splitSettings(settings) {
  const pub = {};
  const priv = {};
  for (const key of PUBLIC_SETTINGS_KEYS) {
    pub[key] = settings[key] !== undefined ? settings[key] : "";
  }
  for (const key of PRIVATE_SETTINGS_KEYS) {
    priv[key] = settings[key] !== undefined ? settings[key] : "";
  }
  return { pub, priv };
}

async function writePublicContent(store) {
  const { pub } = splitSettings(store.settings);
  const data = {
    settings: pub,
    pageContent: store.pageContent,
    seo: store.seo,
    services: store.services,
    pricingPlans: store.pricingPlans,
    caseStudies: store.caseStudies,
    testimonials: store.testimonials,
    faqs: store.faqs,
    blogPosts: store.blogPosts,
    media: store.media
  };
  await fs.writeFile(publicContentPath, JSON.stringify(data, null, 2));
}

async function writePrivateRuntime(store) {
  const { priv } = splitSettings(store.settings);
  const data = {
    settings: priv,
    leads: store.leads || [],
    bookings: store.bookings || [],
    newsletterSubscribers: store.newsletterSubscribers || [],
    orders: store.orders || []
  };
  await fs.writeFile(privateRuntimePath, JSON.stringify(data, null, 2));
}

async function writeStore(data) {
  await writePublicContent(data);
  await writePrivateRuntime(data);
}

async function writePublicOnly(store) {
  await writePublicContent(store);
}

async function writePrivateOnly(store) {
  await writePrivateRuntime(store);
}

function sendJson(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    ...headers
  });
  res.end(JSON.stringify(data));
}

function sendText(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    ...extraHeaders
  });
  res.end(payload);
}

async function parseJsonBody(req, maxBytes = 1048576) {
  const chunks = [];
  let totalSize = 0;
  for await (const chunk of req) {
    totalSize += chunk.length;
    if (totalSize > maxBytes) {
      throw Object.assign(new Error("Request body too large"), { statusCode: 413 });
    }
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    throw Object.assign(new Error("Invalid JSON body"), { statusCode: 400 });
  }
}

const rateLimitMap = new Map();

function rateLimit(key, maxRequests, windowMs) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now - entry.start > windowMs) {
    rateLimitMap.set(key, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > maxRequests;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now - entry.start > 300000) rateLimitMap.delete(key);
  }
}, 300000).unref();

function addSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
}

function escapeXml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function parseCookies(req) {
  const cookieHeader = req.headers.cookie || "";
  return cookieHeader.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) {
      return acc;
    }
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function createSessionValue(username, secret) {
  const signature = crypto.createHmac("sha256", secret).update(username).digest("hex");
  return `${username}.${signature}`;
}

function verifyPassword(password, config) {
  const hash = crypto
    .pbkdf2Sync(
      password,
      config.adminPasswordSalt,
      Number(config.passwordIterations || 120000),
      64,
      "sha512"
    )
    .toString("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(config.adminPasswordHash, "hex")
    );
  } catch {
    return false;
  }
}

function verifySession(req, config) {
  const cookies = parseCookies(req);
  const session = cookies.flowagent_session;
  if (!session) {
    return false;
  }

  const [username, signature] = session.split(".");
  if (!username || !signature || username !== config.adminUsername) {
    return false;
  }

  const expected = crypto.createHmac("sha256", config.sessionSecret).update(username).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

function ensureAdmin(req, res, config) {
  if (!verifySession(req, config)) {
    sendJson(res, 401, { error: "Unauthorized" });
    return false;
  }
  return true;
}

function sanitizePublicData(store, config) {
  // Return only public settings — strip private fields
  const publicSettings = {};
  for (const key of PUBLIC_SETTINGS_KEYS) {
    publicSettings[key] = store.settings[key] !== undefined ? store.settings[key] : "";
  }
  return {
    settings: publicSettings,
    pageContent: store.pageContent,
    seo: store.seo,
    services: store.services,
    pricingPlans: store.pricingPlans,
    caseStudies: store.caseStudies,
    testimonials: store.testimonials,
    faqs: store.faqs,
    blogPosts: store.blogPosts,
    media: store.media,
    paymentConfig: {
      stripePublishableKey: config.stripePublishableKey,
      paypalClientId: config.paypalClientId
    },
    bankDetails: {
      bankName: store.settings.bankName || "",
      accountHolder: store.settings.accountHolder || "",
      accountNumber: store.settings.accountNumber || "",
      iban: store.settings.iban || "",
      swift: store.settings.swift || ""
    }
  };
}

function normalizeList(value) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}

function normalizeFaqList(value) {
  return Array.isArray(value)
    ? value
        .map((item) => ({
          question: String(item.question || "").trim(),
          answer: String(item.answer || "").trim()
        }))
        .filter((item) => item.question && item.answer)
    : [];
}

function normalizeCollectionItem(collection, body, existingId) {
  if (collection === "services") {
    return {
      id: existingId || body.id || crypto.randomUUID(),
      slug: String(body.slug || "").trim(),
      title: String(body.title || "").trim(),
      price: String(body.price || "").trim(),
      description: String(body.description || "").trim(),
      audience: String(body.audience || "").trim(),
      benefits: normalizeList(body.benefits),
      deliverables: normalizeList(body.deliverables),
      useCases: normalizeList(body.useCases),
      outcomes: normalizeList(body.outcomes),
      faq: normalizeFaqList(body.faq),
      stripeLink: String(body.stripeLink || "").trim(),
      paypalLink: String(body.paypalLink || "").trim(),
      imageUrl: String(body.imageUrl || "").trim(),
      imageAlt: String(body.imageAlt || "").trim(),
      featured: Boolean(body.featured)
    };
  }

  if (collection === "pricingPlans") {
    return {
      id: existingId || body.id || crypto.randomUUID(),
      name: String(body.name || "").trim(),
      price: String(body.price || "").trim(),
      summary: String(body.summary || "").trim(),
      features: normalizeList(body.features),
      comparisonLabel: String(body.comparisonLabel || "").trim(),
      stripeLink: String(body.stripeLink || "").trim(),
      paypalLink: String(body.paypalLink || "").trim(),
      highlight: Boolean(body.highlight)
    };
  }

  if (collection === "testimonials") {
    return {
      id: existingId || body.id || crypto.randomUUID(),
      name: String(body.name || "").trim(),
      role: String(body.role || "").trim(),
      company: String(body.company || "").trim(),
      rating: Number(body.rating || 5),
      quote: String(body.quote || "").trim(),
      result: String(body.result || "").trim()
    };
  }

  if (collection === "caseStudies") {
    return {
      id: existingId || body.id || crypto.randomUUID(),
      slug: String(body.slug || "").trim(),
      title: String(body.title || "").trim(),
      clientType: String(body.clientType || "").trim(),
      challenge: String(body.challenge || "").trim(),
      solution: String(body.solution || "").trim(),
      results: normalizeList(body.results),
      ctaLabel: String(body.ctaLabel || "").trim(),
      ctaLink: String(body.ctaLink || "").trim()
    };
  }

  if (collection === "faqs") {
    return {
      id: existingId || body.id || crypto.randomUUID(),
      category: String(body.category || "").trim(),
      question: String(body.question || "").trim(),
      answer: String(body.answer || "").trim()
    };
  }

  if (collection === "blogPosts") {
    return {
      id: existingId || body.id || crypto.randomUUID(),
      slug: String(body.slug || "").trim(),
      title: String(body.title || "").trim(),
      excerpt: String(body.excerpt || "").trim(),
      category: String(body.category || "").trim(),
      tags: normalizeList(body.tags),
      author: String(body.author || "").trim(),
      publishedAt: String(body.publishedAt || "").trim(),
      metaDescription: String(body.metaDescription || "").trim(),
      contentHtml: String(body.contentHtml || "").trim()
    };
  }

  return {
    id: existingId || body.id || crypto.randomUUID(),
    name: String(body.name || "").trim(),
    url: String(body.url || "").trim(),
    alt: String(body.alt || "").trim()
  };
}

function normalizeSettings(body, previous) {
  return {
    ...previous,
    brandName: String(body.brandName || "").trim(),
    tagline: String(body.tagline || "").trim(),
    businessEmail: String(body.businessEmail || "").trim(),
    adminEmail: String(body.adminEmail || "").trim(),
    whatsapp: String(body.whatsapp || "").trim(),
    phone: String(body.phone || "").trim(),
    bookingLink: String(body.bookingLink || "").trim(),
    currency: String(body.currency || "").trim(),
    country: String(body.country || "").trim(),
    address: String(body.address || "").trim(),
    logoPath: String(body.logoPath || "").trim(),
    defaultStripeLink: String(body.defaultStripeLink || "").trim(),
    defaultPaypalLink: String(body.defaultPaypalLink || "").trim(),
    bankName: String(body.bankName || "").trim(),
    accountHolder: String(body.accountHolder || "").trim(),
    accountNumber: String(body.accountNumber || "").trim(),
    iban: String(body.iban || "").trim(),
    swift: String(body.swift || "").trim(),
    bankInstructions: String(body.bankInstructions || "").trim(),
    newsletterTitle: String(body.newsletterTitle || "").trim(),
    newsletterText: String(body.newsletterText || "").trim(),
    footerBlurb: String(body.footerBlurb || "").trim()
  };
}

function normalizePageContent(body, previous) {
  return {
    ...previous,
    home: { ...previous.home, ...(body.home || {}) },
    about: { ...previous.about, ...(body.about || {}) },
    pricing: { ...previous.pricing, ...(body.pricing || {}) },
    contact: { ...previous.contact, ...(body.contact || {}) },
    faq: { ...previous.faq, ...(body.faq || {}) },
    blog: { ...previous.blog, ...(body.blog || {}) }
  };
}

function normalizeSeo(body, previous) {
  return {
    ...previous,
    defaultTitle: String(body.defaultTitle || previous.defaultTitle || "").trim(),
    defaultDescription: String(body.defaultDescription || previous.defaultDescription || "").trim(),
    siteUrl: String(body.siteUrl || previous.siteUrl || "").trim(),
    twitterHandle: String(body.twitterHandle || previous.twitterHandle || "").trim(),
    pages: typeof body.pages === "object" && body.pages ? body.pages : previous.pages
  };
}

async function handleCollection(req, res, config, store, collectionKey, itemId) {
  if (!ensureAdmin(req, res, config)) {
    return true;
  }

  const collection = store[collectionKey];
  if (!Array.isArray(collection)) {
    sendJson(res, 404, { error: "Collection not found" });
    return true;
  }

  if (req.method === "POST" && !itemId) {
    const body = await parseJsonBody(req);
    const item = normalizeCollectionItem(collectionKey, body);
    collection.push(item);
    await writePublicOnly(store);
    sendJson(res, 201, { item });
    return true;
  }

  if (req.method === "PUT" && itemId) {
    const index = collection.findIndex((item) => item.id === itemId);
    if (index < 0) {
      sendJson(res, 404, { error: "Item not found" });
      return true;
    }

    const body = await parseJsonBody(req);
    collection[index] = normalizeCollectionItem(collectionKey, body, itemId);
    await writePublicOnly(store);
    sendJson(res, 200, { item: collection[index] });
    return true;
  }

  if (req.method === "DELETE" && itemId) {
    store[collectionKey] = collection.filter((item) => item.id !== itemId);
    await writePublicOnly(store);
    sendJson(res, 200, { success: true });
    return true;
  }

  return false;
}

async function serveStatic(res, pathname) {
  let requestedPath = pathname === "/" ? "/index.html" : pathname;
  let filePath = path.normalize(path.join(rootDir, requestedPath));

  if (!filePath.startsWith(rootDir)) {
    sendText(res, 403, "Forbidden");
    return;
  }

  if (!path.extname(filePath)) {
    if (pathname.startsWith("/blog/") && pathname !== "/blog") {
      filePath = path.join(rootDir, "blog", "post.html");
    } else if (pathname.startsWith("/services/") && pathname !== "/services") {
      filePath = path.join(rootDir, "service-detail.html");
    } else {
    const htmlCandidate = `${filePath}.html`;
    const indexCandidate = path.join(filePath, "index.html");
    try {
      await fs.access(htmlCandidate);
      filePath = htmlCandidate;
    } catch {
      try {
        await fs.access(indexCandidate);
        filePath = indexCandidate;
      } catch {
        sendText(res, 404, "Not found");
        return;
      }
    }
    }
  }

  try {
    const content = await fs.readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    res.end(content);
  } catch {
    sendText(res, 404, "Not found");
  }
}

async function updatePassword(req, res, config) {
  if (!ensureAdmin(req, res, config)) {
    return;
  }

  const body = await parseJsonBody(req);
  const currentPassword = String(body.currentPassword || "");
  const nextPassword = String(body.nextPassword || "");

  if (!verifyPassword(currentPassword, config)) {
    sendJson(res, 400, { error: "Current password is incorrect" });
    return;
  }

  if (nextPassword.length < 10) {
    sendJson(res, 400, { error: "New password must be at least 10 characters" });
    return;
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(nextPassword, salt, Number(config.passwordIterations || 120000), 64, "sha512")
    .toString("hex");

  const nextConfig = {
    ...config,
    adminPasswordHash: hash,
    adminPasswordSalt: salt
  };

  await fs.writeFile(configPath, JSON.stringify(nextConfig, null, 2));
  configCache = nextConfig;
  sendJson(res, 200, { success: true });
}

async function requestHandler(req, res) {
  const config = await loadConfig();
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  addSecurityHeaders(res);

  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;

  if (req.method === "GET" && pathname === "/api/public-data") {
    const store = await readStore();
    sendJson(res, 200, sanitizePublicData(store, config));
    return;
  }

  if (req.method === "POST" && pathname === "/api/login") {
    if (rateLimit(`login:${clientIp}`, 5, 60000)) {
      sendJson(res, 429, { error: "Too many login attempts. Try again later." });
      return;
    }
    const body = await parseJsonBody(req);
    if (
      String(body.username || "") !== config.adminUsername ||
      !verifyPassword(String(body.password || ""), config)
    ) {
      sendJson(res, 401, { error: "Invalid credentials" });
      return;
    }

    const sessionValue = createSessionValue(config.adminUsername, config.sessionSecret);
    sendJson(
      res,
      200,
      { success: true },
      {
        "Set-Cookie": `flowagent_session=${encodeURIComponent(sessionValue)}; HttpOnly; Path=/; SameSite=Lax${req.headers.host && !req.headers.host.includes("localhost") ? "; Secure" : ""}`
      }
    );
    return;
  }

  if (req.method === "POST" && pathname === "/api/logout") {
    sendJson(
      res,
      200,
      { success: true },
      {
        "Set-Cookie": "flowagent_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
      }
    );
    return;
  }

  if (req.method === "GET" && pathname === "/api/admin-data") {
    if (!ensureAdmin(req, res, config)) {
      return;
    }
    const store = await readStore();
    sendJson(res, 200, store);
    return;
  }

  if (req.method === "PUT" && pathname === "/api/settings") {
    if (!ensureAdmin(req, res, config)) {
      return;
    }
    const body = await parseJsonBody(req);
    const store = await readStore();
    store.settings = normalizeSettings(body, store.settings);
    await writeStore(store);
    sendJson(res, 200, { settings: store.settings });
    return;
  }

  if (req.method === "PUT" && pathname === "/api/page-content") {
    if (!ensureAdmin(req, res, config)) {
      return;
    }
    const body = await parseJsonBody(req);
    const store = await readStore();
    store.pageContent = normalizePageContent(body, store.pageContent);
    await writePublicOnly(store);
    sendJson(res, 200, { pageContent: store.pageContent });
    return;
  }

  if (req.method === "PUT" && pathname === "/api/seo") {
    if (!ensureAdmin(req, res, config)) {
      return;
    }
    const body = await parseJsonBody(req);
    const store = await readStore();
    store.seo = normalizeSeo(body, store.seo);
    await writePublicOnly(store);
    sendJson(res, 200, { seo: store.seo });
    return;
  }

  if (req.method === "POST" && pathname === "/api/forms/contact") {
    if (rateLimit(`form:${clientIp}`, 10, 60000)) {
      sendJson(res, 429, { error: "Too many requests. Try again later." });
      return;
    }
    const body = await parseJsonBody(req);
    const store = await readStore();
    store.leads.unshift({
      id: crypto.randomUUID(),
      type: "contact",
      status: "new",
      submittedAt: new Date().toISOString(),
      name: String(body.name || "").trim(),
      email: String(body.email || "").trim(),
      phone: String(body.phone || "").trim(),
      company: String(body.company || "").trim(),
      service: String(body.service || "").trim(),
      budget: String(body.budget || "").trim(),
      preferredContact: String(body.preferredContact || "").trim(),
      message: String(body.message || "").trim()
    });
    await writePrivateOnly(store);
    sendJson(res, 201, { success: true });
    return;
  }

  if (req.method === "POST" && pathname === "/api/forms/booking") {
    if (rateLimit(`form:${clientIp}`, 10, 60000)) {
      sendJson(res, 429, { error: "Too many requests. Try again later." });
      return;
    }
    const body = await parseJsonBody(req);
    const store = await readStore();
    store.bookings.unshift({
      id: crypto.randomUUID(),
      status: "new",
      submittedAt: new Date().toISOString(),
      name: String(body.name || "").trim(),
      email: String(body.email || "").trim(),
      phone: String(body.phone || "").trim(),
      company: String(body.company || "").trim(),
      service: String(body.service || "").trim(),
      preferredDate: String(body.preferredDate || "").trim(),
      preferredTime: String(body.preferredTime || "").trim(),
      message: String(body.message || "").trim()
    });
    await writePrivateOnly(store);
    sendJson(res, 201, { success: true });
    return;
  }

  if (req.method === "POST" && pathname === "/api/forms/quote") {
    if (rateLimit(`form:${clientIp}`, 10, 60000)) {
      sendJson(res, 429, { error: "Too many requests. Try again later." });
      return;
    }
    const body = await parseJsonBody(req);
    const store = await readStore();
    store.leads.unshift({
      id: crypto.randomUUID(),
      type: "quote",
      status: "new",
      submittedAt: new Date().toISOString(),
      name: String(body.name || "").trim(),
      email: String(body.email || "").trim(),
      phone: String(body.phone || "").trim(),
      company: String(body.company || "").trim(),
      service: String(body.service || "").trim(),
      budget: String(body.budget || "").trim(),
      preferredContact: String(body.preferredContact || "").trim(),
      message: String(body.message || "").trim()
    });
    await writePrivateOnly(store);
    sendJson(res, 201, { success: true });
    return;
  }

  if (req.method === "POST" && pathname === "/api/forms/newsletter") {
    if (rateLimit(`form:${clientIp}`, 10, 60000)) {
      sendJson(res, 429, { error: "Too many requests. Try again later." });
      return;
    }
    const body = await parseJsonBody(req);
    const store = await readStore();
    store.newsletterSubscribers.unshift({
      id: crypto.randomUUID(),
      email: String(body.email || "").trim(),
      submittedAt: new Date().toISOString()
    });
    await writePrivateOnly(store);
    sendJson(res, 201, { success: true });
    return;
  }

  if (req.method === "PATCH" && pathname.startsWith("/api/leads/")) {
    if (!ensureAdmin(req, res, config)) {
      return;
    }
    const leadId = pathname.split("/").pop();
    const body = await parseJsonBody(req);
    const store = await readStore();
    const index = store.leads.findIndex((item) => item.id === leadId);
    if (index < 0) {
      sendJson(res, 404, { error: "Lead not found" });
      return;
    }
    store.leads[index].status = String(body.status || "new");
    await writePrivateOnly(store);
    sendJson(res, 200, { lead: store.leads[index] });
    return;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/leads/")) {
    if (!ensureAdmin(req, res, config)) {
      return;
    }
    const leadId = pathname.split("/").pop();
    const store = await readStore();
    store.leads = store.leads.filter((item) => item.id !== leadId);
    await writePrivateOnly(store);
    sendJson(res, 200, { success: true });
    return;
  }

  if (req.method === "PATCH" && pathname.startsWith("/api/bookings/")) {
    if (!ensureAdmin(req, res, config)) {
      return;
    }
    const bookingId = pathname.split("/").pop();
    const body = await parseJsonBody(req);
    const store = await readStore();
    const index = store.bookings.findIndex((item) => item.id === bookingId);
    if (index < 0) {
      sendJson(res, 404, { error: "Booking not found" });
      return;
    }
    store.bookings[index].status = String(body.status || "new");
    await writePrivateOnly(store);
    sendJson(res, 200, { booking: store.bookings[index] });
    return;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/bookings/")) {
    if (!ensureAdmin(req, res, config)) {
      return;
    }
    const bookingId = pathname.split("/").pop();
    const store = await readStore();
    store.bookings = store.bookings.filter((item) => item.id !== bookingId);
    await writePrivateOnly(store);
    sendJson(res, 200, { success: true });
    return;
  }

  if (req.method === "POST" && pathname === "/api/account/password") {
    await updatePassword(req, res, config);
    return;
  }

  // --- CHECKOUT API ROUTES ---
  if (req.method === "POST" && pathname === "/api/checkout/create-order") {
    const body = await parseJsonBody(req);
    const store = await readStore();
    
    // Find service or pricing plan
    const service = store.services.find(s => s.id === body.serviceId) || store.pricingPlans.find(p => p.id === body.serviceId);
    if (!service) {
      sendJson(res, 404, { error: "Service not found" });
      return;
    }

    const priceMatch = service.price.match(/\d+(\.\d+)?/);
    const numericPrice = priceMatch ? parseFloat(priceMatch[0]) : 0;

    const newOrder = {
      id: crypto.randomUUID(),
      serviceId: service.id,
      serviceName: service.title || service.name,
      price: numericPrice,
      currency: "EUR",
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientWhatsApp: body.clientWhatsApp,
      paymentMethod: body.paymentMethod, // 'paypal' or 'bank'
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: new Date().toISOString()
    };

    store.orders.unshift(newOrder);
    await writePrivateOnly(store);

    if (body.paymentMethod === "paypal") {
      // Create PayPal order via REST API if configured
      if (!config.paypalClientId || !config.paypalClientSecret) {
        sendJson(res, 500, { error: "PayPal credentials not configured on server" });
        return;
      }
      
      try {
        const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Accept-Language": "en_US",
            "Authorization": "Basic " + Buffer.from(`${config.paypalClientId}:${config.paypalClientSecret}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: "grant_type=client_credentials"
        });
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [{
              reference_id: newOrder.id,
              amount: {
                currency_code: newOrder.currency,
                value: newOrder.price.toFixed(2)
              },
              description: newOrder.serviceName
            }]
          })
        });
        
        const orderData = await orderRes.json();
        
        if (!orderRes.ok) {
          throw new Error(orderData.message || "Failed to create PayPal order");
        }

        // Update local order with paypalOrderId
        newOrder.paypalOrderId = orderData.id;
        await writePrivateOnly(store);

        sendJson(res, 200, { orderId: newOrder.id, paypalOrderId: orderData.id });
      } catch (err) {
        console.error("PayPal Create Error:", err);
        sendJson(res, 500, { error: "Failed to initialize PayPal transaction" });
      }
    } else {
      sendJson(res, 200, { orderId: newOrder.id });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/checkout/capture-paypal") {
    const body = await parseJsonBody(req);
    const store = await readStore();
    
    const orderIndex = store.orders.findIndex(o => o.id === body.orderId && o.paypalOrderId === body.paypalOrderId);
    if (orderIndex < 0) {
      sendJson(res, 404, { error: "Order not found" });
      return;
    }

    try {
      const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": "Basic " + Buffer.from(`${config.paypalClientId}:${config.paypalClientSecret}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
      });
      const tokenData = await tokenRes.json();
      
      const captureRes = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${body.paypalOrderId}/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenData.access_token}`
        }
      });
      
      const captureData = await captureRes.json();
      
      if (captureData.status === "COMPLETED") {
        store.orders[orderIndex].paymentStatus = "paid";
        store.orders[orderIndex].status = "completed"; // Or 'in_progress' depending on workflow
        await writePrivateOnly(store);
        
        // Trigger n8n Webhook
        if (config.n8nCheckoutWebhookUrl) {
          fetch(config.n8nCheckoutWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(store.orders[orderIndex])
          }).catch(e => console.error("Webhook trigger failed:", e));
        }

        sendJson(res, 200, { success: true, order: store.orders[orderIndex] });
      } else {
        sendJson(res, 400, { error: "Payment not completed in PayPal" });
      }
    } catch (err) {
      console.error("PayPal Capture Error:", err);
      sendJson(res, 500, { error: "Failed to capture payment" });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/checkout/bank-transfer") {
    const body = await parseJsonBody(req);
    const store = await readStore();
    
    const orderIndex = store.orders.findIndex(o => o.id === body.orderId);
    if (orderIndex < 0) {
      sendJson(res, 404, { error: "Order not found" });
      return;
    }

    store.orders[orderIndex].status = "awaiting_transfer";
    await writePrivateOnly(store);

    // Trigger n8n Webhook
    if (config.n8nCheckoutWebhookUrl) {
      fetch(config.n8nCheckoutWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store.orders[orderIndex])
      }).catch(e => console.error("Webhook trigger failed:", e));
    }

    sendJson(res, 200, { success: true, order: store.orders[orderIndex] });
    return;
  }
  // --- END CHECKOUT ROUTES ---

  // --- ORDER MANAGEMENT API ---
  if (req.method === "PATCH" && pathname.startsWith("/api/orders/")) {
    if (!ensureAdmin(req, res, config)) return;
    
    const orderId = pathname.split("/").pop();
    const body = await parseJsonBody(req);
    const store = await readStore();
    
    const index = store.orders.findIndex(o => o.id === orderId);
    if (index < 0) {
      sendJson(res, 404, { error: "Order not found" });
      return;
    }

    if (body.action === "mark_paid") {
      store.orders[index].paymentStatus = "paid";
      if (store.orders[index].status === "awaiting_transfer" || store.orders[index].status === "pending") {
        store.orders[index].status = "in_progress";
      }
    } else if (body.action === "mark_completed") {
      store.orders[index].status = "completed";
    } else if (body.action === "cancel") {
      store.orders[index].status = "cancelled";
    }

    await writePrivateOnly(store);
    sendJson(res, 200, { success: true, order: store.orders[index] });
    return;
  }
  // --- END ORDER MANAGEMENT ---

  if (pathname.startsWith("/api/collections/")) {
    const parts = pathname.replace("/api/collections/", "").split("/").filter(Boolean);
    const collectionSegment = parts[0];
    const itemId = parts[1];
    const collectionKey = collectionMap[collectionSegment];
    if (!collectionKey) {
      sendJson(res, 404, { error: "Collection not found" });
      return;
    }

    const store = await readStore();
    const handled = await handleCollection(req, res, config, store, collectionKey, itemId);
    if (handled) {
      return;
    }
  }

  if (req.method === "GET" && pathname === "/robots.txt") {
    const robots = `User-agent: *\nAllow: /\nSitemap: ${config.baseUrl}/sitemap.xml\n`;
    sendText(res, 200, robots);
    return;
  }

  if (req.method === "GET" && pathname === "/sitemap.xml") {
    const store = await readStore();
    const staticPages = [
      "/",
      "/services",
      "/about",
      "/pricing",
      "/case-studies",
      "/testimonials",
      "/blog",
      "/contact",
      "/faq"
    ];
    const servicePages = store.services.map((service) => `/services/${service.slug}`);
    const blogPages = store.blogPosts.map((post) => `/blog/${post.slug}`);
    const urls = staticPages.concat(servicePages, blogPages);
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((item) => `  <url><loc>${escapeXml(config.baseUrl + item)}</loc></url>`)
      .join("\n")}\n</urlset>`;
    res.writeHead(200, { "Content-Type": "application/xml; charset=utf-8" });
    res.end(xml);
    return;
  }

  await serveStatic(res, pathname);
}

const server = http.createServer((req, res) => {
  requestHandler(req, res).catch((error) => {
    console.error(error);
    const code = error.statusCode || 500;
    sendJson(res, code, { error: code === 500 ? "Server error" : error.message });
  });
});

loadConfig()
  .then((config) => {
    const port = process.env.PORT || config.port || 3000;
    server.listen(port, () => {
      console.log(`FlowAgent server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });

// Graceful shutdown
function shutdown() {
  console.log("Shutting down...");
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
