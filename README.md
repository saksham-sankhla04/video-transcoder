# Video Transcoder Service 🎥

A backend service built with **NestJS** that accepts video uploads and processes them **asynchronously** to generate multiple resolutions and thumbnails using **FFmpeg** and **BullMQ**.

This project is designed to mimic **real-world media processing pipelines** used in production systems.

---

## 🚀 Key Features

- Upload videos via REST API
- Asynchronous video processing using **BullMQ + Redis**
- Transcoding into:
  - 1080p
  - 720p
  - 480p
- Automatic thumbnail generation
- Job status tracking (`queued`, `processing`, `completed`, `failed`)
- Aspect-ratio–preserving scaling
- Modular and scalable NestJS architecture

---

## 🧠 Architecture Overview

Client
↓
NestJS API
↓
BullMQ Queue
↓
Redis
↓
Worker (FFmpeg)

- API remains responsive
- CPU-intensive work handled by background workers
- Designed for horizontal scaling

---

## 🛠 Tech Stack

- **NestJS**
- **Node.js**
- **BullMQ**
- **Redis**
- **FFmpeg**
- **Multer**
- **pnpm**

---

## 📡 API Endpoints

### Upload Video

POST /upload
Content-Type: multipart/form-data
Field: video

Response:

```json
{
  "videoId": "timer-1767972253901",
  "status": "queued",
  "statusUrl": "/videos/timer-1767972253901/status"
}
```

### Get Processing Status

GET /videos/:videoId/status

Response:

```json
{
  "status": "completed",
  "outputs": {
    "thumbnail": "/outputs/timer-1768237207048/thumbnail.jpg",
    "480p": "/outputs/timer-1768237207048/480p.mp4",
    "720p": "/outputs/timer-1768237207048/720p.mp4",
    "1080p": "/outputs/timer-1768237207048/1080p.mp4"
  }
}
```

📁 File Storage

Uploaded videos: /uploads

Transcoded outputs: /outputs/<videoId>/

These directories are excluded from version control

## 🧪 Local Development

```bash
pnpm install
docker run -p 6379:6379 redis
pnpm run start:dev

```

> Note: Status is currently stored in memory for simplicity and can be replaced with Redis or a database in production.
