# Personal OS — Product & Technical Specification v0.1

**Status:** Draft\
**Version:** 0.1\
**Product type:** Personal productivity and decision-support platform\
**Primary user:** Individual software developer / knowledge worker\
**Core philosophy:** Collect context → reduce cognitive load → recommend action → automate execution → learn from outcomes.

---

## 1. Tổng quan sản phẩm

### 1.1. Product vision

Personal OS là một hệ thống điều hành cá nhân, hợp nhất dữ liệu từ công việc, học tập, lịch trình, dự án và các hoạt động cá nhân thành một **context layer** duy nhất.

Mục tiêu không phải tạo thêm một ứng dụng Todo/Note/Calendar.

Mục tiêu là trả lời ba câu hỏi:

1. **Điều gì đang xảy ra với tôi?**
2. **Điều gì quan trọng nhất lúc này?**
3. **Tôi nên làm gì tiếp theo?**

Ở mức trưởng thành cao hơn, hệ thống còn có khả năng:

4. **Tự thực hiện những hành động có thể tự động hóa.**
5. **Theo dõi kết quả và học từ các quyết định trước đây.**

---

# 2. Problem Statement

Hiện tại thông tin của một người thường phân tán:

```text
GitHub
   ├── commits
   ├── issues
   └── pull requests

Calendar
   └── meetings / schedule

Email
   └── requests / information

Notes
   └── knowledge / ideas

Task manager
   └── TODO

Research
   └── papers / references

Personal data
   └── activities / metrics / journal
```

Các hệ thống này biết thông tin riêng lẻ nhưng không biết **context tổng thể**.

Ví dụ:

```text
Calendar:
09:00 meeting
13:00 meeting
15:00 meeting

GitHub:
PR deadline tomorrow

Task:
Research paper unfinished

Personal:
Low energy
```

Không hệ thống nào mặc định hiểu:

> Hôm nay cognitive load đã cao, do đó không nên tiếp tục xếp deep-work task vào giữa các cuộc họp và cũng không nên tạo thêm commitment mới.

Personal OS giải quyết khoảng trống này.

---

# 3. Product Goals

## 3.1. Primary goals

### G1 — Unified Context

Tập hợp các nguồn dữ liệu quan trọng vào một context layer thống nhất.

### G2 — Daily Decision Support

Mỗi ngày giúp xác định:

- 3 ưu tiên chính.
- Các việc cần làm.
- Các deadline.
- Các rủi ro.
- Những gì nên trì hoãn.
- Những gì có thể tự động hóa.

### G3 — Reduce Cognitive Load

Giảm nhu cầu tự nhớ:

- Việc cần làm.
- Quyết định trước đây.
- Context của project.
- Các thông tin liên quan.
- Các follow-up.

### G4 — Work Memory

Tạo bộ nhớ dài hạn cho:

- Projects.
- Technical decisions.
- Problems.
- Solutions.
- Architecture.
- Deployments.
- Research.

### G5 — Automation

Tự động xử lý các tác vụ có quy tắc rõ ràng.

### G6 — Decision Feedback

Ghi nhận:

```text
Decision
→ Prediction
→ Outcome
→ Evaluation
→ Learning
```

---

# 4. Non-goals

Personal OS **không** cố trở thành:

- Một Google Calendar mới.
- Một Jira mới.
- Một Notion mới.
- Một Slack mới.
- Một Strava mới.
- Một chatbot AI tổng quát.
- Một autonomous agent toàn quyền hành động.

Nguyên tắc:

> Không thay thế các hệ thống chuyên dụng khi chúng đã tốt; Personal OS kết nối và bổ sung intelligence lên trên chúng.

---

# 5. Product Principles

## P1 — Context over Objects

Không chỉ lưu task.

Phải biết:

```text
Task
→ thuộc project nào
→ liên quan deadline nào
→ được tạo từ email nào
→ phụ thuộc task nào
→ liên quan quyết định nào
```

## P2 — Action over Information

Dashboard không chỉ hiển thị dữ liệu.

Mỗi thông tin quan trọng phải hướng tới:

```text
What happened?
Why does it matter?
What should I do?
```

## P3 — Human-in-the-loop

AI được phép:

- phân tích,
- đề xuất,
- phân loại,
- tóm tắt,
- lập kế hoạch.

Nhưng các hành động có tác động lớn phải yêu cầu xác nhận.

Ví dụ:

```text
Send email              → confirmation
Delete data             → confirmation
Reschedule meeting      → confirmation
Create internal task    → can be automatic
Generate summary        → automatic
Classify email          → automatic
```

## P4 — Event-driven

Mọi thay đổi quan trọng nên được biểu diễn bằng event.

Ví dụ:

```text
github.pull_request.created
calendar.event.created
email.received
task.completed
decision.created
project.updated
```

## P5 — Explainability

Mỗi recommendation của AI phải có:

```text
Recommendation
Reason
Evidence
Confidence
```

Không chỉ:

> "You should postpone this task."

Mà:

> "Postpone this task because it is low priority, has no deadline, and today's schedule contains three high-cognitive-load blocks."

---

# 6. Target User

### Primary persona

Một knowledge worker có:

- nhiều project,
- nhiều nguồn thông tin,
- công việc kỹ thuật,
- học tập liên tục,
- nhiều context switching,
- nhu cầu tự động hóa cao.

### V1 thực tế

Chính chủ sản phẩm là user đầu tiên.

Điều này rất quan trọng.

Không tối ưu cho "average user".

Tối ưu cho workflow thực tế của developer/knowledge worker.

---

# 7. Core User Journey

## Buổi sáng

User mở Personal OS.

Hệ thống tạo:

```text
Daily Brief
```

Ví dụ:

```text
TODAY

Priority 1
Finish API migration

Priority 2
Research methodology section

Priority 3
Review deployment issue

Risks
- PR deadline tomorrow
- 2 unfinished tasks carried over

Meetings
- 10:00 Client
- 14:00 Team

Recommendation
Reserve 08:30–10:00 for deep work.
```

---

## Trong ngày

Dữ liệu từ các integration tự cập nhật.

Ví dụ:

```text
GitHub:
PR merged

→ Project status updated

Calendar:
Meeting ended

→ Follow-up task detected

Email:
Client requested deployment

→ Action item created
```

---

## Cuối ngày

Hệ thống tạo:

```text
Daily Review

Completed:
7 tasks

Incomplete:
2 tasks

Important events:
3

Decisions:
1

Potential issue:
Project A has been delayed for 3 days.

Tomorrow:
3 high-priority actions
```

---

# 8. Core Modules

## Module 1 — Command Center

Đây là màn hình trung tâm.

### Components

```text
Today's Focus
Tasks
Calendar
Projects
Inbox
Alerts
AI Recommendations
Daily Review
```

### Main UI

```text
┌─────────────────────────────────────────────┐
│ TODAY                                       │
├─────────────────────────────────────────────┤
│                                             │
│ Focus                                       │
│ 1. Finish API migration                     │
│ 2. Research paper                           │
│ 3. Review PR                                 │
│                                             │
├─────────────────────────────────────────────┤
│ Schedule                                    │
│ 09:00 Deep Work                             │
│ 11:00 Meeting                               │
│ 14:00 Research                              │
│                                             │
├─────────────────────────────────────────────┤
│ Attention                                   │
│ ⚠ Project A deadline approaching            │
│ ⚠ Task blocked                              │
│                                             │
├─────────────────────────────────────────────┤
│ AI Insight                                  │
│ Today's workload is above normal.            │
└─────────────────────────────────────────────┘
```

---

# 9. Module 2 — Tasks

Task model phải mạnh hơn TODO thông thường.

## Task properties

```text
id
title
description

status
priority
dueAt

estimatedDuration
actualDuration

energyLevel
cognitiveLoad

projectId
parentTaskId

source
sourceReference

dependencies

createdAt
updatedAt
completedAt
```

### Source

Task có thể sinh từ:

```text
manual
email
calendar
github
ai
automation
```

### Task lifecycle

```text
Inbox
→ Planned
→ In Progress
→ Blocked
→ Completed
→ Archived
```

---

# 10. Module 3 — Projects

Project là một context container.

```text
Project
├── Tasks
├── Documents
├── Decisions
├── Issues
├── Activities
├── GitHub
├── People
└── Timeline
```

### Project health

Hệ thống tính:

```text
Progress
Momentum
Risk
Overdue tasks
Activity
Blocked tasks
```

Ví dụ:

```text
PROJECT A

Progress        72%
Momentum        High
Risk            Medium

Open tasks      12
Blocked         2
Overdue         1

Last activity   2h ago
```

---

# 11. Module 4 — Work Memory

Đây là knowledge layer quan trọng.

Các entity:

```text
Decision
Problem
Solution
Technical Note
Architecture
Meeting
Incident
Deployment
Postmortem
```

Ví dụ Decision:

```text
Decision

Title:
Use PostgreSQL for service X

Context:
Need relational storage with JSON support.

Alternatives:
MySQL
MongoDB
PostgreSQL

Chosen:
PostgreSQL

Reason:
- JSONB
- indexing
- ecosystem
- existing infrastructure

Confidence:
82%

Outcome:
Pending
```

---

# 12. Module 5 — Journal

Journal dùng để lưu context mà structured data không thể biểu diễn đầy đủ.

Các loại:

```text
Daily Journal
Worklog
Learning Log
Decision Journal
Reflection
Experiment
```

AI có thể phân tích journal để phát hiện:

```text
repeated problems
stress patterns
work overload
recurring blockers
decision mistakes
```

Không mặc định biến mọi thứ thành structured data.

Original text phải được giữ nguyên.

---

# 13. Module 6 — Knowledge Base

Knowledge Base chứa:

```text
Notes
Documents
Research papers
Bookmarks
Technical documentation
Meeting notes
Journal entries
```

Mỗi document được indexing:

```text
Metadata
Full text
Embeddings
Entities
Relations
Topics
```

---

# 14. Module 7 — Research Workspace

Dành riêng cho nghiên cứu học thuật.

Workflow:

```text
Import paper
↓
Extract metadata
↓
Extract sections
↓
Chunk
↓
Embedding
↓
Semantic search
↓
Compare papers
↓
Identify themes
↓
Research gap
```

### Paper entity

```text
title
authors
year
venue
doi
abstract
keywords
citationCount
pdfReference
```

### AI actions

```text
Summarize
Compare
Extract methodology
Extract limitations
Find contradictions
Group by theme
Generate research questions
```

AI không được tự động coi nội dung paper là sự thật.

Citation/source phải được giữ lại.

---

# 15. Module 8 — Calendar & Time

Personal OS không thay thế calendar.

Nó đồng bộ Calendar vào context layer.

### Data

```text
events
startAt
endAt
attendees
location
description
```

AI có thể tính:

```text
free time
meeting load
deep-work windows
context switching
schedule density
```

### Scheduling recommendation

```text
Task estimated duration:
90m

Suitable windows:
08:30–10:00
15:30–17:00

Best:
08:30–10:00

Reason:
No meetings
High-focus window
Deadline proximity
```

---

# 16. Module 9 — Automation Engine

Đây là orchestration layer.

## Automation structure

```text
Trigger
→ Conditions
→ Actions
```

Ví dụ:

```text
Trigger:
GitHub PR merged

Condition:
Project is active

Actions:
1. Update project activity
2. Update linked task
3. Notify if milestone completed
```

### Trigger types

```text
event
schedule
webhook
threshold
manual
AI detection
```

### Action types

```text
create task
update task
create note
send notification
call API
run AI workflow
update project
create journal entry
```

---

# 17. Module 10 — AI Layer

AI không phải một chatbot đứng riêng.

AI là một service layer.

### Capabilities

```text
Classification
Extraction
Summarization
Search
Recommendation
Planning
Prediction
Anomaly detection
Generation
Agent actions
```

---

# 18. AI Context Architecture

LLM không được gửi toàn bộ database.

Context pipeline:

```text
User request
      ↓
Intent detection
      ↓
Relevant entities
      ↓
Permission filtering
      ↓
Semantic retrieval
      ↓
Structured context
      ↓
LLM
      ↓
Response
```

Ví dụ query:

> "Project DayOps đang có vấn đề gì?"

System retrieve:

```text
Project
Recent activities
Open tasks
GitHub PRs
Incidents
Decisions
Meetings
```

Sau đó mới gửi vào LLM.

---

# 19. AI Recommendation Engine

Recommendation object:

```text
Recommendation

type
title
description

reason
evidence[]

confidence

impact
urgency

suggestedAction

requiresConfirmation
```

Ví dụ:

```text
type:
workload_risk

title:
Reduce today's workload

reason:
Three high-priority tasks overlap with
four scheduled meetings.

confidence:
0.87

suggestedAction:
Move task X to tomorrow.
```

---

# 20. Module 11 — Notifications

Không gửi notification cho mọi thứ.

Chia:

```text
Critical
Important
Informational
Silent
```

### Notification examples

Critical:

```text
Deadline missed.
```

Important:

```text
PR has been waiting for review for 20h.
```

Informational:

```text
Project milestone completed.
```

Silent:

```text
GitHub activity synchronized.
```

---

# 21. Module 12 — Decision Journal

Schema:

```text
Decision

id
title
context

options[]
chosenOption

reason

assumptions[]

confidence

expectedOutcome

successCriteria

decisionDate

reviewDate

actualOutcome

evaluation
```

### Review workflow

```text
Decision created
↓
Expected outcome recorded
↓
Review date reached
↓
Outcome entered
↓
AI comparison
↓
Decision quality analysis
```

---

# 22. Module 13 — Personal Analytics

Analytics layer không chỉ tập trung vào productivity.

Các nhóm:

```text
Work
Learning
Time
Projects
Decisions
Habits
Financial
Training
```

Ví dụ:

```text
Weekly Overview

Deep work                 18h
Meetings                   9h
Admin                       4h
Learning                    7h

Projects completed         3
Projects delayed           1

Decisions                  8
Reviewed decisions         4
```

Nguyên tắc:

> Analytics dùng để hỗ trợ quyết định, không biến cuộc sống thành bảng điểm.

---

# 23. Integration Layer

## V1

Ưu tiên:

```text
GitHub
Google Calendar
Gmail
```

## V2

```text
Google Drive
Notion
Slack
Strava / Garmin
```

## V3

```text
Broker / market data
Research databases
Custom APIs
IoT / wearable data
```

---

# 24. Architecture

## High-level

```text
                    ┌──────────────────┐
                    │    Next.js Web   │
                    └────────┬─────────┘
                             │
                         REST / GraphQL
                             │
                    ┌────────▼─────────┐
                    │     API Layer    │
                    │     NestJS       │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   Domain Modules       AI Services        Integration
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                   ┌─────────▼─────────┐
                   │     PostgreSQL    │
                   │      pgvector     │
                   └─────────┬─────────┘
                             │
                      ┌──────▼──────┐
                      │    Redis    │
                      └──────┬──────┘
                             │
                      Background Jobs
```

---

# 25. Backend Architecture

Khuyến nghị bắt đầu bằng **modular monolith**.

Không cần microservices ở V1.

```text
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── tasks/
│   ├── projects/
│   ├── calendar/
│   ├── journal/
│   ├── decisions/
│   ├── knowledge/
│   ├── research/
│   ├── analytics/
│   ├── notifications/
│   ├── automation/
│   ├── ai/
│   └── integrations/
│
├── workers/
│   ├── sync/
│   ├── embeddings/
│   ├── ai/
│   └── notifications/
│
└── infrastructure/
    ├── database/
    ├── queue/
    ├── storage/
    └── llm/
```

---

# 26. Database Strategy

PostgreSQL là database chính.

Sử dụng:

```text
PostgreSQL
+
pgvector
+
JSONB
```

### Relational data

Dùng cho:

```text
users
projects
tasks
events
decisions
integrations
```

### JSONB

Dùng cho:

```text
external event payload
AI metadata
integration-specific data
automation configuration
```

### Vector

Dùng cho:

```text
documents
notes
journal
decisions
project memory
research papers
```

Không sử dụng vector database riêng ở V1.

---

# 27. Core Data Model

Các entity chính:

```text
User
Project
Task
Event
Document
JournalEntry
Decision
ResearchPaper
Integration
Automation
Recommendation
Notification
Activity
Entity
Relation
Embedding
```

### Quan hệ khái quát

```text
User
 ├── Projects
 ├── Tasks
 ├── Events
 ├── JournalEntries
 ├── Decisions
 └── Integrations

Project
 ├── Tasks
 ├── Documents
 ├── Decisions
 ├── Activities
 └── ExternalReferences
```

---

# 28. Event Model

Mọi integration event normalize về:

```text
Event

id
type
source
sourceId

userId

payload

occurredAt
receivedAt

processedAt
```

Ví dụ:

```text
type:
github.pull_request.merged

source:
github

sourceId:
12345
```

Event được xử lý bởi workflow tương ứng.

---

# 29. Search Architecture

Có 3 loại search:

### Exact search

```text
keyword
identifier
project name
```

### Full-text search

```text
PostgreSQL FTS
```

### Semantic search

```text
embedding similarity
```

Search engine nên hỗ trợ hybrid:

```text
Query
↓
Keyword search
+
Semantic search
↓
Reranking
↓
Relevant context
```

---

# 30. API Design

Có thể dùng GraphQL cho data-heavy frontend.

Ví dụ:

```graphql
query Today {
  today {
    focus {
      tasks {
        id
        title
        priority
      }
    }

    schedule {
      startAt
      endAt
      title
    }

    recommendations {
      title
      reason
      confidence
    }
  }
}
```

Mutations:

```graphql
mutation CompleteTask($id: ID!) {
  completeTask(id: $id) {
    id
    status
  }
}
```

Webhook:

```text
POST /webhooks/github
POST /webhooks/google
```

---

# 31. Daily Intelligence Pipeline

Đây là workflow cốt lõi.

Chạy khoảng 05:00–06:00.

```text
Collect
↓
Normalize
↓
Update context
↓
Calculate workload
↓
Detect deadlines
↓
Detect conflicts
↓
Retrieve relevant history
↓
Generate recommendations
↓
Generate Daily Brief
```

Output:

```text
DailyBrief

priorities[]
scheduleSummary
risks[]
recommendations[]
unfinishedTasks[]
importantEvents[]
```

---

# 32. End-of-Day Pipeline

Khoảng 21:00.

```text
Collect today's events
↓
Compare planned vs actual
↓
Summarize progress
↓
Detect unfinished commitments
↓
Update project state
↓
Generate reflection
↓
Prepare tomorrow
```

---

# 33. Project Intelligence

Mỗi project có một Project Health Score.

Không nên chỉ là một con số AI bịa ra.

Score được tính từ các signal:

```text
progress
deadline proximity
overdue tasks
blocked tasks
activity frequency
recent changes
commit frequency
PR status
```

Ví dụ:

```text
Project Health

Progress          72
Momentum          81
Schedule Risk     64
Blocker Risk      35
```

Sau đó AI diễn giải.

---

# 34. Recommendation Engine

V1 không nên dùng agent tự trị hoàn toàn.

Sử dụng:

```text
Rules
+
Statistics
+
LLM reasoning
```

Ví dụ:

```text
Rule:
dueDate < 24h
AND status != completed

→ deadline_risk
```

Sau đó LLM giải thích context.

Điều này dễ kiểm soát hơn so với:

```text
Send everything to an agent and let it decide.
```

---

# 35. Agent Architecture — Future

Khi hệ thống đã ổn định, có thể thêm:

```text
Planner Agent
Research Agent
Project Agent
Communication Agent
Personal Assistant Agent
```

Nhưng tất cả agent phải hoạt động trên:

```text
Tools
Permissions
Policies
Audit logs
```

Ví dụ:

```text
Agent
 ↓
Tool selection
 ↓
Permission check
 ↓
Action preview
 ↓
Approval
 ↓
Execution
 ↓
Audit log
```

---

# 36. Security

Đây là hệ thống chứa dữ liệu cực kỳ nhạy cảm về hành vi cá nhân, vì vậy security phải được coi là core feature.

### Yêu cầu

```text
Encryption in transit
Encryption at rest
OAuth token encryption
Strict authorization
Audit logs
Data export
Data deletion
Session management
```

AI provider phải có cơ chế kiểm soát rõ:

```text
What data was sent?
Why?
Which model?
When?
```

Không gửi toàn bộ database cho LLM.

---

# 37. Privacy Model

User phải có quyền:

```text
Disconnect integration
Delete data
Export data
Disable AI processing
Disable specific automation
```

Mỗi integration có scope riêng.

Ví dụ:

```text
GitHub:
read repositories
read issues
read pull requests
```

Không yêu cầu:

```text
write repository
delete repository
```

trừ khi thật sự cần.

---

# 38. Audit Log

Mọi action quan trọng phải ghi:

```text
actor
action
resource
before
after
timestamp
source
```

Ví dụ:

```text
Actor:
AI Agent

Action:
create_task

Resource:
Task #182

Reason:
Extracted from email #9381

Timestamp:
2026-08-24 09:15
```

---

# 39. MVP Scope

MVP không bao gồm tất cả module.

MVP nên chỉ gồm:

```text
1. Authentication
2. Projects
3. Tasks
4. Calendar integration
5. GitHub integration
6. Daily Command Center
7. Activity timeline
8. Basic AI summary
9. Basic recommendations
10. Automation engine
11. Search
12. Audit log
```

Không làm ngay:

```text
Finance
Running
Research graph
Advanced agents
Full knowledge graph
Complex predictive analytics
```

---

# 40. MVP User Experience

Sau khi đăng nhập:

```text
Dashboard
```

### Sidebar

```text
Today
Inbox
Tasks
Projects
Calendar
Memory
Decisions
Automations
Settings
```

### Today

```text
Focus
Schedule
Tasks
Project alerts
AI insights
Recent activity
```

---

# 41. MVP Acceptance Criteria

MVP được coi là thành công khi:

### AC1

System tự đồng bộ GitHub.

### AC2

System tự đồng bộ Calendar.

### AC3

Có thể tạo task thủ công.

### AC4

Có thể liên kết:

```text
Task ↔ Project
```

### AC5

Có timeline hoạt động.

### AC6

Mỗi sáng hệ thống tạo Daily Brief.

### AC7

AI có thể giải thích recommendation.

### AC8

User có thể search project memory.

### AC9

Automation có thể chạy khi event xảy ra.

### AC10

Mọi AI action quan trọng có audit log.

---

# 42. MVP Metrics

Không đo bằng số lượng feature.

Đo bằng usefulness.

### Primary metric

**Time Saved per Week**

Ví dụ:

```text
Week 1:
1.2h saved

Week 4:
3.5h saved

Week 12:
6.1h saved
```

### Secondary metrics

```text
Number of manual actions avoided
Number of useful recommendations
Recommendation acceptance rate
Task completion rate
Missed deadline rate
Search success rate
Automation success rate
```

---

# 43. Product Success Criteria

Sau khoảng 2–3 tháng sử dụng:

```text
User checks dashboard >= 5 days/week

At least 3 useful automations

At least 50% routine project updates automated

Daily brief perceived useful >= 80%

Search retrieves relevant historical context

Manual task management time decreases
```

---

# 44. Roadmap

## Phase 0 — Foundation

```text
Repository
Authentication
Database
Design system
Core entities
Event infrastructure
```

## Phase 1 — Productivity Core

```text
Tasks
Projects
Calendar
GitHub
Dashboard
Activity timeline
```

## Phase 2 — Intelligence

```text
LLM integration
Daily brief
Summarization
Recommendations
Semantic search
```

## Phase 3 — Automation

```text
Event processing
Workflow engine
Triggers
Actions
Notifications
```

## Phase 4 — Memory

```text
Decision journal
Project memory
Knowledge base
Research
```

## Phase 5 — Personal Intelligence

```text
Analytics
Pattern detection
Decision feedback
Predictive recommendations
```

## Phase 6 — Agentic System

```text
Planner Agent
Research Agent
Project Agent
Communication Agent
```

---

# 45. Suggested Technical Stack

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Apollo Client
```

## Backend

```text
NestJS
TypeScript
GraphQL
REST for webhooks
```

## Database

```text
PostgreSQL
pgvector
```

## Cache / Queue

```text
Redis
BullMQ
```

## Storage

```text
S3-compatible storage
```

## AI

```text
LLM API
Embedding API
Structured output
Tool calling
```

## Infrastructure

```text
Docker
Docker Compose

Production:
AWS / VPS initially
Nginx
Cloudflare
CI/CD
```

Không cần Kubernetes ở giai đoạn đầu.

---

# 46. Repository Structure

```text
personal-os/
│
├── apps/
│   ├── web/
│   └── api/
│
├── packages/
│   ├── shared/
│   ├── types/
│   ├── ui/
│   ├── config/
│   └── ai/
│
├── workers/
│   ├── sync-worker/
│   ├── automation-worker/
│   └── ai-worker/
│
├── infrastructure/
│   ├── docker/
│   └── nginx/
│
├── docs/
│   ├── product/
│   ├── architecture/
│   ├── api/
│   └── adr/
│
└── package.json
```



---

# 47. Architectural Decision Records

Mọi quyết định kiến trúc đáng kể phải được lưu trong:

```text
docs/adr/
```

Ví dụ:

```text
ADR-001-use-postgresql
ADR-002-modular-monolith
ADR-003-use-graphql
ADR-004-use-pgvector
ADR-005-ai-human-in-the-loop
```

Chính Personal OS cũng có thể tự tạo và quản lý ADR cho chính nó.

---

# 48. Long-term Vision

Kiến trúc dài hạn:

```text
                 PERSONAL OS
                      │
       ┌──────────────┼──────────────┐
       │              │              │
      DATA          MEMORY        CONTEXT
       │              │              │
       └──────────────┼──────────────┘
                      │
                   INTELLIGENCE
                      │
          ┌───────────┼───────────┐
          │           │           │
       ANALYSIS    DECISION    PREDICTION
          │           │           │
          └───────────┼───────────┘
                      │
                  AUTOMATION
                      │
                    ACTION
                      │
                  OUTCOME
                      │
                  FEEDBACK
                      │
                      └────────────→ MEMORY
```

Điểm cuối cùng không phải là:

> “AI làm mọi thứ thay tôi.”

Mà là:

> **Tôi có một hệ thống hiểu đủ context để giúp tôi dành ít năng lượng hơn cho việc quản lý cuộc sống, và nhiều năng lượng hơn cho những việc thực sự cần con người suy nghĩ.**

---

# 49. Định nghĩa V1 rất cụ thể

Để tránh biến dự án thành “xây mãi không xong”, V1 nên được chốt ở phạm vi:

```text
Personal OS v1

INPUT
├── GitHub
├── Google Calendar
└── Manual input

CORE
├── Projects
├── Tasks
├── Activities
├── Daily Brief
├── Search
└── Automation

AI
├── Summarization
├── Classification
└── Recommendation

OUTPUT
├── What matters today?
├── What changed?
├── What is at risk?
└── What should I do next?
```

Đây là phiên bản đủ nhỏ để thực sự triển khai nhưng đã chứa **kiến trúc nền móng của Personal OS dài hạn**.

---

# 50. Nguyên tắc quan trọng nhất của dự án

Không xây:

> **“Một dashboard đẹp chứa tất cả dữ liệu của tôi.”**

Hãy xây:

> **“Một hệ thống hiểu trạng thái hiện tại của tôi và giúp tôi đưa ra hành động tiếp theo tốt hơn.”**

Đó là sự khác biệt giữa **productivity dashboard** và **Personal Operating System**.
