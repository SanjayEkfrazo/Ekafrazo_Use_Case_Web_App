// Configuration values for the SQLite database
// Keeping config in one place makes it easy to change later

const path = require("path");

// The SQLite database file will be created inside the backend folder
const DB_PATH = path.join(__dirname, "..", "..", "usecases.db");

module.exports = {
  DB_PATH,
};
