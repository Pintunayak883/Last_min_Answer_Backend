# Exam Education Platform - Backend (Phase 1)

Production-ready backend for an exam-focused education website built with Node.js, Express, PostgreSQL, Prisma, and Redis.

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Cache:** Redis
- **File Upload:** Multer (Local Storage)
- **Email:** Nodemailer
- **Authentication:** JWT + bcrypt
- **Architecture:** MVC + Service Layer (Class-based Controllers)

## 📁 Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   │   ├── config.js
│   │   ├── database.js
│   │   └── redis.js
│   ├── controllers/     # Class-based controllers
│   │   ├── admin.controller.js
│   │   ├── university.controller.js
│   │   ├── course.controller.js
│   │   ├── subject.controller.js
│   │   ├── syllabus.controller.js
│   │   ├── question-paper.controller.js
│   │   └── notes.controller.js
│   ├── services/        # Business logic
│   │   ├── auth.service.js
│   │   ├── mail.service.js
│   │   └── cache.service.js
│   ├── middlewares/     # Express middlewares
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/          # API routes
│   │   ├── index.js
│   │   ├── admin.routes.js
│   │   ├── university.routes.js
│   │   ├── course.routes.js
│   │   ├── subject.routes.js
│   │   ├── syllabus.routes.js
│   │   ├── question-paper.routes.js
│   │   └── notes.routes.js
│   ├── utils/           # Helper utilities
│   │   ├── file.util.js
│   │   ├── otp.util.js
│   │   └── response.util.js
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── uploads/             # File uploads (auto-created)
│   ├── syllabus/
│   ├── notes/
│   └── question-papers/
├── .env.example
├── .gitignore
└── package.json
```

## 🛠️ Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)

### 2. Installation

```bash
# Install dependencies
npm install

# Copy environment file
copy .env.example .env
```

### 3. Environment Configuration

Edit `.env` file with your configuration:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/exam_education_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key
REDIS_HOST=localhost
MAIL_USER=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Optional: Open Prisma Studio
npm run prisma:studio
```

### 5. Run the Application

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Admin Authentication

| Method | Endpoint                           | Description                 | Auth Required |
| ------ | ---------------------------------- | --------------------------- | ------------- |
| POST   | `/api/admin/login`                 | Admin login                 | ❌            |
| POST   | `/api/admin/forgot-password`       | Request password reset OTP  | ❌            |
| POST   | `/api/admin/verify-otp`            | Verify OTP                  | ❌            |
| POST   | `/api/admin/reset-password`        | Reset password              | ❌            |
| POST   | `/api/admin/send-verification-otp` | Send email verification OTP | ❌            |
| GET    | `/api/admin/profile`               | Get admin profile           | ✅            |

### Universities

| Method | Endpoint                | Description          | Auth Required |
| ------ | ----------------------- | -------------------- | ------------- |
| GET    | `/api/universities`     | Get all universities | ❌            |
| GET    | `/api/universities/:id` | Get university by ID | ❌            |
| POST   | `/api/universities`     | Create university    | ✅            |
| PUT    | `/api/universities/:id` | Update university    | ✅            |
| DELETE | `/api/universities/:id` | Delete university    | ✅            |

### Courses

| Method | Endpoint                        | Description               | Auth Required |
| ------ | ------------------------------- | ------------------------- | ------------- |
| GET    | `/api/courses`                  | Get all courses           | ❌            |
| GET    | `/api/courses?universityId=xxx` | Get courses by university | ❌            |
| GET    | `/api/courses/:id`              | Get course by ID          | ❌            |
| POST   | `/api/courses`                  | Create course             | ✅            |
| PUT    | `/api/courses/:id`              | Update course             | ✅            |
| DELETE | `/api/courses/:id`              | Delete course             | ✅            |

### Subjects

| Method | Endpoint                     | Description            | Auth Required |
| ------ | ---------------------------- | ---------------------- | ------------- |
| GET    | `/api/subjects`              | Get all subjects       | ❌            |
| GET    | `/api/subjects?courseId=xxx` | Get subjects by course | ❌            |
| GET    | `/api/subjects/:id`          | Get subject by ID      | ❌            |
| POST   | `/api/subjects`              | Create subject         | ✅            |
| PUT    | `/api/subjects/:id`          | Update subject         | ✅            |
| DELETE | `/api/subjects/:id`          | Delete subject         | ✅            |

### Syllabus

| Method | Endpoint                           | Description             | Auth Required |
| ------ | ---------------------------------- | ----------------------- | ------------- |
| GET    | `/api/syllabus/subject/:subjectId` | Get syllabus by subject | ❌            |
| POST   | `/api/syllabus`                    | Upload syllabus (PDF)   | ✅            |
| DELETE | `/api/syllabus/:id`                | Delete syllabus         | ✅            |

### Question Papers

| Method | Endpoint                                  | Description                    | Auth Required |
| ------ | ----------------------------------------- | ------------------------------ | ------------- |
| GET    | `/api/question-papers/subject/:subjectId` | Get question papers by subject | ❌            |
| GET    | `/api/question-papers/:id`                | Get question paper by ID       | ❌            |
| POST   | `/api/question-papers`                    | Upload question paper (PDF)    | ✅            |
| PUT    | `/api/question-papers/:id`                | Update question paper          | ✅            |
| DELETE | `/api/question-papers/:id`                | Delete question paper          | ✅            |

### Notes

| Method | Endpoint                        | Description          | Auth Required |
| ------ | ------------------------------- | -------------------- | ------------- |
| GET    | `/api/notes/subject/:subjectId` | Get notes by subject | ❌            |
| GET    | `/api/notes/:id`                | Get notes by ID      | ❌            |
| POST   | `/api/notes`                    | Upload notes (PDF)   | ✅            |
| PUT    | `/api/notes/:id`                | Update notes         | ✅            |
| DELETE | `/api/notes/:id`                | Delete notes         | ✅            |

## 🔐 Authentication

Protected routes require JWT token in Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📦 File Upload

File uploads use `multipart/form-data`:

```javascript
// Example: Upload Syllabus
FormData {
  file: <PDF file>,
  subjectId: "uuid",
  year: "2024"
}
```

**Constraints:**

- Only PDF files allowed
- Max file size: 10MB
- Files automatically organized by type

## 🗄️ Database Schema

### Core Entities

- **Admin** - Admin authentication
- **OTP** - OTP storage for verification
- **University** - Universities
- **Course** - Courses (belongs to University)
- **Subject** - Subjects (belongs to Course)
- **Syllabus** - Syllabus files (one per Subject)
- **QuestionPaper** - Question papers (multiple per Subject)
- **Notes** - Notes (multiple per Subject)

## ⚡ Redis Caching

Frequently accessed GET APIs are cached with automatic invalidation on data changes:

- Universities list
- Courses list
- Subjects list
- Content (syllabus, question papers, notes)

## 🔧 Available Scripts

```bash
npm start              # Start production server
npm run dev            # Start development server with nodemon
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate # Run database migrations
npm run prisma:studio  # Open Prisma Studio
npm run prisma:push    # Push schema to database
```

## 🌟 Features

✅ JWT-based admin authentication  
✅ OTP-based password reset & email verification  
✅ Redis caching for performance  
✅ Automatic file organization  
✅ Safe file deletion on update/delete  
✅ Class-based controllers  
✅ Service layer architecture  
✅ Centralized error handling  
✅ Clean response format  
✅ CORS enabled  
✅ Environment-based configuration

## 📝 Phase 1 Scope

- ✅ Admin authentication only
- ✅ Local file storage (Multer)
- ✅ Redis caching
- ✅ Email service (Nodemailer)
- ❌ No AI features
- ❌ No cloud storage
- ❌ No student login

## 🚧 Future Phases

- Phase 2: Student authentication & enrollment
- Phase 3: AI-powered features
- Phase 4: Cloud storage integration
- Phase 5: Advanced analytics

## 📄 License

ISC

---

**Built with ❤️ for efficient exam preparation**
