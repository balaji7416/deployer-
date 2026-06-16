import { pool } from "../db/pool.js";
import type { User } from "../types/index.js";

export const findUserByEmail = async (email: string): Promise<null | User> => {
  const query = `select * from users
                   where email = $1
                    `;
  const { rows } = await pool.query(query, [email]);
  return rows[0];
};
export const findUserByUsername = async (
  username: string,
): Promise<null | User> => {
  const query = `select * from users
                   where username = $1
                    `;
  const { rows } = await pool.query(query, [username]);
  return rows[0];
};
export const findUserById = async (id: string): Promise<null | User> => {
  const query = `select * from users
                   where id = $1
                    `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const createUser = async ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}): Promise<User> => {
  const query = `insert into users (username, email, password) values ($1, $2, $3) returning *`;
  const { rows } = await pool.query(query, [username, email, password]);
  return rows[0];
};
