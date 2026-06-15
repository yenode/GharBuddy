# CodeBase Index and File Map:

This document details the file structures, module distributions, and repository paths across the GharBuddy project.

## Directory Structure:

The project is structured as a monorepo containing a Python FastAPI backend and a React Vite frontend:

### 1. Root Level Assets:
- [.gitignore](file:///c:/Users/Xeron/Desktop/AmazonHackOn/.gitignore): Lists directories and local credential files excluded from repository tracking.
- [docker-compose.yml](file:///c:/Users/Xeron/Desktop/AmazonHackOn/docker-compose.yml): Specifies configuration parameters to deploy local PostgreSQL instances.
- [render.yaml](file:///c:/Users/Xeron/Desktop/AmazonHackOn/render.yaml): Contains the blueprint setup to orchestrate production builds on Render.
- [ReadMe.md](file:///c:/Users/Xeron/Desktop/AmazonHackOn/ReadMe.md): Houses the overall introduction, screenshots, and visual descriptions.

### 2. Backend Directory Structure:
The backend directory (`Backend`) contains all python resources:
- [MainFastApi.py](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend/MainFastApi.py): Launches the FastAPI gateway, registers middleware routers, runs background loops, and configures active lifespans.
- [requirements.txt](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend/requirements.txt): Lists third-party dependencies like PyTorch, FastAPI, ONNX Runtime, and Twilio.
- **Config/**: Configuration settings and loaders.
  - [AppConfig.py](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend/Config/AppConfig.py): Evaluates environment variables to define system behaviors.
- **Database/**: Houses PostgreSQL connection managers.
  - [DatabaseConnection.py](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend/Database/DatabaseConnection.py): Initializes the DB connection pools and falls back to SQLite mocks.
- **Routers/**: Houses REST API endpoints.
  - [AuthRouter.py](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend/Routers/AuthRouter.py): Handles standard login and Google Sign-In verifications.
  - [DeviceRouter.py](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend/Routers/DeviceRouter.py): Exposes device controllers and triggers.
- **Services/**: House the business logic core.
  - [BedrockService.py](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend/Services/BedrockService.py): Controls prompt logic, Bedrock API communication, and Gemini API redirects.
  - [CaregiverService.py](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend/Services/CaregiverService.py): Computes presence trackers and caregiver safety routines.
  - [TwilioService.py](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend/Services/TwilioService.py): Sends emergency alerts to registered WhatsApp numbers.
  - [VectorStoreService.py](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend/Services/VectorStoreService.py): Manages local semantic matching, rule addition, and caches.
- **Tests/**: Test suite folders.
  - Houses the 94 backend tests validating auth, DB, models, Bedrock, and exceptions.

### 3. Frontend Directory Structure:
The frontend directory (`Frontend`) contains all node resources:
- [package.json](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Frontend/package.json): Lists application versions and client dependencies.
- [Vite.config.js](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Frontend/Vite.config.js): Customizes compilation behaviors.
- **Src/**: Front-end code files.
  - [Main.jsx](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Frontend/Src/Main.jsx): Renders the primary React virtual DOM.
  - [App.jsx](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Frontend/Src/App.jsx): Declares app routing and session configurations.
  - [Index.css](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Frontend/Src/Index.css): Central stylesheet for layout structures and color palettes.
  - **Components/**: UI widgets and helper blocks.
    - **Layout/**: Houses sidebar navigation, top bar context, and AppShell containers.
  - **context/**: Global state hooks.
    - [DataContext.jsx](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Frontend/Src/context/DataContext.jsx): Connects backend web sockets and handles polling telemetry.
  - **pages/**: Central page modules.
    - [Overview.jsx](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Frontend/Src/pages/Overview.jsx): Renders 2D digital twin SVG layouts.
    - [Devices.jsx](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Frontend/Src/pages/Devices.jsx): Renders appliance status cards.
    - [Energy.jsx](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Frontend/Src/pages/Energy.jsx): Houses power cut prediction metrics.
    - [Insights.jsx](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Frontend/Src/pages/Insights.jsx): Shows reasoning explainability streams.
    - [Community.jsx](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Frontend/Src/pages/Community.jsx): Visualizes shared neighborhood solar telemetry.
