import cron from 'node-cron';
import { DockerOrchestrator } from './docker';
import { BackupEngine } from './backup-engine';

export interface ScheduledTask {
  id: string;
  serverId: string;
  name: string;
  cronExpression: string;
  action: 'RESTART' | 'BACKUP' | 'COMMAND' | 'STOP' | 'START';
  commandPayload?: string;
}

export class PersistentScheduler {
  private static instance: PersistentScheduler;
  private activeJobs: Map<string, cron.ScheduledTask> = new Map();
  private orchestrator: DockerOrchestrator;

  private constructor() {
    this.orchestrator = DockerOrchestrator.getInstance();
  }

  public static getInstance(): PersistentScheduler {
    if (!this.instance) {
      this.instance = new PersistentScheduler();
    }
    return this.instance;
  }

  public registerJob(task: ScheduledTask): boolean {
    if (!cron.validate(task.cronExpression)) {
      console.error(`Invalid cron expression: ${task.cronExpression}`);
      return false;
    }

    // Cancel existing if replacing
    this.cancelJob(task.id);

    const job = cron.schedule(task.cronExpression, async () => {
      console.log(`[Scheduler] Executing task "${task.name}" (${task.action}) for server ${task.serverId}`);
      this.orchestrator.appendLog(task.serverId, `[Scheduled Task: "${task.name}"] Initiating ${task.action}...`);

      try {
        switch (task.action) {
          case 'RESTART':
            await this.orchestrator.restartServer(task.serverId);
            break;
          case 'STOP':
            await this.orchestrator.stopServer(task.serverId);
            break;
          case 'START':
            await this.orchestrator.startServer(task.serverId);
            break;
          case 'BACKUP': {
            const backupEngine = new BackupEngine(task.serverId);
            const type = (task.commandPayload as any) || 'FULL';
            const res = await backupEngine.createBackup(type);
            this.orchestrator.appendLog(
              task.serverId,
              `[Scheduled Task: "${task.name}"] Backup completed: ${res.fileName} (${(res.sizeBytes / 1024 / 1024).toFixed(1)}MB)`
            );
            break;
          }
          case 'COMMAND':
            if (task.commandPayload) {
              this.orchestrator.appendLog(
                task.serverId,
                `[Scheduled Task: "${task.name}"] Executing: ${task.commandPayload}`
              );
            }
            break;
        }
      } catch (err: any) {
        this.orchestrator.appendLog(
          task.serverId,
          `[Scheduled Task Error: "${task.name}"] Execution failed: ${err.message}`
        );
      }
    });

    this.activeJobs.set(task.id, job);
    return true;
  }

  public cancelJob(taskId: string): void {
    const existing = this.activeJobs.get(taskId);
    if (existing) {
      existing.stop();
      this.activeJobs.delete(taskId);
    }
  }

  public getActiveCount(): number {
    return this.activeJobs.size;
  }
}
