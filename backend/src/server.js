// Entry point of the backend
// Starts the Express server

require("dotenv").config();

const app = require("./app");
const { PORT } = require("./config/server.config");

// Ensure the database file and table are created before the server starts
require("./database/db");

app.listen(PORT, () => {
  console.log(`Use Case Management API running on http://localhost:${PORT}`);
});
