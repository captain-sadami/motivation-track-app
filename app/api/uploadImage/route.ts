export const runtime = "nodejs";

import { NextResponse } from "next/server";

import * as objectstorage from "oci-objectstorage";
import * as common from "oci-common";

import { getAppUser } from "@/lib/getAppUser";
import { createSupabaseServer } from "@/lib/supabaseServer"


export async function POST(req: Request) {
  // User authentication is the first todo
  const user = await getAppUser();
  if (!user) { 
    console.log("1")
    return new Response("Unauthorized", {status: 401});
  }
  const { appUserId } = user;

  // start file manipulation
  const form = await req.formData();
  const file = form.get("image") as File | null;
  const impulseType = form.get("impulseType") as string | null;

  if (!file || !impulseType) {
    console.log("2")
    return NextResponse.json({ error: "invalid" }, {status: 400});
  }

  // convert arraybuffer to the node.js buffer in order to put oci objectstrage api.
  const buffer = Buffer.from(await file.arrayBuffer());
  
  // get file extension
  const originalFileName = file.name; // e.g. cat.png
  const imageUUID=crypto.randomUUID();
  const ext = originalFileName.split(".").pop(); //png
  const objectName = `${appUserId}/${impulseType}/${imageUUID}.${ext}`;

  // construct objecct storage client
  //const provider = new common.ConfigFileAuthenticationDetailsProvider(
  //  "/home/node/.oci/config",
  //  "DEFAULT"
  //);

  const privateKey = process.env.OCI_PRIVATE_KEY!.replace(/\\n/g, '\n');

  const provider = new common.SimpleAuthenticationDetailsProvider(
  process.env.OCI_TENANCY_ID!,
  process.env.OCI_USER_ID!,
  process.env.OCI_FINGERPRINT!,
  privateKey,
  process.env.OCI_PASSPHRASE || null,
  common.Region.AP_OSAKA_1
);


  const client = new objectstorage.ObjectStorageClient({
      authenticationDetailsProvider: provider,
  });
  
  try {
    await client.putObject({
      namespaceName: process.env.OCI_OS_NAMESPACE!,
      bucketName: "image-bucket",
      objectName,
      putObjectBody: buffer,
      contentType: file.type,
    })
    console.log("OCI Upload Success");
  } catch (err) {
    console.log("OCI Error", err);
    return NextResponse.json({ error: "OCI Upload Failed" }, { status: 500 });
  }

  const title = await form.get("title") as string | null;
  const supabase = createSupabaseServer();
  const { error } = await supabase
    .from("impulses")
    .insert({
      user_id: appUserId,
      impulse_type: impulseType,
      file_name: `${imageUUID}.${ext}`,
      title: title
    });
  
  if (error) {
    console.error(error);
    return new Response("Error", { status:500 })
  }

  return NextResponse.json({ ok: true, objectName });
}