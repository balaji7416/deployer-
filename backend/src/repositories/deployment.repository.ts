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
  env_vars?: Record<string, string>,
) => {
  const client = await pool.connect();
  try {
    client.query("begin");
    const query = `
        insert into deployments (repo_url, repo_name, user_id, root_dir) values ($1, $2, $3, $4) returning *
    `;
    const { rows } = await pool.query(query, [
      repo_url,
      repo_name,
      user_id,
      root_dir,
    ]);
    const deployment = rows[0];

    if (env_vars) {
      const insert_promises = Object.entries(env_vars).map(([key, value]) =>
        pool.query(
          `insert into env_variables (deployment_id, key, value) values ($1, $2, $3)`,
          [deployment.id, key, value],
        ),
      );
      try {
        await Promise.all(insert_promises);
      } catch (e) {
        console.log("Error inserting env variables: ", e);
        throw new Error("Error inserting env variables");
      }
    }
    await client.query("commit");
    return deployment;
  } catch (error) {
    console.log("Error creating deployment: ", error);
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
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

const getEnvVariables = async (deploymentId: string) => {
  const query = `
    select * from env_variables
    where deployment_id = $1
  `;
  const { rows } = await pool.query(query, [deploymentId]);
  return rows;
};
export const deploymentRepo = {
  getAllDeployments,
  getUserDeployments,
  getDeploymentById,
  getDeploymentLogs,
  createDeployment,
  updateDeployment,
  deleteDeployment,
  getEnvVariables,
};
