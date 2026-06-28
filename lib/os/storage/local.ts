import { mkdir, writeFile } from "fs/promises";
import path from "path";
import type { StorageProvider, StorageUploadInput, StorageUploadResult } from "@/lib/os/storage/types";

export class LocalStorageProvider implements StorageProvider {
  readonly name = "local";

  isConfigured(): boolean {
    return true;
  }

  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const safeName = path.basename(input.filename);
    const filepath = path.join(uploadsDir, safeName);
    await writeFile(filepath, input.buffer);

    return {
      url: `/uploads/${safeName}`,
      provider: this.name,
    };
  }
}
