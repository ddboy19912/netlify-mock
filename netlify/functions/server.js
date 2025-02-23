const express = require("express");
const serverless = require("serverless-http");
const { faker } = require('@faker-js/faker');

const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from Express on Netlify!" });
});

router.get("/users", (req, res) => {
  // Generate 10 random users using Faker
  const users = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true })
    }
  }));
  res.json(users);
});

app.use("/.netlify/functions/server", router);

module.exports.handler = serverless(app);
