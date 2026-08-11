import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

export const isR2Configured = () => {
  return Boolean(
    accountId &&
      accessKeyId &&
      secretAccessKey &&
      bucketName &&
      !accountId.includes('your_cloudflare_account') &&
      !accessKeyId.includes('your_r2_access_key')
  );
};

let s3Client = null;

if (isR2Configured()) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: accessKeyId,
      secretAccessKey: secretAccessKey,
    },
  });
}

export const uploadToR2 = async (fileBuffer, originalName, mimeType) => {
  if (!s3Client || !isR2Configured()) {
    throw new Error('Cloudflare R2 is not fully configured in server/.env');
  }

  const ext = path.extname(originalName).toLowerCase();
  const uniqueFilename = `uploads/img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueFilename,
    Body: fileBuffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  const baseUrl = publicUrl ? publicUrl.replace(/\/$/, '') : `https://${bucketName}.${accountId}.r2.dev`;
  return `${baseUrl}/${uniqueFilename}`;
};
