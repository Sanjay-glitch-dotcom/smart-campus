# Smart Campus Issue Reporting System

A full-stack web application for managing campus issues with role-based access control, JWT authentication, and a modern React frontend.

---

## 🚀 Features

### Core Functionality
- **Issue Reporting** – Students can report various campus issues (Wi-Fi, Classroom, Laboratory, Hostel, Other)
- **Issue Management** – View, edit, and delete issues with status tracking
- **Role-Based Access** – Student, Admin, and Department Head roles with appropriate permissions
- **Real-time Updates** – Issue status updates with email notifications
- **Priority Levels** – Low, Medium, High, and Critical priority classification

### Frontend Features
- **Dark Mode Toggle** – Switch between light and dark themes
- **Responsive Design** – Mobile-friendly interface with modern UI components
- **Custom Components** – Reusable SelectBox component with theme support
- **Authentication Flow** – Login, registration, and protected routes
- **Interactive Dashboard** – Filter issues by status and view statistics

### Backend Features
- **Spring Boot API** – RESTful services with comprehensive CRUD operations
- **JWT Security** – Token-based authentication with role-based authorization
- **Email Service** – Automatic notifications for issue creation and status updates
- **Database Integration** – JPA with MySQL for data persistence
- **Validation** – Input validation and error handling

---

## 🏗️ Architecture

### Backend (Spring Boot)
| Property | Value |
|----------|-------|
| Framework | Spring Boot 3.5.0 with Java 21 |
| Security | Spring Security with JWT authentication |
| Database | JPA/Hibernate with H2 (in-memory) for development |
| Email | JavaMailSender for notifications |
| Architecture | Layered (Controller, Service, Repository) |

### Frontend (React)
| Property | Value |
|----------|-------|
| Framework | React 19.2.4 with React Router 7.13.1 |
| HTTP Client | Axios |
| Styling | CSS variables with dark mode support |
| State Management | React Context API |
| Build Tool | Create React App |

---

## 📁 Project Structure

```
smart-campus/
├── backend/                 # Spring Boot API
│   ├── src/main/java/
│   │   └── com/example/smart_campus/
│   │       ├── config/      # Security and configuration
│   │       ├── controller/  # REST endpoints
│   │       ├── dto/         # Data transfer objects
│   │       ├── model/       # Entity classes
│   │       ├── repository/  # JPA repositories
│   │       └── service/     # Business logic
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── static/          # Static resources
│   └── pom.xml
├── frontend/                # React application
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── utils/           # Utility functions
│   └── package.json
└── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Java 21 or higher
- Node.js 18 or higher
- MySQL database
- Maven

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Configure the database in `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/smart_campus
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. Build and run:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

The backend will be available at `http://localhost:8081`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

---

## 🚀 Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/Sanjay-glitch-dotcom/smart-campus.git
cd smart-campus

# 2. Set up the database
# Create a MySQL database named `smart_campus`
# Update credentials in backend/src/main/resources/application.properties

# 3. Start the backend
cd backend
mvn spring-boot:run

# 4. Start the frontend (new terminal)
cd frontend
npm start
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8081 |

---

## 🔐 Authentication & Authorization

### User Roles

| Role | Permissions |
|------|-------------|
| `STUDENT` | Create, view, edit (own OPEN issues), delete (own OPEN issues) |
| `DEPARTMENT_HEAD` | View all issues, update issue status |
| `ADMIN` | Full access to all features and issue management |

### API Endpoints

| Category | Endpoint |
|----------|----------|
| Authentication | `POST /api/auth/login` |
| Authentication | `POST /api/auth/register` |
| Issues | `/api/issues` (full CRUD) |
| Admin | `/api/admin/*` |

---

## 🎨 UI/UX Features

### Theme System
- **Light/Dark Mode** – Toggle between themes with smooth transitions
- **CSS Variables** – Consistent theming across all components
- **Responsive Design** – Works seamlessly on desktop and mobile

### Components
- **SelectBox** – Custom dropdown with search and theme support
- **DarkModeToggle** – Animated switcher with sun/moon icons
- **Issue Cards** – Interactive cards for displaying issue information
- **Status Badges** – Color-coded status indicators

---

## 📧 Email Notifications

Automatic emails are sent for:
- New issue creation confirmation
- Issue status updates
- Account registration (if configured)

---

## 🔧 Technologies Used

### Backend
| Technology | Purpose |
|------------|---------|
| Java 21 | Programming language |
| Spring Boot 3.5.0 | Application framework |
| Spring Security | Authentication & authorization |
| Spring Data JPA | Database abstraction |
| MySQL | Database |
| JWT | Token-based authentication |
| Maven | Build tool |

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19.2.4 | UI framework |
| React Router 7.13.1 | Client-side routing |
| Axios | HTTP client |
| CSS3 | Styling with variables |
| JavaScript ES6+ | Programming language |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For support and questions, please [open an issue](https://github.com/Sanjay-glitch-dotcom/smart-campus/issues) on GitHub or contact the project maintainers.