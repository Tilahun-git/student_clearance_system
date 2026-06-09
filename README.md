# WDU Student Clearance System

A full-stack web application for managing student clearance requests at Woldia University. The system automates the multi-step approval workflow across academic and administrative offices, replacing the manual paper-based process.

**Live Demo:** [https://student-clearance-system-m785.onrender.com](https://student-clearance-system-m785.onrender.com)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Software Architecture](#software-architecture)
- [Database Design](#database-design)
- [Clearance Workflow](#clearance-workflow)
- [User Roles](#user-roles)
- [Getting Started](#getting-started)
- [Running Locally](#running-locally)
- [Deployment](#deployment)

---

## Features

- Multi-step clearance workflow with 9 sequential and parallel approval stages
- Role-based access control — each user sees only their relevant dashboard
- Real-time notifications via Socket.io
- Bulk approval for staff roles
- Library book tracking — blocks clearance if unreturned books exist
- PDF certificate generation on full approval
- Forgot / Reset password via Brevo email API
- Force password change on first login for admin-created accounts
- Pagination on all data tables
- Admin dashboard with live statistics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | NextAuth.js v4 (JWT strategy) |
| Real-time | Socket.io |
| Email | Brevo Transactional API |
| File Storage | Cloudinary |
| Deployment | Render |

---

## Software Architecture

The system follows a **layered monolithic architecture** built on Next.js, where the frontend and backend coexist in a single codebase communicating through API routes.

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                      │
│                                                              │
│   React Components  ──►  API Helper Functions (lib/api/)    │
│        │                          │                         │
│        │ Socket.io (real-time)     │ HTTP (REST)            │
└────────┼──────────────────────────┼─────────────────────────┘
         │                          │
         ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js + Next.js)                │
│                                                              │
│  ┌────────────────────┐   ┌──────────────────────────────┐  │
│  │   Socket.io Server │   │     Next.js API Routes        │  │
│  │   (real-time       │   │     (app/api/**/route.ts)     │  │
│  │    notifications)  │   │                              │  │
│  └────────────────────┘   └──────────────┬───────────────┘  │
│                                          │                   │
│                           ┌──────────────▼───────────────┐  │
│                           │       Service Layer           │  │
│                           │  clearance.service.ts         │  │
│                           │  approval.workflow.ts         │  │
│                           │  notification.service.ts      │  │
│                           │  certificate.service.ts       │  │
│                           └──────────────┬───────────────┘  │
│                                          │                   │
│                           ┌──────────────▼───────────────┐  │
│                           │       Prisma ORM              │  │
│                           └──────────────┬───────────────┘  │
└──────────────────────────────────────────┼──────────────────┘
                                           │
                            ┌──────────────▼───────────────┐
                            │       PostgreSQL Database      │
                            └──────────────────────────────┘
```

### Key Architectural Decisions

**1. Custom Node.js Server (`server.js`)**
Next.js runs inside a custom HTTP server that also initializes Socket.io. This allows both the web framework and the WebSocket server to share the same port and process.

**2. JWT-based Session Management**
Authentication uses NextAuth.js with the JWT strategy. The JWT stores the user's roles and `activeRole`. When a user with multiple roles selects a role, the `select-role` API route rewrites the JWT cookie server-side before redirecting to avoid race conditions.

**3. Upfront Approval Record Creation**
When a student submits a clearance request, all 9 approval records are created simultaneously as `PENDING`. The approval workflow engine then updates their status as each role acts — the student always sees the full pipeline from day one.

**4. DAG-based Workflow Engine**
The clearance approval process is modelled as a Directed Acyclic Graph (DAG) in `lib/workflow.ts`. The workflow engine in `approval.workflow.ts` reads the DAG to determine which roles to notify next after each approval.

**5. Scoped Real-time Notifications**
Notifications are scoped by `forRole`. Each Socket.io room corresponds to a user ID. The client filters incoming events by `activeRole` so a user with multiple roles only sees notifications relevant to their current session.

---

## Database Design

The database consists of 12 core models with the following key relationships:

```
User ─────────────────────────────────────────────────────────────┐
 │  has many  UserRole (junction table)                           │
 │  has one   Staff (for non-student users)                       │
 │  has one   Student (for student users)                         │
 │  has many  Notification                                        │
 └────────────────────────────────────────────────────────────────┘

Role ──────────────────────────────────────────────────────────────┐
 │  has many  UserRole                                            │
 │  has many  ClearanceApproval                                   │
 └────────────────────────────────────────────────────────────────┘

Student ───────────────────────────────────────────────────────────┐
 │  belongs to  Department                                        │
 │  belongs to  School                                            │
 │  belongs to  Staff (advisor)                                   │
 │  has many    ClearanceRequest                                  │
 │  has many    LibraryBorrow                                     │
 │  has many    ClearanceCertificate                              │
 └────────────────────────────────────────────────────────────────┘

ClearanceRequest ──────────────────────────────────────────────────┐
 │  belongs to  Student                                           │
 │  has many    ClearanceApproval  (one per role, created upfront)│
 │  has one     ClearanceCertificate                              │
 └────────────────────────────────────────────────────────────────┘

ClearanceApproval ─────────────────────────────────────────────────┐
 │  belongs to  ClearanceRequest                                  │
 │  belongs to  Role                                              │
 │  belongs to  Staff (who approved/rejected)                     │
 │  belongs to  ClearanceStaffOffice (for office-based roles)     │
 └────────────────────────────────────────────────────────────────┘

School ────────────────────────────────────────────────────────────┐
 │  has one   Staff (school_dean)                                 │
 │  has many  Department                                          │
 │  has many  Student                                             │
 └────────────────────────────────────────────────────────────────┘

Department ────────────────────────────────────────────────────────┐
 │  belongs to  School                                            │
 │  has one     Staff (head)                                      │
 │  has many    Student                                           │
 └────────────────────────────────────────────────────────────────┘

ClearanceStaffOffice ──────────────────────────────────────────────┐
 │  has one   Staff (manager)                                     │
 │  has many  ClearanceApproval                                   │
 └────────────────────────────────────────────────────────────────┘
```

### Entity Summary

| Entity | Purpose |
|---|---|
| `User` | Authentication record for all system users |
| `Role` | System roles (STUDENT, ADVISOR, DEPARTMENT_HEAD, etc.) |
| `UserRole` | Many-to-many junction between User and Role |
| `Student` | Student academic profile linked to a User |
| `Staff` | Staff profile linked to a User, scoped to school/department |
| `School` | Academic school with an assigned dean |
| `Department` | Academic department within a school with an assigned head |
| `ClearanceRequest` | A student's clearance application |
| `ClearanceApproval` | One approval step per role for a request |
| `ClearanceCertificate` | Issued certificate after full approval |
| `ClearanceStaffOffice` | Office-based clearance station (Library, Cafeteria, etc.) |
| `LibraryBorrow` | Tracks books borrowed by students |
| `Notification` | In-app notification scoped to a user and role |

---

## Clearance Workflow

When a student submits a request, all 9 approval records are created as `PENDING` immediately. The DAG engine activates the next stage after each approval:

```
Student submits request → all 9 stages shown as PENDING
           │
           ▼
       ADVISOR ──────────────────────────────────► approves
           │
           ▼
   DEPARTMENT HEAD ────────────────────────────► approves
           │
           ▼
    SCHOOL DEAN ─────────────────────────────── ► approves
           │
     ┌─────┴──────┬──────────────┬─────────────┐
     ▼            ▼              ▼              ▼
  LIBRARY     CAFETERIA   CAMPUS POLICE    DORMITORY   (parallel)
     │            │              │
     └────────────┴──────────────┘
                  │ (when both approved)
                  ▼
            STUDENT DEAN
                  │
                  ▼ (when all parallel stages done)
              REGISTRAR ──► issues PDF certificate ──► APPROVED ✓
```

Progress bar on the student dashboard shows: `approved / 9 × 100%`

---

## User Roles

| Role | Responsibility |
|---|---|
| `ADMIN` | Manages users, schools, departments, and offices |
| `STUDENT` | Submits clearance requests, tracks progress, downloads certificate |
| `ADVISOR` | First approval stage |
| `DEPARTMENT_HEAD` | Second approval stage |
| `SCHOOL_DEAN` | Third approval stage |
| `LIBRARY` | Tracks borrowed books; blocks clearance if books unreturned |
| `CAFETERIA` | Parallel approval stage |
| `CAMPUS_POLICE` | Parallel approval stage |
| `DORMITORY` | Parallel approval stage |
| `STUDENT_DEAN` | Approves after cafeteria + campus police |
| `REGISTRAR` | Final approver — issues the clearance certificate |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [PostgreSQL](https://www.postgresql.org/) (local or hosted)
- [Git](https://git-scm.com/)

### Clone the repository

```bash
git clone https://github.com/Tilahun-git/student_clearance_system.git
cd student_clearance_system
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

See `.env.example` for the list of required variables and where to obtain each one.

### Set up the database

```bash
npx prisma migrate deploy
npx prisma generate
```

---

## Running Locally

```bash
npm run dev
```

Runs on [http://localhost:3000](http://localhost:3000)

> The dev server uses a custom Node.js entry point (`server.js`) that starts both Next.js and Socket.io together.

### Production build

```bash
npm run build
npm run start
```

---

## Deployment

Deployed on [Render](https://render.com).

**Build command:**
```bash
npm install && npx prisma generate && npx prisma migrate deploy && npm run build
```

**Start command:**
```bash
node server.js
```

Configure all required environment variables in your Render service → **Environment** tab. See `.env.example` for the full list.

---

## License

Developed as a senior project at **Woldia University**, Ethiopia.
