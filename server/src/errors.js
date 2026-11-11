export class AppError extends Error {
  constructor(status, message, field) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

export function errorHandler(error, req, res, next) {
  if (error instanceof AppError) {
    return res.status(error.status).json({ error: { message: error.message, ...(error.field && { field: error.field }) } });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Request body must be valid JSON.' } });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: { message: 'Request body is too large.' } });
  }
  console.error(error);
  return res.status(500).json({ error: { message: 'Something went wrong. Please try again.' } });
}
