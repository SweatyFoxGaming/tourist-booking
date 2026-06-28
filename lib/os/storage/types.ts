export type StorageUploadInput = {
  buffer: Buffer;
  filename: string;
  contentType: string;
};

export type StorageUploadResult = {
  url: string;
  provider: string;
};

export interface StorageProvider {
  readonly name: string;
  isConfigured(): boolean;
  upload(input: StorageUploadInput): Promise<StorageUploadResult>;
}
