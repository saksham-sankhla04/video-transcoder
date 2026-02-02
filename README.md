# Video Transcoder Service

A backend service built with **NestJS** that accepts video uploads and transcodes them **asynchronously** into multiple resolutions using **FFmpeg**, **BullMQ**, and **Redis**.

The API and worker run as separate containers orchestrated with Docker Compose — the API stays responsive while workers handle CPU-intensive transcoding in the background.

---

## Architecture

```
                         ┌──────────────┐
                         │    Client    │
                         └──────┬───────┘
                                │  POST /upload (multipart)
                                ▼
                    ┌───────────────────────┐
                    │   API  (NestJS)       │
                    │   - Validates file    │
                    │   - Saves to /uploads │
                    │   - Queues job        │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Redis + BullMQ      │
                    │   - Job queue         │
                    │   - Status store      │
                    └───────────┬───────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   Worker (FFmpeg)     │
                    │   - Generates thumb   │
                    │   - Transcodes 1080p  │
                    │   - Transcodes 720p   │
                    │   - Transcodes 480p   │
                    │   - Updates progress  │
                    └───────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │   /outputs/{videoId}  │
                    │   ├── thumbnail.jpg   │
                    │   ├── 1080p.mp4       │
                    │   ├── 720p.mp4        │
                    │   └── 480p.mp4        │
                    └───────────────────────┘
```

- The **API** receives uploads and enqueues transcoding jobs — it never blocks on FFmpeg.
- The **Worker** picks jobs from the queue and transcodes using FFmpeg with real-time progress tracking.
- **Redis** serves as both the job queue backend and the status/progress store.
- Both containers share `uploads/` and `outputs/` via Docker volumes.

---

## Tech Stack

| Component        | Technology             |
|------------------|------------------------|
| Framework        | NestJS 11              |
| Runtime          | Node.js 20             |
| Job Queue        | BullMQ + Redis 7       |
| Video Processing | FFmpeg (libx264, AAC)  |
| File Upload      | Multer                 |
| Containerization | Docker + Docker Compose|
| Language         | TypeScript             |

---

## API Endpoints

### Upload a Video

```
POST /upload
Content-Type: multipart/form-data
Field: video (max 500 MB, video/* MIME types only)
```

Response:

```json
{
  "videoId": "timer-1769701048169",
  "status": "processing"
}
```

### Check Processing Status

```
GET /upload/videos/:videoId/status
```

Response (in progress):

```json
{
  "status": "processing",
  "progress": 42
}
```

Response (completed):

```json
{
  "status": "completed",
  "progress": 100,
  "outputs": {
    "thumbnail": "/outputs/timer-1769701048169/thumbnail.jpg",
    "480p": "/outputs/timer-1769701048169/480p.mp4",
    "720p": "/outputs/timer-1769701048169/720p.mp4",
    "1080p": "/outputs/timer-1769701048169/1080p.mp4"
  }
}
```

Possible statuses: `queued` → `processing` → `completed` | `failed`

---

## Transcoding Details

| Resolution | Width  | Codec   | Preset | CRF | Audio |
|------------|--------|---------|--------|-----|-------|
| 1080p      | 1920px | libx264 | fast   | 23  | AAC   |
| 720p       | 1280px | libx264 | fast   | 23  | AAC   |
| 480p       | 854px  | libx264 | fast   | 23  | AAC   |

- Aspect ratio is preserved automatically (`scale=width:-2`)
- Thumbnail is extracted at the 1-second mark
- Progress is tracked per-resolution with weighted percentages (thumbnail 5%, 1080p 35%, 720p 30%, 480p 30%)
- Failed jobs retry up to 3 times with exponential backoff

---

## Running with Docker Compose

```bash
docker-compose up --build
```

This starts three services:

| Service  | Description                    | Port |
|----------|--------------------------------|------|
| `redis`  | Redis 7 for queue and status   | 6379 |
| `api`    | NestJS API server              | 3000 |
| `worker` | FFmpeg transcoding worker      | —    |

Test with curl:

```bash
# Upload a video
curl -F "video=@sample.mp4" http://localhost:3000/upload

# Check status (replace with your videoId)
curl http://localhost:3000/upload/videos/sample-1769701048169/status
```

---

## Local Development (without Docker)

```bash
# Install dependencies
pnpm install

# Start Redis
docker run -d -p 6379:6379 redis:7

# Run API in watch mode
pnpm run start:dev

# Run worker in a separate terminal
pnpm run start:worker
```

---

## Project Structure

```
src/
├── main.ts                          # API entry point (port 3000)
├── worker.ts                        # Worker entry point
├── app.module.ts                    # Root module (Redis, Bull, routes)
├── worker.module.ts                 # Worker module
├── video-upload/
│   ├── vu.controller.ts             # Upload + status endpoints
│   ├── vu.service.ts                # Queue job creation
│   └── vu.module.ts
├── queue/
│   ├── queue.module.ts              # Queue registration (API side)
│   ├── queue-worker.module.ts       # Queue registration (worker side)
│   └── transcode.processor.ts       # Job processor
├── transcoder/
│   ├── transcoder.service.ts        # FFmpeg transcoding logic
│   ├── video-status.service.ts      # Redis status read/write
│   └── transcoder.module.ts
└── utils/
    └── ffmpeg.util.ts               # FFmpeg spawn + progress parsing

Dockerfile                           # API image
Dockerfile.worker                    # Worker image (includes FFmpeg)
docker-compose.yml                   # Full stack orchestration
```

---

## Environment Variables

| Variable     | Default     | Description          |
|--------------|-------------|----------------------|
| `REDIS_HOST` | `127.0.0.1` | Redis server host    |
| `PORT`       | `3000`      | API server port      |
