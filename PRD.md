# PRD - MVP Demo: Anti-Scam PWA (Single Flow)

## 1. Demo Objective
Build a simple web app with 2 interfaces (2 routes) to demonstrate the workflow: A younger person sends a "Spoofed Message" from the Dashboard, the elderly person's device receives the message, taps the link, and an educational/warning screen appears.

## 2. Proposed Tech Stack for AI Code Generation
- **Framework**: Next.js (App Router) for both interfaces to easily keep them in one project (Monorepo) or React.js (Vite).
- **Styling**: Tailwind CSS (Dark mode for Instructor Dashboard, light mobile-style interface for Learner).
- **Realtime/State**: Use `socket.io` (if Node.js server), Supabase Realtime, or simplest for demo: store state in a JSON file/In-memory database (using Next.js API Routes + client-side `setInterval` polling every 2 seconds to check for new notifications). AI should prioritize the fastest local setup.

## 3. URL Architecture
Project has 2 main routes:

| Route | Audience | Interface |
|-------|----------|-----------|
| `/toolkit` | Young person (Instructor) | Desktop/Tablet |
| `/learner` | Elderly person (Learner) | Simulated Mobile screen |

## 4. Detailed Flow to Implement

### Step 1: Initialization & Pairing
**`/learner` screen:**
- Auto-generates a 4-digit **Session ID** (e.g., `1234`) on load.
- Displays prominently: **"Your device code: 1234. Waiting for connection..."**

**`/toolkit` screen:**
- Input field: **"Enter your relative's device code"**
- Enter `1234` → click **"Connect"**
- On success: UI switches to Dashboard. `/learner` switches to **"Ready (hidden/background)"** state.

### Step 2: Trigger Scam Scenario
**`/toolkit` screen:**
- Shows 1 Card (button): **"Scenario: Traffic Fine Scam"**
- On click → small Form appears:
  - **Sender Name**: (Default: `POLICE DEPARTMENT`)
  - **Content**: `"You have violated traffic law. Access phatnguoivn.com to pay fine or your account will be locked."`
  - Button: **"Send Simulation"**
- On send → calls `POST /api/scam/trigger` with payload:
```json
{
  "session_id": "1234",
  "type": "sms",
  "sender": "POLICE DEPARTMENT",
  "content": "You have violated traffic law. Access phatnguoivn.com to pay fine or your account will be locked."
}
```

### Step 3: Elderly Receives & Reacts (Simulate & React)
**`/learner` screen:**
- Client continuously polls API (or receives socket event). On `"triggered"` signal → immediately renders a **Push Notification** or **SMS App UI** simulation on mobile.
- Notification shows: Sender + Text from Step 2. Contains a **clickable blue spoof link**.
- **Interaction 1 (Ignore)**: **"Delete message"** button → calls API to report `"Passed"` to `/toolkit`.
- **Interaction 2 (Fall for it)**: Tap the link → instantly shows **full-screen red warning Modal/Popup**: **"YOU'VE BEEN SCAMMED!"** with explanation: *"This is a simulation. NEVER click links from unknown messages demanding payment."* → calls API to report `"Failed"` to `/toolkit`.

### Step 4: View Results (Reporting)
**`/toolkit` screen:** Receives event/polling and updates Session `1234` status from **"Sent"** → **"Failed (Trapped)"** or **"Safe (Passed)"**.