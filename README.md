# MediLink - Telemedicine Healthcare System

## 1. Project Overview

**Project Name:** MediLink  
**Project Type:** Final Year Project  
**Category:** Telemedicine / Healthcare Management System

MediLink is a web-based telemedicine healthcare platform that connects patients, doctors, and administrators through one secure online system.

The system allows patients to register, verify their account, search doctors, book consultation slots, upload medical documents, track appointment status, receive digital prescriptions, verify prescriptions, submit support tickets, make mock payments, and request prescription replacement or reissue.

Doctors can manage appointments, review patient records, provide consultation, and generate digital prescriptions.

Admins can manage users, review patient applications, approve or reject requests, request corrections, monitor payments, manage appointment capacity, and track system activity through audit logs.

---

## 2. Project Goal

The main goal of MediLink is to build a modern, responsive, and secure telemedicine platform that makes healthcare consultation easier and more accessible.

The project is designed for academic demonstration and can be extended into a larger real-world healthcare system in the future.

---

## 3. Core Objectives

- Provide an online consultation platform for patients and doctors
- Reduce the need for physical hospital visits for basic consultation
- Allow patients to search doctors by specialization
- Support appointment booking and consultation tracking
- Provide digital prescription generation and verification
- Create separate portals for Patient, Doctor, and Admin
- Demonstrate a secure and organized healthcare workflow
- Build an attractive, responsive, and professional user interface

---

## 4. Core Product Vision

MediLink is designed to be:

- A functional academic prototype
- A complete frontend-focused healthcare system demo
- A bridge between patients and doctors
- A scalable base for future backend and database integration
- A professional final year project with modern UI/UX
---

## 5. Technology Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Lucide React Icons

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- BcryptJS
- Cookie Parser
- Nodemailer
- Multer
- Cloudinary

### Tools

- VS Code
- Git
- GitHub
- npm
- MongoDB Atlas
- Vercel / Render for deployment

---

## 6. Primary User Roles

### 6.1 Patient

Patients can:

- Register an account
- Login to the system
- Verify account using OTP
- Browse doctor profiles
- Filter doctors by specialization
- Select appointment slots
- Upload medical documents
- Track consultation status
- View digital prescription
- Verify prescription token
- Submit support tickets
- Complete mock payment
- Request prescription replacement or reissue

---

### 6.2 Doctor

Doctors can:

- Access doctor dashboard
- View appointment queue
- Review patient record summary
- Start consultation session
- Write diagnosis
- Add medicine details
- Add doctor advice
- Generate digital prescription
- View prescription token
- Download prescription PDF interface

---

### 6.3 Admin

Admins can:

- Access admin dashboard
- Review patient applications
- Approve applications
- Reject applications
- Request corrections
- Monitor payment status
- Manage appointment slot capacity
- View print queue
- Monitor audit logs
- Track system activity
---

## 7. Completed Frontend Pages

The following frontend pages have been completed:

- Home page
- Login page
- Registration page
- OTP verification page
- Doctors directory page
- Patient dashboard
- Doctor dashboard
- Admin dashboard
- Prescription verification page
- Support ticket page
- Mock payment page
- Replacement / reissue request page

---

## 8. Phase-wise Delivery Plan

### Phase 1 — Project Foundation

**Goal:** Create the base project structure.

Completed:

- Created main project folder
- Initialized Git repository
- Connected project with GitHub
- Created React frontend using Vite
- Created Express backend
- Added basic backend health check route
- Added frontend and backend folder structure

---

### Phase 2 — Frontend UI Development

**Goal:** Build attractive and responsive frontend pages.

Completed:

- MediLink logo
- Responsive navbar
- Footer
- Landing page
- Module showcase section
- Doctors page with search and filter
- Patient dashboard UI
- Doctor dashboard UI
- Admin dashboard UI
- Authentication pages
- OTP verification page
- Prescription verification UI
- Support ticket UI
- Mock payment UI
- Replacement request UI

---

### Phase 3 — Backend API Development

**Goal:** Build real backend logic.

Planned:

- MongoDB Atlas connection
- User registration API
- Login API
- JWT authentication
- OTP email verification
- Role-based access control
- Patient profile API
- Doctor profile API
- Appointment booking API
- Prescription API
- Support ticket API
- Payment record API
- Replacement request API
- Audit log API

---

### Phase 4 — Database Integration

**Goal:** Store and manage real project data.

Planned database collections:

- Users
- Doctors
- Appointments
- Prescriptions
- Support Tickets
- Payments
- Replacement Requests
- Audit Logs

---

### Phase 5 — Testing and Deployment

**Goal:** Final testing and live deployment.

Planned:

- Test all frontend routes
- Test backend API endpoints
- Fix UI responsiveness issues
- Connect frontend with backend APIs
- Deploy frontend to Vercel
- Deploy backend to Render
- Final GitHub cleanup
- Final documentation update
---

## 9. Core Data Models

### User Model

```json
{
  "name": "string",
  "email": "string",
  "passwordHash": "string",
  "role": "patient | doctor | admin",
  "isVerified": "boolean",
  "createdAt": "date"
}
```

---

### Doctor Profile Model

```json
{
  "userId": "ref User",
  "specialization": "string",
  "experience": "number",
  "fees": "number",
  "availableSlots": ["string"],
  "status": "active | inactive"
}
```

---

### Appointment Model

```json
{
  "patientId": "ref User",
  "doctorId": "ref User",
  "date": "date",
  "time": "string",
  "status": "pending | approved | completed | cancelled",
  "paymentStatus": "pending | paid | failed | waived",
  "createdAt": "date"
}
```

---

### Prescription Model

```json
{
  "appointmentId": "ref Appointment",
  "patientId": "ref User",
  "doctorId": "ref User",
  "diagnosis": "string",
  "medicines": [
    {
      "name": "string",
      "dosage": "string",
      "schedule": "string",
      "duration": "string"
    }
  ],
  "advice": "string",
  "verificationToken": "string",
  "createdAt": "date"
}
```

---

### Support Ticket Model

```json
{
  "userId": "ref User",
  "subject": "string",
  "message": "string",
  "priority": "low | medium | high",
  "status": "open | answered | closed",
  "createdAt": "date"
}
```

---

### Replacement Request Model

```json
{
  "patientId": "ref User",
  "prescriptionToken": "string",
  "requestType": "lost | damaged | correction | duplicate",
  "reason": "string",
  "status": "submitted | under_review | approved | rejected",
  "paymentStatus": "pending | paid | waived",
  "createdAt": "date"
}
```
---

## 10. Functional Requirements

The system shall allow:

- Patients to register and login
- Patients to verify accounts using OTP
- Patients to browse doctors
- Patients to filter doctors by specialization
- Patients to book appointment slots
- Patients to upload medical documents
- Doctors to view appointment queues
- Doctors to write prescriptions
- Admins to review patient applications
- Admins to approve, reject, or request correction
- Users to verify prescription tokens
- Patients to submit support tickets
- Patients to complete mock payment
- Patients to request prescription replacement or reissue

---

## 11. Non-Functional Requirements

### Security

- User passwords should be encrypted
- JWT should be used for protected routes
- Sensitive patient data should not be exposed publicly
- Prescription verification should show limited public data only

### Performance

- The system should load quickly
- UI should remain responsive
- API requests should respond within a reasonable time

### Usability

- Interface should be clean and easy to understand
- Navigation should be simple
- Each role should have a separate dashboard
- Forms should be user-friendly

### Availability

- The application should be deployable online
- Frontend and backend should run independently
- System should support future scaling

---

## 12. Risks and Challenges

- Implementing secure authentication correctly
- Managing role-based access for Patient, Doctor, and Admin
- Designing correct database relationships
- Handling appointment states properly
- Protecting medical data privacy
- Connecting frontend and backend without breaking UI
- Managing file upload and prescription PDF generation

---

## 13. Current Development Status

### Completed

- React frontend setup
- Tailwind CSS setup
- Responsive UI design
- Logo and branding
- Navbar and footer
- All major frontend pages
- Basic backend server
- Backend health check route
- GitHub repository setup

### Next Work

- MongoDB Atlas setup
- Backend database connection
- Authentication API
- OTP email verification
- Appointment API
- Prescription API
- File upload API
- PDF generation
- Deployment
---

## 14. Project Folder Structure

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
│   │   ├── utils/
│   │   └── server.js
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── frontend/
│   ├── public/
│   │   └── icons.svg
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Footer.jsx
│   │   │   ├── Logo.jsx
│   │   │   └── Navbar.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── DoctorDashboard.jsx
│   │   │   ├── Doctors.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── MockPayment.jsx
│   │   │   ├── OtpVerification.jsx
│   │   │   ├── PatientDashboard.jsx
│   │   │   ├── PrescriptionVerify.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ReplacementRequest.jsx
│   │   │   └── SupportTicket.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── eslint.config.js
│
├── .gitignore
└── README.md
```
---

## 15. How to Run the Project Locally

### Clone Repository

```bash
git clone https://github.com/supti881/medilink.git
```

### Open Project Folder

```bash
cd medilink
```

---

## 16. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## 17. Run Backend

Open another terminal.

```bash
cd backend
npm install
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

Health check URL:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "MediLink server health check passed"
}
```
---

## 18. Main Frontend Routes

```text
/
├── /login
├── /register
├── /otp-verification
├── /doctors
├── /patient-dashboard
├── /doctor-dashboard
├── /admin-dashboard
├── /verify-prescription
├── /support-ticket
├── /mock-payment
└── /replacement-request
```

---

## 19. Backend Environment Variables

Create a `.env` file inside the `backend` folder.

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

Later, these variables will be added:

```env
MONGO_URI=
JWT_SECRET=
EMAIL_USER=
EMAIL_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## 20. Demo Data

### Demo Prescription Token

```text
RX-ML-2026-0924
```

### Demo Doctor

```text
Dr. Ayesha Rahman
Specialization: Cardiology
```

### Demo Patient

```text
Mst. Sharmin Akter
```

---

## 21. Academic Value

MediLink demonstrates a complete telemedicine workflow:

1. Patient creates account
2. Patient verifies OTP
3. Patient searches doctors
4. Patient books appointment
5. Patient uploads medical records
6. Admin reviews application
7. Doctor reviews patient record
8. Doctor creates prescription
9. Patient verifies prescription
10. Payment, support, and replacement workflows are handled through dedicated modules

---

## 22. Immediate Execution Plan

Next development steps:

1. Connect MongoDB Atlas
2. Create User model
3. Create authentication routes
4. Build registration API
5. Build login API
6. Add JWT authentication
7. Add OTP email verification
8. Connect frontend forms with backend APIs
9. Build appointment booking API
10. Build prescription generation API

---

## 23. Developer

**Name:** Mst. Sharmin Akter  
**Project:** MediLink - Telemedicine Healthcare System  
**Type:** Final Year Project  
**Repository:** supti881/medilink