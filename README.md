# NWIS (National Well Intelligence System)

**NWIS** is an AI-powered drilling decision-support command center. It acts as an early warning and intelligence prototype for drilling operations, actively correlating live drilling parameters against thousands of historical records (e.g., Daily Drilling Reports, Wireline Logs) to proactively alert drillers about impending risks like Mud Loss, Stuck Pipe, and formation hazards.

![NWIS Dashboard](https://img.shields.io/badge/Status-Prototype-blue)
![React](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20TailwindCSS-000080)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-138808)
![AI Engine](https://img.shields.io/badge/AI_Engine-Python%20%7C%20FastAPI%20%7C%20Gemini-FF9933)

---

## 🎯 Key Features

1. **Live Drilling Simulator & Risk Radar**
   - Simulates real-time active drilling telemetry (ROP, WOB, RPM, Torque, SPP, Flow).
   - "Risk Radar" predicts impending subsurface hazards based on offset well data matching the current formation/depth.

2. **Proactive Alert Center & Explainability**
   - Automatically flashes alerts when approaching historical risk zones.
   - Provides clear explainability by presenting the exact source documents (e.g., *DDR_XYZ_07.pdf*) and NLP-extracted mitigation strategies used in the past.

3. **Well Analytics & Similarity Engine**
   - Dynamically correlates the active operation with historical wells.
   - **Cross-Well Depth Timeline:** Visually compares the active drill bit depth against mapped risk events in nearby wells.
   - Computes granular similarity scores (Formation, Depth, Trajectory, Geographic).

4. **Institutional Memory Portal (RAG)**
   - A semantic search interface simulating document intelligence across thousands of legacy well reports.
   - Dynamically generated suggestions based on the active well's specific context.

5. **VEDAS Geospatial Context**
   - Interactive map showing the active rig, offset wells, and synthetic historical event markers.
   - Features integration capabilities for VEDAS API layers (NDVI, NDMI, Energy Infrastructure).

---

## 🏗️ Architecture

The system is broken down into three microservices:

1. **`frontend/` (React + Vite + TailwindCSS)**
   - The primary command center. Uses React Context (`ActiveOperationContext`) to manage the state of the active well and simulate live telemetry. Maps are built using `react-leaflet`.
   
2. **`backend/` (Node.js + Express + TypeScript)**
   - Acts as an API gateway and middleware. Manages operations, mock endpoints for geospatial data, and routes requests to the AI engine.
   
3. **`ai-service/` (Python + FastAPI)**
   - The intelligent core. Processes Retrieval-Augmented Generation (RAG) queries, matches formations, and generates simulated unstructured text extraction over synthetic historical databases.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python 3.9+
- Gemini API Key (for the Python RAG Engine)

### 1. Start the Backend API
```bash
cd backend
npm install
npm run dev
```
*Runs on http://localhost:3000*

### 2. Start the AI RAG Service
```bash
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
# Set your Gemini API key in main.py
uvicorn main:app --host 0.0.0.0 --port 8000
```
*Runs on http://localhost:8000*

### 3. Start the Frontend Command Center
```bash
cd frontend
npm install
npm run dev
```
*Runs on http://localhost:5173*

---

## 🔒 Confidentiality & Prototype Notice
**Note:** This application currently relies on locally synthesized mock data and demonstration contexts. It is intended as a proof-of-concept for the Smart India Hackathon to demonstrate the feasibility of AI-driven drilling intelligence. No actual classified drilling telemetry or un-redacted well reports are included in this repository.

## 👥 Contributors
Developed for the SIH 2024 problem statement: **National Well Intelligence System**.