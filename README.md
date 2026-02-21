# Prasanth Software Solutions - Management Portal

A full-stack, role-based software company management portal built to streamline operations between Admins, Employees, and Clients.

---

## 🚀 Live Links
- **Frontend (Live):** `[INSERT_FRONTEND_URL_HERE]`
- **Backend (API):** `[INSERT_BACKEND_URL_HERE]`

---

## 📸 Screenshots
*(Insert screenshots of the platform here before submission)*
- **Admin Dashboard:** `![Admin Dashboard](link)`
- **Client Project View (with Payment Modal):** `![Client Project](link)`
- **Employee Portal:** `![Employee Portal](link)`
- **Messaging System:** `![Messaging](link)`

---

## 🛠 Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS (for modern, responsive styling)
- Axios (API requests)
- React Router DOM (Routing)
- Lucide React (Icons)
- React Hot Toast (Notifications)

**Backend:**
- Node.js & Express.js (Microservices Architecture)
- MongoDB & Mongoose (NoSQL Database)
- JSON Web Tokens (JWT) & bcrypt.js (Authentication & Security)
- Multer (File Uploads)
- CORS & body-parser

---

## 🔐 Test Login Credentials

You can use the following seeded accounts to test the application's role-based access control.

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@prasanth.dev` | `Admin@123` |
| **Employee** | `employee@prasanth.dev` | `Emp@123` |
| **Client** | `client@prasanth.dev` | `Client@123` |

*(Note: Additional Employee and Client accounts can be created manually via the Admin portal and Client registration respectively).*

---

## ⚙️ Local Setup & Configuration

Follow these instructions to run the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster free M0)
- Git

### 1. Database Setup (MongoDB Atlas)
This project uses MongoDB. You can either install MongoDB locally or use a free cloud cluster via MongoDB Atlas.
1. Create a free M0 cluster on [MongoDB Atlas](https://cloud.mongodb.com).
2. Create your connection string (e.g., `mongodb+srv://...`).

### 2. Backend Initialization
The backend has been refactored into a single **Modular Monolith** for simplicity and performance.

1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in the `backend/` folder:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   ```

3. Seed initial users (optional):
   ```bash
   npm run seed
   ```

4. Start the server:
   ```bash
   npm start
   ```
   *(The server will run on port 5000)*

### 3. Frontend Initialization
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   npm install
   ```

2. Configure Environment Variables:
   Create a `.env` file in the `frontend/` directory pointing to your local Gateway:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## ✨ Key Features Achieved (PRD Checklist)
- **Role-Based Authentication:** Distinct views and capabilities for Admins, Employees, and Clients using secure JWT guards.
- **Service Request Flow:** Clients request services -> Admin approves -> Auto-generates a linked Project.
- **Project Lifecycle Management:** Admins assign Employees -> Employees update progress statuses -> Admin/Client handles billing.
- **Messaging System:** Full inbox functionality allowing secure Admin↔Employee, Admin↔Client, and Client↔Employee communication streams.
- **File Uploads (Bonus):** Attach PDFs, images, and documents to projects safely via Multer.
- **Payment Management (Bonus):** Realistic Dummy Razorpay checkout flow with full UI modal simulation and backend financial ledger updating tracking balances and history.

---
*Developed from scratch by Prasanth.*
