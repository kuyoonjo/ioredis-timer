import { EventEmitter } from 'events';
import { Redis } from 'ioredis';
import * as uuid from 'uuid/v1';

const REDIS_KEY_IDENTIFIER = '__redistimer__';
const REDIS_CLEANER_IDENTIFIER = '__redistimercleaner__';

export class Timer extends EventEmitter {
  public id: string;
  public clearMs = 60000;
  private redis: Redis;
  private redisWriter: Redis;
  private fn: any;

  constructor(redis: Redis) {
    super();
    this.id = uuid().replace(/-/g, '');
    this.redis = redis.duplicate();
    this.redisWriter = redis.duplicate();

    this.fn = async (_s: string, _c: string, k: string) => {
      const prefix = this.id + REDIS_KEY_IDENTIFIER;
      const cleanerPrefix = this.id + REDIS_CLEANER_IDENTIFIER;
      if (k.startsWith(prefix)) {
        try {
          const event = k.slice(prefix.length, k.length - 32);
          const id = k.slice(k.length - 32, k.length);
          if (await this.redisWriter.sadd(event, k)) {
            this.emit(event, id);
          }
        } catch (e) {
          this.emit('error', e);
        }
      } else if (k.startsWith(cleanerPrefix)) {
        try {
          const event = k.slice(cleanerPrefix.length, k.length - 32);
          const id = k.slice(k.length - 32, k.length);
          const key = this.id + REDIS_KEY_IDENTIFIER + event + id;
          await this.redisWriter.srem(event, key);
        } catch (e) {
          this.emit('error', e);
        }
      }
    };
    this.subscribe();
  }

  public setTimeout(event: string, ms: number) {
    const id = uuid().replace(/-/g, '');
    const key = this.id + REDIS_KEY_IDENTIFIER + event + id;
    const ts = new Date().getTime() + ms;
    this.redisWriter.set(key, ts, 'px', ms);
  }

  public async finish(event: string, id: string) {
    const k = this.id + REDIS_CLEANER_IDENTIFIER + event + id;
    await this.redisWriter.set(k, 1, 'px', this.clearMs);
  }

  public distroy() {
    this.unsubscribe();
    this.redis.disconnect();
    this.redisWriter.disconnect();
  }

  private subscribe() {
    this.redis.psubscribe('__keyevent@*__:expired');
    this.redis.on('pmessage', this.fn);
  }

  private unsubscribe() {
    this.redis.off('pmessage', this.fn);
  }
}
