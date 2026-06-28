import { LocalStorageProvider } from "@/lib/os/storage/local";
import { VercelBlobStorageProvider } from "@/lib/os/storage/vercel-blob";
import type { StorageProvider, StorageUploadInput, StorageUploadResult } from "@/lib/os/storage/types";

const vercelBlob = new VercelBlobStorageProvider();
const local = new LocalStorageProvider();

function getActiveProvider(): StorageProvider {
  if (vercelBlob.isConfigured()) {
    return vercelBlob;
  }
  return local;
}

export function getStorageProvider(): StorageProvider {
  return getActiveProvider();
}

export function isRemoteStorageConfigured(): boolean {
  return vercelBlob.isConfigured();
}

export async function uploadFile(
  input: StorageUploadInput
): Promise<StorageUploadResult> {
  return getActiveProvider().upload(input);
}

export const ALLOWED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type { StorageProvider, StorageUploadInput, StorageUploadResult };
