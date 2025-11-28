import jwt from "jsonwebtoken";

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_USER_TOKEN_SIGNATURE, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.REFRESH_USER_TOKEN_SIGNATURE, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
};

export const verifyToken = (token, type = "access") => {
  const secret =
    type === "access"
      ? process.env.ACCESS_USER_TOKEN_SIGNATURE
      : process.env.REFRESH_USER_TOKEN_SIGNATURE;

  if (!token || token.split(".").length !== 3) {
    throw new Error("Invalid token");
  }

  return jwt.verify(token, secret);
};

export const extractBearerToken = (authorization = "") => {
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer" || !token) {
    throw new Error("Missing or invalid Bearer token");
  }
  return token;
};
