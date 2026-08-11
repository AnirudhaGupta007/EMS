# 🧑‍💼 Employee Management System

A clean and practical **MERN Stack** application for managing employees, leaves, salaries, and roles — built with React, Node.js, Express, MongoDB, and TailwindCSS.

---

## ✨ Features

- **Admin Dashboard** – Manage employees, departments, and overall system
- **Leave Management** – Employees can request leave, admins can approve/reject
- **Salary Management** – Track and manage employee salaries
- **Role-based Access** – Separate experiences for Admin and Employee
- **Secure Authentication** – Login with JWT
- **Modern UI** – Clean interface built with React + TailwindCSS
- **RESTful API** – Well-structured backend with Express & MongoDB

---

## 🛠️ Tech Stack

| Layer       | Technologies                          |
|-------------|---------------------------------------|
| Frontend    | React, React Router, Axios, TailwindCSS |
| Backend     | Node.js, Express.js                   |
| Database    | MongoDB + Mongoose                    |
| Auth        | JWT (JSON Web Token)                  |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/ahmedmaajid/Employee-Management-System.git
cd Employee-Management-System
```

### 2. Setup Backend

```bash
cd employee-management-backend
npm install
```

Create a `.env` file inside the `employee-management-backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

### 3. Create the first Admin account

```bash
npm run seed-admin
```

This creates the default admin account:

- **Email:** `admin@gmail.com`
- **Password:** `admin123`

### 4. Start the Backend

```bash
npm start
```

Backend will run on: `http://localhost:5000`

### 5. Setup Frontend

Open a **new terminal** and run:

```bash
cd employee-management-frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## 📂 Project Structure

```
Employee-Management-System/
├── employee-management-backend/     # Express + MongoDB API
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── ...
├── employee-management-frontend/    # React + TailwindCSS
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── ...
└── README.md
```

---

## 🔑 Default Admin Login

After running `npm run seed-admin`:

| Field    | Value             |
|----------|-------------------|
| Email    | admin@gmail.com   |
| Password | admin123          |

---

## 🤝 Contributing

Feel free to open issues or submit pull requests.  
For bigger changes, it’s better to discuss first via an issue.

---

## ⭐ Support

If you found this project useful, please consider giving it a star. It really helps!

---

Made with ❤️ using the MERN stack
