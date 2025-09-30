# Covid Slayer

Demonstration Game between Covid Monster vs Vaccinator

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Validation**: Zod schema validation
- **Logging**: Winston logger with file and console transports
- **CORS**: Configurable cross-origin resource sharing

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Hookform resolvers
- **HTTP Client**: Axios
- **Validation**: Zod schema validation


## Project Structure

```
covid-slayer/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and environment configuration
│   │   ├── middleware/      # Authentication and validation middleware
│   │   ├── models/          # MongoDB data models
│   │   ├── modules/         # Feature modules (auth, game)
│   │   ├── routes/          # API route definitions
│   │   └── schemas/         # Validation schemas
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Feature-specific components and logic
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services and HTTP client
│   │   ├── store/           # Redux store configuration
│   │   └── types/           # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## How to run locally?

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Atlas or local)
- npm

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```env
   PORT=4000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/covid-slayer
   JWT_SECRET=your-secret-key
   FRONTEND_URL=http://localhost:5173
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:4000`

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
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## How to docker locally?

### Prerequisites
- MongoDB (Atlas or local)
- env in project root

1. Navigate to the root directory:
   ```bash
   cd covid-slayer
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Replace JWT_SECRET value in `.env` with your own secret key:
   ```env
   JWT_SECRET=your-super-secret-jwt-key
   ```
4. Build and run the containers:
   ```bash
   docker compose up
   ```
5. Access the application:
   - Frontend: `http://localhost`
   - Backend API: `http://localhost:4000`
