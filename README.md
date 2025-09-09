# Youtube Demo Video Link
https://youtu.be/WX0mQzxhlP0

# Movementum-Money

A web application to manage and track personal finances, including expense tracking, budget management, analytics, and visualizations.

---

## Features

- **Dashboard**: Provides a quick overview of total income, total expenses, and net balance. It also breaks down expenses by category.
- **Transactions Page**: Allows users to view all transactions with pagination and provides options to update or delete any transaction.
- **Add Transaction**: Add new income or expense records manually.
- **Analytics Page**: Visualizes income versus expenses through interactive pie and bar charts.
- **File Uploads**: Supports uploading receipts or documents, with an integration of **Azure Document Intelligence** to automatically extract transaction details such as amount, merchant name, and date.
- **Authentication**: Includes secure routes for user registration and login using JSON Web Tokens (JWT).

---

## Technologies Used

### Frontend
- **React** and **Vite**: The primary framework for building the user interface.
- **Material UI (MUI)**: A library of pre-built UI components.
- **Tailwind CSS**: A utility-first CSS framework for styling.
- **Recharts**: Used for rendering charts and data visualizations.
- **Zustand**: A state management library for the React application.

### Backend
- **Node.js** and **Express.js**: Form the server-side foundation of the application.
- **MongoDB**: The NoSQL database used for storing all application data, with **Mongoose** as the ODM to manage schema and interactions.
- **Multer**: Middleware for handling `multipart/form-data`, primarily for file uploads.
- **JSON Web Token (JWT)**: Used for stateless authentication and securing API endpoints.
- **Express-Validator**: Middleware for request body validation, ensuring data integrity.
- **Azure Document Intelligence**: A cloud service integrated into the backend to process and extract data from receipts.

---

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/Varun2234/Finance.git](https://github.com/Varun2234/Finance.git)
    cd Finance
    ```
2.  **Install dependencies**: Install dependencies for both the server and client.
3.  **Setup environment variables**: Create a `.env` file in the `server` directory. This file should contain the database connection URI, JWT secret, and Azure Document Intelligence credentials.
4.  **Run the server**: Start the server using Nodemon for development.
    ```bash
    npm run server
    ```
5.  **Run the client**: Navigate to the `client` directory and start the React application.
    ```bash
    cd client
    npm run dev
    ```
