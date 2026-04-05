# DevLog 📓

> A journaling platform for developers to track their learning journey, share progress with the community, and maintain discipline.

## 🌐 Website
Live demo at: [https://devlog-web.onrender.com](https://devlog-web.onrender.com)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![NestJS](https://img.shields.io/badge/NestJS-10.x-red)
![React](https://img.shields.io/badge/React-18.x-61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-336791)

---

## 📸 Demo & Screenshots

A visual overview of the DevLog system:

### 🛠️ Login Page
*Modern UI UX Login Page.*
<img width="1885" height="910" alt="image" src="https://github.com/user-attachments/assets/a4270a6d-6d96-453e-983c-d15124723eba" />

### 🏠 Home Feed
*Displays the latest posts from the developer community.*
<img width="1884" height="911" alt="image" src="https://github.com/user-attachments/assets/504fc03e-8c82-4f76-8f1e-a229e84c1745" />

### ✍️ Create Post (Markdown Editor)
*A powerful editor with live preview and tag support.*
<img width="1890" height="915" alt="image" src="https://github.com/user-attachments/assets/5d7be5a6-2d03-4587-b898-6dd1d80fbf76" />

### 📖 Post Detail
*An optimized reading view with like ❤️ and comment 💬 support.*
<img width="1449" height="906" alt="image" src="https://github.com/user-attachments/assets/ca3ad8a0-d977-4b72-b3a1-ff93a5d60101" />

### 👤 User Profile & Stats
*Track learning streaks, post history, and followers.*
<img width="1889" height="908" alt="image" src="https://github.com/user-attachments/assets/87d38c72-d120-4f5e-80e7-093f5b0ca706" />


### 🔍 Smart Search
*Quickly search by keyword, technology, or author.*
<img width="1000" height="846" alt="image" src="https://github.com/user-attachments/assets/7a24cf0b-25fc-4e7a-aa0b-adbbec0130f5" />

---

## ✨ Key Features

- **User Authentication** — Login with Email/Password or Google OAuth2, managed via JWT (Access & Refresh tokens).
- **Dev Journaling** — Write posts in Markdown, save as draft or publish publicly.
- **Categories & Tags** — Organize posts by technology (React, NestJS, DevOps...) for easy management.
- **Community Feed** — Discover and learn from other developers' experiences.
- **Interactions** — Like ❤️ and comment 💬 directly on posts.
- **Follow System** — Follow other developers to receive their latest updates.
- **User Profile** — Display Streak stats to motivate daily learning habits.
- **Advanced Search** — Flexible filters to find exactly what you need in seconds.
- **Email Notifications** — Welcome emails and interaction alerts via Nodemailer.

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
| :--- | :--- |
| **NestJS** | Main framework (Modules, DI, Guards) |
| **TypeORM** | Database management & Migrations |
| **PostgreSQL** | Primary relational database |
| **Passport.js** | Authentication strategies (JWT, Google) |
| **Cloudinary** | Image and avatar storage |
| **Nodemailer** | System email notifications |

### Frontend
| Technology | Purpose |
| :--- | :--- |
| **React 18 + Vite** | UI library & fast build tool |
| **Redux Toolkit** | Global state management |
| **React Router v6** | Client-side routing |
| **Tailwind CSS** | Utility-first UI styling |
| **Zod** | Strict form data validation |
| **TipTap** | Professional rich Markdown editor |

### DevOps & Deployment
| Technology | Purpose |
| :--- | :--- |
| **Docker** | Containerized application packaging |
| **GitHub Actions** | CI/CD pipeline automation |
| **Render/Railway** | Cloud deployment |
| **Nginx** | Reverse proxy and SSL configuration |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/devlog.git
cd devlog
```

### 2. Setup Backend

Open a new terminal and run:
```bash
cd backend
npm install
cp .env.example .env
# Fill in the required environment variables in .env
npm run start:dev
```

### 3. Setup Frontend

Open another terminal and run:
```bash
cd frontend
npm install
npm run dev
```

### 4. Run with Docker (Optional)

If you have Docker installed, simply run the following at the project root:
```bash
docker-compose up --build
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ for the developer community.*
