export const asyncHandler = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
};
export const globalErrorHandler = (error, req, res, next) => {
  return res.status(error.cause || 500).json({
    message: error.message,
    stack: error.stack,
  });
};

export const successResponse = ({
  res,
  message = "Success",
  statusCode = 200,
  data = {},
}) => {
  return res.status(statusCode).json({
    message,
    data,
  });
};
