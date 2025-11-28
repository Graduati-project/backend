import bcrypt from "bcryptjs";

export const generateHash = (plaintext = '') => {
  if (!plaintext) throw new Error("Password is required");

  const salt = bcrypt.genSaltSync(parseInt(process.env.SALT_ROUNDS, 10) || 10);
  return bcrypt.hashSync(plaintext, salt);
};


export const compareHash = (plaintext = '', hash = '') => {
  if (!plaintext || !hash) throw new Error("Both password and hash are required");

  return bcrypt.compareSync(plaintext, hash);
};