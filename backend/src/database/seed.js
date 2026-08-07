const db = require("./db");

const baseUseCases = [
  {
    title: "Churn Risk Prediction for Mobile Subscribers",
    description: "Predict subscribers likely to churn in the next 30 days so retention teams can intervene.",
    domain: "Telecommunications",
    client_name: "NovaTel Communications",
    category: "Predictive Analytics",
    business_problem: "Retention campaigns were broad and expensive, with low conversion due to poor targeting.",
    proposed_solution: "Train a gradient boosting model on usage, billing, and support events to rank churn risk weekly.",
    technology_stack: "Python, XGBoost, Airflow, PostgreSQL, React",
  },
  {
    title: "Invoice OCR and AP Workflow Automation",
    description: "Extract key fields from supplier invoices and route exceptions to finance reviewers.",
    domain: "Manufacturing",
    client_name: "EastBridge Manufacturing",
    category: "Document Intelligence",
    business_problem: "Manual invoice entry caused delays, duplicate payments, and audit friction.",
    proposed_solution: "Use OCR and validation rules to auto-post clean invoices and flag anomalies for human review.",
    technology_stack: "Azure Form Recognizer, Node.js, Express, SQL Server, Power BI",
  },
  {
    title: "Personalized Product Recommendations",
    description: "Recommend products across home page, cart, and email campaigns to increase basket size.",
    domain: "Retail",
    client_name: "UrbanCart",
    category: "Recommendation Engine",
    business_problem: "Static merchandising underperformed for repeat customers with diverse preferences.",
    proposed_solution: "Deploy hybrid collaborative and content-based recommendations with real-time event features.",
    technology_stack: "Python, FastAPI, Redis, Kafka, Snowflake",
  },
  {
    title: "Claims Triage Assistant",
    description: "Classify incoming insurance claims by complexity and recommend routing paths.",
    domain: "Insurance",
    client_name: "ShieldLine Insurance",
    category: "NLP Classification",
    business_problem: "Claims backlog increased due to inconsistent triage and delayed adjuster assignment.",
    proposed_solution: "Apply text classification on claim narratives and policy metadata to prioritize handling.",
    technology_stack: "Python, spaCy, LightGBM, Docker, AWS Lambda",
  },
  {
    title: "Store Demand Forecasting",
    description: "Forecast SKU-level weekly demand for 400+ stores to reduce stockouts and overstock.",
    domain: "Retail",
    client_name: "FreshBasket Grocers",
    category: "Time Series Forecasting",
    business_problem: "Forecast errors created both lost sales and high wastage for perishable inventory.",
    proposed_solution: "Use hierarchical time series models with weather and promotion signals.",
    technology_stack: "Python, Prophet, Pandas, dbt, BigQuery",
  },
  {
    title: "Fraud Detection in Card Transactions",
    description: "Score card transactions in near-real time and trigger step-up authentication for high-risk events.",
    domain: "Banking",
    client_name: "HarborBank",
    category: "Fraud Analytics",
    business_problem: "Rising fraud losses and high false positives were degrading customer experience.",
    proposed_solution: "Combine rules with supervised anomaly detection and dynamic thresholding per segment.",
    technology_stack: "Java, Spring Boot, Kafka Streams, Cassandra, TensorFlow",
  },
  {
    title: "Patient No-Show Prediction",
    description: "Identify appointments likely to be missed and trigger reminder and rescheduling workflows.",
    domain: "Healthcare",
    client_name: "CarePoint Hospitals",
    category: "Predictive Analytics",
    business_problem: "No-shows reduced clinic utilization and increased wait times for other patients.",
    proposed_solution: "Train no-show models and integrate with SMS reminders and overbooking recommendations.",
    technology_stack: "Python, Scikit-learn, Twilio API, Flask, MySQL",
  },
  {
    title: "Contract Risk Review Copilot",
    description: "Highlight risky clauses and missing compliance language in vendor contracts.",
    domain: "Legal",
    client_name: "Lexon Advisory",
    category: "LLM Assistant",
    business_problem: "Legal reviewers spent too much time on first-pass contract screening.",
    proposed_solution: "Use retrieval-augmented generation over clause libraries and policy playbooks.",
    technology_stack: "TypeScript, Node.js, OpenAI API, Pinecone, Next.js",
  },
  {
    title: "Predictive Maintenance for CNC Machines",
    description: "Detect early equipment failure patterns from sensor telemetry and maintenance logs.",
    domain: "Manufacturing",
    client_name: "PrecisionFab",
    category: "IoT Analytics",
    business_problem: "Unexpected downtime impacted fulfillment SLAs and overtime costs.",
    proposed_solution: "Build failure probability models and schedule proactive maintenance windows.",
    technology_stack: "Python, MQTT, InfluxDB, Grafana, Kubernetes",
  },
  {
    title: "Dynamic Pricing Optimization",
    description: "Recommend daily room-rate updates based on demand, events, and competitor prices.",
    domain: "Hospitality",
    client_name: "BlueHarbor Hotels",
    category: "Optimization",
    business_problem: "Manual pricing updates lagged market signals and reduced RevPAR.",
    proposed_solution: "Run elasticity models and constrained optimization to maximize occupancy-adjusted revenue.",
    technology_stack: "R, Python, Airflow, PostgreSQL, Tableau",
  },
  {
    title: "Warehouse Slotting Optimization",
    description: "Reassign bin locations based on order velocity to shorten picker travel distance.",
    domain: "Logistics",
    client_name: "SwiftFulfill",
    category: "Operations Research",
    business_problem: "Long pick paths and congestion increased order cycle times.",
    proposed_solution: "Use ABC segmentation and route simulation to optimize slot assignments weekly.",
    technology_stack: "Python, OR-Tools, FastAPI, PostgreSQL, React",
  },
  {
    title: "Customer Support Ticket Summarization",
    description: "Auto-generate concise ticket summaries and next-best responses for agents.",
    domain: "SaaS",
    client_name: "CloudPort",
    category: "Generative AI",
    business_problem: "Agents spent excessive time reading long conversations before responding.",
    proposed_solution: "Deploy LLM-powered summaries with confidence gating and human edit workflow.",
    technology_stack: "Python, LangChain, OpenAI API, Elasticsearch, Vue",
  },
  {
    title: "Loan Application Document Checker",
    description: "Validate applicant documents for completeness and policy compliance before underwriting.",
    domain: "Financial Services",
    client_name: "PrimeLend",
    category: "Document Validation",
    business_problem: "Incomplete applications delayed approvals and increased abandonment rates.",
    proposed_solution: "Automate document checks and send applicants targeted remediation tasks.",
    technology_stack: "Node.js, Express, OCR, MongoDB, Angular",
  },
  {
    title: "Energy Consumption Anomaly Detection",
    description: "Detect abnormal consumption at plant and line levels to reduce utility overrun.",
    domain: "Energy",
    client_name: "VoltGrid Utilities",
    category: "Anomaly Detection",
    business_problem: "Abnormal usage patterns were discovered late, increasing monthly energy costs.",
    proposed_solution: "Use multivariate anomaly detection with alert thresholds tuned per site.",
    technology_stack: "Python, PyTorch, TimescaleDB, Grafana, Docker",
  },
  {
    title: "Campus Enrollment Yield Forecast",
    description: "Estimate admission acceptance probability to improve seat planning.",
    domain: "Education",
    client_name: "Northview University",
    category: "Predictive Analytics",
    business_problem: "Enrollment targets were often missed due to inaccurate yield assumptions.",
    proposed_solution: "Model applicant behavior by program and geography to guide outreach strategy.",
    technology_stack: "Python, CatBoost, PostgreSQL, Metabase, Airflow",
  },
  {
    title: "Field Sales Route Prioritization",
    description: "Rank accounts and optimize visit routes for regional sales teams.",
    domain: "FMCG",
    client_name: "PeakConsumer Goods",
    category: "Route Optimization",
    business_problem: "Sales reps missed high-value opportunities due to static route plans.",
    proposed_solution: "Blend lead scores with geospatial optimization to produce daily route plans.",
    technology_stack: "TypeScript, Node.js, PostGIS, Mapbox, React Native",
  },
  {
    title: "Employee Attrition Early Warning",
    description: "Identify teams at high attrition risk and suggest retention actions.",
    domain: "Human Resources",
    client_name: "PeopleFirst BPO",
    category: "Workforce Analytics",
    business_problem: "Unexpected attrition spikes disrupted staffing and training budgets.",
    proposed_solution: "Predict attrition risk from engagement, attendance, and manager span metrics.",
    technology_stack: "Python, Scikit-learn, Power BI, SQL Server, Azure Data Factory",
  },
  {
    title: "Shipment Delay Prediction",
    description: "Predict delayed deliveries and proactively notify customers with revised ETAs.",
    domain: "Logistics",
    client_name: "TransitWave",
    category: "ETA Prediction",
    business_problem: "Late delivery visibility was poor, driving customer complaints and support volume.",
    proposed_solution: "Combine route telemetry, weather, and hub load to estimate delay likelihood.",
    technology_stack: "Python, Spark, Delta Lake, Databricks, React",
  },
  {
    title: "Pharmacovigilance Signal Detection",
    description: "Surface potential adverse event signals from case reports and literature.",
    domain: "Pharmaceuticals",
    client_name: "Helix Pharma",
    category: "Safety Analytics",
    business_problem: "Manual review pipelines struggled with rising case volume and complexity.",
    proposed_solution: "Use NLP entity extraction and disproportionality analysis to prioritize review.",
    technology_stack: "Python, spaCy, Neo4j, FastAPI, AWS",
  },
  {
    title: "B2B Lead Scoring Platform",
    description: "Score inbound leads and recommend next actions for account executives.",
    domain: "Enterprise Software",
    client_name: "OrbitStack",
    category: "Sales Analytics",
    business_problem: "Low conversion due to inconsistent lead qualification across regions.",
    proposed_solution: "Create explainable lead scoring with CRM integration and feedback loops.",
    technology_stack: "Node.js, Python, HubSpot API, PostgreSQL, React",
  }
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeRecord(base, index) {
  const slug = slugify(base.title);

  const createdAt = new Date(Date.UTC(2025, (index * 3) % 12, (index % 27) + 1, 10, 30, 0));
  const updatedAt = new Date(createdAt.getTime() + ((index % 18) + 2) * 24 * 60 * 60 * 1000);

  return {
    title: base.title,
    description: base.description,
    domain: base.domain,
    domain_image_url: "",
    deployment_url: `https://demo.ekfrazo.ai/${slug}`,
    resource_url: `https://docs.ekfrazo.ai/usecases/${slug}`,
    client_name: base.client_name,
    category: base.category,
    business_problem: base.business_problem,
    proposed_solution: base.proposed_solution,
    technology_stack: base.technology_stack,
    created_at: createdAt.toISOString(),
    updated_at: updatedAt.toISOString(),
  };
}

function seed({ reset = false } = {}) {
  if (reset) {
    db.exec("DELETE FROM use_cases");
    db.exec("DELETE FROM sqlite_sequence WHERE name='use_cases'");
  }

  const insert = db.prepare(`
    INSERT INTO use_cases (
      title,
      description,
      domain,
      domain_image_url,
      deployment_url,
      resource_url,
      client_name,
      category,
      business_problem,
      proposed_solution,
      technology_stack,
      created_at,
      updated_at
    ) VALUES (
      @title,
      @description,
      @domain,
      @domain_image_url,
      @deployment_url,
      @resource_url,
      @client_name,
      @category,
      @business_problem,
      @proposed_solution,
      @technology_stack,
      @created_at,
      @updated_at
    )
  `);

  const rows = baseUseCases.map((item, index) => makeRecord(item, index));
  db.exec("BEGIN");
  try {
    rows.forEach((row) => insert.run(row));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }

  const total = db.prepare("SELECT COUNT(*) AS total FROM use_cases").get().total;
  return { inserted: rows.length, total };
}

const shouldReset = process.argv.includes("--reset");
const result = seed({ reset: shouldReset });

console.log(`Seed complete. Inserted: ${result.inserted}. Total rows: ${result.total}.`);
