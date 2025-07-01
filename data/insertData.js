const fs = require("fs");
const tourModel = require("../models/toursModel");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");

console.log(process.env.CONNECTION_STRING);

const CONNECTION_STRING = process.env.CONNECTION_STRING.replace(
  "DB_PASSWORD",
  process.env.DB_PASSWORD
);

mongoose.connect(CONNECTION_STRING).then(() => {
  console.log("DB connection successful");
});

const toursJSON = JSON.parse(
  fs.readFileSync(`${__dirname}/data.json`, "utf-8")
);

async function insertdata() {
  const insertedData = await tourModel.insertMany(toursJSON);
}
insertdata();
