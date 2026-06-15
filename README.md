# 🏠 Smart Home System

A full-stack IoT Smart Home monitoring and control system built with the MERN stack and MQTT protocol. The system collects real-time environmental data from IoT sensors, supports remote device control, threshold-based alerting, face recognition door access, and multi-user household management.

> **Course Project** — Multidisciplinary Project - Software Engineering Track (CO3109)  
> Ho Chi Minh City University of Technology, VNU-HCM — Semester 252

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Hardware](#hardware)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Design Patterns](#design-patterns)
- [AI Features](#ai-features)
- [Future Roadmap](#future-roadmap)
- [Team](#team)

---

## Overview

The Smart Home System addresses common household monitoring challenges — lack of continuous environmental tracking, no early fire/smoke detection, inability to monitor remotely, and no shared multi-user access. The system collects data from temperature, humidity, and light sensors, displays it on a real-time dashboard, triggers alerts when thresholds are exceeded, and allows remote control of actuators (fan, servo door, RGB LED).

---

## Features

### For All Users (Household Members)
- Real-time sensor data monitoring (temperature, humidity, light intensity)
- View and control device status (fan, servo door, LED)
- View alert history and current alerts
- View household activity logs

### For Home Owners (Admin)
- All user features, plus:
- Add, edit, and remove IoT devices
- Configure alert thresholds per sensor
- Invite and manage household members
- View complete home activity logs

### For System Administrators (SysAdmin)
- View all users across the system
- Manage and disable/restore user accounts
- Monitor all devices system-wide
- Access full system activity logs

### Special Features
- **Face Recognition Door Control** — Haar Cascade + MobileNetV2 pipeline; auto-opens servo door when authorized user is detected with >80% confidence
- **Person Detection & Auto Control** — YOLOv8 Nano (≈80 FPS) adjusts fan speed and LED color based on room occupancy and environmental context
- **Threshold Alerting** — Automatic email notifications when sensor values exceed configured limits
- **Historical Charts** — Sensor history visualized with Recharts; filter by device, date range, and data type

---

## System Architecture

The system follows a **Layered Architecture** combined with **Event-Driven Architecture** for real-time sensor data processing.

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (React)          │
│  Dashboard · Devices · Alerts · Logs        │
└──────────────────┬──────────────────────────┘
                   │ REST API
┌──────────────────▼──────────────────────────┐
│         Routing & Middleware Layer          │
│  AuthMiddleware · RoleMiddleware ·          │
│  AccessControlMiddleware                    │
├─────────────────────────────────────────────┤
│              Controller Layer               │
│  Auth · Device · Sensor · Alert · Log ·     │
│  Home · User · System                       │
├─────────────────────────────────────────────┤
│                Service Layer                │
│  AuthService · DeviceService ·              │
│  SensorService · AlertService · LogService  │
│  HomeService · UserService · SystemService  │
├─────────────────────────────────────────────┤
│            Model Layer (MongoDB)            │
│  User · Home · Device · SensorData ·        │
│  Alert · ActivityLog · Invitation           │
├─────────────────────────────────────────────┤
│     Infrastructure & Integration Layer      │
│  MQTTClient · DeviceFactory ·               │
│  SensorEventBus · DatabaseLogger ·          │
│  AlertSystem · connectDB                    │
└──────────────────┬──────────────────────────┘
                   │ MQTT (Adafruit IO)
┌──────────────────▼──────────────────────────┐
│           Hardware Layer (ESP32)            │
│  DHT20 · Light Sensor · LCD · Fan ·         │
│  Servo · NeoPixel LED                       │
└─────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime environment |
| Express.js | REST API framework |
| MongoDB | Primary database |
| Mongoose | ODM / schema management |
| MQTT (Adafruit IO) | IoT device communication |
| JWT | Authentication |
| Swagger UI | API documentation (`/api-docs`) |

### Frontend
| Technology | Purpose |
|---|---|
| React | Component-based UI |
| Vite | Build tool & dev server |
| React Router DOM | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Recharts | Sensor data charts |

### AI / ML
| Technology | Purpose |
|---|---|
| Haar Cascade | Face detection |
| MobileNetV2 | Face recognition (transfer learning) |
| YOLOv8 Nano | Person detection (~80 FPS) |

### DevOps
| Technology | Purpose |
|---|---|
| Docker / Docker Compose | MongoDB containerization |
| FreeRTOS | Embedded multitasking on ESP32 |

---

## Hardware

### Input Devices
| Device | Interface | Function |
|---|---|---|
| DHT20 | I2C (Pin 21, 22) | Temperature (°C) & Humidity (%) — updated every 10s |
| Light Sensor | Analog (ADC) | Light intensity (0–100%) |
| Adafruit IO | MQTT | Receives control commands from dashboard |

### Output Devices
| Device | Interface | Function |
|---|---|---|
| LCD 16×2 | I2C (Addr: 0x21) | Displays sensor readings, system status, NTP time |
| Fan Motor | PWM | Variable speed cooling (0–100%) |
| Servo Motor | PWM (Pin 18) | Door open/close (0°/90°) |
| NeoPixel LED (×4) | Digital (One-Wire) | Smart RGB lighting with Hex color support |

The hardware runs on an **ESP32-WROOM-32** (Yolo:bit board) using **FreeRTOS** for real-time multitasking. Each device is managed as an independent task using `vTaskDelay` for non-blocking operation.

---

## Project Structure

```
smart-home/
├── backend/
│   ├── src/
│   │   ├── controllers/       # HTTP request handlers
│   │   │   ├── AuthController.js
│   │   │   ├── DeviceController.js
│   │   │   ├── SensorController.js
│   │   │   ├── AlertController.js
│   │   │   ├── LogController.js
│   │   │   ├── HomeController.js
│   │   │   ├── UserController.js
│   │   │   └── SystemController.js
│   │   ├── services/          # Business logic
│   │   │   ├── AuthService.js
│   │   │   ├── DeviceService.js
│   │   │   ├── SensorService.js
│   │   │   ├── AlertService.js
│   │   │   ├── LogService.js
│   │   │   ├── HomeService.js
│   │   │   ├── UserService.js
│   │   │   └── SystemService.js
│   │   ├── models/            # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Home.js
│   │   │   ├── Device.js
│   │   │   ├── SensorData.js
│   │   │   ├── Alert.js
│   │   │   ├── ActivityLog.js
│   │   │   └── Invitation.js
│   │   ├── routes/            # Express routes
│   │   │   ├── AuthRoutes.js
│   │   │   ├── DeviceRoutes.js
│   │   │   ├── SensorRoutes.js
│   │   │   ├── AlertRoutes.js
│   │   │   ├── LogRoutes.js
│   │   │   ├── HomeRoutes.js
│   │   │   ├── UserRoutes.js
│   │   │   └── SystemRoutes.js
│   │   ├── middlewares/
│   │   │   ├── AuthMiddleware.js
│   │   │   ├── RoleMiddleware.js
│   │   │   └── AccessControlMiddleware.js
│   │   └── infrastructure/
│   │       ├── MQTTClient.js       # Singleton MQTT connection
│   │       ├── DeviceFactory.js    # Factory for device handlers
│   │       ├── SensorEventBus.js   # Singleton event bus
│   │       ├── DatabaseLogger.js   # Observer: persists sensor data
│   │       ├── AlertSystem.js      # Observer: threshold checks & email
│   │       └── connectDB.js
│   ├── docker-compose.yml
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   ├── MyHome/
│   │   │   ├── Environment/
│   │   │   ├── Devices/
│   │   │   ├── Alerts/
│   │   │   ├── Members/
│   │   │   ├── ConfigureSensors/
│   │   │   ├── Logs/
│   │   │   └── Admin/
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
├── ai/
│   ├── face_recognition/     # MobileNetV2 face auth pipeline
│   └── person_detection/     # YOLOv8 Nano occupancy detection
└── firmware/                 # ESP32 / FreeRTOS source
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- Docker & Docker Compose
- An [Adafruit IO](https://io.adafruit.com/) account (for MQTT)
- MongoDB (via Docker or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/smart-home.git
cd smart-home
```

### 2. Start MongoDB with Docker

```bash
cd backend
docker-compose up -d
```

This starts MongoDB on port `27017` with credentials `admin / password_123`.

### 3. Configure environment variables

Create a `.env` file in `backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://admin:password_123@localhost:27017/smarthome?authSource=admin
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

ADAFRUIT_USERNAME=your_adafruit_username
ADAFRUIT_KEY=your_adafruit_io_key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Install and run the backend

```bash
cd backend
npm install
npm run dev
```

The API will be available at `http://localhost:5000`.  
Swagger docs: `http://localhost:5000/api-docs`

### 5. Install and run the frontend

```bash
cd frontend
npm install
npm run dev
```

The web app will be available at `http://localhost:5173`.

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Backend server port (default: `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | JWT token expiry (e.g., `7d`) |
| `ADAFRUIT_USERNAME` | Adafruit IO username |
| `ADAFRUIT_KEY` | Adafruit IO active key |
| `EMAIL_HOST` | SMTP host for alert emails |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | Sender email address |
| `EMAIL_PASS` | SMTP password / app password |

---

## API Documentation

Full interactive API docs are available via Swagger UI at `/api-docs` when the backend is running.

### Core Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login and receive JWT |
| `GET` | `/api/v1/sensors/latest` | Latest sensor readings |
| `GET` | `/api/v1/sensors/history` | Historical sensor data (filterable) |
| `GET` | `/api/v1/devices` | List devices in home |
| `POST` | `/api/v1/devices` | Add a new device |
| `PUT` | `/api/v1/devices/:id/control` | Send control command to device |
| `GET` | `/api/v1/alerts` | List alerts for home |
| `PUT` | `/api/v1/alerts/:id/resolve` | Mark alert as resolved |
| `GET` | `/api/v1/logs` | Activity log for home |
| `POST` | `/api/v1/homes/invite` | Invite a member to home |
| `GET` | `/api/v1/system/users` | (SysAdmin) All users |
| `GET` | `/api/v1/system/devices` | (SysAdmin) All devices |

---

## User Roles

| Role | Description |
|---|---|
| `SystemAdmin` | Platform-level administrator; manages all users, devices, and logs across all homes |
| `Admin` (Home Owner) | Controls their home — manages devices, members, thresholds, and views all logs |
| `Family` (Member) | Views sensor data, device status, and alerts; can control devices within their home |

Role-based access is enforced through `RoleMiddleware` and `AccessControlMiddleware` on every protected route. Users can only interact with devices and data belonging to their own home.

---

## Design Patterns

### Observer Pattern — Real-time Sensor Processing
`SensorEventBus` (Subject) fires a `newSensorData` event whenever MQTT data arrives. Two independent observers react:
- **`DatabaseLogger`** — persists data to `SensorData` collection and updates `last_seen` on the device
- **`AlertSystem`** — checks thresholds, creates `Alert` documents, and sends email notifications

### Singleton Pattern — Shared Resources
- **`MQTTClient`** — single MQTT connection shared by all services via `MQTTClient.getInstance()`
- **`SensorEventBus`** — single event bus instance across the entire application

### Factory Method Pattern — Device Abstraction
`DeviceFactory.createHandler(feedName)` returns a typed handler for each device. Each handler extends a common `DeviceHandler` base and implements `parseValue()`, `getUnit()`, `isSensor()`, and `formatControlCommand()`.

Available handlers: `TemperatureHandler`, `HumidityHandler`, `LightHandler`, `FanHandler`, `ServoHandler`, `LEDHandler`, `LEDRGBHandler`

---

## AI Features

### Face Recognition Door Access
1. **Detection** — Haar Cascade detects face regions from webcam frames
2. **Recognition** — MobileNetV2 (transfer learning) classifies the detected face
3. **Access Control** — If confidence > 80% and the user is on the authorized list, a servo open command (`90°`) is published to Adafruit IO. The door auto-closes after 10 seconds.

### Person Detection & Adaptive Control (YOLOv8 Nano)
Runs at approximately 80 FPS to determine room occupancy and trigger:

**Fan adaptation:**
- Person present + hot/humid → 70–100% power
- Person present + comfortable → 40% (light breeze)
- No person → 20% ventilation or off

**LED lighting logic:**
- No person → immediately off (fail-safe)
- Sufficient ambient light → LED stays off
- After 22:00 → warm orange (circadian protection)
- High temperature → cool blue (comfort)
- A 30-second timeout prevents rapid on/off cycling

---

## Future Roadmap

- [ ] WebSocket / Server-Sent Events for real-time frontend updates
- [ ] Mobile application (React Native)
- [ ] Multi-factor authentication (OTP)
- [ ] Rule Engine — user-defined "if-then" automation rules
- [ ] Time-based device scheduling
- [ ] Multi-channel alerts (Telegram, Zalo, push notifications)
- [ ] Expanded sensor support (gas, smoke, motion, door contact)
- [ ] Additional actuators (smart lock, blinds, air conditioning, smart plugs)
- [ ] Advanced analytics dashboard (weekly/monthly trends)
- [ ] AI-based habit learning and energy optimization
- [ ] Production deployment (cloud hosting, HTTPS, structured logging)

---

## Team

| Student ID | Name | Role |
|---|---|---|
| 2312105 | Phan Huy Quang Minh | Backend & Database |
| 2310979 | Trần Phạm Minh Hiếu | Backend & Database |
| 2313180 | Huỳnh Võ Quốc Thắng | Frontend & UI/UX |
| 2313646 | Nguyễn Bảo Trọng | Hardware configuration & firmware |

**Supervisor:** MSc. Nguyễn Hữu Hiếu  
**Institution:** Faculty of Computer Science and Engineering, HCMUT  
**Submitted:** May 2026

---

## License

This project was developed for academic purposes as part of the Multidisciplinary Project course (CO3109) at Ho Chi Minh City University of Technology, VNU-HCM. All rights reserved by the authors.
