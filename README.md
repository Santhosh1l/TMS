# Training Management System (TMS)

A full-stack Task Management System built with a Java Spring Boot backend and a React frontend.

## Project Structure

This repository contains two main directories:

- `backend/`: The Java Spring Boot backend application.
- `frontend/`: The React frontend application.

## Prerequisites

Ensure you have the following installed on your system:
- **Java Development Kit (JDK) 17+**
- **Node.js (v16+)**
- **npm** (comes with Node.js)
- **Maven** (optional, the project includes a Maven wrapper `mvnw`)

---

## Backend Setup (Spring Boot)

The backend is located in the `backend/` directory and is built using Java Spring Boot.

### Running the Backend Locally

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the application using the Maven wrapper:
   ```bash
   # On Windows
   mvnw.cmd spring-boot:run

   # On macOS/Linux
   ./mvnw spring-boot:run
   ```

By default, the backend server will start on port `8080`.

---

## Frontend Setup (React)

The frontend is located in the `frontend/` directory and is built using React and Tailwind CSS.

### Running the Frontend Locally

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

The application will be accessible at `http://localhost:3000` in your web browser.

## Technologies Used

### Backend
- Java
- Spring Boot
- Maven

### Frontend
- React 18
- React Router DOM
- Tailwind CSS
- Axios
- date-fns
