import { pool } from "../db/pool.js";
import type {
  DeploymentCreate,
  DeploymentUpdate,
} from "../types/deployment.js";

export const getAllDeployments = async () => {
  const query = `
        select * from deployments
    `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getDeploymentById = async (id: string) => {
  const query = `
        select * from deployments 
        where id = $1
    `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const createDeployment = async (repo_url: string) => {
  const query = `
        insert into deployments (repo_url) values ($1) returning *
    `;
  const { rows } = await pool.query(query, [repo_url]);
  return rows[0];
};

export const updateDeployment = async (id: string, data: DeploymentUpdate) => {
  const keys = Object.keys(data);
  const values = Object.values(data);

  const clause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");

  const query = `
    update deployments
    set ${clause}
    where id = $${keys.length + 1}
    returning *
  `;

  const { rows } = await pool.query(query, [...values, id]);
  return rows[0];
};
