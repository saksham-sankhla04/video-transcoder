import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class VideoStatusService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  private getStatusKey(videoId: string) {
    return `video:${videoId}`;
  }

  private getEventsChannel(videoId: string) {
    return `video:${videoId}:events`;
  }

  async set(videoId: string, data: any) {
    await this.redis.set(this.getStatusKey(videoId), JSON.stringify(data));
    await this.publish(videoId, data);
  }

  async get(videoId: string) {
    const value = await this.redis.get(this.getStatusKey(videoId));
    return value ? JSON.parse(value) : null;
  }

  async update(videoId: string, partial: any) {
    const existing = await this.get(videoId);
    const updated = { ...existing, ...partial };
    await this.set(videoId, updated);
  }

  async publish(videoId: string, payload: any) {
    await this.redis.publish(
      this.getEventsChannel(videoId),
      JSON.stringify(payload),
    );
  }

  async subscribe(
    videoId: string,
    onMessage: (payload: any) => void,
  ): Promise<() => Promise<void>> {
    const channel = this.getEventsChannel(videoId);
    const subscriber = this.redis.duplicate();

    const messageHandler = (incomingChannel: string, message: string) => {
      if (incomingChannel !== channel) return;

      try {
        onMessage(JSON.parse(message));
      } catch {
        // Ignore malformed messages so one bad payload doesn't break the stream.
      }
    };

    subscriber.on('message', messageHandler);
    await subscriber.subscribe(channel);

    return async () => {
      await subscriber.unsubscribe(channel);
      subscriber.off('message', messageHandler);
      await subscriber.quit();
    };
  }
}
