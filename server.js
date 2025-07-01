const dotenv = require("dotenv");
dotenv.config({
  path: "./config.env",
});
const app = require("./app");
const mongoose = require("mongoose");

const CONNECTION_STRING = process.env.CONNECTION_STRING.replace(
  "DB_PASSWORD",
  process.env.DB_PASSWORD
);

mongoose
  .connect(CONNECTION_STRING)
  .then(() => {
    console.log("DB connection successful");
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
