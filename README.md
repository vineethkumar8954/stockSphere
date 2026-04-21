# Stock Harmony

Stock Harmony is a full-stack inventory and stock management application.

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn-ui
- **Backend**: Node.js, Express
- **Database**: MySQL

## Local Development Setup

To run this application locally, you will need Node.js installed.

### 1. Database Setup
Ensure you have a local MySQL database running or an accessible remote database.

### 2. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with your database credentials.
4. Start the backend: `npm run dev`

### 3. Frontend Setup
1. Open a new terminal in the root directory.
2. Install dependencies: `npm install`
3. Start the application: `npm run dev`

## Deployment
This project is configured to be deployed on AWS using RDS (MySQL), EC2 (Backend), and S3/Amplify (Frontend).
