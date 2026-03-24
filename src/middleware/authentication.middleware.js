import {
  decodeToken,
  tokenTypeEnum,
  verifyToken,
} from "../utils/security/token.js";

export const authentication = ({ tokenType = tokenTypeEnum.access } = {}) => {
  return async (req, res, next) => {
    try {
      const { user, decoded } = await decodeToken({
        next,
        tokenType: tokenType,
        authorization: req.headers.authorization,
      });
      req.user = user;
      req.decoded = decoded;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

export const authorization = ({ role = [] } = {}) => {
  return async (req, res, next) => {
    try {
      const checkAuthorization = role.includes(req.user.role);
      if (!checkAuthorization) {
        return next(
          new Error("Notttt authorized", {
            cause: 403,
          }),
        );
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
