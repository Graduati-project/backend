
import { asyncHandler, successResponse } from "../../utils/response/respone.js";

export const profile = asyncHandler(async (req, res, next) => {
  return successResponse({ res, data: req.user });
});

