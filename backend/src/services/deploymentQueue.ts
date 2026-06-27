import type { DeploymentRow } from "../types/index.js";
import { deploymentRepo } from "../repositories/deployment.repository.js";
import { startDeployment } from "./orchestrator.js";
import { logEmitter } from "../utils/logEmmiter.js";

class DeploymentQueue {
  private maxConcurrentDeployments: number;
  private activeDeployments: number;
  private queue: DeploymentRow[] = [];

  constructor(maxConcurrentDeployments: number) {
    this.maxConcurrentDeployments = maxConcurrentDeployments;
    this.activeDeployments = 0;
  }

  public async add(deployment: DeploymentRow) {
    await deploymentRepo.updateDeployment(deployment.id, { status: "queued" });

    this.queue.push(deployment);

    console.log(`[SYSTEM]: Added deployment ${deployment.id} to queue`);
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: `[SYSTEM]: Added deployment ${deployment.id} to queue`,
    });

    this.next();
  }

  private async next() {
    // Bound the concurrency pool strictly
    if (this.activeDeployments >= this.maxConcurrentDeployments) return;

    const deployment = this.queue.shift();
    if (!deployment) return;

    // Lock the concurrency slot synchronously before running async processors
    this.activeDeployments++;

    console.log(`[SYSTEM]: Starting deployment ${deployment.id}`);
    logEmitter.emit("log", {
      deploymentId: deployment.id,
      stage: "info",
      message: `[SYSTEM]: Worker is currently running your deployment pipeline`,
    });

    // Execute background worker without blocking the recursive slot scanner
    this.processDeployment(deployment);

    // Scan if more slots are open for queued items
    this.next();
  }

  private async processDeployment(deployment: DeploymentRow) {
    try {
      await startDeployment(deployment);
    } catch (e) {
      const errMsg =
        e instanceof Error
          ? e.message
          : "Deployment failed for an unknown reason";
      await deploymentRepo.updateDeployment(deployment.id, {
        status: "failed",
        error_message: errMsg,
      });
      console.log(
        `Deployment worker failed for deployment ${deployment.id}, reason: `,
        e,
      );
      logEmitter.emit("log", {
        deploymentId: deployment.id,
        stage: "failed",
        message: `[SYSTEM]: Deployment worker failed to deploy deployment ${deployment.id}, reason: ${errMsg}`,
      });
    } finally {
      // Free slot up inside the finally block so workers never choke on crashed builds
      this.activeDeployments--;
      console.log(`[SYSTEM]: Worker finished deployment ${deployment.id}`);
      this.next();
    }
  }
}

export const deploymentQueue = new DeploymentQueue(3);
