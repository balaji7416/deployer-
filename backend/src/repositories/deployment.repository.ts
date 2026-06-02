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

export const getDeploymentLogs = async (id: string) => {
  const query = `
    select build_logs from deployments
    where id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const createDeployment = async (
  repo_url: string,
  repo_name: string | null,
) => {
  const query = `
        insert into deployments (repo_url, repo_name) values ($1, $2) returning *
    `;
  const { rows } = await pool.query(query, [repo_url, repo_name]);
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

export const deploymentRepo = {
  getAllDeployments,
  getDeploymentById,
  getDeploymentLogs,
  createDeployment,
  updateDeployment,
};
