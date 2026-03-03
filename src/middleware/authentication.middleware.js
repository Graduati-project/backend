import { verifyToken } from "../utils/security/token.js";
import { UserModel } from "../config/models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = verifyToken(authorization.replace("Bearer ", ""));
    if (!decoded?.id) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const user = await UserModel.findById(decoded.id);
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: err.message || "Invalid token" });
  }
};

export const checkRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return next(new Error("Not authorized", { cause: 403 }));
    }
    next();
  };
};
