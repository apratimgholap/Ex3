// Allows request from different origin
const cors = require("cors");
const express = require("express");
const app = express();
const Person = require("./models/mongo");
const PORT = process.env.PORT;

// Allows custom logging format
const morgan = require("morgan");

// fetching enviornment variables
require("dotenv").config();
app.use(express.static("dist"));
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
  Person.find({}).then((person) => {
    response.send(
      `<p>Phonebook has info for ${person.length} people </p> <br\> ${date}`
    );
  });
});

// Fetch all persons
app.get("/api/persons", (request, response) => {
  Person.find({}).then((person) => {
    response.json(person);
  });
});

// Fetch a particular person
app.get("/api/persons/:id", (request, response, next) => {
  const id = Number(request.params.id); // Always rememebr url params are string!s
  Person.find({ id: id })
    .then((person) => {
      // MongoDb query returns back a array
      console.log(person);
      if (person.length) {
        // due our logic we can have same ids hence >=1
        return response.json(...person); // should return element not array as it contains single element
      } else {
        return response.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
      // Now the error is handled by global error handler
      // console.log(error);
      // response.status(400).send({ error: "malformatted id" });
    });
});

// Deletes entry
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  console.log(id);
  Person.deleteOne({ id: { $eq: id } })
    .then(() => {
      return response.status(204).end();
    })
    .catch((error) => next(error));
});

// Create a new person
app.post("/api/persons", (request, response) => {
  const body = request.body;

  // We should have both name and number
  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  // check if name already exists
  Person.find({ name: body.name }).then((person) => {
    console.log(person);

    // We are handling person exists in frontend still we have included
    // the code in backend just in case we miss something

    // Person already exists
    if (person.length) {
      return response.status(400).json({
        error: "name must be unique",
      });
    }

    // Person does not exist
    else {
      const person = new Person({
        id: generateID(),
        name: body.name,
        number: body.number,
      });

      person.save().then((result) => {
        console.log("person saved!");
        response.status(201).end();
      });
    }
  });
});

//updates a person
app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const id = Number(request.params.id); // Always rememebr url params are string!s

  Person.find({ id: id })
    .then((person) => {
      person = person[0]; // MongoDb query returns back a array
      if (person) {
        const update = new Person({
          _id: person._id,
          name: body.name || person.name,
          number: body.number || person.number,
        });
        return update;
      }
    })
    .then((update) => {
      Person.findByIdAndUpdate(update._id, update, { new: true })
        .then((updatedDocument) => {
          console.log(updatedDocument);
          return response.json(updatedDocument).end();
        })
        .catch((error) => {
          next(error);
        });
    });
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

// process.env.PORT allows the webserver to assign available port
// const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
