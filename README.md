# Greenis Cache manager

Based on Redis.
Implements the following commands:

- PING
- SET (key, value)
- SET (key, value, 'EX', time)
- GET (key)
- DEL (key)
- DBSIZE
- INCR (key)
- ZADD (key, score, member)
- ZCARD (key)
- ZRANK (key, member)
- ZRANGE (key, start, stop)

#### And an extra command which returns all stored values:

- ALL

For more information on the sintax for these commands,
check [here](http://redis.io/commands)
