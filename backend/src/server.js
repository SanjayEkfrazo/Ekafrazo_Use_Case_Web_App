// Entry point of the backend
// Starts the Express server

require("dotenv").config();

const app = require("./app");
const { PORT } = require("./config/server.config");

// Ensure the database file and table are created before the server starts
require("./database/db");

const server = app.listen(PORT, () => {
  console.log(`Use Case Management API running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  if (error?.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the existing process or change PORT in backend/.env.`);
    process.exit(1);
  }

  throw error;
});
