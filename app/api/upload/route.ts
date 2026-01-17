import { NextRequest } from "next/server";
import { auth } from "@/lib/authOptions";

const SERVER_URL = process.env.BACKEND_URL;

export const runtime = "nodejs"; // REQUIRED
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authUser = await auth();
  const accessToken = authUser?.accessToken;

  if (!accessToken) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
    });
  }
  try {
    const backendRes = await fetch(`${SERVER_URL}/files/upload`, {
      method: "POST",
      headers: {
        "content-type": req.headers.get("content-type") || "",
        authorization: `Bearer ${accessToken}`,
      },
      body: req.body,
      duplex: "half",
    } as RequestInit);

    return new Response(backendRes.body, {
      status: backendRes.status,
      headers: backendRes.headers,
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: "Error uploading file" }), {
      status: 500,
    });
  }
}