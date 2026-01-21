import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class VideoStatusService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async set(videoId: string, data: any) {
    await this.redis.set(`video:${videoId}`, JSON.stringify(data));
  }

  async get(videoId: string) {
    const value = await this.redis.get(`video:${videoId}`);
    return value ? JSON.parse(value) : null;
  }

  async update(videoId: string, partial: any) {
    const existing = await this.get(videoId);
    const updated = { ...existing, ...partial };
    await this.set(videoId, updated);
  }
}
