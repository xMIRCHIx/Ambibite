import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || "ambibite";
const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://pub-6173aeb8009d4efd9966052cb0ea9b71.r2.dev";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split(".").pop() || "jpg";
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
    const uniqueKey = `food/${Date.now()}_${cleanFileName}.${extension}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueKey,
        Body: buffer,
        ContentType: file.type || "image/jpeg",
      })
    );

    const fileUrl = `${publicUrl.replace(/\/$/, "")}/${uniqueKey}`;

    return NextResponse.json({
      success: true,
      message: "Image uploaded to Cloudflare R2 successfully!",
      url: fileUrl,
      key: uniqueKey,
    });
  } catch (error: any) {
    console.error("R2 Upload Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image to R2" },
      { status: 500 }
    );
  }
}
