# Greenis Cache manager

Based on Redis, made with Node and Express.js
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

## Usage

Clone the repository and install dependencies with
`yarn`
or
`npm i --save`

After installation, run the server with
`node src/server.js`

There is a script for this in package.json:

```
yarn start
// or
npm run start
```

The server will lisen on port 8080 of your localhost

## API

The commands can be accessed in two different ways:

### ASCII encoded strings with space-delimited parameters

The instruction and arguments must be placed in the
**cmd** query parameter:

http://localhost:8080/?cmd=*command*%20*arg1*%20*arg2*%20*arg3*%20*arg4*

For example (ommitting the base url):

- `/?cmd=set%20mykey%20myvar%20EX%2010`
  creates entry {mykey: 'myvar'}, returns 'OK', and deletes the entry in 10 seconds.
- `/?cmd=get%20mykey`
  returns 'myvar' befor the 10 seconds have passed. If time
  has expired, returns '(nil)'.
- `/?cmd=zadd%20myzset%2042%20mymember`
  adds 'mymember' with score = 42 in Z set 'myzset' (or creates it,
  if it does not exist). Returns '1'.
- `/?cmd=zrange%20myzset%200%20-1`
  returns all values of Z set 'myzset' separated by spaces.

The commands are case **insensitive**, so 'get', 'GET', 'Get' and
other variations will work. The arguments are case sensitive.

### REST http requests

The instruction and key (where appropriate) must be in in
the route parameters, arguments are passed as raw data:

http://localhost:8080/*command*/*mykey*

For passing arguments, it's necessary to use an http client.
With the exception of DEL, all commands are either PUT or GET requests:

- PUT for insertions of updates: SET, INCR, ZADD
- GET for reads: ALL, PING, GET, ZCARD, ZRANK, ZRANGE, DBSIZE
- DELETE for DEL

Here are the same examples using Curl:

- `curl -d "value=myvar&EX=true&seconds=10" -X PUT localhost:8080/set/mykey`
- `curl -X GET localhost:8080/get/mykey`
- `curl -d "score=42&member=mymember" -X PUT localhost:8080/zadd/myzset`
- `curl -d "start=0&stop=-1" -X PUT localhost:8080/zrange/myzset`

## Observations

Note that regular key-value pairs have key and value, while
Z set values have a **score** and a **member**, and correct
identification is necessary when using an http client.

Also, the ZADD command only supports one new element per
request, unlike Redis', which can take multiple.

All responses are also space-delimited encoded strings, except
for the ALL command, which returns a JSON object.

Other than that, it should behave just like Redis.

For more information on the sintax for these commands,
check [here](http://redis.io/commands)
