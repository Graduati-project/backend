import { roleenum } from "../../config/models/user.model.js";
import { deleteAccount } from "./user.validation.js";

export const endPoint = {
  restoreAccount: [roleenum.admin],
  deleteAccount: [roleenum.admin],
  getAllUsers: [roleenum.admin],
};
