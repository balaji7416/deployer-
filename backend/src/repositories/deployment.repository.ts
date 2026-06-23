import { pool } from "../db/pool.js";
import type { DeploymentCreate, DeploymentUpdate } from "../types/index.js";

export const getAllDeployments = async () => {
  const query = `
        select * from deployments
        order by created_at desc
    `;
  const { rows } = await pool.query(query);
  return rows;
};

export const getUserDeployments = async (userId: string) => {
  const query = `
        select * from deployments
        where user_id = $1
        order by created_at desc
  `;
  const { rows } = await pool.query(query, [userId]);
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
    select logs from deployments
    where id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const createDeployment = async (
  repo_url: string,
  repo_name: string | null,
  user_id: string,
  root_dir?: string,
) => {
  const query = `
        insert into deployments (repo_url, repo_name, user_id, root_dir) values ($1, $2, $3, $4) returning *
    `;
  const { rows } = await pool.query(query, [
    repo_url,
    repo_name,
    user_id,
    root_dir,
  ]);
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

export const deleteDeployment = async (id: string) => {
  const query = `
    delete from deployments
    where id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
};

export const deploymentRepo = {
  getAllDeployments,
  getUserDeployments,
  getDeploymentById,
  getDeploymentLogs,
  createDeployment,
  updateDeployment,
  deleteDeployment,
};
