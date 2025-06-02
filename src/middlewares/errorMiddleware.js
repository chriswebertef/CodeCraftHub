/**
 * Global error handling middleware
 * @param {*} err
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const handleErrors = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message
  });
};

module.exports = {
  handleErrors
};