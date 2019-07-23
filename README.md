[![Build Status](https://travis-ci.org/kuyoonjo/ioredis-timer.svg?branch=master)](https://travis-ci.org/kuyoonjo/ioredis-timer.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/kuyoonjo/ioredis-timer/badge.svg?branch=master)](https://coveralls.io/github/kuyoonjo/ioredis-timer?branch=master)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

# Ioredis Timer

This module allows you do `settimeout` in cluster mode.

## Usage

```ts
import * as Redis from 'ioredis';
import { Timer } from 'ioredis-timer';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});
const timer = new Timer(redis);

timer.on('delivery', async id => {
  console('do delevery here');
  timer.finish('delivery', id);
});
timer.setTimeout('delivery', 1000);

```
