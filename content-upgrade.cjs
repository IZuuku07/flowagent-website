// Update only unchanged legacy defaults. Keep owner edits and removed services.
const changes=[
{"keys":["services",{"id":"svc-custom-004"},"audience"],"before":"Ecommerce businesses with repetitive operational tasks","after":"Businesses with repetitive processes across multiple tools"},
{"keys":["services",{"id":"svc-custom-004"},"useCases"],"before":["CRM automation","Inventory sync","Order processing","Reporting"],"after":["CRM updates","Lead routing","Business reporting","Document processing","Team notifications","Order workflows"]},
{"keys":["faqs",{"id":"faq-scope"},"answer"],"before":"The plan covers the workflow and volume agreed for your system. For example, the Shopify blog service lists 30 articles per month. Discuss your expected message volume, connections, and deliverables before starting.","after":"Every plan covers an agreed workflow, integrations and usage range. We confirm expected message volume, actions and support before launch."},
 {keys:["seo","pages","/services/whatsapp-chat-bot","title"],before:"WhatsApp AI Chatbot | FlowAgent",after:"WhatsApp AI Agent for Business | FlowAgent"},
 {keys:["pageContent","home","heroTitle"],before:"Answer WhatsApp enquiries. Keep your team focused.",after:"Stop answering the same WhatsApp questions all day."},
  {
    "keys": [
      "pageContent",
      "home",
      "heroTitle"
    ],
    "before": "AI automation for the work behind your business.",
    "after": "Stop answering the same WhatsApp questions all day."
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

changes.push(...[
  {
    "keys": [
      "pageContent",
      "home",
      "heroTitle"
    ],
    "before": "Stop answering the same WhatsApp questions all day.",
    "after": "Less busywork. More business."
  },
  {
    "keys": [
      "pageContent",
      "home",
      "heroText"
    ],
    "before": "An AI assistant that answers common questions, collects enquiry details and hands conversations to your team. Built around your business information and the tools you already use.",
    "after": "Your AI automation agency. We build agents that keep your social media active, publish your blog and turn WhatsApp conversations into confirmed orders. Reduce manual work, control costs and give your team time back."
  },
  {
    "keys": [
      "pageContent",
      "home",
      "finalCtaTitle"
    ],
    "before": "What happens when a customer messages you?",
    "after": "Build your next unfair advantage."
  },
  {
    "keys": [
      "pageContent",
      "home",
      "finalCtaText"
    ],
    "before": "Tell us about your current process. We will review where a WhatsApp assistant could help and suggest a practical first workflow.",
    "after": "Tell us what takes up your day. We will help you choose one useful automation, define its scope and get it working for your business."
  },
  {
    "keys": [
      "pageContent",
      "about",
      "intro"
    ],
    "before": "FlowAgent builds WhatsApp assistants and business workflows around the questions, information and tools your team uses every day.",
    "after": "FlowAgent is an AI automation agency for businesses that want less repetitive work and more time to grow. We connect content, publishing and customer conversations to the tools you already use."
  },
  {
    "keys": [
      "pageContent",
      "contact",
      "headline"
    ],
    "before": "Your free WhatsApp automation audit.",
    "after": "Let’s put your busywork on autopilot."
  },
  {
    "keys": [
      "pageContent",
      "contact",
      "intro"
    ],
    "before": "Tell us how you handle enquiries today. We will review your request and arrange a 20-minute conversation about your first workflow.",
    "after": "Tell us about your business and the work you want to automate. Start with one agent, a clear scope and a free conversation."
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-social-manager"
      },
      "title"
    ],
    "before": "Social Media Manager",
    "after": "Social Media Manager"
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-social-manager"
      },
      "category"
    ],
    "before": "Content & Publishing",
    "after": "Content & Publishing"
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-social-manager"
      },
      "description"
    ],
    "before": "A custom social media workflow for content creation, publishing and inbox replies. Request an availability review to confirm the channels, tools and scope for your business.",
    "after": "Keep your channels active with daily AI-generated videos and images, captions and scheduled posts. Answer comments using your brand information, with handoff when a person is needed."
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-social-manager"
      },
      "audience"
    ],
    "before": "Business owners who want help managing their social presence",
    "after": "Businesses that want a consistent social presence without doing every post and reply by hand."
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-social-manager"
      },
      "deliverables"
    ],
    "before": [
      "Agreed content plan",
      "Monthly videos and images",
      "Review and approval process"
    ],
    "after": [
      "A content plan built around your business and brand voice",
      "AI-generated videos and images with captions and relevant hashtags",
      "Daily publishing on the connected channels agreed in your plan",
      "Comment replies grounded in your approved business information",
      "Approval controls and handoff for sensitive or uncertain replies"
    ]
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-social-manager"
      },
      "workflowSteps"
    ],
    "before": [
      "Agree on your business goals",
      "Create and review content",
      "Schedule approved content on supported channels"
    ],
    "after": [
      "Choose topics and brand guidelines.",
      "Generate the visual, video and caption.",
      "Review content if your workflow requires approval.",
      "Publish on the agreed daily schedule.",
      "Reply to comments and route exceptions to your team."
    ]
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-social-manager"
      },
      "faq"
    ],
    "before": [],
    "after": [
      {
        "question": "Is every platform supported?",
        "answer": "We confirm your platforms, account permissions and publishing capabilities before setup. Comment automation depends on each platform’s API and account access."
      },
      {
        "question": "How much content is included?",
        "answer": "We agree the monthly number of videos and images, video length, channels and generation costs before you pay."
      }
    ]
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-seo-001"
      },
      "title"
    ],
    "before": "Blog Writing & Publishing",
    "after": "Blogging Agent"
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-seo-001"
      },
      "category"
    ],
    "before": "Content & Publishing",
    "after": "Content & Publishing"
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-seo-001"
      },
      "description"
    ],
    "before": "Move from a topic queue to a reviewed, published blog post. Connect your product or business information, article generation, images, and publishing schedule.",
    "after": "Turn useful topics into structured articles, with titles, metadata and internal links. Review the draft, then publish to your connected website on schedule."
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-seo-001"
      },
      "audience"
    ],
    "before": "Businesses and agencies publishing to Shopify or a supported CMS",
    "after": "Businesses that want a useful, consistent blog with less time spent drafting and uploading."
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-seo-001"
      },
      "deliverables"
    ],
    "before": [
      "30 published blog articles per month",
      "Content tracking spreadsheet"
    ],
    "after": [
      "Topic planning around your products and customer questions",
      "Draft articles in your brand voice",
      "SEO titles, descriptions and suggested internal links",
      "A review step for facts, accuracy and brand fit",
      "Scheduled publishing to your supported CMS"
    ]
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-seo-001"
      },
      "workflowSteps"
    ],
    "before": [
      "Read the next approved topic",
      "Generate the draft using business information",
      "Collect approval and prepare the article",
      "Publish and update the topic queue"
    ],
    "after": [
      "Add approved topics and source information.",
      "Draft a structured article and its metadata.",
      "Review facts, links and the final copy.",
      "Publish to your connected CMS on schedule."
    ]
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-seo-001"
      },
      "faq"
    ],
    "before": [
      {
        "question": "Are the articles written specifically for my products?",
        "answer": "Yes. Every article is based on your product catalogue, target keywords, and audience."
      },
      {
        "question": "Can I approve articles before publishing?",
        "answer": "Yes. You can enable a review step in the workflow before automatic publishing."
      }
    ],
    "after": [
      {
        "question": "Will it guarantee Google rankings?",
        "answer": "No. The agent helps you publish useful, structured content consistently. Rankings depend on content quality, competition, site authority and many other factors."
      }
    ]
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-wa-003"
      },
      "title"
    ],
    "before": "WhatsApp AI Chatbot",
    "after": "WhatsApp Sales & Confirmation"
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-wa-003"
      },
      "category"
    ],
    "before": "Customer Support",
    "after": "Sales & Bookings"
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-wa-003"
      },
      "description"
    ],
    "before": "Answer common questions using your business information, capture enquiry details, and route conversations to your team when a person is needed.",
    "after": "Answer product questions, collect customer details and confirm orders on WhatsApp. Keep your order sheet or CRM updated and bring in your team when needed."
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-wa-003"
      },
      "audience"
    ],
    "before": "Businesses handling sales or support conversations on WhatsApp",
    "after": "Shops and service businesses handling repeated sales questions and order confirmations on WhatsApp."
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-wa-003"
      },
      "deliverables"
    ],
    "before": [
      "Configured WhatsApp AI assistant",
      "Knowledge base based on your products and policies",
      "Lead capture and handoff flow",
      "Testing and launch support"
    ],
    "after": [
      "Answers based on your products, prices and approved policies",
      "Collection of customer details and order preferences",
      "An order summary and explicit customer confirmation step",
      "Order updates in your connected sheet or CRM",
      "Human handoff for exceptions and uncertain answers"
    ]
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-wa-003"
      },
      "workflowSteps"
    ],
    "before": [
      "Receive an incoming WhatsApp message",
      "Retrieve approved business information",
      "Draft a response or identify a handoff",
      "Send the reply and log the conversation"
    ],
    "after": [
      "A customer sends a WhatsApp message.",
      "The agent answers using approved business information.",
      "Collect the details needed for the order.",
      "Ask the customer to confirm the order summary.",
      "Save the confirmed details and notify your team."
    ]
  },
  {
    "keys": [
      "services",
      {
        "id": "svc-wa-003"
      },
      "faq"
    ],
    "before": [
      {
        "question": "Can the AI hand off to a human?",
        "answer": "Yes. The agent detects when a customer needs human help and routes the conversation to your team."
      }
    ],
    "after": [
      {
        "question": "Can it confirm orders automatically?",
        "answer": "It can send an order summary and record the customer’s confirmation. Payment verification, stock checks and fulfilment require the relevant integrations and agreed rules."
      }
    ]
  },
  {
    "keys": [
      "seo",
      "pages",
      "/",
      "title"
    ],
    "before": "WhatsApp AI Chatbots & Business Automation | FlowAgent",
    "after": "FlowAgent | AI Automation Agency for Content & Sales"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/",
      "description"
    ],
    "before": "Answer WhatsApp enquiries, capture lead details and connect your business tools with FlowAgent. Start with a free automation audit.",
    "after": "Reduce repetitive work with FlowAgent: social media management, AI blogging and WhatsApp sales and order confirmation agents built around your business."
  }
]);

changes.push(...[
  {
    "keys": [
      "seo",
      "pages",
      "/services",
      "title"
    ],
    "before": "Business Automation Services | FlowAgent",
    "after": "AI Automation Services for Content & Sales | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/services",
      "description"
    ],
    "before": "Explore WhatsApp AI assistants, lead follow-up and custom n8n workflows built around your business.",
    "after": "Explore AI social media management, blog writing and publishing, and WhatsApp sales and order confirmation. Compare workflows and request a free audit."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/contact",
      "title"
    ],
    "before": "Free WhatsApp Automation Audit | FlowAgent",
    "after": "Free AI Automation Consultation | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/contact",
      "description"
    ],
    "before": "Request a free 20-minute discussion of your WhatsApp enquiries, business tools and first automation workflow.",
    "after": "Discuss social media, blogging or WhatsApp automation. Tell us about your business, tools and workload to plan a practical first workflow."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/pricing",
      "title"
    ],
    "before": "WhatsApp Automation Pricing & Project Scope | FlowAgent",
    "after": "AI Automation Pricing & Project Scope | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/pricing",
      "description"
    ],
    "before": "Compare the free audit, scoped automation plans and ongoing support. Confirm deliverables and monthly volume before you commit.",
    "after": "Compare automation plans and agree content volume, integrations, setup and support before starting your social media, blogging or WhatsApp workflow."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/about",
      "title"
    ],
    "before": "About FlowAgent | Practical Business Automation",
    "after": "About FlowAgent | AI Automation Agency"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/about",
      "description"
    ],
    "before": "Learn how FlowAgent scopes, builds and tests WhatsApp assistants and business workflows.",
    "after": "FlowAgent builds social media, blogging and WhatsApp sales automations around your business information, approval steps and existing tools."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/faq",
      "title"
    ],
    "before": "WhatsApp & Business Automation FAQ | FlowAgent",
    "after": "AI Automation Questions: Setup, Usage & Support | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/faq",
      "description"
    ],
    "before": "Answers about setup, approved business information, human handoff, monthly scope and support.",
    "after": "Answers about AI automation setup, account access, content approvals, human handoff, monthly scope and ongoing support."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/services/social-media-manager",
      "title"
    ],
    "before": "Social Media Manager | FlowAgent",
    "after": "AI Social Media Management & Auto Posting | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/services/social-media-manager",
      "description"
    ],
    "before": "A custom social media workflow for content creation, publishing and inbox replies. Request an availability review to confirm the channels, tools and scope for your business.",
    "after": "Automate daily videos and images, captions, scheduled publishing and comment replies. Build a social media workflow with brand guidelines and approvals."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/services/blog-automation",
      "title"
    ],
    "before": "Blog Writing & Publishing Automation | FlowAgent",
    "after": "AI Blog Writing & Publishing Automation | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/services/blog-automation",
      "description"
    ],
    "before": "Move from a topic queue to a reviewed, published blog post. Connect your product or business information, article generation, images, and publishing schedule.",
    "after": "Turn approved topics into blog drafts, SEO titles and internal links. Review facts and publish articles to your connected website on schedule."
  },
  {
    "keys": [
      "seo",
      "pages",
      "/services/whatsapp-chat-bot",
      "title"
    ],
    "before": "WhatsApp AI Agent for Business | FlowAgent",
    "after": "WhatsApp Sales Chatbot & Order Confirmation | FlowAgent"
  },
  {
    "keys": [
      "seo",
      "pages",
      "/services/whatsapp-chat-bot",
      "description"
    ],
    "before": "Answer common questions using your business information, capture enquiry details, and route conversations to your team when a person is needed.",
    "after": "Answer product questions, collect order details and confirm orders on WhatsApp. Connect your sheet or CRM and hand complex conversations to your team."
  }
]);
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
