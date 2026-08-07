// Catch-all error handler
// Any error not handled inside a controller ends up here

function errorHandler(err, req, res, next) {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Image must be 5MB or smaller" });
  }

  if (err && err.message === "Only image files are allowed") {
    return res.status(400).json({ message: err.message });
  }

  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
}

// Handle requests to routes that do not exist
function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

module.exports = { errorHandler, notFoundHandler };
