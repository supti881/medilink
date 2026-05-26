# MediLink - Connected Healthcare Platform

MediLink is a full-stack healthcare web application built for a final year project. The system connects patients, doctors, and administrators through one digital healthcare platform.

Patients can register, verify their account, search doctors, manage appointments, view prescriptions, make mock payments, submit support tickets, and request duplicate or corrected prescription copies. Doctors can manage assigned appointments and create digital prescriptions. Admins can monitor doctors, support tickets, and prescription replacement requests.

---

## Project Status

**Current Status:** Almost submission-ready  
**Frontend Build:** Passed  
**Backend Health Check:** Passed  
**Database Connection:** MongoDB Atlas connected  
**GitHub:** Updated

---

## Main Features

### Patient Features

- Patient registration and login
- OTP verification after registration
- Doctor search and department filtering
- Patient dashboard with live backend data
- Appointment overview
- Prescription overview
- Prescription verification token view
- Mock payment flow
- Support ticket creation and tracking
- Prescription duplicate/reissue request

### Doctor Features

- Doctor login
- Doctor dashboard with assigned appointments
- Appointment status update
- Digital prescription creation
- Medicine, test, advice, and follow-up date entry
- Video consultation meeting link support

### Admin Features

- Admin login
- Admin dashboard
- Doctor directory overview
- Support ticket review
- Support ticket status update
- Prescription replacement request approval/rejection
- Admin note management

### System Features

- Role-based authentication
- JWT token authentication
- MongoDB Atlas database
- REST API backend
- Frontend and backend separated structure
- Clean responsive UI
- Production build support

---

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Lucide React
- CSS / utility-based styling

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token
- bcryptjs
- cookie-parser
- cors
- dotenv
- nodemon

### Database

- MongoDB Atlas

### Version Control

- Git
- GitHub

---

## Project Structure

```text
medilink/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── seed/
│   │   ├── utils/
│   │   └── server.js
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md