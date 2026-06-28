import { logger } from "@/lib/os/logger";

export type JobHandler = () => void | Promise<void>;

export type EnqueueOptions = {
  name: string;
  handler: JobHandler;
  maxAttempts?: number;
  baseDelayMs?: number;
};

type QueuedJob = {
  id: string;
  name: string;
  handler: JobHandler;
  maxAttempts: number;
  baseDelayMs: number;
  attempt: number;
};

class JobQueue {
  private pending: QueuedJob[] = [];
  private running = false;

  enqueue(options: EnqueueOptions): string {
    const job: QueuedJob = {
      id: crypto.randomUUID(),
      name: options.name,
      handler: options.handler,
      maxAttempts: options.maxAttempts ?? 3,
      baseDelayMs: options.baseDelayMs ?? 500,
      attempt: 0,
    };

    this.pending.push(job);
    logger.debug("os.queue", "Job enqueued", {
      jobId: job.id,
      name: job.name,
      pending: this.pending.length,
    });

    void this.drain();
    return job.id;
  }

  get size(): number {
    return this.pending.length;
  }

  private async drain(): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;

    while (this.pending.length > 0) {
      const job = this.pending.shift();
      if (!job) {
        break;
      }

      job.attempt += 1;
      const startedAt = Date.now();

      try {
        await job.handler();
        logger.info("os.queue", "Job completed", {
          jobId: job.id,
          name: job.name,
          attempt: job.attempt,
          durationMs: Date.now() - startedAt,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (job.attempt < job.maxAttempts) {
          const delayMs = job.baseDelayMs * 2 ** (job.attempt - 1);
          logger.warn("os.queue", "Job failed, retrying", {
            jobId: job.id,
            name: job.name,
            attempt: job.attempt,
            maxAttempts: job.maxAttempts,
            delayMs,
            error: message,
          });

          await sleep(delayMs);
          this.pending.unshift(job);
          continue;
        }

        logger.error("os.queue", "Job failed permanently", {
          jobId: job.id,
          name: job.name,
          attempt: job.attempt,
          error: message,
        });
      }
    }

    this.running = false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const jobQueue = new JobQueue();
