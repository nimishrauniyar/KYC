function notFound(req, res) { return res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }); }

function errorHandler(error, _req, res, _next) {
  if (error.name === 'ValidationError') return res.status(400).json({ message: error.message });
  if (error.code === 11000) return res.status(409).json({ message: 'A record with this value already exists.' });
  if (process.env.NODE_ENV !== 'test') console.error(error);
  return res.status(500).json({ message: 'An unexpected error occurred.' });
}

module.exports = { notFound, errorHandler };
