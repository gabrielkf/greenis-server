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
    sampleWord: 'sample',
    sampleNumber: '3',
    sampleZ: [
      {
        score: '11',
        member: '0',
      },
      {
        score: '12',
        member: '1',
      },
      {
        score: '13',
        member: '2',
      },
      {
        score: '14',
        member: '3',
      },
      {
        score: '21',
        member: '4',
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

  //* SETTERS
  // SET key value [EX seconds]
  const set = (key, value, EX, seconds) => {
    if (EX && !seconds) {
      return ['ERR Invalid arguments', 400];
    }
    if (seconds && isNaN(seconds)) {
      return ['ERR Seconds is not a valid float', 400];
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
      return ['ERR Invalid arguments'];
    }

    // returns error if score is not a number
    if (isNaN(score)) {
      return ['ERR Value is not a valid float', 400];
    }

    // insterted member and current Z set
    const newMember = {
      score,
      member,
    };
    const oldZ = this.cache[key];

    // check if Z set exists and key is not assigned
    if (!oldZ) {
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

    if (typeof this.cache[key] === 'object') {
      return [
        'WRONGTYPE Operation against a key holding the wrong kind of value',
        400,
      ];
    }

    if (isNaN(this.cache[key])) {
      return [
        'ERR value is not an integer or out of range',
        405,
      ];
    }

    const withIncrement = Number(this.cache[key]) + 1;
    this.cache[key] = withIncrement;

    return [String(this.cache[key]), 200];
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

    return [String(counter), 200];
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

    return [String(this.cache[key].length), 200];
  };

  const zrank = (key, member) => {
    if (typeof this.cache[key] !== 'object') {
      return [
        'WRONGTYPE Operation against a key holding the wrong kind of value',
        400,
      ];
    }

    const memberIndex = this.cache[key].findIndex(
      item => item.member === String(member)
    );

    if (!this.cache[key] || memberIndex === -1) {
      return ['(nil)', String(404)];
    }

    return [String(memberIndex), 200];
  };

  const zrange = (key, start, stop) => {
    if (isNaN(start) || isNaN(stop)) {
      return ['ERR Range argument is not a number', 400];
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

    // get members
    const members = this.cache[key].map(
      item => item.member
    );

    // adapts indexes to make .slice bahave as zrange
    const first =
      start < 0 ? members.length + +start : +start;
    const last =
      stop < 0 ? members.length + +stop + 1 : +stop + 1;

    const range = members.slice(first, last);

    return [range.toString().replace(/,/g, ' '), 200];
  };

  //* DELETE
  const del = key => {
    if (!this.cache[key]) {
      return ['0', 404];
    }

    // checks if key refers to a Z set
    if (typeof this.cache[key] === 'object') {
      return ['0', 400];
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
