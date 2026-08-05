// Catch-all error handler
// Any error not handled inside a controller ends up here

function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
}

// Handle requests to routes that do not exist
function notFoundHandler(req, res) {
  res.status(404).json({ message: "Route not found" });
}

module.exports = { errorHandler, notFoundHandler };
