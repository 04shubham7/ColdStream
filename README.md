<div align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/Kafka-Event%20Streaming-black?style=for-the-badge&logo=apachekafka&logoColor=white" alt="Kafka">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/Redis-Idempotency-dc382d?style=for-the-badge&logo=redis&logoColor=white" alt="Redis">
  <img src="https://img.shields.io/badge/Supabase-Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
</div>

<h1 align="center">🧊 ColdStream</h1>

<p align="center">
  <strong>A high-performance, asynchronous cold email dispatching platform.</strong><br/>
  Automate your outreach with powerful templating, seamless resume attachments, and guaranteed delivery via Apache Kafka.
</p>

---

## 🌟 Overview

**ColdStream** is an enterprise-grade solution for managing outbound recruitment and sales emails. Built around a robust event-driven microservices architecture, it ensures that your emails are never lost in transit, preventing duplicate dispatches through advanced idempotency caching, and providing a stunning, minimalistic Vercel-inspired user interface.

### ✨ Core Features
- **🚀 Async Dispatch Engine**: Powered by Apache Kafka for guaranteed, high-throughput email delivery with optimized single-producer worker architecture.
- **🎨 Modern UI/UX**: A sleek, high-end minimalist design system built with TailwindCSS, Framer Motion, and global toast notifications via `react-hot-toast`.
- **📊 Visual Job Tracking**: Track the precise stage of your emails in real-time with an interactive, inline flowchart tracker.
- **🛡️ Enterprise Security**: Comprehensive API protection featuring global rate limiting (`express-rate-limit`), NoSQL injection prevention (`express-mongo-sanitize`), and strict input validation via `Zod`.
- **⚡ Advanced Data Caching**: Intelligent state management and request deduplication using `Zustand` and `@tanstack/react-query`, backed by `Redis` on the server.
- **☁️ Cloud Storage**: Resume PDF uploads seamlessly integrated with Supabase storage.
- **📝 Dynamic Templating**: Create reusable email templates with dynamic variable injection (`{{company}}`, `{{role}}`).

---

## 🏗️ System Architecture

ColdStream is decoupled into three primary packages managed via NPM Workspaces. The architecture guarantees high availability and fault tolerance.

```mermaid
graph TD
    %% Define Styles
    classDef client fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef api fill:#4a90e2,stroke:#333,stroke-width:2px,color:#fff;
    classDef worker fill:#f5a623,stroke:#333,stroke-width:2px,color:#fff;
    classDef db fill:#50e3c2,stroke:#333,stroke-width:2px;
    classDef queue fill:#d0021b,stroke:#333,stroke-width:2px,color:#fff;
    classDef group fill:#ffffff,stroke:#e5e7eb,stroke-width:2px,stroke-dasharray: 5 5;

    Client[💻 Web Client / React]:::client -->|HTTP REST| API[⚙️ Express API]:::api
    
    subgraph Backend Infrastructure
        direction TB
        API -->|Reads/Writes Data| MongoDB[(🍃 MongoDB Atlas)]:::db
        API -->|Caches & Rate Limits| Redis[(🔴 Redis)]:::db
        API -->|Produces Job Event| Kafka{Apache Kafka}:::queue
        
        Kafka -->|Consumes Event| Worker[⚡ Node.js Email Worker]:::worker
        Worker -->|Updates Job Status| MongoDB
        Worker -->|Idempotency Check| Redis
        Worker -->|Fetches PDF Resume| Supabase[(☁️ Supabase Storage)]:::db
    end
    
    Worker -->|Sends via Nodemailer| SMTP[📧 Mail Server / Gmail]:::client
```

### 🧩 Package Structure
| Package | Stack | Responsibility |
|---|---|---|
| **`packages/web`** | React 18, Vite, Tailwind, Zustand, React Query | Provides the dashboard, template editor, resume uploader, and visual dispatch tracker. Includes global toast handling and advanced caching. |
| **`packages/api`** | Node.js, Express, Mongoose, Zod | The secure REST API layer. Handles authentication, stores entities in MongoDB, enforces rate limits in Redis, validates schemas via Zod, and pushes jobs to Kafka. |
| **`packages/worker`** | Node.js, KafkaJS, Nodemailer | The resilient background processor. Subscribes to Kafka, formats HTML emails, attaches resumes from Supabase, and dispatches via SMTP with zero memory leaks. |

---

## 🚀 Getting Started

Follow these comprehensive guidelines to set up the project locally.

### 1. Prerequisites
Ensure you have the following installed on your local development machine:
- **Node.js**: v18 or higher
- **Docker & Docker Compose**: Required for running Kafka, Zookeeper, and Redis.
- **MongoDB Atlas**: A free tier cluster (or a local MongoDB instance).
- **Supabase**: A free tier project for blob storage.

### 2. Infrastructure Setup
Start the local message broker and caching layer using Docker:
```bash
# From the project root
docker-compose up -d
```
> *This provisions Zookeeper, Apache Kafka (port `9092`), and Redis (port `6379`) in the background.*

### 3. Environment Variables
You must configure the `.env` files for both the API and the Worker. 

**API Environment (`packages/api/.env`)**
```env
PORT=8080
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/coldstream
REDIS_URL=redis://localhost:6379
KAFKA_BROKER=localhost:9092
JWT_SECRET=your_super_secret_jwt_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Worker Environment (`packages/worker/.env`)**
```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/coldstream
KAFKA_BROKER=localhost:9092
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
```
> **⚠️ Critical:** Both the `api` and `worker` must point to the **same** MongoDB database and Kafka broker to communicate properly.

### 4. Running the Application
ColdStream uses NPM workspaces to manage dependencies across all three packages simultaneously.

1. **Install Dependencies (Root Level)**
   ```bash
   npm install
   ```
2. **Start the API Server**
   ```bash
   npm run dev:api
   ```
3. **Start the Background Worker**
   ```bash
   npm run dev:worker
   ```
4. **Start the Web Frontend**
   ```bash
   npm run dev:web
   ```

Open your browser to `http://localhost:5173` to access the ColdStream Dashboard!

---

## 🎨 UI Guidelines & Design System

The frontend strictly adheres to a **high-end minimalist aesthetic** aimed at maximizing developer and user experience:
- **Palette**: Monochromatic with white, off-whites (`gray-50`), and crisp translucent borders (`white/40`). Avoid heavy, muddy gradients.
- **Typography**: `Inter` (sans-serif) for clean, modern readability.
- **Components**: 
  - *Cards*: Use the `.glass-card` CSS class for a subtle, frosted layout with sharp, distinct borders.
  - *Buttons*: Solid black/primary for primary actions, subtle gray hover states for secondary actions.
- **Animations**: `framer-motion` is utilized for micro-interactions (e.g., the Inline Job Tracker accordion dropdown) to keep the application feeling deeply responsive and alive.

---

## 🛠️ Error Handling & Troubleshooting

ColdStream features a robust, self-healing architecture:
- **API Crashes**: Global `asyncHandler` wrappers prevent Express from crashing due to unhandled promise rejections (e.g., duplicate job conflicts).
- **Worker Restarts**: The Kafka consumer uses `fromBeginning: true` to ensure that if the worker goes offline, any queued jobs are instantly processed upon restart.
- **Visual Diagnostics**: The web dashboard automatically parses backend stack traces (e.g., MongoDB disconnects, SMTP Auth errors) and displays human-readable diagnostic tags directly in the visual tracker.
