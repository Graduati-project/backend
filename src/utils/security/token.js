import jwt from "jsonwebtoken";
import * as dbService from "../../config/db.service.js";
import { UserModel } from "../../config/models/user.model.js";
import { TokenModel } from "../../config/models/token.model.js";
import { log } from "console";
export const tokenTypeEnum = { access: "access", refresh: "refresh" };
export const logoutEnum = {
  signOutFromAll: "allDevices",
  signout: "signout",
  stayLoggedIn: "",
};

export const decodeToken = async ({
  next,
  tokenType = tokenTypeEnum.access,
  authorization = "",
} = {}) => {
  try {
    const [bearer, token] = authorization.split(" ") || [];
    if (!bearer || !token || bearer !== "Bearer") {
      return next(
        new Error("Missing or invalid Bearer token or invalid token", {
          cause: 401,
        }),
      );
    }

    const secretKey =
      tokenType === tokenTypeEnum.access
        ? process.env.ACCESS_USER_TOKEN_SIGNATURE
        : process.env.REFRESH_USER_TOKEN_SIGNATURE;

    const decoded = await verifyToken({ token, secretKey });
    const checkTokenLogout = await dbService.findOne({
      model: TokenModel,
      filter: {
        jti: decoded.jti,
      },
    });
    if (checkTokenLogout) {
      return next(new Error("Invalid Login credentials", { cause: 401 }));
    }

    if (!decoded?.id) {
      return next(new Error("Invalid token", { cause: 401 }));
    }
    const user = await dbService.findById({
      model: UserModel,
      id: decoded.id,
    });
    if (!user || user.isDeleted) {
      return next(new Error("User not found", { cause: 404 }));
    }

    if (user.changeCredentialsTime?.getTime() > decoded.iat * 1000) {
      return next(new Error("Invalid Login credentials", { cause: 401 }));
    }

    return { user, decoded };
  } catch (error) {
    return next(new Error(error.message, { cause: 401 }));
  }
};

export const generateAccessToken = ({
  payload,
  secretKey = process.env.ACCESS_USER_TOKEN_SIGNATURE,
  options = {},
}) => {
  return jwt.sign(payload, secretKey, {
    expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
    ...options,
  });
};

export const generateRefreshToken = ({
  payload,
  secretKey = process.env.REFRESH_USER_TOKEN_SIGNATURE,
  options = {},
}) => {
  return jwt.sign(payload, secretKey, {
    expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
    ...options,
  });
};

export const verifyToken = async ({
  token,
  secretKey = process.env.ACCESS_USER_TOKEN_SIGNATURE,
} = {}) => {
  return jwt.verify(token, secretKey);
};

export const extractBearerToken = (authorization = "") => {
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer" || !token) {
    throw new Error("Missing or invalid Bearer token");
  }
  return token;
};

export const revokeToken = async ({ req } = {}) => {
  const revokToken = await dbService.create({
    model: TokenModel,
    data: [
      {
        jti: req.decoded.jti,
        expiresIn:
          req.decoded.iat + Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
        userId: req.decoded.id,
      },
    ],
  });
  if (!revokToken) {
    return next(new Error("Failed to revoke token", { cause: 400 }));
  }
};
