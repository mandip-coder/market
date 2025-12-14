import { availableMethods, proxyAPI } from "@/lib/proxy";
import { NextRequest, NextResponse } from "next/server";

const getParams = (params: any): string => "/" + params.path.join("/");

const handler = (method: availableMethods) =>
  async (req: NextRequest, { params }: { params: any }) => {
    const p=await params;
    try {
      const path = getParams(p);
      return proxyAPI(req, path, method);
    } catch (error) {
      console.error(`Error in ${method} handler:`, error);
      return new NextResponse(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  };

export const GET = handler("GET");
export const POST = handler("POST");
export const PUT = handler("PUT");
export const DELETE = handler("DELETE");
export const OPTIONS = handler("OPTIONS");
export const PATCH = handler("PATCH");