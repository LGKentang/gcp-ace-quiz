# What Recent Test-Takers Report About the Google Cloud Associate Cloud Engineer (ACE) Exam (target window: May–Nov 2026)

> **Read this first: how good the evidence is.** I found very few first-hand "I sat the ACE in May–Nov 2026" reports that say which topics appeared. Reddit (r/googlecloud, r/GCPCertification) could not be fetched directly: the one mirror I tried returned HTTP 403. Search engines surfaced only undated Reddit mirror snippets. Most search results were practice-test vendors and exam-dump sites, and I did not use the dump sites for content. The most important dated fact in the window is that the exam guide changed: **a new "v4.0" ACE exam guide went live on June 30 (2026 according to third-party sources).** So reports from before July 2026 describe the older blueprint. The notes below combine (a) the official v4.0 guide, which I read in full, (b) the few dated first-hand reports, labelled by date, and (c) vendor claims, flagged as such. No exam question text was collected.

## Q1. Which services and topics do recent candidates say appeared most often?

### Takeaway
I found no 2026 first-hand report that lists the services that appeared on the exam. The best dated evidence is the official v4.0 guide (live June 30). It confirms that IAM and service accounts, GKE and kubectl, Cloud Run, VPC and firewall, Cloud Storage classes and lifecycle, billing and budgets, logging and monitoring, and database selection all remain core. It also adds Gemini Cloud Assist, Cloud NGFW policies, Hyperdisk, AlloyDB, Database Center, and IaC via Terraform, Config Connector, Fabric FAST and Helm. Deployment Manager is not listed. Older first-hand reports (2025) name IAM and networking as the trickiest areas.

### Cited Findings
**Official v4.0 exam guide (primary source; "This exam guide will be live on June 30")** — [Google v4.0 ACE exam guide PDF](https://services.google.com/fh/files/misc/v4.0_associate_cloud_engineer_exam_guide_english.pdf)
- Four sections with these weights: **S1 Setting up a cloud solution environment ~23%**, **S2 Planning and implementing ~30%**, **S3 Ensuring successful operation ~27%**, **S4 Configuring access and security ~20%**. (The older guide had five sections; see the conflict note below.)
- **S1 (setup):** resource hierarchy and org policies; granting IAM roles in a project; managing Cloud Identity users and groups (manually and automated); enabling APIs; setting up Google Cloud Observability; quotas and quota increases; standalone organizations; setting up cloud networking; confirming product availability by region or global location; **"Configuring Cloud Asset Inventory and using Gemini Cloud Assist to analyze resources."** Billing: creating billing accounts, linking projects, **budgets and alerts**, **billing exports**.
- **S2 compute:** choosing among Compute Engine, GKE, Cloud Run, **Cloud Run functions**, and Knative serving; availability policy and SSH keys; choosing between zonal PD, regional PD and **Hyperdisk**; autoscaled MIG from an instance template; **OS Login**; **VM Manager**; **Spot VMs** and custom machine types; installing and configuring kubectl; GKE **Autopilot / regional / private clusters**; deploying containers to GKE; serverless event processing (**Pub/Sub, Cloud Storage notifications, Eventarc**).
- **S2 data and storage:** choosing among Cloud SQL, BigQuery, Firestore, Spanner, Bigtable, **AlloyDB**, Dataflow, Pub/Sub, **Managed Service for Apache Kafka**, and Memorystore; choosing among Cloud Storage, Filestore and **NetApp Volumes**; storage classes (Standard, Nearline, Coldline, Archive); loading data (CLI upload, load from Cloud Storage, **Storage Transfer Service**); multi-region redundancy.
- **S2 networking:** custom-mode VPC and **Shared VPC**; **Cloud NGFW policies** with ingress and egress rule attributes; **secure Tags and service accounts in NGFW rules**; Cloud VPN, VPC peering, Interconnect; choosing load balancers; **Network Service Tiers**.
- **S2 IaC:** "Fabric FAST, Config Connector, Terraform, Helm"; versioning, **state management**, and updates. **Deployment Manager is not named, and neither is Infrastructure Manager.**
- **S3 operations:** SSH and remote connection; snapshots and images, including **snapshot schedules**; GKE inventory (nodes, Pods, Services); **GKE pulling from Artifact Registry**; adding, editing or removing node pools and node-pool autoscaling; Pods, Services, StatefulSets; **HPA and VPA**; **Autopilot Pod resource requests**; new **Cloud Run revisions**; **traffic splitting (Cloud Run, Cloud Run functions, GKE)**; Cloud Run autoscaling.
- **S3 storage ops:** securing objects; **lifecycle policies**; querying Cloud SQL, BigQuery, Bigtable, Spanner, Firestore and AlloyDB; **estimating storage costs**; backup and restore (Cloud SQL, Firestore, Spanner, AlloyDB, Bigtable); job status (Dataflow, BigQuery); **Database Center**.
- **S3 networking ops:** adding a subnet; **expanding a subnet**; reserving static internal and external IPs; custom static routes; **Cloud DNS and Cloud NAT**.
- **S3 monitoring and logging:** alerting on metrics; **custom metrics (from apps or logs)**; log export (to on-prem or BigQuery); **log buckets, Log Analytics, log router**; filtering logs; Trace, Profiler, **Query Insights, index advisor**; **Personalized Service Health**; **Ops Agent**; **Managed Service for Prometheus**; **audit logs**; **"Using Gemini Cloud Assist for Cloud Monitoring"**; **Active Assist**.
- **S4 IAM and service accounts:** viewing and creating IAM policies; basic, predefined and custom roles; creating service accounts; **service accounts with minimum permissions**; attaching service accounts to resources; managing a service account's own IAM; **impersonation**; **short-lived credentials**; **using a Google service account from a GKE app** (that is, Workload Identity-type scenarios).

**First-hand reports (dated)**
- (Post dated **Sept 15, 2026**, Google Developer forums; the author is from the "Gear Get Certified" cohort that started **June 29, 2026**.) The author lists the five old-guide domains and the services they *studied*. They do **not** say which topics appeared. They say the exam tests "which service to use, why, how to configure it, and how to operate it" rather than memorization. — [Google Developer forums: "My 6-week journey"](https://discuss.google.dev/t/google-cloud-certified-associate-cloud-engineer-ace-my-6-week-journey-from-learning-to-certification/397463)
- (Post dated **Sept 3, 2025**, before the target window.) The author names **IAM and networking** as the trickiest areas. They describe the exam as practical, console- and troubleshooting-oriented, and "not code-heavy." — [iterai: How I passed the ACE](https://iterai.beehiiv.com/p/how-i-passed-the-google-cloud-associate-cloud-engineer-certification)
- (Exam **Feb 2025**, post June 2025, before the target window.) The author says the exam is a "broad overview of GCP services" and an entry point rather than deep specialization. They name no specific services. — [castnutt on dev.to](https://dev.to/castnutt/google-cloud-associate-cloud-engineer-my-experience-5hmh)
- (Undated Reddit mirror snippets.) Search snippets show "Passed ACE Exam Today!" posts on r/GCPCertification (about one month of study, Coursera plus notes) and r/googlecloud (a 6-hour cram). No topic detail was visible, and I could not confirm the dates. — [r/GCPCertification mirror](https://redlib.hbubli.cc/r/GCPCertification) (403 on fetch); [r/googlecloud mirror](https://cal1.lr.ggtyler.dev/r/googlecloud/comments/1gismjg/i_passed_my_ace_exam)

**Secondary and vendor claims (lower confidence)**
- ExamOS (vendor, post dated **Oct 4, 2026**) says the June 30, 2026 refresh moved the guide from five sections to four. It adds Gemini Cloud Assist, AlloyDB, Hyperdisk, Managed Lustre, NetApp Volumes, Managed Kafka and Cloud NGFW, and treats Deployment Manager as deprecated in favour of Terraform, Config Connector and Fabric FAST. It **also** claims that Gemini CLI, Application Design Center, Agent Runtime and GPU-vs-TPU choice are in scope. **The v4.0 PDF I read does not contain Gemini CLI, Application Design Center, Agent Runtime, Antigravity, Managed Lustre, or GPU/TPU.** — [ExamOS: ACE June 2026 refresh](https://examos.io/blog/google-ace-exam-june-2026-refresh); compare [official v4.0 PDF](https://services.google.com/fh/files/misc/v4.0_associate_cloud_engineer_exam_guide_english.pdf)
- **Weight conflict:** ExamOS gives roughly 20% (S1) and 23% (S4). The official PDF gives **23% (S1)** and **20% (S4)**. Use the official figures. — [ExamOS](https://examos.io/blog/google-ace-exam-june-2026-refresh); [official PDF](https://services.google.com/fh/files/misc/v4.0_associate_cloud_engineer_exam_guide_english.pdf)
- **Date conflict:** one search-surfaced source places the Gemini Cloud Assist addition at an Aug 1, 2025 update. ExamOS and others say June 30, 2026. The PDF says only "June 30" with no year. — [ExamOS](https://examos.io/blog/google-ace-exam-june-2026-refresh); [open-exam-prep 2026 guide](https://open-exam-prep.com/blog/google-associate-cloud-engineer-exam-guide-2026)
- CBT Nuggets (July 2025) says an earlier 2025 update added more AI/ML-adjacent, IAM and security, deployment and automation, and Kubernetes content. — [CBT Nuggets: ACE exam update 2025](https://www.cbtnuggets.com/blog/certifications/cloud/google-associate-cloud-engineer-ace-exam-update-whats-changed-in-2025)

### Inferences
- Because first-hand topic reports are missing, the v4.0 guide is the most reliable map of what candidates sitting after June 30, 2026 will see. The traditional core (IAM and service accounts, GKE and kubectl, Cloud Run, VPC, storage classes and lifecycle, billing, logging and monitoring, database selection) is all still explicitly listed.
- The **new or expanded** areas below are the ones most likely missing from older practice banks, so they are where original questions add the most value:
  - Gemini Cloud Assist (with Cloud Asset Inventory, and for Monitoring)
  - Cloud NGFW *policies* with secure Tags and service-account targets, rather than just legacy VPC firewall rules
  - Hyperdisk vs PD
  - AlloyDB
  - Database Center
  - Managed Kafka and NetApp Volumes as selection distractors
  - Cloud Run functions (the renamed Cloud Functions) and Eventarc
  - Autopilot Pod resource requests, and HPA vs VPA
  - Traffic splitting across Cloud Run and GKE
  - Log Analytics and log buckets
  - Managed Prometheus and Ops Agent
  - Personalized Service Health
  - Active Assist
  - Query Insights and index advisor
  - Short-lived credentials and impersonation
  - Terraform state management, Config Connector and Fabric FAST
- Deployment Manager questions are probably no longer worth writing for the post-June-2026 exam, since it is absent from v4.0. "Deployment Manager vs Terraform" items, if used at all, should be framed as "which tool is current and recommended."

### Gaps
- No first-hand May–Nov 2026 report I could access lists the services that actually appeared on the exam. Reddit was not reachable, and LinkedIn posts did not surface in search.
- I could not confirm whether candidates are actually seeing Gemini Cloud Assist, NGFW-policy or Database Center questions after June 30, 2026, or how often.
- I could not confirm the year of the "June 30" go-live from Google directly; the PDF omits the year.

## Q2. What scenario patterns recur?

### Takeaway
None of the 2026 first-hand reports I found describes scenario patterns in any detail. The available evidence says only that the exam is practical and asks you to choose a service and configure or operate it ("which service, why, how to configure, how to operate"). The official guide's wording points to least privilege, cost estimation, service selection, CLI and kubectl operations, and troubleshooting.

### Cited Findings
- The Sept 2026 author says questions test choosing the right service, justifying it, configuring it and operating it, not memorization. — [Google Developer forums](https://discuss.google.dev/t/google-cloud-certified-associate-cloud-engineer-ace-my-6-week-journey-from-learning-to-certification/397463)
- A 2025 candidate describes the exam as practical, with hands-on console work and troubleshooting, and not code-heavy. — [iterai](https://iterai.beehiiv.com/p/how-i-passed-the-google-cloud-associate-cloud-engineer-certification)
- The official guide's wording includes "Using service accounts in IAM policies **with minimum permissions**," "**Selecting appropriate compute choices** for a given workload," "**Estimating costs** of data storage resources," "**Using cloud diagnostics to research an application issue**," "**Expanding a subnet**," and "Installing and configuring … kubectl." — [official v4.0 PDF](https://services.google.com/fh/files/misc/v4.0_associate_cloud_engineer_exam_guide_english.pdf)
- (Vendor claim) Deployment questions often present a broken CI/CD rollout, or ask which sequence of gcloud, Cloud Build or kubectl commands gives a safe rollout. — [examcert.app: command drills](https://www.examcert.app/blog/gcp-associate-cloud-engineer-exam-questions-2026/)
- (Vendor claim) Networking scenarios include hybrid connectivity to on-prem over private IP ranges. — surfaced via search of vendor sample pages; not independently confirmed.

### Inferences
- These archetypes are consistent with both the guide and the reports, and are safe to build original questions around:
  1. **Least privilege**: the narrowest predefined role or service-account binding, impersonation instead of key download, and short-lived credentials.
  2. **Service selection** (compute and database): "minimal operational overhead" usually points to Cloud Run or Autopilot.
  3. **Most cost-effective**: storage class plus lifecycle, Spot VMs, budgets and exports, and estimating storage costs.
  4. **Choosing the right gcloud, kubectl or gsutil/gcloud storage command or flag.**
  5. **Troubleshooting** connectivity (NGFW rule targeting, Cloud NAT for private VMs, routes, peering limits) and app issues (Logging filters, Trace, Query Insights).
  6. **Operational change without downtime**: Cloud Run revision traffic splits, MIG rolling updates, node-pool changes.

### Gaps
- No first-hand 2026 report quantifies how often "least privilege," "cost-effective," or "minimal overhead" framings appear, or how many questions are command or flag selection.

## Q3. What surprised people, what did prep materials miss, and are Gemini/AI features mentioned?

### Takeaway
Few recent surprises are documented. The recurring complaints are that the scope is broad and the docs are dense, and that labs don't map neatly onto exam questions. The main "missed by prep materials" risk in 2026 is structural: practice banks written before the June 30 guide lack the new Gemini Cloud Assist, Database Center, NGFW-policy and similar content. In the sources I could access, Gemini shows up in the exam guide and in training programs, but no test-taker reports actually seeing a Gemini question.

### Cited Findings
- A Feb 2025 candidate found the scope hard to pin down and the official documentation overwhelming. Hands-on labs "don't always align with what's needed to actually pass." — [castnutt on dev.to](https://dev.to/castnutt/google-cloud-associate-cloud-engineer-my-experience-5hmh)
- A 2025 candidate found IAM and networking the trickiest areas. — [iterai](https://iterai.beehiiv.com/p/how-i-passed-the-google-cloud-associate-cloud-engineer-certification)
- The Sept 2026 program participant's Week 5 included a mandatory skill badge, "Create Your First Gemini Enterprise Application," plus an introduction to agents. The author did **not** tie this to exam content. — [Google Developer forums](https://discuss.google.dev/t/google-cloud-certified-associate-cloud-engineer-ace-my-6-week-journey-from-learning-to-certification/397463)
- The official v4.0 guide includes Gemini Cloud Assist twice: resource analysis with Cloud Asset Inventory, and use with Cloud Monitoring. — [official v4.0 PDF](https://services.google.com/fh/files/misc/v4.0_associate_cloud_engineer_exam_guide_english.pdf)
- A public GitHub issue on a quiz repository notes that its ACE question bank predates the June 2026 guide and has no Gemini Cloud Assist or Database Center questions. This illustrates that the gap exists in prep materials. — [GitHub issue: earthboundtrev/cloud_computing_quizzes #8](https://github.com/earthboundtrev/cloud_computing_quizzes/issues/8)
- **Delivery change:** since March 2, 2026, Google Cloud exams are delivered through Pearson VUE (online-proctored or test centre) instead of Kryterion. Length and format are unchanged (2 hours, 50–60 multiple-choice and multiple-select questions, $125). — [open-exam-prep 2026 guide](https://open-exam-prep.com/blog/google-associate-cloud-engineer-exam-guide-2026); [Google ACE certification page](https://cloud.google.com/learn/certification/cloud-engineer); [ExamOS](https://examos.io/blog/google-ace-exam-june-2026-refresh)
- **Renewal:** from July 2026, ACE can reportedly be renewed by completing designated Google Skills courses or badges (third-party reports). — [ExamOS](https://examos.io/blog/google-ace-exam-june-2026-refresh); [open-exam-prep](https://open-exam-prep.com/blog/google-associate-cloud-engineer-exam-guide-2026)
- **Difficulty (secondary):** most sources call ACE "moderate." Vendors disagree on whether practice tests are harder or easier than the real exam. Certsqill argues that cheap or free banks oversimplify into memorization, while the real exam is more applied. — [Certsqill blog](https://www.certsqill.com/blog/google-ace-passed-practice-failed/); [CertSharp](https://www.certsharp.com/certifications/google/associate-cloud-engineer)
- Google does not publish a passing score; 70% figures are unofficial estimates. — [open-exam-prep](https://open-exam-prep.com/blog/google-associate-cloud-engineer-exam-guide-2026)

### Inferences
- The likeliest post-June-2026 "surprise" is newer products and renamed services appearing in answer options (Cloud NGFW policies, Hyperdisk, AlloyDB, Database Center, Cloud Run functions, Gemini Cloud Assist), because candidates often train on older banks. Original questions that use the current product names and these newer services fill a real gap.
- Gemini questions are likely to be operational, e.g. "use Gemini Cloud Assist to analyze resources or investigate a monitoring issue," rather than about building AI apps. The guide does not include Vertex AI, Gemini CLI or agent-building, despite some vendor claims.

### Gaps
- No accessible first-hand 2026 account says "I was surprised by X" or "the Gemini questions looked like Y."
- I found no reliable reports on recent ACE pass and fail rates or score distributions; Google doesn't publish them.

## Q4. Which study resources and mock exams do candidates say were most representative?

### Takeaway
Candidates consistently rank practice questions above labs for matching the exam format. Specific names are Aldovelio Castremonte's practice questions (Feb 2025 exam) and TutorialsDojo (2025). Google's Get Certified / Gear program labs and the official sample questions are valued for hands-on grounding (Sept 2026). No 2026 source evaluates whether any mock exam reflects the v4.0 guide.

### Cited Findings
- The Sept 2026 author found the Gear Get Certified program's hands-on labs the most valuable resource, alongside the official exam guide, skill badges, and Google's sample questions. They named no third-party mock exams. — [Google Developer forums](https://discuss.google.dev/t/google-cloud-certified-associate-cloud-engineer-ace-my-6-week-journey-from-learning-to-certification/397463)
- The Feb 2025 candidate found **Aldovelio Castremonte's practice questions** most useful for exam format and finding gaps, and **Dan Sullivan's ACE study guide** useful for concepts but "possibly outdated." Get Certified labs were good practice but not aligned with the exam. — [castnutt on dev.to](https://dev.to/castnutt/google-cloud-associate-cloud-engineer-my-experience-5hmh)
- A 2025 candidate used YouTube domain walkthroughs, TutorialsDojo free mocks, Google docs, a free-tier account, and self-made flashcards. They say practice tests made the real exam feel familiar. (They also used ExamTopics, which is a **question-dump site and should not be used as a source for original questions**.) — [iterai](https://iterai.beehiiv.com/p/how-i-passed-the-google-cloud-associate-cloud-engineer-certification)
- (Vendor-hosted reviews) Reviews on practice-exam seller pages claim close similarity to the real exam. These are self-interested and unverifiable. — [Udemy ACE practice test listing](https://www.udemy.com/course/latest-gcp-ace-google-associate-cloud-engineer-practice-exams-tests/)

### Inferences
- The consistent signal is that scenario-style practice questions are the most representative prep, and docs or labs alone are not. That supports writing scenario-based original questions aligned to the v4.0 guide, especially for the new areas listed under Q1.
- Popular pre-2026 resources (Sullivan's book, older Udemy and TutorialsDojo banks) probably under-cover v4.0 additions. Questions targeting those additions are where an original set can differentiate.

### Gaps
- No 2026 candidate report compares specific mock exams (TutorialsDojo, Whizlabs, Udemy sets, Google's official sample questions) against the post-June-30 exam.
- Reddit consensus threads on resources could not be retrieved.
