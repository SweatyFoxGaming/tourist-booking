import { put } from "@vercel/blob";
import type { StorageProvider, StorageUploadInput, StorageUploadResult } from "@/lib/os/storage/types";

export class VercelBlobStorageProvider implements StorageProvider {
  readonly name = "vercel-blob";

  isConfigured(): boolean {
    return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
  }

  async upload(input: StorageUploadInput): Promise<StorageUploadResult> {
    const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
    if (!token) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not configured");
    }

    const blob = await put(input.filename, input.buffer, {
      access: "public",
      token,
      contentType: input.contentType,
      addRandomSuffix: true,
    });

    return {
      url: blob.url,
      provider: this.name,
    };
  }
}
