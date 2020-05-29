/*
 * Factory for the cache object
 *
 * The function has a "cache" object with the stored
 * values, which are accessible by the inner functions
 *
 * It also has an array with the valid commands and
 * a funcion for checking for valid commands
 */

function cacheFactory() {
  // storage object
  this.cache = {
    chave: [
      {
        score: '11',
        member: 'minxo',
      },
      {
        score: '12',
        member: 'catorro',
      },
      {
        score: '13',
        member: 'capeta',
      },
      {
        score: '14',
        member: 'caixa',
      },
      {
        score: '21',
        member: 'cerva',
      },
    ],
  };

  // list of valid commands
  this.validCommands = [
    'ping',
    'all',
    'set',
    'get',
    'del',
    'incr',
    'dbsize',
    'zadd',
    'zcard',
    'zrank',
    'zrange',
  ];

  // checks if command is valid
  const cmdIsValid = cmd => {
    return this.validCommands.includes(cmd);
  };

  //* PING
  const ping = () => {
    return ['pong', 200];
  };

  //* GETTERS
  // returns all values
  const all = () => [this.cache, 200];

  const get = key => {
    if (typeof this.cache[key] === 'object') {
      return [
        'WRONGTYPE Operation against a key holding the wrong kind of value',
        400,
      ];
    }

    if (this.cache[key]) {
      return [this.cache[key], 200];
    }

    return ['(nil)', 404];
  };

  const dbsize = () => {
    let counter = 0;
    const keys = Object.keys(this.cache);

    for (let i = 0; i < keys.length; i += 1) {
      if (typeof this.cache[keys[i]] === 'object') {
        counter += this.cache[keys[i]].length;
      } else {
        counter += 1;
      }
    }

    return [counter, 200];
  };

  const zcard = key => {
    if (!this.cache[key]) {
      return ['0', 404];
    }

    if (typeof this.cache[key] !== 'object') {
      return [
        'WRONGTYPE Operation against a key holding the wrong kind of value',
        400,
      ];
    }

    return [this.cache[key].length, 200];
  };

  const zrank = (key, member) => {
    if (typeof this.cache[key] !== 'object') {
      return [
        'WRONGTYPE Operation against a key holding the wrong kind of value',
        400,
      ];
    }

    const memberIndex = this.cache[key].findIndex(
      item => item.member === member
    );

    if (!this.cache[key] || memberIndex === -1) {
      return ['(nil)', 404];
    }

    return [memberIndex, 404];
  };

  const zrange = (key, start, stop) => {
    if (isNaN(start) || isNaN(stop)) {
      return ['ERR range argument is not a number', 400];
    }

    if (!this.cache[key]) {
      return [[], 404];
    }

    if (typeof this.cache[key] !== 'object') {
      return [
        'WRONGTYPE Operation against a key holding the wrong kind of value',
        400,
      ];
    }

    let end;
    if (+stop < 0) {
      end = this.cache[key].length + 1 + stop;
    }

    const range = this.cache[key].slice(start, end);

    return [range, 200];
  };

  //* SETTERS
  // SET key value [EX seconds]
  const set = (key, value, EX, seconds) => {
    if (EX && !seconds) {
      return ['ERR wrong arguments', 400];
    }
    if (seconds && isNaN(seconds)) {
      return ['ERR seconds is not a valid float', 400];
    }

    this.cache[key] = value;

    if (EX) {
      setTimeout(
        () => delete this.cache[key],
        seconds * 1000
      );
    }

    return ['OK', 201];
  };

  const zadd = (key, score, member) => {
    if (!score || !member) {
      return ['ERR wrong number of arguments'];
    }

    // returns error if score is not a number
    if (isNaN(score)) {
      return ['ERR value is not a valid float', 400];
    }

    const newMember = {
      score,
      member,
    };
    const oldZ = this.cache[key];
    // check if Z set exists and key is not assigned
    if (oldZ === undefined) {
      this.cache[key] = [newMember];
      return ['1', 201];
    }
    if (typeof oldZ !== 'object') {
      return [
        'WRONGTYPE Operation against a key holding the wrong kind of value',
        400,
      ];
    }

    // runs through the set and adds to newZ[] in correct place
    const newZ = [];
    let inserted = false;
    for (let i = 0; i < oldZ.length; i += 1) {
      if (
        (!inserted && score < oldZ[i].score) ||
        (score === oldZ[i].score &&
          member < oldZ[i].member &&
          !inserted)
      ) {
        inserted = true;
        newZ.push(newMember);
      }
      newZ.push(oldZ[i]);
    }
    if (!inserted) {
      newZ.push(newMember);
    }

    this.cache[key] = newZ;

    return ['1', 201];
  };

  const incr = key => {
    if (!this.cache[key]) {
      this.cache[key] = 1;
      return ['1', 201];
    }

    if (isNaN(this.cache[key])) {
      return [
        'ERR value is not an integer or out of range',
        405,
      ];
    }

    this.cache[key] += 1;

    return [this.cache[key], 200];
  };

  //* DELETE
  const del = key => {
    if (!this.cache[key]) {
      return ['0', 404];
    }

    delete this.cache[key];

    return ['1', 200];
  };

  return {
    ping,
    cmdIsValid,
    all,
    set,
    get,
    del,
    dbsize,
    incr,
    zadd,
    zcard,
    zrank,
    zrange,
  };
}

module.exports = cacheFactory();
