
# Taskly — Full-Stack Todo App

A full-stack Todo application built with Next.js, Node.js, Express, PostgreSQL, and Sequelize ORM.

Taskly lets users create an account, log in securely, and manage their own tasks through a clean, responsive interface.

## Features

- User registration and login
- Password hashing with bcrypt
- JWT-based authentication
- Create, view, update, and delete tasks
- Mark tasks as completed or in progress
- User-specific task access
- PostgreSQL database integration
- Sequelize ORM and model associations
- Responsive Next.js frontend
- Separate controllers, services, routes, and models
- API error handling and input validation

## Tech Stack

### Frontend
- Next.js
- React
- JavaScript
- Tailwind CSS
- Lucide React

### Backend
- Node.js
- Express.js
- Sequelize ORM
- PostgreSQL
- bcryptjs
- JSON Web Tokens (JWT)

## Project Structure

```text
todo-node-express-nextjs-db/
├── todo-app-backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   └── tasks/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
├── todo-app-frontend/
│   ├── app/
│   ├── lib/
│   ├── package.json
│   └── .env.local.example
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- PostgreSQL
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MFurqanCh10/todo-node-express-nextjs-db.git
cd todo-node-express-nextjs-db
```

### 2. Set up PostgreSQL

Create a PostgreSQL database and a dedicated database user.

Example SQL:

```sql
CREATE ROLE todo_user
WITH LOGIN PASSWORD 'replace_with_your_local_password';

CREATE DATABASE todo_app_db OWNER todo_user;
```

Use your own local database credentials.

### 3. Configure the backend

```bash
cd todo-app-backend
npm install
cp .env.example .env
```

Edit `.env` with your local settings:

```env
PORT=5001

DB_NAME=todo_app_db
DB_USER=todo_user
DB_PASSWORD=replace_with_your_local_password
DB_HOST=localhost
DB_PORT=5432

JWT_SECRET=replace_with_a_secure_random_secret
```

Generate a JWT secret with:

```bash
openssl rand -hex 32
```

Start the backend:

```bash
npm run dev
```

The backend runs at `http://localhost:5001`.

Health check: `GET /health`

### 4. Configure the frontend

Open another terminal at the project root:

```bash
cd todo-app-frontend
npm install
cp .env.local.example .env.local
```

Set the API URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000`.

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register an account |
| POST | `/api/auth/login` | Log in |

### Tasks

All task endpoints require a valid JWT access token.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Get the logged-in user's tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | Get a task |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

Send the token in the HTTP `Authorization` header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

## Architecture

- **Routes:** Map HTTP endpoints to controller functions.
- **Controllers:** Handle requests and responses.
- **Services:** Implement business logic and coordinate database operations.
- **Models:** Define database fields, constraints, and relationships.
- **Middleware:** Verify authentication tokens.
- **Config:** Configure the database connection.

## Database

PostgreSQL stores users and tasks. Sequelize provides the JavaScript ORM layer used to interact with the database.

Tasks are associated with their owning users.

## Security Notes

- Never commit `.env` or `.env.local`.
- Use strong passwords and a secure JWT secret.
- Keep dependencies updated.
- Use HTTPS and an appropriate production authentication strategy before deployment.

## Author

Muhammad Furqan

GitHub: [MFurqanCh10](https://github.com/MFurqanCh10)

## License

This project is for learning and portfolio purposes.
