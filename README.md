# GharBuddy Context-Aware Smart Home for Indian Households:

GharBuddy is a proactive, context-aware smart home assistant designed for Indian households. It understands daily routines like morning pooja, pressure cooker whistles, load-shedding windows, and caregiver anomalies, acting autonomously to preheat water, dim lights, schedule inverter charging, and alert family members.

## Overview of GharBuddy:

GharBuddy bridges smart home devices with state-of-the-art Generative AI reasoning. Instead of relying solely on hard-coded schedules or manually triggered scenes, it uses an LSTM machine learning routine combined with LLM orchestrations (AWS Bedrock Claude 3.5 Sonnet and Google Gemini 3.5 Flash) to infer intent and take preemptive action. The front-end React interface is built with premium aesthetics, offering a live 2D digital twin of the home alongside real-time telemetry, AI decision consoles, and neighborhood micro-grid statistics.

## Live Visual Demos:

Below are the visual screenshots captured from the live running system:

### 1. User Authentication Portal:
![User Authentication Portal](visuals/login_page.png)
The secure login screen handles JWT credentials and integrates Google OAuth login options.

### 2. Home Overview Dashboard:
![Home Overview Dashboard](visuals/overview.png)
The interactive 2D floor plan updates in real-time with device states, occupancy detection, and AI pulse indicators.

### 3. Smart Appliances Console:
![Smart Appliances Console](visuals/devices.png)
A dedicated device manager displaying real-time power consumption, toggle switches, and quick-preset activities.

### 4. Energy Analytics Control:
![Energy Analytics Control](visuals/energy.png)
Detailed consumption histories, load-shedding lookaheads, and battery status visualizations.

### 5. AI Reasoning Insights:
![AI Reasoning Insights](visuals/ai_insights.png)
The cognitive brain of the system displaying live explainable decisions, RAG lookup indicators, and simulation triggers.

### 6. Community Micro-Grid:
![Community Micro-Grid](visuals/community.png)
A localized dashboard simulating neighborhood solar shares, energy transfers, and active grid demand.

## Major Features and Capabilities:

The system is equipped with the following features:
- Live 2D Digital Twin: The reactive SVG floor plan shows room occupancies and device status dynamically.
- Hybrid LLM Reasoner: System switches dynamically between AWS Bedrock and Google Gemini to calculate explainable choices.
- Caregiver Safety Monitor: Tracks morning motions between 6:00 AM and 9:00 AM, automatically executing safety notifications.
- Predictive Inverter Charger: Syncs with regional power cut timetables to charge batteries prior to outages.
- Twilio WhatsApp Alerts: Dispatches immediate push notifications to family members regarding anomalies.
- Vector RAG Optimizer: Evaluates custom user overrides and stores rules inside an indexed database repository.

## Documentation Index:

Refer to these dedicated guides to learn more about the codebase structure, installations, and architecture:
- [CodeBaseIndex.md](file:///c:/Users/Xeron/Desktop/AmazonHackOn/CodeBaseIndex.md): Directory structures, packages, and file organization.
- [Frontend.md](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Frontend.md): Client-side components, state providers, and page layouts.
- [Backend.md](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Backend.md): Server endpoints, background tasks, and database managers.
- [AIAgent.md](file:///c:/Users/Xeron/Desktop/AmazonHackOn/AIAgent.md): Model parameters, RAG lookup rules, and training routines.
- [Architecture.md](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Architecture.md): Data flows, message sequences, and hardware simulation loops.
- [InstallationAndSetup.md](file:///c:/Users/Xeron/Desktop/AmazonHackOn/InstallationAndSetup.md): Prerequisites, local builds, and database setup instructions.
- [Deploy.md](file:///c:/Users/Xeron/Desktop/AmazonHackOn/Deploy.md): Render blueprint steps, Vercel deployments, and environment syncs.
