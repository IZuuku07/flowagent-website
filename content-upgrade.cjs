// Update only unchanged legacy defaults. Keep owner edits and removed services.
const changes=[
  {
    "keys": [
      "pageContent",
      "home",
      "heroTitle"
    ],
    "before": "AI automation for the work behind your business.",
    "after": "Answer WhatsApp enquiries. Keep your team focused."
  },
  {
    "keys": [
      "pageContent",
      "home",
      "heroText"
    ],
    "before": "Connect your content, customer support and everyday tools. FlowAgent builds WhatsApp agents, publishing workflows and custom automation around the way you work.",
    "after": "An AI assistant that answers common questions, collects enquiry details and hands conversations to your team. Built around your business information and the tools you already use."
  },
  {
    "keys": [
      "pageContent",
      "home",
      "primaryCtaLabel"
    ],
    "before": "Discuss your project",
    "after": "Request a free audit"
  },
  {
    "keys": [
      "pageContent",
      "home",
      "secondaryCtaLabel"
    ],
    "before": "Explore services",
    "after": "See the example"
  },
  {
    "keys": [
      "pageContent",
      "home",
      "secondaryCtaLink"
    ],
    "before": "/services",
    "after": "/demo"
  },
  {
    "keys": [
      "pageContent",
      "home",
      "finalCtaTitle"
    ],
    "before": "What would you take off your to-do list?",
    "after": "What happens when a customer messages you?"
  },
  {
    "keys": [
      "pageContent",
      "home",
      "finalCtaText"
    ],
    "before": "Tell us about one repetitive task, the tools involved, and your monthly volume. We can discuss the right workflow and its scope.",
    "after": "Tell us about your current process. We will review where a WhatsApp assistant could help and suggest a practical first workflow."
  },
  {
    "keys": [
      "pageContent",
      "home",
      "finalCtaLabel"
    ],
    "before": "Discuss my workflow",
    "after": "Request my free audit"
  },
  {
    "keys": [
      "pageContent",
      "about",
      "headline"
    ],
    "before": "Practical automation for the work behind your business.",
    "after": "Practical automation. A clear first step."
  },
  {
    "keys": [
      "pageContent",
      "about",
      "intro"
    ],
    "before": "FlowAgent connects content publishing, customer conversations, sales, and business operations using n8n and the tools you already use.",
    "after": "FlowAgent builds WhatsApp assistants and business workflows around the questions, information and tools your team uses every day."
  },
  {
    "keys": [
      "pageContent",
      "contact",
      "headline"
    ],
    "before": "Let’s work through your first workflow.",
    "after": "Your free WhatsApp automation audit."
  },
  {
    "keys": [
      "pageContent",
      "contact",
      "intro"
    ],
    "before": "Tell us what you do manually today. Include your tools, the steps involved, and approximate monthly volume.",
    "after": "Tell us how you handle enquiries today. We will review your request and arrange a 20-minute conversation about your first workflow."
  },
  {
    "keys": [
      "pageContent",
      "blog",
      "intro"
    ],
    "before": "Insights on ecommerce automation, AI, and growth.",
    "after": "Practical guides to customer conversations and business automation."
  },
  {
    "keys": [
      "seo",
      "defaultTitle"
    ],
    "before": "FlowAgent | AI Automation, Chatbots & Content Services",
    "after": "WhatsApp AI Chatbots & Business Automation | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "defaultDescription"
    ],
    "before": "Automate content, customer support and everyday business tasks with FlowAgent. Explore WhatsApp agents, blog publishing, AI video and custom n8n workflows.",
    "after": "Answer WhatsApp enquiries, capture lead details and connect your business tools with FlowAgent. Start with a free automation audit."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/",
      "title"
    ],
    "before": "FlowAgent | AI Automation, Chatbots & Content Services",
    "after": "WhatsApp AI Chatbots & Business Automation | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/",
      "description"
    ],
    "before": "Automate content, customer support and everyday business tasks with FlowAgent. Explore WhatsApp agents, blog publishing, AI video and custom n8n workflows.",
    "after": "Answer WhatsApp enquiries, capture lead details and connect your business tools with FlowAgent. Start with a free automation audit."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/services",
      "title"
    ],
    "before": "n8n Automation Services | FlowAgent",
    "after": "Business Automation Services | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/services",
      "description"
    ],
    "before": "Automate social publishing, blog content, WhatsApp support, lead follow-up, bookings, and business operations with FlowAgent.",
    "after": "Explore WhatsApp AI assistants, lead follow-up and custom n8n workflows built around your business."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/pricing",
      "title"
    ],
    "before": "Pricing | FlowAgent",
    "after": "WhatsApp Automation Pricing & Project Scope | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/pricing",
      "description"
    ],
    "before": "Simple pricing for automated SEO, UGC video, and custom AI systems.",
    "after": "Compare the free audit, scoped automation plans and ongoing support. Confirm deliverables and monthly volume before you commit."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/contact",
      "title"
    ],
    "before": "Contact | FlowAgent",
    "after": "Free WhatsApp Automation Audit | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/contact",
      "description"
    ],
    "before": "Tell us what you want to automate for your ecommerce brand.",
    "after": "Request a free 20-minute discussion of your WhatsApp enquiries, business tools and first automation workflow."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/faq",
      "title"
    ],
    "before": "FAQ | FlowAgent",
    "after": "WhatsApp & Business Automation FAQ | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/faq",
      "description"
    ],
    "before": "Common questions about FlowAgent automation services.",
    "after": "Answers about setup, approved business information, human handoff, monthly scope and support."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/blog",
      "title"
    ],
    "before": "Blog | FlowAgent",
    "after": "Business Automation Guides | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/blog",
      "description"
    ],
    "before": "Insights on ecommerce automation, AI, and growth.",
    "after": "Practical articles about customer support, content workflows and business automation."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/about",
      "title"
    ],
    "before": "About | FlowAgent",
    "after": "About FlowAgent | Practical Business Automation"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/about",
      "description"
    ],
    "before": "FlowAgent is a productized AI automation studio for Shopify and ecommerce brands.",
    "after": "Learn how FlowAgent scopes, builds and tests WhatsApp assistants and business workflows."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/services/social-media-manager",
      "description"
    ],
    "before": "A planned managed service for videos, branded images, scheduled posts, and replies to messages and comments. We confirm supported channels and availability befo",
    "after": "A custom social media workflow for content creation, publishing and inbox replies. Request an availability review to confirm the channels, tools and scope for your business."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/content"
    ],
    "after": {
      "title": "Content & Blog Publishing Automation | FlowAgent",
      "description": "Connect ideas, content review and publishing with tailored blog, video and social media workflows."
    }
  },
  {
    "keys": [
      "seo",
      "pages",
      "/demo"
    ],
    "after": {
      "title": "WhatsApp AI Chatbot Example | FlowAgent",
      "description": "Explore a scripted WhatsApp assistant demo with FAQ replies, enquiry capture and human handoff. Sample data only."
    }
  },
  {
    "keys": [
      "seo",
      "pages",
      "/case-studies"
    ],
    "after": {
      "title": "Automation Workflow Examples | FlowAgent",
      "description": "Explore illustrative business workflows and sample conversations. These are examples, not verified client outcomes."
    }
  },
  {
    "keys": [
      "seo",
      "pages",
      "/testimonials"
    ],
    "after": {
      "title": "Customer Feedback | FlowAgent",
      "description": "Customer feedback and ways to explore FlowAgent services."
    }
  },
  {
    "keys": [
      "seo",
      "pages",
      "/privacy"
    ],
    "after": {
      "title": "Privacy Policy | FlowAgent",
      "description": "How FlowAgent handles website enquiries and personal information."
    }
  },
  {
    "keys": [
      "seo",
      "pages",
      "/terms"
    ],
    "after": {
      "title": "Terms of Service | FlowAgent",
      "description": "Terms covering FlowAgent services, agreed scope and payments."
    }
  },
  {
    "keys": [
      "seo",
      "pages",
      "/services/blog-automation"
    ],
    "after": {
      "title": "Blog Writing & Publishing Automation | FlowAgent",
      "description": "Move from a topic queue to a reviewed, published blog post. Connect your product or business information, article generation, images, and publishing schedule."
    }
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-social-manager"
      },
      "description"
    ],
    "before": "A planned managed service for videos, branded images, scheduled posts, and replies to messages and comments. We confirm supported channels and availability before you start.",
    "after": "A custom social media workflow for content creation, publishing and inbox replies. Request an availability review to confirm the channels, tools and scope for your business."
  },
  {
    "keys": [
      "faqs",
      {
        "id": "faq-002"
      },
      "answer"
    ],
    "before": "Yes. For SEO blog automation and product-based content, we need read access to your Shopify product catalogue and blog publishing permissions.",
    "after": "Only for workflows involving Shopify. Other services use the relevant WhatsApp, spreadsheet, CRM or publishing permissions agreed during setup."
  },
  {
    "keys": [
      "faqs",
      {
        "id": "faq-human"
      }
    ],
    "after": {
      "id": "faq-human",
      "category": "WhatsApp",
      "question": "When does a person take over?",
      "answer": "We agree on handoff rules before launch, including unanswered questions, sensitive requests and customers asking for your team. The workflow can flag these for human review."
    }
  },
  {
    "keys": [
      "faqs",
      {
        "id": "faq-security"
      }
    ],
    "after": {
      "id": "faq-security",
      "category": "WhatsApp",
      "question": "What information does the assistant use?",
      "answer": "The products, policies and FAQs you approve. We agree access permissions and the information to record before setup. AI answers and exception handling are tested before launch."
    }
  }
];

module.exports=function upgrade(data){
 const result=structuredClone(data);
 for(const change of changes){
  let target=result;
  for(const key of change.keys.slice(0,-1)){
   if(!target)break;
   if(typeof key==='object')target=Array.isArray(target)?target.find(item=>item.id===key.id):undefined;
   else target=target[key]??={};
  }
  if(!target)continue;
  const key=change.keys.at(-1);
  if(typeof key==='object'){
   if(Array.isArray(target)&&change.before===undefined&&!target.some(item=>item.id===key.id))target.push(structuredClone(change.after));
  }else if(JSON.stringify(target[key])===JSON.stringify(change.before))target[key]=structuredClone(change.after);
 }
 return result;
};
