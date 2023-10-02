/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

console.log("Connecting to", url);

mongoose
  .connect(url)
  .then((result) => console.log("Connected to MongoDB"))
  .catch((error) =>
    console.error("Error connecting to MongoDb", error.message)
  );

const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String,
});

// changes the format of object returned by the query
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    //Need to recheck if commenting was the right decision
    // returnedObject.id = returnedObject._id.toString();
    // delete returnedObject._id; //deleting id from view
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);

// const Person = mongoose.model("Person", personSchema);

// **** Command line utility to add documents to Persons Collection

// if (process.argv.length < 3) {
//   console.log("give password as argument");
//   process.exit(1);
// }

// if (process.argv.length < 4) {
//   Person.find({}).then((result) => {
//     result.forEach((person) => {
//       console.log(`${person.id} ${person.name} ${person.number}`);
//     });
//     mongoose.connection.close();
//   });
// }

// const password = process.argv[2];
// const name = process.argv[3];
// const number = process.argv[4];
// const id = Math.floor(Math.random() * 1000);

// const person = new Person({
//   id: id,
//   name: name,
//   number: number,
// });

// person.save().then((result) => {
//   console.log("person saved!");
//   mongoose.connection.close();
// });
