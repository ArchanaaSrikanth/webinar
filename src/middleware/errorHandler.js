const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }

  if (err.code === 'ER_NO_SUCH_TABLE') {
    return res.status(500).json({ error: 'Database table not found' });
  }

  if (err.code === 'ER_DUP_ENTRY' || err.code === 'ER_BAD_FIELD_ERROR') {
    return res.status(400).json({ error: 'Invalid data provided' });
  }

  res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;