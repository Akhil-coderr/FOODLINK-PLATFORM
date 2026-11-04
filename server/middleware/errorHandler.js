const isMongoConnectionError = (err) =>
  Boolean(
    err &&
      (err.name === 'MongoServerSelectionError' ||
        err.name === 'MongoNetworkError' ||
        /MongoServerSelectionError|MongoNetworkError|Client network socket disconnected|secure TLS connection|ECONNRESET|ECONNREFUSED|ENOTFOUND|querySrv/i.test(
          err.message || ''
        ))
  );

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Database outages are expected in development; keep the log short and
  // return 503 instead of dumping a huge Mongoose stack trace.
  if (isMongoConnectionError(err)) {
    console.error(`⚠️  Database temporarily unavailable: ${err.message}`);
    return res.status(503).json({
      success: false,
      message: 'Database temporarily unavailable. Please try again in a moment.',
    });
  }

  // Log error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error Caught:', err);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    if (field === 'email' || (err.keyPattern && err.keyPattern.email)) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please sign in instead.',
      });
    }
    const message = `Duplicate value entered for ${field}: "${err.keyValue ? err.keyValue[field] : ''}". Please use another value.`;
    return res.status(400).json({ success: false, message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Multer file upload error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File size exceeds maximum 5MB limit.' });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
