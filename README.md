# SS2-SmartLMS - Smart Learning Management System

A comprehensive Learning Management System built with modern technologies including NestJS backend, React frontend, and MySQL database. The system supports students, instructors, and administrators with features for course management, assessments, virtual classrooms, and more.

## 🏗️ Architecture

- **Backend**: NestJS (TypeScript) - Migrated from Express.js
- **Frontend**: React.js
- **Database**: MySQL with TypeORM
- **Authentication**: JWT + Google OAuth2.0
- **API Documentation**: Swagger/OpenAPI

## 🔧 System Requirements

- **Node.js**: v18 or higher (recommended)
- **MySQL**: v8.0 or higher
- **npm** or **yarn**: Latest version
- **TypeScript**: v4.0+ (automatically installed)

## 📦 Installation Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/SS2-SmartLMS.git
cd SS2-SmartLMS
```

### 2. Set Up NestJS Backend

```bash
cd nestjs-backend
npm install
```

### 3. Configure Backend Environment Variables

Create a `.env` file in the `nestjs-backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=lms_db

# JWT Configuration
JWT_SECRET=your_very_long_and_secure_jwt_secret_key_replace_this_in_production

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="LMS Admin <no-reply@lms.com>"

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Google OAuth (optional - configure if using Google login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Set Up Database

The application will automatically create database tables using TypeORM migrations. Ensure your MySQL server is running and the database exists:

```sql
CREATE DATABASE lms_db;
```

### 5. Configure Google OAuth (Optional)

Place your `key.json` file in the project root with your Google OAuth credentials:

```json
{
  "oauth_credentials": {
    "web": {
      "client_id": "your_google_client_id",
      "client_secret": "your_google_client_secret",
      "redirect_uris": ["http://localhost:3000/auth/callback"]
    }
  }
}
```

### 6. Set Up Frontend

```bash
cd ../frontend
npm install
```

### 7. Start the NestJS Backend Server

```bash
cd ../nestjs-backend
npm run start:dev
```

The backend will start at http://localhost:5000 with:
- API endpoints at `http://localhost:5000/api/`
- Swagger documentation at `http://localhost:5000/api/docs`

### 8. Start the Frontend Server

In a new terminal:

```bash
cd frontend
npm start
```

The application will open automatically at http://localhost:3000

## 👥 Default Login Credentials

After setting up the database, you can use these default credentials:

### Admin
- **Email**: admin@lms.com
- **Password**: admin123

### Instructor  
- **Email**: instructor@lms.com
- **Password**: instructor123

### Student
- **Email**: student@lms.com  
- **Password**: 123456789

> **Note**: Students are required to change their password upon first login for security.

## ✨ Key Features

### 🔐 Authentication & Authorization
- Email/password authentication
- Google OAuth2.0 integration
- JWT-based session management
- Role-based access control (Student, Instructor, Admin)
- Password reset functionality

### 📚 Course Management
- Create and manage courses
- Lesson planning and materials
- Course modules and structure
- Student enrollment system
- Progress tracking

### 📝 Assessment System
- **Quiz Creation**: Multiple choice, true/false questions
- **Assignment Management**: File uploads and submissions
- **Grading System**: Automated and manual grading
- **Progress Analytics**: Student performance tracking

### 🎓 Virtual Classroom
- Live session scheduling
- Video conferencing integration
- Session recording capabilities
- Interactive whiteboard features

### 💬 Communication
- Discussion forums
- Direct messaging
- Announcement system
- Email notifications

### 📊 Analytics & Reporting
- Student progress reports
- Course completion statistics
- Performance analytics
- Export capabilities

## 🚀 API Documentation

The NestJS backend automatically generates Swagger documentation available at:
```
http://localhost:5000/api/docs
```

### Key API Endpoints

```
🔐 Authentication:
POST /api/auth/login           # Login with email/password
POST /api/auth/google          # Google OAuth login
GET  /api/auth/google          # Google OAuth redirect
POST /api/auth/logout          # Logout

👥 Users (Admin Only):
GET    /api/users              # List all users (admin only)
GET    /api/users/me           # Get current user profile
PUT    /api/users/:id          # Update user (admin only)
DELETE /api/users/:id          # Delete user (admin only)
POST   /api/users/admin-register # Create new user (admin only)

📚 Courses:
GET    /api/courses            # List courses
POST   /api/courses            # Create course (instructor/admin)
GET    /api/courses/:id        # Get course details
PUT    /api/courses/:id        # Update course (instructor/admin)
DELETE /api/courses/:id        # Delete course (admin only)

📝 Assessments:
GET    /api/quizzes            # List quizzes
POST   /api/quizzes            # Create quiz (instructor/admin)
GET    /api/quizzes/:id        # Get quiz details
PUT    /api/quizzes/:id        # Update quiz (instructor/admin)

GET    /api/assignments        # List assignments
POST   /api/assignments        # Create assignment (instructor/admin)
GET    /api/assignments/:id    # Get assignment details

🎓 Virtual Classroom:
GET    /api/virtual-sessions   # List virtual sessions
POST   /api/virtual-sessions   # Create session (instructor/admin)
GET    /api/virtual-sessions/:id # Get session details
```

### 🔒 Authentication & Authorization

| Endpoint | Authentication | Authorization |
|----------|---------------|---------------|
| `/api/status` | ❌ None | ❌ None |
| `/api/auth/login` | ❌ None | ❌ None |
| `/api/users` | ✅ JWT | 👑 Admin only |
| `/api/users/me` | ✅ JWT | 👤 Any user |
| `/api/courses` | ✅ JWT | 👤 Any user |
| `/api/quizzes` | ✅ JWT | 👤 Any user |

## 📁 Project Structure

```
SS2-SmartLMS/
├── nestjs-backend/          # NestJS TypeScript Backend
│   ├── src/
│   │   ├── assessments/     # Quiz & Assignment modules
│   │   ├── auth/           # Authentication & Authorization
│   │   ├── courses/        # Course management
│   │   ├── users/          # User management
│   │   ├── uploads/        # File upload handling
│   │   └── main.ts         # Application entry point
│   ├── uploads/            # Uploaded files storage
│   └── package.json
├── frontend/               # React.js Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   └── context/        # React context providers
│   └── package.json
├── backend/               # Legacy Express.js (deprecated)
└── key.json              # Google OAuth credentials
```

## 🛠️ Development Scripts

### Backend (NestJS)
```bash
npm run start          # Start production server
npm run start:dev      # Start development server with hot reload
npm run start:debug    # Start with debug mode
npm run build          # Build for production
npm run test           # Run unit tests
npm run test:e2e       # Run end-to-end tests
npm run lint           # Run ESLint
```

### Frontend (React)
```bash
npm start              # Start development server
npm run build          # Build for production
npm test               # Run tests
npm run eject          # Eject from Create React App
```

## 🔧 Troubleshooting

### Common Issues

#### Backend Connection Issues
```bash
# Check if NestJS server is running
curl http://localhost:5000/api/status

# View server logs
cd nestjs-backend
npm run start:dev
```

#### Database Connection
```bash
# Test MySQL connection
mysql -u your_username -p -h localhost

# Check if database exists
SHOW DATABASES;
USE lms_db;
SHOW TABLES;
```

#### Google OAuth Issues
1. Ensure `key.json` is in the project root
2. Verify Google client ID matches in both `key.json` and frontend config
3. Check redirect URIs are properly configured in Google Console
4. Restart both servers after configuration changes

#### Frontend API Connection
1. Verify backend is running on port 5000
2. Check CORS configuration in `main.ts`
3. Ensure `FRONTEND_URL` environment variable is set correctly

#### File Upload Issues
1. Check upload directory permissions
2. Verify multer configuration in uploads module
3. Ensure file size limits are appropriate

### Environment Variables Checklist

Ensure these variables are set in your `.env` file:
- ✅ `PORT` (default: 5000)
- ✅ `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- ✅ `JWT_SECRET` (use a strong, random string)
- ✅ `FRONTEND_URL` (for CORS)
- ✅ Email configuration (if using notifications)

## 🚀 Deployment

### Production Build

#### Backend
```bash
cd nestjs-backend
npm run build
npm run start:prod
```

#### Frontend
```bash
cd frontend
npm run build
# Deploy the build folder to your web server
```

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
JWT_SECRET=your_very_secure_production_jwt_secret
FRONTEND_URL=https://your-domain.com
```

## 🆕 Migration from Express.js to NestJS

This project has been migrated from Express.js to NestJS for better:
- **Type Safety**: Full TypeScript support
- **Modularity**: Better code organization with modules
- **Documentation**: Auto-generated Swagger docs
- **Testing**: Built-in testing framework
- **Validation**: Automatic request/response validation
- **Scalability**: Enterprise-ready architecture

### Breaking Changes
- API base URL changed to `/api/`
- Response format standardized
- Enhanced error handling
- Improved validation

## 📄 License

This project is licensed under the terms of the license included in the LICENSE file.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the API documentation at `/api/docs`
3. Open an issue on GitHub
4. Contact the development team

---

**Built with ❤️ using NestJS, React, and TypeScript**

## 📖 Enhanced Swagger API Documentation & Testing

### 🎯 **Complete API Testing Workflow**

The API now includes comprehensive Swagger documentation with proper parameter definitions, authentication requirements, and example requests/responses.

#### **Step 1: Access Swagger UI**
```bash
# Start the NestJS backend first
cd nestjs-backend
npm run start:dev

# Open Swagger UI in browser
http://localhost:5000/api/docs
```

#### **Step 2: Authenticate and Get JWT Token**

1. **Login via Swagger UI:**
   - Go to **Authentication** section
   - Click on **POST /api/auth/login**
   - Click "Try it out"
   - Use these credentials:
   ```json
   {
     "email": "admin@smartlms.com",
     "password": "admin123"
   }
   ```
   - Copy the JWT token from the response

2. **Set Authorization Header:**
   - Click the **🔒 Authorize** button at the top of Swagger UI
   - Enter: `Bearer YOUR_JWT_TOKEN_HERE`
   - Click "Authorize"

#### **Step 3: Test Protected Endpoints**

Now you can test all protected endpoints with proper authentication:

##### **👥 User Management (Admin Only)**
```bash
# Get all users
GET /api/users
# Headers: Authorization: Bearer YOUR_JWT_TOKEN

# Create new user
POST /api/users/admin-register
{
  "email": "newuser@smartlms.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT"
}

# Get user profile
GET /api/users/me
```

##### **📚 Course Management**
```bash
# Get all courses
GET /api/courses
# Query params: ?status=ACTIVE&featured=true

# Create new course (Admin/Instructor)
POST /api/courses
{
  "title": "Advanced JavaScript",
  "code": "JS301",
  "description": "Advanced JavaScript concepts and frameworks",
  "departmentId": 1,
  "status": "draft"
}

# Get course by ID
GET /api/courses/1
```

##### **🎓 Enrollment Management**
```bash
# Enroll in course (Student only)
POST /api/enrollments/enroll
{
  "courseId": 1,
  "enrollmentKey": "optional_key"
}

# Get my enrolled courses
GET /api/enrollments/my-courses

# Leave course
DELETE /api/enrollments/leave/1
```

##### **🏫 Virtual Classroom**
```bash
# Create virtual session
POST /api/virtual-classroom
{
  "title": "Live Lecture",
  "description": "Introduction to React",
  "scheduledStart": "2024-12-01T10:00:00Z",
  "courseId": 1
}

# Get all sessions
GET /api/virtual-classroom

# Join session
POST /api/virtual-classroom/1/register
```

#### **Step 4: Role-Based Testing**

Test different user roles to see authorization in action:

1. **Student Role:**
   - Can enroll/leave courses
   - Can access enrolled course content
   - Cannot create courses or manage users

2. **Instructor Role:**
   - Can create and manage courses
   - Can create virtual sessions
   - Can view enrolled students

3. **Admin Role:**
   - Full access to all endpoints
   - Can manage users, courses, and system settings

### 🔧 **Enhanced Features in Swagger UI**

#### **✅ Comprehensive Parameter Documentation**
- All endpoints now have detailed parameter descriptions
- Example values for easy testing
- Required vs optional parameters clearly marked
- Data type validation and constraints

#### **✅ Authentication Flow**
- Bearer token authentication configured
- Authorize button for easy token management
- Role-based access clearly documented

#### **✅ Response Examples**
- Detailed response schemas
- HTTP status codes with descriptions
- Error response examples

#### **✅ Request Body Schemas**
- Complete DTO documentation with examples
- Validation rules and constraints
- Nested object structures

### 🐛 **Common API Testing Issues & Solutions**

#### **Issue: 404 Not Found**
```bash
❌ Wrong: http://localhost:5000/users
✅ Correct: http://localhost:5000/api/users
```

#### **Issue: 401 Unauthorized**
```bash
# Make sure to include Bearer token:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Issue: 403 Forbidden**
```bash
# Check user role requirements:
- Admin only: User management endpoints
- Instructor/Admin: Course creation
- Student only: Enrollment endpoints
```

#### **Issue: Validation Errors**
```bash
# Check required fields and formats:
- Email: Must be valid email format
- Password: Min 8 chars, uppercase, lowercase, number/special char
- Dates: ISO string format (2024-12-01T10:00:00Z)
```

### 📋 **Quick Test Checklist**

- [ ] Login successfully and get JWT token
- [ ] Set Bearer authorization in Swagger
- [ ] Test public endpoints (no auth required)
- [ ] Test protected endpoints with token
- [ ] Try different user roles
- [ ] Test CRUD operations for your role
- [ ] Verify error responses for invalid requests
- [ ] Test pagination and filtering parameters
