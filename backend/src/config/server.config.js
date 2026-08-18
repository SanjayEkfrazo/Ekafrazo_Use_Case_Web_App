// Configuration values for the Express server

const rawClientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

module.exports = {
  PORT: process.env.PORT || 5000,
  CLIENT_ORIGIN: rawClientOrigin
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
