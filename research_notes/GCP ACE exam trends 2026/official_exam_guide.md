# Official Google Cloud Associate Cloud Engineer (ACE) Exam Definition, 2026 (current as of November 18, 2026)

Research method note: I downloaded both live official PDFs (the standard and renewal guides) and the prior "v4.0" PDF from services.google.com on 2026-11-18, extracted their text, and diffed them by hand. Bullets below are verbatim from the PDFs. Only the old v4.0 PDF has a version label. The live guide has no version number or effective date printed on it.

Primary URLs:
- Cert page: https://cloud.google.com/learn/certification/cloud-engineer
- Live standard guide: https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf
- Live renewal guide: https://services.google.com/fh/files/misc/associate_cloud_engineer_renewal_exam_guide_english.pdf
- Previous guide (v4.0, historical): https://services.google.com/fh/files/misc/v4.0_associate_cloud_engineer_exam_guide_english.pdf

## Q1. What is the current official ACE exam guide, and what are its sections, weightings and sub-objectives?

### Takeaway
The live standard guide has four sections weighted ~20% / ~30% / ~30% / ~20%. Its 2026 objectives explicitly name AI tooling: Gemini Cloud Assist, Gemini CLI, Google Antigravity, Application Design Center, and Agent Runtime on Gemini Enterprise Agent Platform. It also names GPUs/TPUs, Workforce and Workload Identity Federation, CMEK and Cloud Hub. No version number is printed on it.

### Cited Findings

**Guide metadata and role description**
- The PDF title metadata is "Associate Cloud Engineer Exam Guide | English". It carries no version number or "live on" date. By contrast, the previous file was explicitly titled "v4.0 Associate Cloud Engineer Exam Guide" — [Live guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf); [v4.0 PDF](https://services.google.com/fh/files/misc/v4.0_associate_cloud_engineer_exam_guide_english.pdf)
- The live role description (verbatim): "An Associate Cloud Engineer deploys and secures applications, services, and infrastructure, monitors the operations of multiple projects, and maintains enterprise solutions to meet target performance metrics. This individual has experience working with public clouds or on-premises solutions. They are able to perform common platform-based tasks, **supported by AI tooling**, to maintain and scale one or more deployed solutions that leverage Google-managed or self-managed services on Google Cloud." The phrase "supported by AI tooling" is new compared with v4.0 — [Live guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)
- The cert page lists the same four assessed areas: set up a cloud solution environment; plan and implement a cloud solution; ensure successful operation of a cloud solution; configure access and security. Note that the cert page's role blurb still uses the older wording without "supported by AI tooling" — [Cert page](https://cloud.google.com/learn/certification/cloud-engineer)

**Section 1: Setting up a cloud solution environment (~20% of the exam)** — [Live guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)

1.1 Setting up cloud projects and accounts. Considerations include:
- Creating a resource hierarchy
- Applying organizational policies to the resource hierarchy
- Granting members Identity and Access Management (IAM) roles within a project
- Managing users and groups in Cloud Identity (manually and automated)
- Enabling APIs within projects
- Provisioning and setting up products in Google Cloud Observability
- Assessing quotas and requesting increases
- Setting up standalone organizations
- Setting up cloud networking
- Verifying product availability across geographical locations (e.g., regions, zones)
- Configuring Cloud Asset Inventory and using Gemini Cloud Assist to analyze resources
- Configuring Workforce Identity Federation

1.2 Managing billing configuration. Considerations include:
- Creating one or more billing accounts
- Linking projects to a billing account
- Establishing billing budgets and alerts
- Setting up billing exports

**Section 2: Planning and implementing a cloud solution (~30% of the exam)** — [Live guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)

2.1 Planning and implementing compute resources. Considerations include:
- Selecting appropriate compute choices for a given workload (e.g., Compute Engine, Google Kubernetes Engine [GKE], Cloud Run, Cloud Run functions, Agent Runtime on Gemini Enterprise Agent Platform [formerly Vertex AI Agent Engine])
- Launching a compute instance (e.g., availability policy, SSH keys)
- Choosing the appropriate storage for Compute Engine (e.g., zonal Persistent Disk, regional Persistent Disk, Google Cloud Hyperdisk)
- Creating an autoscaled managed instance group by using an instance template
- Configuring OS Login
- Configuring VM Manager
- Using Spot VM instances and custom machine types
- Installing and configuring the command-line interface (CLI) for Kubernetes (kubectl)
- Deploying a GKE cluster with different configurations (e.g., GKE Autopilot, regional clusters, private clusters)
- Deploying a containerized application to GKE
- Deploying an application to serverless compute platforms, including for the processing of Google Cloud events (e.g., Pub/Sub events, Cloud Storage object change notification events, Eventarc)
- Identifying whether to use GPUs or TPUs

2.2 Planning and implementing storage and data solutions. Considerations include:
- Choosing and deploying data products (e.g., Cloud SQL, BigQuery, Firestore, Spanner, Bigtable, AlloyDB, Dataflow, Pub/Sub, Google Cloud Managed Service for Apache Kafka, Memorystore)
- Choosing and deploying storage products (e.g., Cloud Storage, Filestore, Google Cloud NetApp Volumes, Google Cloud Managed Lustre) and Cloud Storage options (e.g., Standard, Nearline, Coldline, Archive)
- Loading data (e.g., command-line upload, load data from Cloud Storage, Storage Transfer Service)
- Maintaining multi-region redundancy across data solutions

2.3 Planning and implementing networking resources. Considerations include:
- Creating a VPC with subnets (e.g., custom mode VPC, Shared VPC, VPC Network Peering)
- Creating and applying VPC firewalls rules and Cloud Next Generation Firewall (Cloud NGFW) policies with ingress and egress rules and attributes (e.g., action, source, destination, targets, protocols, ports)
- Using Tags (e.g., secure Tags) and service accounts in Cloud NGFW policy rules
- Establishing network connectivity (e.g., Cloud VPN, VPC Network Peering, Cloud Interconnect)
- Choosing and deploying load balancers
- Differentiating Network Service Tiers

2.4 Planning and implementing resources using tooling. Considerations include:
- Infrastructure as Code tooling (e.g., Fabric FAST, Config Connector, Terraform, Helm)
- AI-assisted planning and implementation (e.g., Gemini CLI, Google Antigravity, Gemini Cloud Assist, Application Design Center)

**Section 3: Ensuring the successful operation of a cloud solution (~30% of the exam)** — [Live guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)

3.1 Managing compute resources. Considerations include:
- Remotely connecting to a Compute Engine instance
- Viewing current running Compute Engine instances
- Working with snapshots and images (e.g., create, view, and delete images or snapshots; schedule a snapshot)
- Viewing current running GKE cluster inventory (e.g., nodes, Pods, Services)
- Configuring GKE to access Artifact Registry
- Working with GKE node pools (e.g., add, edit, or remove a node pool; autoscaling node pool)
- Working with Kubernetes resources (e.g., Pods, Services, StatefulSets)
- Managing horizontal and vertical Pod autoscaling configurations
- Managing GKE Autopilot Pod resource requests
- Deploying new versions of a Cloud Run application
- Adjusting application traffic splitting parameters (e.g., Cloud Run, Cloud Run functions, GKE)
- Configuring autoscaling for a Cloud Run application
- Attaching GPUs and TPUs
- Deploying an agent to Agent Runtime on Gemini Enterprise Agent Platform (formerly Vertex AI Agent Engine)
- Managing notebooks in Gemini Enterprise Agent Platform Workbench (formerly Vertex AI Workbench) and BigQuery
- Managing developer environments (e.g., Cloud Workstations)

3.2 Managing storage and data solutions. Considerations include:
- Managing and securing objects in Cloud Storage buckets
- Setting object lifecycle management policies for Cloud Storage buckets
- Executing queries to retrieve data from data instances (e.g., Cloud SQL, BigQuery, Bigtable, Spanner, Firestore, AlloyDB)
- Estimating costs of data storage resources
- Backing up and restoring database instances (e.g., Cloud SQL, Firestore, Spanner, AlloyDB, Bigtable)
- Reviewing job status (e.g., Dataflow, BigQuery)
- Using Database Center to manage the Google Cloud database fleet
- Configuring customer-managed encryption keys (CMEK)

3.3 Managing networking resources. Considerations include:
- Resizing a subnet's IPv4 address range
- Reserving static external or internal IP addresses
- Adding custom static routes in a VPC
- Using Cloud DNS and Cloud NAT
- Managing VPC firewall rules and Cloud NGFW policies

3.4 Monitoring and logging. Considerations include:
- Creating Cloud Monitoring alerts based on resource metrics
- Creating and ingesting Cloud Monitoring custom metrics (e.g., from applications or logs)
- Configuring audit logs (e.g., VPC Flow Logs, audit logs, firewall logs)
- Exporting logs to external systems (e.g., on-premises, BigQuery)
- Configuring log buckets, log analytics, and log routers
- Viewing and filtering logs in Cloud Logging
- Viewing specific log message details in Cloud Logging
- Using cloud diagnostic tools (e.g., Cloud Trace, Cloud Profiler, Query Insights, index advisor) to investigate an application issue
- Viewing the Personalized Service Health dashboard
- Configuring and deploying Ops Agent
- Deploying Google Cloud Managed Service for Prometheus
- Using Gemini Cloud Assist for Cloud Monitoring
- Using Active Assist to optimize resource utilization
- Using Cloud Hub to monitor active events and application health data

**Section 4: Configuring access and security (~20% of the exam)** — [Live guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)

4.1 Managing IAM. Considerations include:
- Viewing and creating IAM policies
- Attaching roles and policy inheritance in the Organization hierarchy
- Managing the various role types and defining custom IAM roles

4.2 Managing service accounts. Considerations include:
- Creating service accounts, including Google-managed service accounts
- Using service accounts in IAM policies with minimum permissions
- Assigning service accounts to resources
- Managing IAM permissions of a service account
- Managing service account impersonation
- Creating and managing short-lived service account credentials
- Using a Google Cloud service account with a GKE application
- Provisioning Workload Identity Federation

**Bullet counts (my tally of the live guide):** 1.1 = 12, 1.2 = 4, 2.1 = 12, 2.2 = 4, 2.3 = 6, 2.4 = 2, 3.1 = 16, 3.2 = 8, 3.3 = 5, 3.4 = 14, 4.1 = 3, 4.2 = 8. That is 94 bullets in total, versus 80 in v4.0 — [Live guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf); [v4.0 PDF](https://services.google.com/fh/files/misc/v4.0_associate_cloud_engineer_exam_guide_english.pdf)

**Renewal exam guide (live)**
- The renewal guide describes itself (verbatim) as "a streamlined version of the standard Associate Cloud Engineer exam guide, focusing on key areas critical to the job role… Section and objective numbers in this renewal exam guide are aligned to the standard Associate Cloud Engineer exam guide. Omitted objectives are not assessed in the renewal exam." — [Renewal guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_renewal_exam_guide_english.pdf)
- Renewal weightings:
  - Section 1 is "(not included in renewal exam)".
  - Section 2 is ~40%, with 2.1–2.4 identical to the standard guide, including the AI-assisted tooling bullet.
  - Section 3 is ~40%, with 3.1–3.4 identical to the standard guide.
  - Section 4 is ~20%, but covers **only 4.2 Managing service accounts**. 4.1 Managing IAM is omitted.
  - [Renewal guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_renewal_exam_guide_english.pdf)
- The renewal guide uses the same "supported by AI tooling" role description and the same Agent Platform naming as the live standard guide. This shows the two were refreshed together — [Renewal guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_renewal_exam_guide_english.pdf)

### Inferences
- The live guide has a heavier operations weight (S3 ~30%) and AI-tooling objectives in S1, S2.4, S3.1 and S3.4. Practice questions should therefore weight operations at least as heavily as planning, and include some recognition-level questions on Gemini Cloud Assist, Gemini CLI, Antigravity, Application Design Center, Agent Runtime and Cloud Hub.
- Section 4 has only 11 bullets but carries ~20%. Each IAM and service-account bullet (impersonation, short-lived credentials, Workload and Workforce Identity Federation, Google-managed service accounts, policy inheritance) is therefore likely to be tested repeatedly.
- The renewal exam omits Section 1 and 4.1 entirely. So renewal candidates should focus on S2, S3 and service accounts.

### Gaps
- Google does not print a version number (for example "v5.0") or an effective date on the live guide. I could not find an official Google page that names the live guide's version.
- Google does not publish how many questions come from each section. Weightings are approximate ("~").

## Q2. Did Google revise the exam guide or announce exam changes in 2025-2026, and what changed?

### Takeaway
Yes. Google replaced the v4.0 guide with the current, unversioned guide. v4.0 was weighted ~23/30/27/20 and was itself announced as "live on June 30". The current guide is weighted ~20/30/30/20. It adds AI-assisted tooling (Gemini CLI, Antigravity, Gemini Cloud Assist, Application Design Center), Agent Runtime and Workbench on Gemini Enterprise Agent Platform, GPUs/TPUs, Managed Lustre, CMEK, Cloud Hub, and Workforce and Workload Identity Federation. Secondary sources date the current version to June 30, 2026, but the year printed on v4.0's "June 30" is ambiguous (see Gaps). Separately, exam delivery moved from Kryterion to Pearson VUE (first Pearson test date March 2, 2026).

### Cited Findings

**Version history**
- The v4.0 PDF reads (verbatim): "This is the new version of the Associate Cloud Engineer standard exam guide. This exam guide will be live on June 30. If you plan to take the Associate Cloud Engineer standard exam in English on or after June 30, review this exam guide." No year is given — [v4.0 PDF](https://services.google.com/fh/files/misc/v4.0_associate_cloud_engineer_exam_guide_english.pdf)
- v4.0 weightings (historical): Section 1 ~23%, Section 2 ~30%, Section 3 ~27%, Section 4 ~20% — [v4.0 PDF](https://services.google.com/fh/files/misc/v4.0_associate_cloud_engineer_exam_guide_english.pdf)
- Current weightings: ~20% / ~30% / ~30% / ~20%. Net change is S1 −3 points and S3 +3 points — [Live guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)
- A third-party article (dated Oct 4, 2026, no author) says the guide "was updated on June 30, 2026". It says the update added Gemini Cloud Assist, Gemini CLI, Application Design Center, GPU vs TPU, Managed Lustre and others. It says Vertex AI Agent Engine was renamed Agent Runtime on Gemini Enterprise Agent Platform in April 2026, and that the June 30 refresh aligned the guide with that rename. However, it gives the weights as ~20/30/27/23, which **contradicts** the live PDF's ~20/30/30/20. It also cites no Google announcement — [examos.io](https://examos.io/blog/google-ace-exam-june-2026-refresh); contradicted by [Live guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)
- Another third-party article says ACE "moved to a new English-language version of the exam on June 30, 2026". It says there is no option to take the older version and that the renewal exam was refreshed the same day. It lists no specific objective changes and links no Google announcement — [DirectCertify](https://www.directcertify.com/blog/google-cloud-certification-changes-2026-pearson-vue-and-ai-exam-overhaul/)
- CBT Nuggets (July 24, 2025) said the 2025 update kept domain names but expanded IAM, GKE and networking. This third-party piece gives no weightings. Some of its claims are unreliable: it says Deployment Manager gained emphasis, yet Deployment Manager appears in neither v4.0 nor the live guide. Treat it as low-reliability historical context — [CBT Nuggets](https://www.cbtnuggets.com/blog/certifications/cloud/google-associate-cloud-engineer-ace-exam-update-whats-changed-in-2025)

**Exact diff, v4.0 to live guide** (my own comparison of the two official PDFs: [v4.0](https://services.google.com/fh/files/misc/v4.0_associate_cloud_engineer_exam_guide_english.pdf) vs [live](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf))

- Role description: added "supported by AI tooling".
- **S1 (23% → 20%)**
  - "Confirming availability of products in geographical locations (e.g., regional, global)" was reworded to "Verifying product availability across geographical locations (e.g., regions, zones)".
  - ADDED: "Configuring Workforce Identity Federation".
  - "Configuring Cloud Asset Inventory and using Gemini Cloud Assist to analyze resources" was already in v4.0, so it is not new in 2026.
- **S2.1**
  - The compute-choice example "Knative serving" was REMOVED and replaced with "Agent Runtime on Gemini Enterprise Agent Platform [formerly Vertex AI Agent Engine]".
  - ADDED: "Identifying whether to use GPUs or TPUs".
- **S2.2:** ADDED "Google Cloud Managed Lustre" to storage products. Hyperdisk, NetApp Volumes, Managed Kafka, AlloyDB and Memorystore were already in v4.0.
- **S2.3**
  - VPC example now includes "VPC Network Peering".
  - The firewall bullet was broadened from "Cloud NGFW policies" to "VPC firewalls rules and Cloud NGFW policies".
- **S2.4**
  - Retitled from "Planning and implementing resources through infrastructure as code" to "Planning and implementing resources using tooling".
  - REMOVED: "Planning and executing infrastructure as code deployments, including versioning, state management, and updates".
  - ADDED: "AI-assisted planning and implementation (e.g., Gemini CLI, Google Antigravity, Gemini Cloud Assist, Application Design Center)".
  - The IaC tool list (Fabric FAST, Config Connector, Terraform, Helm) is unchanged.
- **S3 (27% → 30%)**
  - Title gains "the".
  - 3.1 ADDED: "Attaching GPUs and TPUs"; "Deploying an agent to Agent Runtime on Gemini Enterprise Agent Platform (formerly Vertex AI Agent Engine)"; "Managing notebooks in Gemini Enterprise Agent Platform Workbench (formerly Vertex AI Workbench) and BigQuery"; "Managing developer environments (e.g., Cloud Workstations)".
  - 3.2 ADDED: "Configuring customer-managed encryption keys (CMEK)".
  - 3.3: "Adding a subnet to an existing VPC" and "Expanding a subnet to have more IP addresses" were merged into "Resizing a subnet's IPv4 address range". "Working with Cloud DNS and Cloud NAT" became "Using…". ADDED: "Managing VPC firewall rules and Cloud NGFW policies".
  - 3.4: "Configuring audit logs" now has examples "(e.g., VPC Flow Logs, audit logs, firewall logs)". The diagnostics bullet was reworded to "Using cloud diagnostic tools … to investigate an application issue". ADDED: "Using Cloud Hub to monitor active events and application health data". "Using Gemini Cloud Assist for Cloud Monitoring" and "Using Active Assist…" were already in v4.0.
- **S4 (20% → 20%)**
  - 4.1 retitled "Managing IAM".
  - ADDED: "Attaching roles and policy inheritance in the Organization hierarchy".
  - The custom-roles bullet dropped its example "(e.g., basic, predefined, custom)".
  - 4.2: "Creating service accounts" became "Creating service accounts, including Google-managed service accounts". ADDED: "Provisioning Workload Identity Federation".
- Unchanged in both versions: GKE Autopilot (cluster deployment and Pod resource requests), Cloud Run traffic splitting and autoscaling, Database Center, Managed Service for Prometheus, Personalized Service Health, and Ops Agent.
- Not named in either v4.0 or the live guide: Infrastructure Manager, Deployment Manager and App Engine.

**Exam delivery and platform changes (official)**
- Google's support FAQ gives the delivery-partner dates:
  - "February 22, 2026: Last day to schedule and test with Kryterion"
  - No exams between February 23 and March 1, 2026
  - CM Connect registration resumed 9 am PST February 26, 2026
  - "first available test date of March 2, 2026" with Pearson
  - [Google support: Upcoming Change to Exam Delivery Provider](https://support.google.com/cloud-certification/answer/16803278?hl=en)
- The same FAQ says exam content is unchanged by the Pearson move; only the layout and delivery interface changed. The retake policy is unchanged — [Google support](https://support.google.com/cloud-certification/answer/16803278?hl=en)
- Pearson details from the same FAQ:
  - Delivery is via OnVUE online proctoring or a test center.
  - Rescheduling or cancelling needs 24 hours' notice, or the fee is forfeited.
  - Online-proctor support is in English, Japanese and Spanish.
  - Chromebook compatibility was "expected in June 2026".
  - [Google support](https://support.google.com/cloud-certification/answer/16803278?hl=en)
- Beginning October 29, 2026, CM Connect sign-in requires Google Skills or Google Skills for Partners credentials instead of an email and password — [Google support: renewal](https://support.google.com/cloud-certification/answer/9907853)
- Training platform rebrand: cloudskillsboost.google/paths/11 now returns a 308 permanent redirect to skills.google/paths/11 ("Google Skills") — [skills.google path 11](https://www.skills.google/paths/11)

### Inferences
- **Year of the v4.0 "June 30" (inference, not confirmed):** v4.0 most likely took effect June 30, **2025**, and the current guide is a later 2026 refresh. Evidence:
  - The current guide uses the "Gemini Enterprise Agent Platform" names, which a secondary source dates to an April 2026 rename.
  - The v4.0 PDF was rendered by "Skia/PDF m139", the live one by "m151". Chrome 139 shipped around August 2025, which suggests v4.0 was produced in 2025.
  - A Scribd copy of "Associate Cloud Engineer Exam Guide English" (ID 896346972) appears in search results consistent with mid-2025.
  - Secondary 2026 sources all say a new version went live June 30, 2026. That matches the live guide's content (Agent Platform names, Antigravity, which launched in late 2025).
  - So both versions may have used a "June 30" cutover in consecutive years. The report writer should present June 30, 2026 as the secondary-sourced effective date of the current guide, and v4.0 as the prior (probably 2025) version.
- The 2026 changes are mostly additive and are concentrated in three areas: AI tooling and agents, accelerators (GPU/TPU), and identity federation and encryption (WIF, Workforce IF, CMEK). The IaC lifecycle bullet (versioning and state management) was removed, which lowers emphasis on Terraform internals in favour of tool recognition.

### Gaps
- I found no official Google blog post or announcement that dates the current guide's go-live or lists its changes. The June 30, 2026 date comes only from third-party sites (examos.io, DirectCertify).
- I could not confirm from an official source the year of v4.0's "June 30" go-live.
- I found no official statement on whether non-English versions (Japanese, Spanish, Portuguese) of the exam have moved to the new guide. v4.0's note said the change applied to "the Associate Cloud Engineer standard exam in English".

## Q3. What are the current logistics?

### Takeaway
- Standard exam: 2 hours, 50–60 multiple-choice and multiple-select questions, $125 plus tax. Offered in English, Japanese, Spanish and Portuguese, online- or onsite-proctored via Pearson VUE, no prerequisites, 6+ months of hands-on experience recommended, valid 3 years.
- Renewal exam: 1 hour, 20 questions, $75, English and Japanese only, available from 180 days before expiry.
- From 2026, a continuing-education (Google Skills) renewal path can also add 1 year of validity for select certifications.

### Cited Findings
- **Standard exam:** "Length: 2 hours"; "Registration fee: $125 (plus tax where applicable)"; "Languages: English, Japanese, Spanish, Portuguese"; "Exam format: 50-60 multiple choice and multiple select questions"; "Exam Delivery Method: Online-proctored or onsite-proctored"; "Validity period: 3 years"; "Prerequisites: None"; "Recommended experience: 6+ months hands-on experience with Google Cloud" — [Cert page](https://cloud.google.com/learn/certification/cloud-engineer)
- **Renewal exam:** "Length: 1 hour"; "Registration fee: $75 (plus tax where applicable)"; "Languages: English, Japanese"; "Exam format: 20 multiple choice and multiple select questions"; "Validity period: 3 years"; "Eligibility: Candidates must have an active certification and be within the renewal eligibility period" — [Cert page](https://cloud.google.com/learn/certification/cloud-engineer)
- **Path rule (verbatim):** "If this is your first time getting certified, or your certification has expired, you must take the standard exam. If you are renewing your certification, you can choose to take the shorter renewal exam or the standard exam starting 180 days before your expiration date. Once you have chosen either the standard or renewal exam path, you will stay in that path until you pass or your certification expires." — [Cert page](https://cloud.google.com/learn/certification/cloud-engineer)
- The renewal FAQ names ACE, together with Professional Data Engineer and Cloud Digital Leader, as certifications that cannot switch renewal paths after the first renewal attempt. Professional Cloud Architect can switch — [Google support: renewal](https://support.google.com/cloud-certification/answer/9907853)
- **Continuing-education renewal (official, wording general):** "Renew with continuing education in Google Skills" is available for select Google Cloud certifications. Its window opens 1 year before the inactive date, and completing it "adds 1 year of validity to your current inactive date". Renewal is possible up to 30 days after the inactive date. After that, the standard exam at full price is required — [Google support: renewal](https://support.google.com/cloud-certification/answer/9907853)
- A secondary source says that from July 2026 the CE option covers PCA, PDE, **ACE** and CDL, adding one year of validity — [DirectCertify](https://www.directcertify.com/blog/google-cloud-certification-changes-2026-pearson-vue-and-ai-exam-overhaul/)
- **Delivery:** Pearson VUE (OnVUE remote or test center) since March 2, 2026. Registration is through CM Connect (cp.certmetrics.com/google) — [Google support](https://support.google.com/cloud-certification/answer/16803278?hl=en); [Cert page](https://cloud.google.com/learn/certification/cloud-engineer)
- **Historical:** before March 2026, exams were delivered by Kryterion (Webassessor) — [Google support](https://support.google.com/cloud-certification/answer/16803278?hl=en)

### Inferences
- The question count (50–60), duration and price did not change with the 2026 guide refresh. The cert page shows the same values as in previous years.

### Gaps
- Passing score and scoring method are not published on the cert page.
- My fetch of the renewal FAQ returned a flattened table, so I could not verify directly from Google that ACE is on the CE-renewal list. ACE's inclusion is confirmed only by a secondary source.
- I did not retrieve the retake waiting-period rules (the Pearson FAQ says only that the retake policy is "unchanged").

## Q4. What do Google's official sample questions and learning path emphasize?

### Takeaway
- Google's official prep resources are the sample-questions form, the "Associate Cloud Engineer Certification" learning path (now on skills.google, 12 activities: courses, labs and skill badges), and the "Preparing for the Associate Cloud Engineer Examination" course.
- Neither the form nor the path page, as fetched, showed which topics it covers or which guide version it matches.

### Cited Findings
- The cert page's prep steps are:
  1. Get 6+ months of hands-on experience.
  2. Review the standard or renewal exam guide.
  3. Follow the Cloud Engineer learning path, and take the "Preparing for the Associate Cloud Engineer Examination" course for a "final check for exam readiness".
  4. Review the sample questions.
  5. Schedule the exam.
  - It also links partner training (partner.cloudskillsboost.google/paths/69) and the community forum (discuss.google.dev).
  - [Cert page](https://cloud.google.com/learn/certification/cloud-engineer)
- The learning path is titled "Associate Cloud Engineer Certification". It combines on-demand courses, labs and skill badges for the Cloud Engineer role, "from infrastructure setup through application deployment", and contains "12 activities". The activity list did not render in my fetch, and the page as fetched did not mention Gemini — [Google Skills path 11](https://www.skills.google/paths/11)
- The sample-questions form is titled "Associate Cloud Engineer Sample Questions". Its intro says the questions familiarize candidates with the format and example content, and do not represent the full range of topics or difficulty. The form has about 22 pages. It names no guide version or date — [Sample questions form](https://docs.google.com/forms/d/e/1FAIpQLSfexWKtXT2OSFJ-obA4iT3GmzgiOCGvjrT9OfxilWC1yPtmfQ/viewform)

### Inferences
- The learning path describes itself as running "from infrastructure setup through application deployment", which suggests it maps to Sections 1–3. Without the rendered activity list I cannot tell whether it has been updated for the 2026 AI-tooling objectives.

### Gaps
- The learning path's activity list (course names and order) did not render, because the page is JavaScript-driven.
- The sample-questions form's per-topic coverage was not visible without going through the form. Per the task constraints, I did not extract any question content.
- I found no official statement on whether the sample questions were updated for the 2026 guide.
