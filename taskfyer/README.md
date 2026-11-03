# Taskfyer

Taskfyer is a full-stack task-management application. The project is split into two independently installed packages:

- [`client/`](./client/) — Next.js 14 frontend.
- [`backend/`](./backend/) — Express API using MongoDB and Mongoose.

For prerequisites, environment variables, and complete setup instructions, see the [Taskfyer setup guide](./SETUP_GUIDE.md). Backend environment-variable names are listed in [`backend/.env.example`](./backend/.env.example); provide your own local credentials and do not commit a populated `.env` file.

## Local development

1. Follow the setup guide to configure the backend `.env`, MongoDB, and email credentials.
2. In one terminal, install backend dependencies and start the API:

   ```sh
   cd backend
   npm install
   npm start
   ```

3. In another terminal, install frontend dependencies and start Next.js:

   ```sh
   cd client
   npm install
   npm run dev
   ```

The client defaults and API URL settings should be checked against the backend URL and CORS configuration before deployment. This repository snapshot has not been validated as a production deployment.
