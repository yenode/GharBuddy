# Deployment Guide:

This guide explains how to deploy the full-stack GharBuddy application to production environments.

## Render Blueprint Deployment:

The easiest method uses the root-level `render.yaml` file to deploy all backend services, database nodes, and static frontend sites automatically.

### 1. Push Code to GitHub:
- Ensure all local changes are staged.
- Run `git push origin main` to sync your repository.

### 2. Launch Render Blueprint:
- Navigate to the Render Dashboard.
- Click **New +** and select **Blueprint**.
- Connect your GitHub repository.
- Render will parse `render.yaml` and prompt you for configuration values.

### 3. Provide Environment variables:
- Provide the required environment variables.
  - `GEMINI_API_KEY`: API token from Google AI Studio.
  - `TWILIO_ACCOUNT_SID`: Account string from Twilio Console.
  - `TWILIO_AUTH_TOKEN`: Security token from Twilio Console.
- Render will automatically set up `JWT_SECRET` and Postgres credentials.

### 4. Wait for Build Completion:
- Render will spin up the database instance.
- Render builds the FastAPI container, installing requirements and listening on port 8000.
- Render compiles the static site from the `Frontend` directory, setting the backend URL parameter.

## Separate Hosting Alternative:

You can separate hosting across providers:

### 1. Database Hosting:
- Set up a managed Postgres instance on Neon or AWS RDS.
- Execute SQL migrations to initialize tables and pgvector indexes.

### 2. Backend Hosting on Render or Railway:
- Deploy `Backend` as a Python Web Service.
- Set the build command: `pip install -r Backend/requirements.txt`.
- Set the start command: `python -m uvicorn Backend.MainFastApi:app --host 0.0.0.0 --port $PORT`.
- Set `MOCK_MODE=False` and supply database connection details.

### 3. Frontend Hosting on Vercel or Netlify:
- Link the repository to Vercel.
- Configure Root Directory: `Frontend`.
- Set Build Command: `npm run build`.
- Set Output Directory: `dist`.
- Set Environment Variable: `VITE_API_URL` pointing to the deployed backend URL.
