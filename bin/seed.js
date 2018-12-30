#!/usr/bin/env node

const { db, Todo, User } = require('../server/db/models');

const seed = async () => {
  await db.sync({ force: true });

  await Todo.create({
    name: 'Buy dog food',
    assignee: 'Cody',
  });

  await Todo.create({
    name: 'Take over world',
    assignee: 'Cody',
  });

  db.close();
  console.log(`

    Seeding successful!
    Time to do stuff!

  `);
};

seed().catch(err => {
  db.close();
  console.log(`

    Error seeding:

    ${err.message}

    ${err.stack}

  `);
});
