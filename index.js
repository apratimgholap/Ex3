const express = require("express");
const app = express();

// Allows request from different origin
const cors = require("cors");

// Allows custom logging format
const morgan = require("morgan");

// app.use(express.static("dist"));
app.use(cors());

morgan.token("req-body", (request) => {
  return JSON.stringify(request.body);
});

const customToken = ":method :url :status :response-time :req-body";
const generateID = () => Math.floor(Math.random() * 1000);
app.use(express.json()); // very important
app.use(morgan(customToken));

// Logs no of phonebook entries and date of request made
app.get("/info", (request, response) => {
  const date = new Date().toString();
  console.log(date);
  response.send(
    `<p>Phonebook has info for ${phoneBook.length} people </p> <br\> ${date}`
  );
});

// Fetch all persons
app.get("/api/persons", (request, response) => {
  response.json(phoneBook);
});

// Fetch a particular person
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id); // Always rememebr url params are string!s
  const result = phoneBook.find((entry) => entry.id === id);

  if (result) {
    return response.json(result);
  }

  response.status(404).end();
});

// Deletes entry
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  console.log(id);
  phoneBook = phoneBook.filter((note) => note.id !== id);
  console.log(phoneBook);
  response.status(204).end();
});

// Create a new person
app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  }
  // check if name already exists

  const nameExists = phoneBook.find((entry) => entry.name == body.name);

  if (nameExists) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }

  const obj = {
    id: generateID(),
    name: body.name,
    number: body.number,
  };

  phoneBook = phoneBook.concat(obj);

  response.status(201).end();
});

// We have hardcoded data in server itself
// We could have stored data in database!
let phoneBook = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

// process.env.PORT allows the webserver to assign available port
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
