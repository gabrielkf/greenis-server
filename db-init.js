// eslint-disable-next-line no-undef
db.createUser({
  user: 'iamcreator',
  pwd: 'mongopass',
  roles: [
    {
      role: 'readWrite',
      db: 'uncached-data',
    },
  ],
});
