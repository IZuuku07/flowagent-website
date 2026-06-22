// ==========================================
// WHATSAPP CHAT SIMULATOR & ROI CALCULATOR
// Vanilla JavaScript — No Dependencies
// ==========================================

// ------------------------------------------
// Chat State
// ------------------------------------------
const chatState = {
  messages: [],
  currentScenario: null,
  conversationStep: 0,
  isTyping: false,
  typingTimeout: null
};

// ------------------------------------------
// Scenario Definitions
// Each scenario is a keyed object containing:
//   introText   — the bot's opening message
//   introReplies — quick-reply buttons for the intro
//   triggers    — words that auto-select this scenario
//   steps[]     — sequential bot responses
// ------------------------------------------
const scenarios = {

  // ---- Scenario 1: Order Tracking ----
  orderTracking: {
    introText: "Hey! 👋 Welcome to StyleStore. How can I help you today?",
    introReplies: ["Where's my order?", "Browse products", "I need a refund", "Shipping info"],
    triggers: ["order", "track", "where", "delivery", "shipped"],
    steps: [
      {
        text: "Sure! Could you share your order number? It usually starts with #ORD-",
        quickReplies: []
      },
      {
        text: "Found it! ✅\n\n*Order #ORD-7834*\n📦 Status: Out for delivery\n🚚 Carrier: DHL Express\n📅 Expected: Today by 6 PM\n📍 Last location: Local sorting facility\n\nWant me to send you a live tracking link?",
        quickReplies: ["Yes, send link", "Contact driver", "Change address"]
      },
      {
        text: "Done! 📲 I've sent the tracking link to your WhatsApp. You'll also get a notification when the driver is 10 minutes away.\n\nAnything else I can help with?",
        quickReplies: ["Browse products", "I need a refund", "That's all, thanks!"]
      }
    ]
  },

  // ---- Scenario 2: Product Inquiry ----
  productInquiry: {
    introText: "Hey! 👋 Welcome to StyleStore. How can I help you today?",
    introReplies: ["Where's my order?", "Browse products", "I need a refund", "Shipping info"],
    triggers: ["product", "hoodie", "size", "stock", "browse", "catalog", "buy"],
    steps: [
      {
        text: "Let me check that for you... 🔍\n\n*Classic Black Hoodie*\n✅ In stock: Size XL\n💰 Price: $49.99\n🏷️ Sale: 20% off today → *$39.99*\n\nWant me to add it to your cart?",
        quickReplies: ["Add to cart", "Show other colors", "Similar items"]
      },
      {
        text: "Added to cart! 🛒\n\nBased on your style, you might also like:\n• *Slim Fit Joggers* — $34.99\n• *Canvas Sneakers* — $59.99\n\nShall I add anything else or proceed to checkout?",
        quickReplies: ["Proceed to checkout", "Keep browsing", "Remove from cart"]
      }
    ]
  },

  // ---- Scenario 3: Returns & Refunds ----
  returnsRefunds: {
    introText: "Hey! 👋 Welcome to StyleStore. How can I help you today?",
    introReplies: ["Where's my order?", "Browse products", "I need a refund", "Shipping info"],
    triggers: ["return", "refund", "money back", "exchange", "damaged"],
    steps: [
      {
        text: "No worries, I can help with that! 📋\n\nCould you share your order number so I can pull up the details?",
        quickReplies: []
      },
      {
        text: "Got it! Here are the details:\n\n*Order #ORD-6521*\n📅 Ordered: June 15\n📦 Items: Classic Black Hoodie (XL)\n\n✅ This order is eligible for return (within 30-day window).\n\nWould you like a *refund* or an *exchange*?",
        quickReplies: ["Refund to card", "Exchange for different size", "Store credit"]
      },
      {
        text: "Perfect! I've initiated your return. ✅\n\n📧 Return label sent to your email\n📦 Drop off at any DHL point\n💳 Refund in 3-5 business days\n\nIs there anything else?",
        quickReplies: ["Where's my order?", "Browse products", "That's all, thanks!"]
      }
    ]
  },

  // ---- Scenario 4: Product Recommendations ----
  recommendations: {
    introText: "Hey! 👋 Welcome to StyleStore. How can I help you today?",
    introReplies: ["Where's my order?", "Browse products", "I need a refund", "Shipping info"],
    triggers: ["recommend", "suggest", "what should", "popular", "best seller"],
    steps: [
      {
        text: "Great question! 😊 What's the occasion?\n\n🏋️ Athletic / Gym\n👔 Smart Casual\n🏖️ Summer / Beach\n🎉 Going out",
        quickReplies: ["Athletic / Gym", "Smart Casual", "Summer", "Going out"]
      },
      {
        text: "Here are my top picks for you! 🔥\n\n1. *Performance Tank Top* — $24.99 ⭐ 4.8\n2. *Compression Shorts* — $29.99 ⭐ 4.9\n3. *Lightweight Runners* — $79.99 ⭐ 4.7\n\n📦 Free shipping on orders over $50!\n\nWant details on any of these?",
        quickReplies: ["Tell me about item 1", "Add all to cart", "Show more options"]
      }
    ]
  },

  // ---- Scenario 5: FAQ / Shipping Policy ----
  shippingFAQ: {
    introText: "Hey! 👋 Welcome to StyleStore. How can I help you today?",
    introReplies: ["Where's my order?", "Browse products", "I need a refund", "Shipping info"],
    triggers: ["shipping", "ship", "deliver", "faq", "policy", "how long"],
    steps: [
      {
        text: "Here's everything about our shipping! 🚚\n\n*Standard Shipping* — Free (5-7 days)\n*Express Shipping* — $9.99 (2-3 days)\n*Next Day* — $14.99 (order before 2 PM)\n\n🌍 We ship to 45+ countries\n📦 All orders include tracking\n🔄 Free returns within 30 days\n\nAnything specific you'd like to know?",
        quickReplies: ["Do you ship to my country?", "Track my order", "Return policy"]
      },
      {
        text: "We currently ship to all EU countries, US, Canada, UK, Australia, and most of Asia. 🌍\n\nIf your country isn't listed at checkout, drop us a message and we'll sort it out!\n\nCan I help with anything else?",
        quickReplies: ["Where's my order?", "Browse products", "That's all, thanks!"]
      }
    ]
  },

  // ---- Scenario 6: Human Handoff ----
  humanHandoff: {
    introText: "Hey! 👋 Welcome to StyleStore. How can I help you today?",
    introReplies: ["Where's my order?", "Browse products", "I need a refund", "Shipping info"],
    triggers: ["human", "agent", "person", "real person", "talk to", "representative", "support"],
    steps: [
      {
        text: "Of course! Let me connect you with our team. 🤝\n\n*Agent Sarah* is available now.\n⏱️ Estimated wait: Under 2 minutes\n\nWhile you wait, could you briefly describe your issue so Sarah can help faster?",
        quickReplies: []
      },
      {
        text: "Thanks! I've shared that with Sarah. 📋\n\n✅ *You're now #1 in queue*\n💬 Sarah will be with you shortly\n\nIn the meantime, you can also:\n📧 Email: support@stylestore.com\n📱 Call: +1 (800) 555-0123\n\nWe'll take great care of you! 🙏",
        quickReplies: ["Where's my order?", "Browse products", "That's all, thanks!"]
      }
    ]
  }
};


// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Returns the current time as a HH:MM string (24-hour format).
 */
function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parses WhatsApp-style *bold* into <strong> tags
 * and preserves newlines as <br>.
 */
function formatMessage(text) {
  // Escape HTML entities first to prevent injection
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Convert *bold* to <strong> (non-greedy, single-line segments)
  formatted = formatted.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');

  // Convert newlines to <br>
  formatted = formatted.replace(/\n/g, '<br>');

  return formatted;
}

/**
 * Smoothly scrolls the chat messages container to the bottom.
 */
function scrollToBottom() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  container.scrollTo({
    top: container.scrollHeight,
    behavior: 'smooth'
  });
}


// ==========================================
// CHAT ENGINE
// ==========================================

/**
 * Initializes the chat on page load.
 * Binds form submission, wires up scenario buttons,
 * and loads the default scenario.
 */
function initChat() {
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');

  // Handle form submission (Send button or Enter key)
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const text = input.value.trim();
      if (text) {
        sendMessage(text);
        input.value = '';
      }
    });
  }

  // Wire up scenario selector buttons
  const scenarioButtons = document.querySelectorAll('.scenario-btn');
  scenarioButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const key = btn.getAttribute('data-scenario');
      if (key && scenarios[key]) {
        // Update active state on buttons
        scenarioButtons.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        loadScenario(key);
      }
    });
  });

  // Load the default scenario
  loadScenario('orderTracking');
}

/**
 * Resets the chat state and loads a new scenario.
 * Shows the bot's intro message with quick replies.
 */
function loadScenario(scenarioKey) {
  const scenario = scenarios[scenarioKey];
  if (!scenario) return;

  // Clear any pending typing timeout
  if (chatState.typingTimeout) {
    clearTimeout(chatState.typingTimeout);
  }

  // Reset state
  chatState.messages = [];
  chatState.currentScenario = scenarioKey;
  chatState.conversationStep = 0;
  chatState.isTyping = false;
  chatState.typingTimeout = null;

  // Clear the DOM
  const container = document.getElementById('chatMessages');
  if (container) container.innerHTML = '';
  clearQuickReplies();

  // Show intro bot message after a brief delay for natural feel
  setTimeout(function () {
    addMessage(scenario.introText, 'incoming', {
      quickReplies: scenario.introReplies,
      time: getCurrentTime()
    });
  }, 400);
}

/**
 * Sends a user message and triggers the bot response flow.
 * Called when the user types text or clicks a quick reply.
 */
function sendMessage(text) {
  if (!text || chatState.isTyping) return;

  // If no scenario is loaded yet, try to detect one from the text
  if (!chatState.currentScenario) {
    loadScenario('orderTracking');
  }

  // Clear existing quick replies
  clearQuickReplies();

  // Add user's outgoing message
  addMessage(text, 'outgoing', { time: getCurrentTime() });

  // On the first user message (step 0), check if the text
  // matches triggers for a *different* scenario
  if (chatState.conversationStep === 0) {
    const detected = detectScenario(text);
    if (detected && detected !== chatState.currentScenario) {
      chatState.currentScenario = detected;
      chatState.conversationStep = 0;

      // Update active button state
      const scenarioButtons = document.querySelectorAll('.scenario-btn');
      scenarioButtons.forEach(function (b) {
        if (b.getAttribute('data-scenario') === detected) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
    }
  }

  // Show typing indicator, then respond
  showTypingIndicator();

  const delay = 1000 + Math.random() * 1000; // 1000-2000ms
  chatState.typingTimeout = setTimeout(function () {
    hideTypingIndicator();

    const response = getBotResponse();
    if (response) {
      addMessage(response.text, 'incoming', {
        quickReplies: response.quickReplies,
        time: getCurrentTime()
      });
    }
  }, delay);
}

/**
 * Creates a message DOM element and appends it to the chat.
 *
 * @param {string} text     — message body (may contain *bold* and \n)
 * @param {string} type     — 'incoming' or 'outgoing'
 * @param {object} options  — { quickReplies: string[], time: string }
 */
function addMessage(text, type, options) {
  options = options || {};
  const time = options.time || getCurrentTime();
  const quickReplies = options.quickReplies || [];

  const container = document.getElementById('chatMessages');
  if (!container) return;

  // Build the message bubble
  const wrapper = document.createElement('div');
  wrapper.className = `chat-message ${type}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.innerHTML = formatMessage(text);

  // Meta line (time + optional ticks)
  const meta = document.createElement('div');
  meta.className = 'message-meta';

  const timeSpan = document.createElement('span');
  timeSpan.className = 'message-time';
  timeSpan.textContent = time;
  meta.appendChild(timeSpan);

  if (type === 'outgoing') {
    const ticks = document.createElement('span');
    ticks.className = 'message-ticks';
    ticks.textContent = ' ✓✓';
    meta.appendChild(ticks);
  }

  bubble.appendChild(meta);
  wrapper.appendChild(bubble);
  container.appendChild(wrapper);

  // Entrance animation
  requestAnimationFrame(function () {
    wrapper.classList.add('visible');
  });

  // Track in state
  chatState.messages.push({ text: text, type: type, time: time });

  // Scroll to bottom
  scrollToBottom();

  // Render quick replies if provided
  if (quickReplies.length > 0) {
    renderQuickReplies(quickReplies);
  }
}

/**
 * Displays a typing indicator (three animated dots) as an
 * incoming message bubble.
 */
function showTypingIndicator() {
  if (chatState.isTyping) return;
  chatState.isTyping = true;

  const container = document.getElementById('chatMessages');
  if (!container) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'chat-message incoming';
  wrapper.id = 'typingIndicator';

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble typing-bubble';

  // Three animated dots
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.className = 'typing-dot';
    dot.style.animationDelay = (i * 0.2) + 's';
    bubble.appendChild(dot);
  }

  wrapper.appendChild(bubble);
  container.appendChild(wrapper);

  requestAnimationFrame(function () {
    wrapper.classList.add('visible');
  });

  scrollToBottom();
}

/**
 * Removes the typing indicator from the DOM.
 */
function hideTypingIndicator() {
  chatState.isTyping = false;
  const indicator = document.getElementById('typingIndicator');
  if (indicator) {
    indicator.remove();
  }
}

/**
 * Determines the bot's next response based on the current
 * scenario and conversation step.
 *
 * @returns {{ text: string, quickReplies: string[] } | null}
 */
function getBotResponse() {
  const scenario = scenarios[chatState.currentScenario];
  if (!scenario) return null;

  const step = chatState.conversationStep;

  // If we've exhausted all steps, loop back with a closing message
  if (step >= scenario.steps.length) {
    // Reset so user can replay
    chatState.conversationStep = 0;
    return {
      text: "Thanks for chatting with us! 😊 Feel free to start a new conversation anytime.\n\nIs there anything else I can help you with?",
      quickReplies: scenario.introReplies
    };
  }

  const currentStep = scenario.steps[step];
  chatState.conversationStep++;

  return {
    text: currentStep.text,
    quickReplies: currentStep.quickReplies
  };
}

/**
 * Renders quick-reply buttons below the chat messages.
 * Clicking a button calls sendMessage with its label.
 */
function renderQuickReplies(replies) {
  clearQuickReplies();

  const container = document.getElementById('quickRepliesContainer');
  if (!container || !replies || replies.length === 0) return;

  replies.forEach(function (label) {
    const btn = document.createElement('button');
    btn.className = 'quick-reply-btn';
    btn.textContent = label;
    btn.addEventListener('click', function () {
      sendMessage(label);
    });
    container.appendChild(btn);
  });

  // Animate in
  requestAnimationFrame(function () {
    container.classList.add('visible');
  });
}

/**
 * Clears all quick-reply buttons.
 */
function clearQuickReplies() {
  const container = document.getElementById('quickRepliesContainer');
  if (container) {
    container.innerHTML = '';
    container.classList.remove('visible');
  }
}

/**
 * Attempts to detect which scenario the user's free-text
 * message matches, based on trigger keywords.
 *
 * @param {string} text — the user's input
 * @returns {string|null} — scenario key or null
 */
function detectScenario(text) {
  const lower = text.toLowerCase();

  for (const key in scenarios) {
    if (!scenarios.hasOwnProperty(key)) continue;
    const triggers = scenarios[key].triggers;
    for (let i = 0; i < triggers.length; i++) {
      if (lower.includes(triggers[i])) {
        return key;
      }
    }
  }
  return null;
}


// ==========================================
// ROI CALCULATOR
// ==========================================

/**
 * Initializes the ROI calculator.
 * Attaches input listeners to the range sliders and
 * performs the first calculation.
 */
function initROICalculator() {
  const messagesSlider = document.getElementById('roiMessages');
  const responseTimeSlider = document.getElementById('roiResponseTime');
  const staffCostSlider = document.getElementById('roiStaffCost');

  // Bail out gracefully if the DOM elements aren't present
  if (!messagesSlider || !responseTimeSlider || !staffCostSlider) return;

  // Attach real-time listeners
  messagesSlider.addEventListener('input', function () {
    updateSliderDisplay('roiMessages', this.value);
    calculateROI();
  });

  responseTimeSlider.addEventListener('input', function () {
    updateSliderDisplay('roiResponseTime', this.value + ' min');
    calculateROI();
  });

  staffCostSlider.addEventListener('input', function () {
    updateSliderDisplay('roiStaffCost', '$' + Number(this.value).toLocaleString());
    calculateROI();
  });

  // Set initial displayed values
  updateSliderDisplay('roiMessages', messagesSlider.value);
  updateSliderDisplay('roiResponseTime', responseTimeSlider.value + ' min');
  updateSliderDisplay('roiStaffCost', '$' + Number(staffCostSlider.value).toLocaleString());

  // Initial calculation
  calculateROI();
}

/**
 * Updates the value label displayed next to a slider.
 * Expects an element with id = sliderId + 'Value'.
 */
function updateSliderDisplay(sliderId, displayValue) {
  const label = document.getElementById(sliderId + 'Value');
  if (label) {
    label.textContent = displayValue;
  }
}

/**
 * Reads slider values, computes ROI metrics, and
 * updates the result elements in the DOM.
 */
function calculateROI() {
  const messages = parseInt(document.getElementById('roiMessages').value, 10);
  const responseTime = parseInt(document.getElementById('roiResponseTime').value, 10);
  const staffCost = parseInt(document.getElementById('roiStaffCost').value, 10);

  // --- Calculations ---
  // AI response time is always < 1 minute
  const aiResponseTime = '< 1 minute';

  // Monthly savings: 65% of current staff cost
  const monthlySavings = Math.round(staffCost * 0.65);

  // Messages handled: same as input value
  const messagesHandled = messages;

  // Cost per message: flat $40 plan / total messages
  const costPerMessage = (40 / messages);

  // --- Update DOM ---
  animateResultUpdate('roiResultResponseTime', aiResponseTime);
  animateResultUpdate('roiResultSavings', '$' + monthlySavings.toLocaleString());
  animateResultUpdate('roiResultMessages', messagesHandled.toLocaleString());
  animateResultUpdate('roiResultCostPerMessage', '$' + costPerMessage.toFixed(2));

  // Also update the "before" comparison values if they exist
  const beforeResponseEl = document.getElementById('roiBeforeResponseTime');
  if (beforeResponseEl) {
    beforeResponseEl.textContent = responseTime + ' min';
  }

  const beforeCostEl = document.getElementById('roiBeforeCost');
  if (beforeCostEl) {
    beforeCostEl.textContent = '$' + staffCost.toLocaleString();
  }
}

/**
 * Adds a subtle pulse animation to a result element
 * when its value changes.
 */
function animateResultUpdate(elementId, newValue) {
  const el = document.getElementById(elementId);
  if (!el) return;

  // Only animate if the value actually changed
  if (el.textContent === newValue) return;

  el.textContent = newValue;

  // Add animation class
  el.classList.add('value-updated');

  // Remove after animation completes
  setTimeout(function () {
    el.classList.remove('value-updated');
  }, 500);
}


// ==========================================
// SCROLL ANIMATIONS (Intersection Observer)
// ==========================================

/**
 * Sets up an IntersectionObserver to add the `.animate-in`
 * class to elements with `.animate-on-scroll` when they
 * enter the viewport.
 */
function initScrollAnimations() {
  const targets = document.querySelectorAll('.animate-on-scroll');
  if (!targets.length) return;

  // Use a threshold of 0.15 so the animation triggers
  // when 15% of the element is visible
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        // Stop observing once animated (one-shot)
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  targets.forEach(function (el) {
    observer.observe(el);
  });
}


// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function () {
  // Boot up the chat simulator
  initChat();

  // Boot up the ROI calculator
  initROICalculator();

  // Boot up scroll animations
  initScrollAnimations();
});
