const express = require("express");
const serverless = require("serverless-http");
const { faker } = require('@faker-js/faker');

// Initialize with a fixed seed for consistent data
faker.seed(123); // Any number for consistent results

// Generate users once
const allUsers = Array.from({ length: 23214 }, () => ({
  id: faker.string.uuid().substring(0, 11),
  organization: faker.company.name(),
  personalInfo: {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    profileImage: "https://i.ibb.co/sJ29kFkQ/image.png",
    gender: faker.helpers.arrayElement(["male", "female", "other"]),
    maritalStatus: faker.helpers.arrayElement(["single", "married", "divorced"]),
    children: faker.number.int({ min: 0, max: 5 }),
    residenceType: faker.helpers.arrayElement(["owned", "rented", "family"]),
  },
  account: {
    tier: faker.helpers.arrayElement([1, 2, 3]),
    balance: parseFloat(faker.finance.amount({ min: 1000, max: 100000 })),
    number: faker.finance.accountNumber(10),
    bank: faker.finance.accountName(), // Using company name for bank
    bvn: faker.string.numeric(11),
  },
  employment: {
    company: faker.company.name(),
    position: faker.person.jobTitle(),
    sector: faker.commerce.department(),
    duration: faker.number.int({ min: 1, max: 15 }),
    income: parseFloat(faker.finance.amount({ min: 20000, max: 250000 })),
  },
  education: {
    level: faker.helpers.arrayElement(["high-school", "bachelors", "masters", "phd"]),
    institution: faker.company.name(),
    graduationYear: faker.date.past({ years: 20 }).getFullYear(),
  },
  socials: {
    twitter: faker.internet.username(),
    facebook: faker.internet.username(),
    instagram: faker.internet.username(),
    linkedin: faker.internet.username(),
  },
  guarantors: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
    name: faker.person.fullName(),
    relationship: faker.helpers.arrayElement(["Parent", "Sibling", "Friend", "Colleague"]),
    phone: faker.phone.number(),
    email: faker.internet.email(),
  })),
  meta: {
    email: faker.internet.email(),
    phone: faker.phone.number(),
    joined: faker.date.past({ years: 5 }).toISOString(),
    status: faker.helpers.arrayElement(["active", "inactive", "blacklisted", "pending"]),
    loanAmount: faker.helpers.maybe(() => 0, { probability: 0.3 }) ?? 
                parseFloat(faker.finance.amount({ min: 5000, max: 50000 })),
    savingsAmount: faker.helpers.maybe(() => 0, { probability: 0.3 }) ?? 
                  parseFloat(faker.finance.amount({ min: 1000, max: 100000 })),
  }
}));

const app = express();
const router = express.Router();

// Add middleware to parse JSON bodies
app.use(express.json());

router.get("/", (req, res) => {
  res.json({ message: "Hello from Express on Netlify!" });
});

// Get paginated users
router.get("/users", (req, res) => {
  const count = parseInt(req.query.count) || 100;
  res.json(allUsers.slice(0, count));
});

// Get single user by ID
router.get("/users/:id", (req, res) => {
  const user = allUsers.find(u => u.id === req.params.id);
  user ? res.json(user) : res.status(404).send("User not found");
});

// Update user status
router.patch("/users/:id", (req, res) => {
  const user = allUsers.find(u => u.id === req.params.id);
  if (!user) return res.status(404).send("User not found");
  
  if (req.body.status) {
    user.meta.status = req.body.status;
  }
  
  res.json(user);
});

// Get current user (first user in array)
router.get("/me", (req, res) => {
  res.json(allUsers[0]);
});

app.use("/.netlify/functions/server", router);

module.exports.handler = serverless(app);
