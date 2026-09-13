function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  // MySQL Duplicate Entry (e.g. unique email or registration number)
  if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
    return res.status(409).json({
      message: 'Duplicate resource already exists'
    });
  }

  // MySQL Foreign Key Constraint violation
  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.errno === 1452) {
    return res.status(400).json({
      message: 'Referenced record does not exist'
    });
  }

  if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.errno === 1451) {
    return res.status(400).json({
      message: 'Cannot delete: record is referenced by existing bookings'
    });
  }

  // JWT Token errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Invalid or expired token'
    });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
}

module.exports = { notFound, errorHandler };
