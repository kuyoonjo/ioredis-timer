import * as Redis from 'ioredis';
import { Timer } from '../src/Timer';

test('Should greet with message', async () => {
  const redis = new Redis({
    host: 'localhost',
    port: 6379,
  });
  const timer = new Timer(redis);
  timer.clearMs = 1000;
  let id: string = '';
  timer.on('hello', async _id => {
    id = _id;
    timer.finish('hello', id);
  });
  timer.setTimeout('hello', 1000);
  expect(id).toBeFalsy();
  await new Promise(r => setTimeout(r, 2000));
  expect(id).toBeTruthy();
  const key = timer.id + '__redistimercleaner__' + 'hello' + id;
  const res1 = await redis.get(key);
  expect(res1).toBeTruthy();
  await new Promise(r => setTimeout(r, 2000));
  const res2 = await redis.get(key);
  expect(res2).toBeFalsy();
  timer.distroy();
});
