# RAMP (Research, Academic & Mentorship Portal) Extended Proposal

## Executive Summary
This proposal outlines the implementation roadmap for the extended Thapar Research, Academic & Mentorship Portal (RAMP). Our primary objective is to complete **90% of the core platform by the end of October**, leaving November for advanced intelligent features and testing, prior to a **full campus rollout in January**.

To make this portal state-of-the-art, we are integrating intelligent student screening, in-dashboard video interviews, and post-selection project tracking.

## Timeline & Phases

### Phase 1: Foundation & Data Aggregation (August)
* **Objective:** Establish system architecture, database design, and migrate legacy data into the new ecosystem.
* **Workload:** "Small steps" involving Next.js scaffolding, Turso DB (LibSQL) configuration, and strict schema validation using TypeScript and Zod.
* **Key Tasks:** Consolidating faculty profiles, research papers, and domains into a unified, high-speed database. Structuring the Data-Lake to support future AI integrations.

### Phase 2: "Big Work" & 90% Milestone (September – October)
* **Objective:** Rapid feature expansion covering Secure Access, Core Application Workflow, and Interview Integration.
* **Sept 1 – Sept 20:** Aggressive development on Enterprise-grade Authentication, Role-Based Access Control (RBAC), and dynamic User Profiles.
* **Sept 21 – Oct 3:** 🛑 **Mid-Semester Exam Break** (Development paused).
* **Oct 4 – Oct 31:** 
  * Resume heavy development focusing on Project Posting and Student Discovery.
  * **Centralized Faculty Review Dashboards** (1-click accept/reject).
  * **NEW:** **Integrated Video Meets** — allowing faculty to schedule and launch selection interviews natively from the dashboard (via WebRTC/Jitsi).
  * **NEW:** **Peer-to-Peer Collab Board** — enabling interdisciplinary student collaboration.
* **Milestone Check:** By October 31st, 90% of the portal's core features will be implemented.

### Phase 3: Advanced Intelligence & Workspaces (November 1 – Mid-November)
* **Objective:** Complete the remaining 10% representing the advanced "Future Horizons".
* **Workload:** 
  * **NEW:** **AI-Powered Portfolio Analysis** — automatically analyzing student GitHub repos to generate a compatibility "Fit Score" for projects.
  * **NEW:** **Post-Selection Kanban Workspaces** — giving selected students and faculty a built-in tracker for milestones (Lit Review, Drafts, etc.).
  * **NEW:** **Alumni Mentorship Network & Gamified Badges** for research achievements.

### Testing & QA (Mid-November – End of November)
* **Objective:** Comprehensive load testing on Cloudflare's Edge network, RBAC security audits, and UI/UX polishing.

### Final Exam Break & Rollout Prep (December – January)
* **Dec 1 – Dec 25:** 🛑 **End-Semester Exam Break** (Development paused).
* **Dec 26 – Dec 31:** Final polish, bug fixes, and User Acceptance Testing (UAT) with a select group of faculty.
* **January:** 🚀 **Full Rollout at Thapar Campus**.

---

## Visual Roadmap

*(Note: You can copy and paste the code below into Excalidraw via `Insert -> Diagram` to generate an editable flowchart).*

### 1. Extended Workflow & Phases Diagram

```mermaid
flowchart TD
    subgraph P1 [Phase 1: August - Foundation]
        A[Next.js & Turso DB Setup] --> B[Data Normalization & Zod]
        B --> C[Faculty Profile Consolidation]
        C -.-> |"Data-Lake Prep"| C
    end
    
    subgraph P2 [Phase 2: September - October - Core & Interviews]
        D[Auth, RBAC & Profiles]
        E{Mid-Sem Exams<br/>Sept 21 - Oct 3}
        F[Project Discovery & Dashboards]
        F1[Integrated Video Interviews]
        F2[Peer-to-Peer Collab Board]
        
        C --> D
        D --> E
        E -->|Resume Oct 4| F
        F --> F1
        F --> F2
        F1 --> G((90% Complete<br/>by Oct 31))
    end
    
    subgraph P3 [Phase 3: November - Intelligence]
        H[Remaining 10%<br/>Nov 1 - Nov 15]
        I[AI Portfolio Fit-Scores]
        I2[Post-Selection Kanban]
        I3[Alumni Network & Badges]
        J[System Testing & QA<br/>Mid-Nov to End-Nov]
        
        G --> H
        H --> I
        H --> I2
        H --> I3
        I --> J
        I2 --> J
    end
    
    subgraph Rollout [Phase 4: December - January]
        K{End-Sem Exams<br/>Dec 1 - Dec 25}
        L[Final Polish & Edge Deploy<br/>Dec 26 - Dec 31]
        M(((Full Campus Rollout<br/>January)))
        
        J --> K
        K -->|Resume Dec 26| L
        L --> M
    end
    
    classDef exam fill:#ffcccc,stroke:#ff0000,stroke-width:2px;
    classDef milestone fill:#d4edda,stroke:#28a745,stroke-width:2px;
    classDef feature fill:#e1f5fe,stroke:#03a9f4,stroke-width:2px;
    class E,K exam;
    class G,M milestone;
    class F1,F2,I,I2,I3 feature;
```

### 2. Timeline Gantt Chart

```mermaid
gantt
    title Extended RAMP Implementation Timeline
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d
    
    section Phase 1 (Aug)
    Small Steps (Data & DB)        :a1, 2026-08-01, 31d
    
    section Phase 2 (Sep-Oct)
    Big Work (Auth & RBAC)         :a2, 2026-09-01, 20d
    Mid-Sem Exam Break             :crit, break1, 2026-09-21, 13d
    Core Workflows & Video Meets   :a3, 2026-10-04, 28d
    90% Milestone                  :milestone, m1, 2026-10-31, 0d
    
    section Phase 3 (Nov)
    AI Features & Kanbans (10%)    :a4, 2026-11-01, 15d
    Testing & QA                   :a5, 2026-11-16, 15d
    
    section Dec - Jan
    End-Sem Exam Break             :crit, break2, 2026-12-01, 25d
    Final Polish & Deploy          :a6, 2026-12-26, 6d
    Full Campus Rollout            :milestone, m2, 2027-01-01, 0d
```
