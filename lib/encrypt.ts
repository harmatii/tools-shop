import { hashSync, compareSync } from "bcrypt-ts-edge";

// Hashes a plain-text password using bcrypt with a cost factor of 10. Used at sign-up before storing in the DB.
export const hashPassword = (password: string) => hashSync(password, 10);

// Compares a plain-text password against a stored bcrypt hash. Returns true if they match. Used at sign-in.
export const comparePasswords = (plain: string, hashed: string) => compareSync(plain, hashed);
