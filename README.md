# Thrusha Motors ERP - CloudSpace DevOps Challenge

Welcome to the **CloudSpace team selection challenge**. Read this whole file before you start.

---

## 📜 The Scenario

**Thrusha Motors (Pvt) Ltd.** uses an internal **ERP system** to manage its electronic parts inventory, customer orders, low-stock alerts and sales dashboard. An **intern** worked on this system, made a few changes "to make it work on my machine" and pushed them straight to the repository. Since then, nothing works the way it should. The company has called you in as a **Senior DevOps Engineer** to troubleshoot it, fix it and ship it.

The trouble starts with the **frontend**. When it is started by hand, the dev server comes up without complaint, but the browser shows **nothing except a white page**.

Once the page finally loads, the **Backend Sync** box in the sidebar stays **red** and the orders never arrive, even though the backend answers perfectly when it is called directly.

Next, the intern tried Docker. The **backend image does not even build**.

The **frontend image** is no better. The React app compiles, but the **final stage of the build fails**.

When everything is fixed, the whole system must come up with **one single command**: `docker compose up -d --build`. The database must be **healthy**, the ERP must open at http://localhost:3000, the sidebar must show a green **Synced (:5000)**, and orders must be able to be approved, completed, cancelled and returned.

Finally, Thrusha Motors wants delivery to be automatic. Build a **GitHub Actions** workflow inside `.github/workflows/` that runs on every **push to `main`** and **builds and pushes both the backend and the frontend images** to **Docker Hub**, tagged with **your team name**.

> [!NOTE]
> The business logic (orders, inventory, dashboard) is fine. The problems are only in **configuration, connections and the container setup**.

---

## 💡 Hints

Try on your own first. Open a hint only when you are stuck.

<details>
<summary><b>Hint 1 — The white page</b></summary>

<br>

A browser can only render what the entry point actually manages to load. Something that is **referenced** is not always something that **exists**.

</details>

<details>
<summary><b>Hint 2 — The red Backend Sync</b></summary>

<br>

The backend is not silent about itself when it starts. Every request the browser sends carries an **address**, and not every address leads to a running service.

</details>

<details>
<summary><b>Hint 3 — The backend image</b></summary>

<br>

A build instruction runs exactly **where the image is standing** at that moment, not where you might expect it to be.

</details>

<details>
<summary><b>Hint 4 — The frontend image</b></summary>

<br>

Before copying something from one stage to another, it is worth knowing what the earlier stage **really left behind**.

</details>

<details>
<summary><b>Hint 5 — Shipping to Docker Hub</b></summary>

<br>

Docker already maintains **official building blocks** for GitHub Actions. Two images mean **two separate journeys**. A token written in plain text is a token for **everyone**.

</details>

<details>
<summary><b>Hint 0 — When nothing makes sense</b></summary>

<br>

Every failure leaves a **trace**. The answer is rarely in the **last line**.

</details>

---

## 🛠 Technology Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React 18 + Vite 5, Tailwind CSS (CDN), FontAwesome |
| Frontend Web Server | Nginx (`nginx:1.25-alpine`) |
| Backend API | Node.js 18 + Express 4 (`node:18-alpine`) |
| Backend Packages | `pg`, `helmet`, `cors`, `express-rate-limit`, `dotenv` |
| Database | PostgreSQL 15 (`postgres:15-alpine`) |
| Containers | Docker (multi-stage builds) + Docker Compose v2 |
| CI/CD | GitHub Actions |
| Image Registry | Docker Hub |

| Service | URL / Port |
| :--- | :--- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| Backend Health | http://localhost:5000/health |
| Database | `localhost:51434` (user `postgres`, password `postgres`, database `erp_db`) |

> [!IMPORTANT]
> **A `.env.example` file is provided.** Default environment variables are built into `docker-compose.yml`. You may optionally copy `.env.example` to `.env` for local testing, but do **NOT** commit any `.env` file to your repository. The stack must start out-of-the-box via `docker compose up -d --build`.

---

## 🚀 Getting Started

1. Create a **new public repository** on your own GitHub account named exactly **`cloudspace`**. Keep it empty (no README, no license).
2. Clone the challenge repository and push it to your new `cloudspace` repository:

```bash
git clone https://github.com/cloudspace-v2/erp-devops-challenge.git cloudspace
cd cloudspace
git remote remove origin
git remote add origin https://github.com/<your-github-username>/cloudspace.git
git branch -M main
git push -u origin main
```

3. Do **all** your work inside **your team's own `cloudspace` repository**, and push every fix to it.

---

## 🐳 Docker Hub Details

| Item | Value |
| :--- | :--- |
| Docker Hub Username | `cloudspacev2` |
| Docker Hub Access Token | Distributed via the official WhatsApp announcement at 7:00 PM |

Save them as **GitHub repository secrets** in your team's `cloudspace` repository (`Settings → Secrets and variables → Actions`):
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`


**Image names — the tag must be your team tag:**

```text
cloudspacev2/erp-backend:<your-team-tag>
cloudspacev2/erp-frontend:<your-team-tag>
```

Team tag format: lowercase letters, numbers and hyphens only, no spaces.
Example: team **"Byte Busters"** tag `byte-busters` → `cloudspacev2/erp-backend:byte-busters`

---

## 📤 Submission

Follow this exact order for your submission (as specified in **STEP 05** of the Challenge Guide):

1. **Push your code:** Push all your fixes and your `.github/workflows/` workflow to your public **`cloudspace`** repository (ensure no `.env` file is committed).
2. **Confirm CI/CD run:** Verify that your GitHub Actions workflow completes successfully (green checkmark) and pushes both images (`cloudspacev2/erp-backend:<your-team-tag>` and `cloudspacev2/erp-frontend:<your-team-tag>`) to `cloudspacev2` on Docker Hub.
3. **Submit the official form:**
   👉 **[CloudSpace v2.0 - Online Qualifier: Final Challenge Submission](https://forms.cloud.microsoft/r/r16FXXUhxN)**

The evaluation committee will verify your GitHub repository and test that the application stack runs cleanly via `docker compose up -d --build`.

> [!IMPORTANT]
> **Selection order:** Teams are ranked primarily by the **verified Docker Hub push timestamp** of both required images, validated against their official form submission and confirmation that the stack builds and runs cleanly via `docker compose up -d --build`. Only your first valid form submission will be evaluated.

---

## ⚖️ Rules and Regulations (Mandatory)

Every team **must** follow these rules. Breaking any rule can lead to **disqualification**.

1. **Repository:** Your GitHub repository must be named exactly **`cloudspace`** and must be **public**.
2. **Your own work:** Do not work on the public challenge repository directly. Clone it and push it to your own `cloudspace` repository.
3. **No AI tools:** AI assistants and AI agents (Claude, ChatGPT, GitHub Copilot, Cursor, Antigravity or similar) must **not** write, change, commit or push anything in your repository. The OC will check commit history, commit authors and the contributors list. Any AI or bot commit means **immediate disqualification**.
4. **Do not change business logic:** Do not change the ERP features or the UI design. Fix only what is broken.
5. **No `.env` file committed:** You may use `.env.example` for reference/local testing, but do not commit any `.env` file to your repository. The system must run out-of-the-box from `docker-compose.yml`.
6. **One command:** The application must start with **only** `docker compose up -d --build`. No extra manual steps.
7. **No hardcoded secrets:** Do not write the Docker Hub token in any file. Use GitHub repository secrets.
8. **Correct image names and tag:** Push only `cloudspacev2/erp-backend:<your-team-tag>` and `cloudspacev2/erp-frontend:<your-team-tag>`. Both images must be pushed **by your GitHub Actions workflow**, not from your own machine.
9. **Do not touch other teams' images:** Overwriting, deleting or changing another team's image or tag means **immediate disqualification**.
10. **Shared credentials:** Use the Docker Hub credentials **only** for this challenge.
11. **Submission order:** Follow the strict submission order: (1) Push code & workflow to GitHub, (2) Confirm both images pushed to Docker Hub via GitHub Actions, (3) Submit the official submission form.
12. **One submission:** Only your **first** official form submission counts. Changes pushed after you submit may not be evaluated.
13. **Explain your work:** Every team member must be able to explain the fixes if the OC asks.
14. **OC decision is final.**

---

## 💬 Official Channels & Support

- **Official WhatsApp Group (Live Updates & PAT Release):** [Join WhatsApp Group](https://chat.whatsapp.com/JI6cMuXu2ppBYPvvOPEFMr)
- If you face platform issues, reach out to the organizing team contacts listed in the Delegate Challenge Guide.

---

**Good luck, engineers! Troubleshoot it, containerize it, ship it.** 
