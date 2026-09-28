# BULLET MASTER // Viral News Tachometer & Intelligence Cockpit

A high-octane viral content intelligence web platform featuring a dynamic 60 FPS Canvas Tachometer Gauge, real-time virality analysis, image-backed article publishing, developer passcode authentication (`1412`), and a live administrator moderation cockpit.

---

## ⚡ Key Features

### 1. Dynamic Spinning Tachometer Gauge
- **60 FPS Canvas Engine**: Realistic automotive physics with spring damping, inertial needle response, and redline jitter.
- **Redline Zone (8,000 - 10,000 RPM)**: Visual redline arc, vibrating HUD, peak-hold ghost needle, and flashing shift light.
- **Synthesized Web Audio Engine**: Zero-asset audio synthesizer using HTML5 Web Audio API to create authentic engine revs and rev-limiter stutter based on post virality.
- **Digital Telemetry HUD**: Real-time readout of RPM, Gear status (Idle through 6th Gear), Virality Velocity (MPH), and Controversy Index.

### 2. Virality & Bullet Impact Analyzer
- Evaluates any headline, tweet (X), Reddit post, or news dispatch.
- **Bullet Impact Classes**:
  - `CLASS: RUBBER BULLET` (0 - 4,200 RPM)
  - `CLASS: HOLLOW POINT` (4,200 - 6,800 RPM)
  - `CLASS: ARMOR PIERCING` (6,800 - 8,000 RPM)
  - `CLASS: RAILGUN KINETIC [REDLINE]` (8,000 - 10,000 RPM)

### 3. Dispatch Creation with Image Support (`+` Icon)
- Click the glowing floating **(+) button** at the bottom-right or the header to broadcast a post.
- **Dual Image Support**:
  - Upload any image from your local computer (automatically encoded to base64 DataURL).
  - Paste any remote image URL.
  - Choose from quick cyberpunk / tech sample presets.
- Live real-time RPM estimate preview while composing.

### 4. Developer Option & Admin Verification
- Click the **DEVELOPER** terminal button in the top navigation.
- **Strictly No Hints**: The modal provides zero hints or clues.
- Enter passcode: `1412`
- Unlocks **Admin Mode** with visual badge, card purge controls, and direct access to the Moderation Cockpit.

### 5. Content Management & Purge Authorization
- Administrators can delete any dispatch directly from its card in the live feed.
- Persistent in browser storage (`localStorage`) and synchronized across browser windows using the `BroadcastChannel` API.

### 6. Real-Time Moderation Dashboard
- Accessible to authenticated administrators via the **DASHBOARD** link.
- **Live KPIs**: Total Dispatches, Redline Posts, Average Velocity RPM, and Moderation Actions.
- **Content Moderation Queue**: Table of all live posts with thumbnail, source platform, RPM badge, impact class, and purge actions.
- **Real-Time Audit Log**: Live tracking of system events (dispatches published, admin logins, purged items).
- **Inject Spike**: Simulates viral breaking news surges to stress-test the telemetry engine.
- **Session Lock**: One-click lock to revoke admin credentials.

---

## 🚀 How to Run

Simply open `index.html` in any modern web browser (Edge, Chrome, Firefox, Brave):
```powershell
Start-Process "C:\Users\hp\.gemini\antigravity\scratch\bullet-master\index.html"
```
No external servers, Node.js, or Python dependencies are required—everything runs natively in the browser with full offline and local persistence.
