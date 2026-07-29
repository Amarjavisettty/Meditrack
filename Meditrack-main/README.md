# 🏥 MediTrack - Healthcare Management System

[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0%2B-green.svg)](https://mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, modern healthcare management system built with the MERN stack (MongoDB, Express.js, React, Node.js). MediTrack facilitates seamless communication between patients and healthcare providers through intelligent appointment management, digital prescription handling, and comprehensive feedback systems.

## ✨ Features

### 👨‍⚕️ For Healthcare Providers (Doctors)

- **Professional Registration** with license verification and profile management
- **Smart Appointment Management** with real-time scheduling and status updates
- **Digital Prescription System** with medicine database integration
- **Patient Records Access** with comprehensive medical history
- **Analytics Dashboard** with appointment statistics and performance metrics
- **Feedback Management** to track patient satisfaction and improve services
- **Secure Authentication** with role-based access control

### 👤 For Patients

- **Easy Registration & Profile Management** with personal health information
- **Doctor Discovery** with advanced search and filtering capabilities
- **Seamless Appointment Booking** with real-time availability checking
- **Appointment Tracking** with status updates and notifications
- **Digital Prescription Access** with medication reminders
- **Feedback System** to rate and review healthcare providers
- **Personal Dashboard** with health metrics and appointment history

### 🔒 System Features

- **JWT-based Authentication** with secure token management
- **Role-based Access Control** (Patient/Doctor/Admin)
- **Real-time Notifications** and status updates
- **Responsive Design** optimized for all devices
- **RESTful API Architecture** with comprehensive error handling
- **Data Validation** and sanitization at all levels
- **Security Best Practices** including rate limiting and CORS protection

## 🛠️ Technology Stack

### Backend

| Technology     | Version | Purpose                        |
| -------------- | ------- | ------------------------------ |
| **Node.js**    | 16+     | JavaScript runtime environment |
| **Express.js** | ^4.18.2 | Web application framework      |
| **MongoDB**    | 7.0+    | NoSQL database                 |
| **Mongoose**   | ^7.5.0  | MongoDB object modeling        |
| **JWT**        | ^9.0.2  | Authentication & authorization |
| **bcryptjs**   | ^2.4.3  | Password hashing               |
| **Joi**        | ^17.9.2 | Data validation                |
| **Helmet**     | ^7.0.0  | Security middleware            |
| **CORS**       | ^2.8.5  | Cross-origin resource sharing  |

### Frontend

| Technology       | Version  | Purpose                     |
| ---------------- | -------- | --------------------------- |
| **React**        | ^19.1.1  | UI library                  |
| **Vite**         | ^7.1.2   | Build tool and dev server   |
| **Tailwind CSS** | ^3.4.17  | Utility-first CSS framework |
| **React Router** | ^7.8.2   | Client-side routing         |
| **Lucide React** | ^0.542.0 | Beautiful icon library      |
| **ESLint**       | ^9.33.0  | Code linting                |

## 📁 Project Structure

```
MediTrack/
├── 📁 backend/                    # Node.js Express API
│   ├── 📁 src/
│   │   ├── 📄 app.js              # Express application setup
│   │   ├── 📄 server.js           # Server entry point
│   │   ├── 📁 config/             # Database configuration
│   │   ├── 📁 controllers/        # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── prescriptionController.js
│   │   │   └── ...
│   │   ├── 📁 models/             # Database schemas
│   │   │   ├── User.js
│   │   │   ├── Doctor.js
│   │   │   ├── Patient.js
│   │   │   ├── Appointment.js
│   │   │   └── ...
│   │   ├── 📁 routes/             # API endpoints
│   │   ├── 📁 middleware/         # Custom middleware
│   │   └── 📁 utils/              # Helper functions
│   ├── 📄 package.json
│   └── 📄 .env.example
├── 📁 Frontend/                   # React Application
│   ├── 📁 src/
│   │   ├── 📄 App.jsx             # Main application component
│   │   ├── 📄 main.jsx            # Application entry point
│   │   ├── 📁 components/         # Reusable components
│   │   │   ├── 📁 common/         # Shared components
│   │   │   ├── 📁 doctor/         # Doctor-specific components
│   │   │   └── 📁 Home/           # Landing page components
│   │   ├── 📁 pages/              # Page components
│   │   │   ├── 📁 Auth/           # Authentication pages
│   │   │   ├── 📁 Dashboard/      # Dashboard pages
│   │   │   └── 📁 Appointments/   # Appointment pages
│   │   ├── 📁 contexts/           # React contexts
│   │   ├── 📁 services/           # API service functions
│   │   └── 📁 assets/             # Static assets
│   ├── 📄 package.json
│   ├── 📄 tailwind.config.js
│   └── 📄 vite.config.js
├── 📄 README.md
└── 📄 .gitignore
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v7.0 or higher) - [Installation guide](https://docs.mongodb.com/manual/installation/)
- **Git** - [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/sreepuli/Meditrack.git
   cd Meditrack
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install

   # Create environment file
   cp .env.example .env

   # Edit .env with your configuration
   nano .env
   ```

3. **Frontend Setup**

   ```bash
   cd ../Frontend
   npm install
   ```

4. **Environment Configuration**

   Update `backend/.env` with your settings:

   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/meditrack
   # For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/meditrack

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # CORS Configuration (Frontend URL)
   CORS_ORIGIN=http://localhost:5173
   ```

5. **Start the Application**

   ```bash
   # Terminal 1: Start Backend
   cd backend && npm run dev

   # Terminal 2: Start Frontend
   cd Frontend && npm run dev
   ```

6. **Access the Application**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)

## 📋 Available Scripts

### Backend Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run test suite
npm run test:watch # Run tests in watch mode
```

### Frontend Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Appointments

- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Prescriptions

- `GET /api/prescriptions` - Get user prescriptions
- `POST /api/prescriptions` - Create prescription (doctors only)
- `PUT /api/prescriptions/:id` - Update prescription
- `GET /api/prescriptions/:id` - Get prescription details

### Feedback

- `GET /api/feedback` - Get feedback list
- `POST /api/feedback` - Submit feedback
- `PUT /api/feedback/:id` - Update feedback
- `DELETE /api/feedback/:id` - Delete feedback

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests (if configured)
cd Frontend && npm test
```

## 🚀 Deployment

### Backend Deployment

1. Set up MongoDB Atlas or your preferred database
2. Configure environment variables for production
3. Deploy to Heroku, Railway, or your preferred platform

### Frontend Deployment

1. Build the production version: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred hosting service
3. Update CORS settings in backend for production URL

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and ensure they follow our coding standards
4. **Test your changes**: Run all tests and ensure they pass
5. **Commit your changes**: `git commit -m "Add some feature"`
6. **Push to the branch**: `git push origin feature/your-feature-name`
7. **Open a Pull Request**

### Development Guidelines

- Follow the existing code style and conventions
- Write clear, concise commit messages
- Include tests for new features
- Update documentation for any API changes
- Ensure all tests pass before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports & Feature Requests

Found a bug or have a feature request? Please open an issue on our [GitHub Issues](https://github.com/sreepuli/Meditrack/issues) page.

## 📧 Contact & Support

- **GitHub**: [@sreepuli](https://github.com/sreepuli)
- **Repository**: [MediTrack](https://github.com/sreepuli/Meditrack)

## 🙏 Acknowledgments

- Thanks to all contributors who helped make this project better
- Built with ❤️ using the MERN stack
- Icons provided by [Lucide React](https://lucide.dev/)
- Styling powered by [Tailwind CSS](https://tailwindcss.com/)

---

⭐ **If you find this project helpful, please consider giving it a star!** ⭐
