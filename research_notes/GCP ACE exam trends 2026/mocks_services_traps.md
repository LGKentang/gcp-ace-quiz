# GCP ACE Mock Exams, Recently Changed Services, and Classic Traps (state as of 18 Nov 2026)

Research conducted 2026-11-18. The official exam guide PDF was downloaded and its text extracted that day, so it is the primary anchor for these notes. Third-party pages are labeled as such. No paid mock-exam questions were viewed or reproduced; only advertised structure and themes are described.

## Q1. Which providers are well regarded for ACE practice, how are their tests structured, and what changed in 2026?

### Takeaway
The biggest 2026 event is Google's own blueprint refresh, not anything a vendor did. The current official guide has 4 sections weighted ~20/30/30/20 and adds a large set of AI and new-product topics (Gemini Cloud Assist, Gemini CLI, Agent Runtime, Cloud NGFW, Hyperdisk, AlloyDB, Managed Kafka, Database Center, Cloud Hub). Third-party sources date the refresh to June 30, 2026. Many mock exams and blogs still use the old 5-section outline, so treat them as possibly stale.

### Cited Findings
**Official exam facts (Google, primary)**
- Standard exam: 2 hours, 50-60 multiple-choice and multiple-select questions, $125, in English, Japanese, Spanish and Portuguese, online- or onsite-proctored, valid 3 years, no prerequisites, 6+ months hands-on experience recommended — [Google Cloud ACE certification page](https://cloud.google.com/learn/certification/cloud-engineer)
- A new shorter renewal exam is available: 1 hour, 20 questions, $75, English and Japanese, open from 180 days before expiry — [Google Cloud ACE certification page](https://cloud.google.com/learn/certification/cloud-engineer)
- Scheduling now points to Pearson VUE (OnVUE online requirements and Pearson test centers), with registration through CertMetrics — [Google Cloud ACE certification page](https://cloud.google.com/learn/certification/cloud-engineer)
- Google's free resources are the official sample-questions form (a Google Form), the Cloud Skills Boost "Cloud Engineer" learning path (paths/11), and the "Preparing for the Associate Cloud Engineer Examination" course — [Google Cloud ACE certification page](https://cloud.google.com/learn/certification/cloud-engineer)
- The current exam guide describes the role as performing "common platform-based tasks, supported by AI tooling" — [Official ACE exam guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)

**Current official blueprint (text extracted from the PDF on 2026-11-18)** — [Official ACE exam guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)
- **Section 1: Setting up a cloud solution environment (~20%)**
  - 1.1: resource hierarchy; applying org policies; granting IAM roles in a project; managing Cloud Identity users and groups (manually and automated); enabling APIs; provisioning Google Cloud Observability; assessing quotas and requesting increases; setting up standalone organizations; setting up cloud networking; verifying product availability across regions and zones; **configuring Cloud Asset Inventory and using Gemini Cloud Assist to analyze resources**; **configuring Workforce Identity Federation**.
  - 1.2: billing accounts; linking projects; budgets and alerts; billing exports.
- **Section 2: Planning and implementing a cloud solution (~30%)**
  - 2.1 Compute:
    - Choosing a compute option among Compute Engine, GKE, Cloud Run, **Cloud Run functions**, and **Agent Runtime on Gemini Enterprise Agent Platform (formerly Vertex AI Agent Engine)**.
    - Instance launch: availability policy, SSH keys.
    - Disks: zonal PD, regional PD, **Hyperdisk**.
    - Autoscaled MIGs built from instance templates.
    - OS Login, VM Manager, Spot VMs, custom machine types.
    - kubectl install.
    - GKE Autopilot, regional, and private clusters; deploying containerized apps to GKE.
    - Serverless deployment for events (Pub/Sub, Cloud Storage notifications, Eventarc).
    - **Choosing between GPUs and TPUs**.
  - 2.2 Data:
    - Data products: Cloud SQL, BigQuery, Firestore, Spanner, Bigtable, **AlloyDB**, Dataflow, Pub/Sub, **Managed Service for Apache Kafka**, Memorystore.
    - Storage products: Cloud Storage, Filestore, **NetApp Volumes**, **Managed Lustre**; storage classes Standard, Nearline, Coldline, Archive.
    - Loading data: CLI upload, load from Cloud Storage, Storage Transfer Service.
    - Multi-region redundancy.
  - 2.3 Networking:
    - Custom-mode VPC, Shared VPC, VPC Peering.
    - **VPC firewall rules and Cloud NGFW policies** (action, source, destination, targets, protocols, ports).
    - **Secure Tags and service accounts in NGFW policy rules**.
    - VPN, Peering, Interconnect; choosing load balancers; Network Service Tiers.
  - 2.4 Tooling:
    - IaC: **Fabric FAST, Config Connector, Terraform, Helm**.
    - **AI-assisted planning: Gemini CLI, Google Antigravity, Gemini Cloud Assist, Application Design Center**.
- **Section 3: Ensuring successful operation (~30%)**
  - 3.1 Compute:
    - Remote connection to VMs; viewing running VMs; snapshots and images (including schedules).
    - GKE inventory (nodes, Pods, Services); **configuring GKE to access Artifact Registry**; node pools and node-pool autoscaling.
    - Pods, Services, StatefulSets; HPA and VPA; **GKE Autopilot Pod resource requests**.
    - Deploying new Cloud Run versions; **traffic splitting (Cloud Run, Cloud Run functions, GKE)**; Cloud Run autoscaling.
    - Attaching GPUs and TPUs.
    - **Deploying an agent to Agent Runtime**; **notebooks in Agent Platform Workbench (formerly Vertex AI Workbench) and BigQuery**; **Cloud Workstations**.
  - 3.2 Data:
    - Securing Cloud Storage objects; lifecycle policies.
    - Querying Cloud SQL, BigQuery, Bigtable, Spanner, Firestore, AlloyDB.
    - Estimating storage costs.
    - Backup and restore for Cloud SQL, Firestore, Spanner, AlloyDB, Bigtable.
    - Job status for Dataflow and BigQuery.
    - **Database Center**; **CMEK**.
  - 3.3 Networking: resizing a subnet's IPv4 range; reserving static external and internal IPs; custom static routes; Cloud DNS and Cloud NAT; managing VPC firewall rules and NGFW policies.
  - 3.4 Monitoring and logging:
    - Alerts on resource metrics; custom metrics (from apps or logs).
    - Audit logs, VPC Flow Logs, firewall logs; exporting logs (on-prem, BigQuery).
    - **Log buckets, Log Analytics, log routers**; viewing, filtering and inspecting logs.
    - **Diagnostic tools: Trace, Profiler, Query Insights, index advisor**.
    - **Personalized Service Health**; Ops Agent; **Managed Service for Prometheus**.
    - **Gemini Cloud Assist for Monitoring**; Active Assist; **Cloud Hub**.
- **Section 4: Configuring access and security (~20%)**
  - 4.1 IAM: viewing and creating IAM policies; policy inheritance through the hierarchy; role types and custom roles.
  - 4.2 Service accounts:
    - Creating service accounts, including Google-managed ones.
    - Minimum permissions; attaching service accounts to resources; managing a service account's own IAM.
    - **Impersonation**; **short-lived credentials**; using a service account from a GKE app.
    - **Provisioning Workload Identity Federation**.

**Refresh date and context (secondary sources)**
- A third-party site says the guide was updated on June 30, 2026 and lists the additions: Gemini Cloud Assist, Agent Runtime, Gemini CLI, Application Design Center, GPU vs TPU, AlloyDB, Hyperdisk, Managed Lustre, NetApp Volumes, Managed Kafka, NGFW policies, Terraform, Config Connector and Fabric FAST. It lists these removals: Deployment Manager, old product names, and the 5-section blueprint. It also mentions a strikethrough tool in the exam UI and a third renewal path via Google Skills (July 2026). The page is dated 04-Oct-2026 and links no primary sources — [examos.io](https://examos.io/blog/google-ace-exam-june-2026-refresh)
- A third-party guide (May 4, 2026) attributes the exam updates to products announced at Google Cloud Next '26. It gives this Kryterion-to-Pearson VUE timeline: last Kryterion test date Feb 22, 2026; blackout Feb 23-Mar 1; Pearson VUE from Mar 2, 2026. It also says the old 5-domain split (17.5/17.5/25/20/20) is retired. The Google transition notice it relies on is named but not linked — [open-exam-prep.com](https://open-exam-prep.com/blog/google-associate-cloud-engineer-exam-guide-2026)
- One 2026 study guide (Mar 28, 2026) still gives a 17/32/34/17 four-section split under the *old* section names ("Planning and configuring", "Deploying and implementing"). It also says "typically ~70%" passing with no official source. This conflicts with the official PDF — [CertLand](https://certland.net/blog/google-cloud-associate-cloud-engineer-ace-study-guide-2026/); contradicted by [Official ACE exam guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)
- A quick-facts page still lists five domains and a ~75% passing score. Google does not publish a passing score, and third-party estimates around 70% are unofficial — [certificationpractice.com via search](https://certificationpractice.com/exam-overviews/google-associate-cloud-engineer-quick-facts); [open-exam-prep.com](https://open-exam-prep.com/blog/google-associate-cloud-engineer-exam-guide-2026)

**Providers**
- **Tutorials Dojo (Jon Bonso et al.):**
  - The course page is dated Sept 29, 2025. Modes: Timed, Review, Section-Based and Randomized, with explanations and references.
  - It sets an internal 75% pass mark and recommends repeating exams until you reach 85% or higher. A free sampler is offered.
  - I found no 2026 update notice. The free sample-questions page was last updated Nov 6, 2024 — [Tutorials Dojo course page](https://tutorialsdojo.com/courses/google-certified-associate-cloud-engineer-practice-exams/); [TD sample questions](https://tutorialsdojo.com/google-certified-associate-cloud-engineer-ace-sample-exam-questions/)
  - A TD forum thread puts the unique ACE question pool at about 110 questions (count is from the search summary, not verified on the page) — [TD forum](https://portal.tutorialsdojo.com/forums/discussion/how-many-quesstions-in-the-ace-practice-exams/)
  - TD also publishes a free ACE study guide — [TD ACE study guide](https://tutorialsdojo.com/gcp-associate-cloud-engineer-exam-study-guide/)
- **Udemy:**
  - The search engine summary says Dan Sullivan (author of the Wiley official ACE study guide) offers six 50-question exams "updated October 2026". Udemy returned HTTP 403 to direct fetch, so this is unverified — [Udemy listing](https://www.udemy.com/course/google-cloud-associate-cloud-engineer-practice-examspractice-exams/)
  - Many other Udemy listings carry "2026" in the title: a "CloudCraft Prep" listing with 365 questions updated 9/2026, and a "1500 Questions" listing updated 5/2026. Ratings and student counts are low, so treat them cautiously. All come from search summaries — [Udemy search results](https://www.udemy.com/course/gcp-associate-cloud-engineer-practice-exams-2026-c/)
- **Whizlabs:** has an ACE practice test set. Its catalog-wide claim of "25,000+" questions is not ACE-specific, and I could not retrieve a per-exam question count — [Whizlabs practice tests](https://www.whizlabs.com/practice-tests/)
- **ExamPro and A Cloud Guru/Pluralsight:** none of my searches turned up current ACE product pages (see Gaps).

### Inferences
- Any mock exam updated before July 2026 almost certainly targets the previous blueprint. That includes TD's last visible update (Sept 2025) and most blog cheat sheets. Such exams will under-cover AI tooling, NGFW policies, Hyperdisk, AlloyDB, Database Center, Cloud Hub, Personalized Service Health, Managed Prometheus, Workforce/Workload Identity Federation and Agent Runtime. These are where original questions can add the most value.
- The guide names product families without detailing them, so new AI-tooling questions at ACE level are likely to be scenario-selection questions (e.g., "which tool helps analyze resources or troubleshoot?") rather than deep configuration.
- Section 4 now covers only IAM and service accounts. Its explicit bullets on impersonation, short-lived credentials, WIF and Google-managed service accounts suggest keyless authentication patterns will be stressed.
- Question writers should use current product names: Cloud Run functions, Gemini Enterprise Agent Platform, Agent Runtime, Agent Platform Workbench, Google Cloud Observability. Older names should be treated as legacy context only.

### Gaps
- I did not find Google's own announcement of the June 2026 refresh date or the Pearson VUE transition notice. Both rest on third-party reports. The PDF itself has no visible version date.
- The official sample-questions Google Form was not opened, so its current question count and themes are unverified.
- Current ACE question counts and 2026 update dates for Whizlabs, ExamPro, Pluralsight/A Cloud Guru and Dan Sullivan's Udemy course could not be confirmed from vendor pages. Udemy blocked fetching, and ExamPro and Pluralsight returned nothing relevant.
- Whether any vendor has re-aligned to the June 2026 blueprint is unknown.

## Q2. Which GCP products and behaviors changed in 2025-2026 in ways an ACE question could test?

### Takeaway
Exam-relevant changes fall into five groups:
- **Container Registry is gone.** Writes ended Mar 18, 2025 and reads ended by around Jun 3, 2025. Artifact Registry is the only answer.
- **Deployment Manager has lost support.** Support ended Apr 1, 2026, and the service runs for existing customers only until Jun 30, 2027. It has been replaced by Infrastructure Manager or Terraform.
- **Cloud Functions has been renamed.** It became Cloud Run functions in Aug 2024.
- **Vertex AI has been renamed.** It became Gemini Enterprise Agent Platform at Next '26 (Apr 22, 2026), and Agent Engine became Agent Runtime.
- **New organizations get secure-by-default org policies.** Since May 3, 2024, key creation is blocked, default service accounts get no automatic Editor grant, domain-restricted sharing is on, and uniform bucket-level access is enforced.

Smaller changes: `gcloud storage` replaces `gsutil`, Cloud Run GPUs are GA, worker pools are in preview, and Autopilot compute classes now run in Standard clusters.

### Cited Findings
**Artifact Registry replaces Container Registry**
- Container Registry was shut down, and writing images became unavailable on March 18, 2025 — [Container Registry deprecation](https://docs.cloud.google.com/container-registry/docs/deprecations/container-registry-deprecation?authuser=0)
- Reads: GKE cannot read images stored in Container Registry from June 3, 2025. Older release notes said May 20, 2025, so the sources conflict and the later doc wins — [GKE transition doc](https://docs.cloud.google.com/kubernetes-engine/docs/deprecations/container-registry); [Container Registry release notes](https://docs.cloud.google.com/container-registry/docs/release-notes)
- gcr.io repositories hosted on Artifact Registry are unaffected and keep gcr.io URLs. Images never copied to Artifact Registry are unavailable — [Transition from Container Registry](https://docs.cloud.google.com/artifact-registry/docs/transition/transition-from-gcr)
- The exam guide explicitly tests "Configuring GKE to access Artifact Registry" — [Official ACE exam guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)

**Deployment Manager to Infrastructure Manager or Terraform**
- Deployment Manager support ended April 1, 2026. It keeps running for existing customers (console, gcloud, DM V2 API) until June 30, 2027, with no new features. New customers or organizations are not supported. Google recommends Infrastructure Manager (Terraform-based) or Terraform/OpenTofu. Earlier versions of the page gave Dec 31, 2025 and Mar 31, 2026 — [Deployment Manager deprecations](https://docs.cloud.google.com/deployment-manager/docs/deprecations)
- The current exam guide's IaC list is Fabric FAST, Config Connector, Terraform and Helm. It does not name Deployment Manager or Infrastructure Manager — [Official ACE exam guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)

**Serverless**
- Cloud Functions was renamed Cloud Run functions on Aug 21, 2024. 1st gen became "Cloud Run functions (1st gen)" — [Google Cloud blog](https://cloud.google.com/blog/products/serverless/google-cloud-functions-is-now-cloud-run-functions?authuser=4); [Cloud Run functions release notes](https://docs.cloud.google.com/functions/docs/release-notes)
- Cloud Run GPU support reached GA for services on Jun 9, 2025 and for jobs around Oct 21, 2025. Worker pools, for non-request (pull-based) workloads, launched in Preview on Jun 25, 2025, and I found no GA note. These dates come from release-note snippets; verify before using exact dates — [Cloud Run release notes](https://cloud.google.com/run/docs/release-notes)
- The exam guide tests Cloud Run new-revision deployment, traffic splitting (also for Cloud Run functions and GKE), autoscaling, and event processing via Pub/Sub, Cloud Storage notifications and Eventarc — [Official ACE exam guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)

**GKE**
- Autopilot mode is now available inside Standard clusters via built-in `autopilot` and `autopilot-spot` ComputeClasses:
  - Launched Sept 2025 on GKE 1.33.1-gke.1107000+ in the Rapid channel; later docs say 1.34.1-gke.1829001+.
  - It can be set as the default for a cluster or namespace.
  - Autopilot pricing applies only to workloads using those classes — [About Autopilot mode workloads in GKE Standard](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/about-autopilot-mode-standard-clusters); [Google Cloud blog](https://cloud.google.com/blog/products/containers-kubernetes/gke-autopilot-now-available-to-all-qualifying-clusters)
- KubeCon EU 2026: Autopilot can be turned on "at any time, on a per-workload basis" in Standard clusters — [Google Cloud blog, KubeCon EU 2026](https://cloud.google.com/blog/products/containers-kubernetes/gke-and-oss-innovation-at-kubecon-eu-2026)
- NodeLocal DNSCache is on by default for new Standard clusters at 1.34.1-gke.3720000+ (Feb 24, 2026 release note) — [GKE release notes](https://docs.cloud.google.com/kubernetes-engine/docs/release-notes-new-features)
- The exam guide adds "Managing GKE Autopilot Pod resource requests" and HPA/VPA management — [Official ACE exam guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)

**Org policy secure-by-default (IAM and Storage)**
- These baseline constraints are enforced on all organizations created on or after May 3, 2024 — [Security baseline constraints doc](https://docs.cloud.google.com/resource-manager/docs/secure-by-default-organizations?hl=en):
  - `iam.managed.disableServiceAccountKeyCreation`: blocks persistent service account key creation.
  - `iam.disableServiceAccountKeyUpload`
  - `iam.automaticIamGrantsForDefaultServiceAccounts`: stops default service accounts from getting Editor.
  - `iam.allowedPolicyMemberDomains`: domain-restricted sharing.
  - `essentialcontacts.managed.allowedContactDomains`
  - `compute.managed.restrictProtocolForwardingCreationForTypes`
  - `storage.uniformBucketLevelAccess`: no per-object ACLs.
- Managing these requires `roles/orgpolicy.policyAdmin`. Check them with `gcloud resource-manager org-policies list --organization=ID` and remove one with `gcloud org-policies delete CONSTRAINT --organization=ID` — [Security baseline constraints doc](https://docs.cloud.google.com/resource-manager/docs/secure-by-default-organizations?hl=en)
- The key-creation constraint name changed from the legacy `iam.disableServiceAccountKeyCreation` to the managed `iam.managed.disableServiceAccountKeyCreation`. Localized pages still show the old name — [Security baseline constraints doc](https://docs.cloud.google.com/resource-manager/docs/secure-by-default-organizations?hl=en)

**AI platform rename (Next '26)**
- Vertex AI became part of Gemini Enterprise Agent Platform, its direct successor. The renames are:
  - Vertex AI Agent Engine became Agent Runtime.
  - Vertex AI Studio became Agent Studio.
  - Vertex AI Search became Agent Search.
  - Vector Search 2.0 became Agent Retrieval.
  - Old links redirect — [Gemini Enterprise Agent Platform release notes](https://docs.cloud.google.com/gemini-enterprise-agent-platform/release-notes?authuser=1)
- The announcement came at Google Cloud Next '26 on Apr 22, 2026 (secondary sources) — [The New Stack](https://thenewstack.io/google-finally-builds-the-ai-and-agent-platform-its-been-describing-for-years/); [pasqualepillitteri.it](https://pasqualepillitteri.it/en/news/1311/gemini-enterprise-agent-platform-google-next-2026)

**Cloud Storage**
- `gcloud storage` is GA and the recommended CLI. Nearly all `gsutil` commands have equivalents. There are behavior differences: `gcloud storage rsync` ignores symlinks unless `--no-ignore-symlinks` is set, and output formats differ — [Transition from gsutil to gcloud storage](https://docs.cloud.google.com/storage/docs/gsutil-transition-to-gcloud)
- A new **Rapid** storage class (zonal, Rapid Bucket only, 99.9% SLA, no minimum duration, no retrieval fee) now sits alongside Standard, Nearline, Coldline and Archive. Autoclass automates class transitions. Enabling it on an existing bucket moves non-soft-deleted objects to Standard — [Storage classes doc](https://docs.cloud.google.com/storage/docs/storage-classes)

**Firewalls and NGFW**
- VPC firewall rules are evaluated alongside Cloud NGFW firewall policy rules. Unlike VPC rules, policy rules cannot share priorities. The exam guide now names NGFW policies and secure Tags — [VPC firewall rules doc](https://docs.cloud.google.com/firewall/docs/firewalls); [Official ACE exam guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)

### Inferences
- **Safe "now-true" facts for questions:**
  - Container images belong in Artifact Registry (`*-docker.pkg.dev`, or gcr.io-on-AR).
  - New IaC answers are Terraform, Infrastructure Manager or Config Connector, never Deployment Manager.
  - Serverless functions are "Cloud Run functions".
  - In a new org, creating a service account key fails unless an Org Policy Administrator relaxes the managed constraint. The preferred alternatives are impersonation, short-lived credentials, attached service accounts or WIF.
- **Distractor material:** "Push to Container Registry", "use Deployment Manager templates", "grant per-object ACLs" (blocked under UBLA) and "the default compute service account has Editor" (no longer automatic in new orgs) make good wrong answers. Explanations should note they are legacy.
- Because Rapid storage now exists, stating that Cloud Storage has "four storage classes" is no longer strictly accurate.
- Privileged Access Manager, IAM deny policies, Cloud Deploy, Gemini Cloud Assist features, FinOps hub and billing tooling are not named in the current guide (billing covers only accounts, linking, budgets/alerts and exports). Questions on them should stay light and scenario-level.

### Gaps
- I did not research Privileged Access Manager, IAM deny policy and principal access boundary GA status and 2025-2026 changes, Cloud Deploy, Infrastructure Manager feature changes, FinOps hub, or Gemini Cloud Assist feature specifics. The tool budget ran out, and none of these is named in the guide except Gemini Cloud Assist.
- I could not determine whether the Google Cloud console's default cluster mode for new GKE clusters is Autopilot. Search results did not confirm it.
- Exact GA dates for Cloud Run worker pools and GPUs on worker pools are unconfirmed.
- I found no authoritative 2026 statement on `gsutil` removal or end of support, only "gcloud storage recommended".

## Q3. What are the recurring traps and commonly confused pairs?

### Takeaway
The guide still targets classic ACE traps: storage-class durations and retrieval fees, firewall priority and implied rules, basic vs predefined roles, regional vs zonal resources, Spot VMs, and keys vs keyless authentication. The newer guide adds pairs such as VPC firewall rules vs NGFW policies, AlloyDB vs Cloud SQL vs Spanner, Hyperdisk vs PD, and Workforce vs Workload Identity Federation. Third-party tips stress that the scenario's stated constraint (cost, ops overhead, availability, least privilege) is what separates technically valid options.

### Cited Findings
- **Storage class minimums and fees** — [Storage classes doc](https://docs.cloud.google.com/storage/docs/storage-classes):
  - Nearline: 30 days. Coldline: 90 days. Archive: 365 days.
  - Standard and Rapid have no minimum and no retrieval fee. Nearline, Coldline and Archive charge retrieval fees.
  - All classes are low-latency with "no offline data retrieval". Archive data is available "within milliseconds, not hours or days".
  - The trap: treating Archive as hours-to-retrieve (an AWS Glacier mental model).
- **Storage SLA differences** — [Storage classes doc](https://docs.cloud.google.com/storage/docs/storage-classes):
  - Standard: 99.95% in multi- and dual-region, 99.9% in a region.
  - Nearline, Coldline and Archive: 99.9% in multi- and dual-region, 99.0% in a region.
- **Firewall rules** — [VPC firewall rules doc](https://docs.cloud.google.com/firewall/docs/firewalls):
  - Implied deny for ingress and implied allow for egress.
  - Priority runs 0-65535 (default 1000), and lower numbers win.
  - Deny beats allow only at the same priority.
  - Rules are stateful (return traffic is allowed and cannot be denied).
  - The default network ships `default-allow-internal` (10.128.0.0/9), `default-allow-ssh`, `default-allow-rdp` and `default-allow-icmp`, all at priority 65534. Custom VPCs do not get these.
- **Third-party exam tips** — [CertLand](https://certland.net/blog/google-cloud-associate-cloud-engineer-ace-study-guide-2026/):
  - "Minimize operational overhead" points to Autopilot or Cloud Run.
  - Least privilege means predefined or custom roles, never basic roles.
  - Budget alerts only notify. Capping spend needs programmatic action, e.g. a function that disables billing.
  - "Most cost-effective" points to Spot, lifecycle rules or sustained-use discounts.
  - Cloud NAT is outbound-only.
  - Often several options are technically valid, and the stated constraint eliminates the rest.
- **New exam-guide pairs** — [Official ACE exam guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf):
  - Zonal PD vs regional PD vs Hyperdisk.
  - GPUs vs TPUs.
  - VPC firewall rules vs NGFW policies, including secure Tags vs network tags vs service accounts as targets.
  - Workforce Identity Federation (Section 1, human users from an external IdP) vs Workload Identity Federation (Section 4, external workloads).
  - Impersonation vs short-lived credentials vs keys.
  - Log buckets vs log router sinks vs Log Analytics.
  - Cloud Asset Inventory vs Gemini Cloud Assist for resource analysis.
  - Active Assist vs Cloud Hub vs Personalized Service Health.
  - Filestore vs NetApp Volumes vs Managed Lustre.
  - Pub/Sub vs Managed Kafka.
  - Database Center for fleet management.
- **Secure-by-default org-policy traps** — [Security baseline constraints doc](https://docs.cloud.google.com/resource-manager/docs/secure-by-default-organizations?hl=en):
  - In new orgs, "create a JSON key for the service account" fails by default.
  - Default service accounts no longer get Editor automatically.
  - Per-object ACLs are blocked by uniform bucket-level access.
  - Sharing with external-domain principals is blocked.

### Inferences
These are classic confusions from long-standing GCP behavior, based on my background knowledge. They were not re-verified this session, so check them against the linked product docs before using them as answer keys.
- **Basic vs predefined roles:** basic roles (Owner, Editor, Viewer) are broad. Least privilege wants predefined or custom roles. Custom roles cannot be created at folder level, only at org or project level.
- **IAM inheritance:** policies are additive down the hierarchy. A grant at a higher level cannot be removed by an allow policy lower down. Removing access needs deny policies or a re-structure.
- **Regional vs zonal MIGs:** regional MIGs spread instances across zones for zonal-failure resilience. Autohealing (health check) and autoscaling are separate features.
- **Spot vs preemptible VMs:** Spot has no 24h max runtime (preemptible did), and both can be reclaimed with ~30s notice. They suit fault-tolerant batch work, not stateful single instances.
- **Cloud SQL vs Spanner vs AlloyDB vs Bigtable vs Firestore vs BigQuery:**
  - Cloud SQL: regional relational database, HA via a standby in another zone.
  - Spanner: global or horizontally scalable relational database with strong consistency.
  - AlloyDB: PostgreSQL-compatible, high-performance, with an analytics accelerator.
  - Bigtable: wide-column NoSQL for time series and IoT at low latency (not SQL joins).
  - Firestore: document database for mobile and web.
  - BigQuery: analytics warehouse, not OLTP.
- **gcloud config vs configurations:** `gcloud config set` changes properties in the *active* configuration. `gcloud config configurations create/activate` switches between named profiles, e.g. per project or account.
- **Service account keys vs keyless authentication:** prefer attached service accounts, impersonation (`--impersonate-service-account`), Workload Identity Federation for GKE (KSA mapped to IAM) and WIF for external clouds or CI over downloaded keys.
- **Load balancer selection:**
  - Global external Application LB for HTTP(S) across regions.
  - Network LB (passthrough) for TCP/UDP that preserves client IP.
  - Internal LBs for private traffic.
  - Premium vs Standard Network Service Tier changes global LB eligibility.
- **Shared VPC vs VPC Peering:** Shared VPC uses central host-project administration. Peering is non-transitive and needs non-overlapping CIDRs.
- **Subnet expansion:** a primary range can be expanded (`gcloud compute networks subnets expand-ip-range`) but not shrunk.
- **Billing:** budgets do not cap spend, and billing export to BigQuery must be enabled before you can analyze historical data. Project billing link changes need Billing Account User on the billing account plus project permissions.
- **Logging:** audit log types differ. Admin Activity is always on and free; Data Access is off by default except for BigQuery. Retention for _Required and _Default buckets differs, and long-term retention or analysis needs a sink to Cloud Storage, BigQuery or Pub/Sub.
- **Cloud Run:**
  - Traffic splitting goes by revision; `--no-traffic` deploys a revision without serving it.
  - Min instances reduce cold starts but cost money, and concurrency and max instances govern scaling.
  - `--allow-unauthenticated` vs IAM `roles/run.invoker`.

### Gaps
- I did not search for or verify vendor-specific "most missed topic" statistics. None were found, and paid mock content was intentionally not accessed.
- I did not read Google's official sample-questions form to confirm which traps Google itself emphasizes.

## Q4. Which gcloud, gcloud storage/gsutil, kubectl, and bq commands matter?

### Takeaway
The guide explicitly names kubectl installation and many CLI-driven tasks: quotas, APIs, MIGs from templates, snapshots and schedules, subnet expansion, static IPs, routes, Cloud Run revisions and traffic, node pools, log filtering, and service account impersonation. `gcloud storage` should be the primary Cloud Storage CLI in new questions, with `gsutil` treated as legacy. The specific command syntax below is background knowledge mapped to guide bullets and should be checked against the gcloud reference.

### Cited Findings
- Google calls `gcloud storage` the recommended CLI for Cloud Storage, and nearly all `gsutil` commands have equivalents — [Transition from gsutil to gcloud storage](https://docs.cloud.google.com/storage/docs/gsutil-transition-to-gcloud)
- Org policy inspection and removal use `gcloud resource-manager org-policies list --organization=ID` and `gcloud org-policies delete CONSTRAINT --organization=ID` — [Security baseline constraints doc](https://docs.cloud.google.com/resource-manager/docs/secure-by-default-organizations?hl=en)
- Third-party guides keep emphasizing `gcloud init`, `gcloud config set project`, `gcloud auth login`, plus `bq` for BigQuery — [CertLand](https://certland.net/blog/google-cloud-associate-cloud-engineer-ace-study-guide-2026/)
- CLI-relevant tasks named in the guide:
  - Installing and configuring kubectl.
  - Enabling APIs; assessing quotas.
  - Autoscaled MIGs from instance templates.
  - Snapshots and images, including scheduled snapshots.
  - Viewing GKE nodes, Pods and Services; node pool add, edit and remove, plus autoscaling.
  - HPA and VPA.
  - Cloud Run deploy, traffic splitting and autoscaling.
  - Resizing a subnet's IPv4 range; reserving static IPs; custom static routes.
  - Viewing and filtering logs.
  - Service account impersonation; short-lived credentials.
  - Loading data via command-line upload or from Cloud Storage.
  - Source: [Official ACE exam guide PDF](https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf)

### Inferences
The list below comes from background knowledge mapped to the bullets above. It was not individually re-verified this session, so confirm flags in the gcloud, kubectl and bq references before using them as answer keys.
- **Setup and configuration:**
  - `gcloud init`
  - `gcloud auth login` (user credentials) vs `gcloud auth application-default login` (ADC for local code)
  - `gcloud config set project|compute/region|compute/zone`
  - `gcloud config configurations create|activate|list`
  - `gcloud services enable <api>.googleapis.com`
  - `gcloud projects add-iam-policy-binding PROJECT --member=... --role=...`
  - `gcloud projects get-iam-policy`
  - `gcloud iam roles create --project|--organization`
  - `gcloud billing projects link PROJECT --billing-account=ID`
- **Compute:**
  - `gcloud compute instances create ... --provisioning-model=SPOT` (or `--preemptible`, legacy)
  - `--custom-cpu`/`--custom-memory` (or `--machine-type=custom-...`)
  - `gcloud compute instance-templates create`
  - `gcloud compute instance-groups managed create ... --template --size` (regional with `--region`)
  - `gcloud compute instance-groups managed set-autoscaling`
  - `gcloud compute ssh` (with `--tunnel-through-iap` for VMs without external IPs)
  - OS Login via metadata `enable-oslogin=TRUE`
  - `gcloud compute disks snapshot`
  - `gcloud compute resource-policies create snapshot-schedule`
  - `gcloud compute images create`
- **Networking:**
  - `gcloud compute networks create --subnet-mode=custom`
  - `gcloud compute networks subnets create`
  - `gcloud compute networks subnets expand-ip-range --prefix-length`
  - `gcloud compute addresses create` (`--region` or `--global`; internal with `--subnet`)
  - `gcloud compute routes create`
  - `gcloud compute firewall-rules create --direction --priority --action --rules --source-ranges --target-tags/--target-service-accounts`
  - `gcloud compute network-firewall-policies ...` (NGFW)
- **GKE:**
  - `gcloud container clusters create-auto` (Autopilot) vs `create` (Standard; `--region` for regional; `--enable-private-nodes`)
  - `gcloud container clusters get-credentials`
  - `gcloud container node-pools create|update|delete --enable-autoscaling --min-nodes --max-nodes`
  - `kubectl get nodes|pods|services|deployments`
  - `kubectl apply -f`
  - `kubectl scale`
  - `kubectl autoscale deployment ... --min --max --cpu-percent`
  - `kubectl rollout status|undo`
  - `kubectl describe` / `kubectl logs`
- **Cloud Run:**
  - `gcloud run deploy SERVICE --image ... --region ... [--no-traffic] [--min-instances/--max-instances] [--allow-unauthenticated]`
  - `gcloud run services update-traffic --to-revisions=REV=PCT` / `--to-latest`
  - `gcloud functions deploy ... --gen2` (now Cloud Run functions)
- **Artifact Registry:**
  - `gcloud artifacts repositories create --repository-format=docker --location`
  - `gcloud auth configure-docker REGION-docker.pkg.dev`
- **Storage:**
  - `gcloud storage buckets create gs://B --location --default-storage-class`
  - `gcloud storage cp|rsync|ls|rm`
  - `gcloud storage buckets update --lifecycle-file` (legacy: `gsutil mb`, `gsutil cp`, `gsutil lifecycle set`)
  - `gcloud storage sign-url` (legacy: `gsutil signurl`) for time-limited access
- **BigQuery:**
  - `bq mk` (dataset or table)
  - `bq load --source_format=CSV dataset.table gs://...`
  - `bq query --use_legacy_sql=false '...'`
  - `--dry_run` to estimate bytes scanned and cost
  - `bq ls` / `bq show`
- **Service accounts:**
  - `gcloud iam service-accounts create`
  - `gcloud iam service-accounts add-iam-policy-binding SA --member=user:... --role=roles/iam.serviceAccountTokenCreator` (impersonation) or `roles/iam.serviceAccountUser` (attach to resources)
  - `--impersonate-service-account=SA` on gcloud
  - `gcloud iam workload-identity-pools create ...`
- **Logging:**
  - `gcloud logging read 'FILTER' --limit`
  - `gcloud logging sinks create NAME DESTINATION --log-filter`
  - `gcloud logging buckets create`

### Gaps
- I did not verify current flag syntax for NGFW policy commands, `gcloud storage sign-url`, Workload Identity pool creation, or snapshot schedule creation against the 2026 gcloud reference.
- I found no source listing which commands mock-exam vendors emphasize most in 2026.
