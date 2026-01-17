"use server"

import { SERVERAPI } from "@/Utils/apiFunctions";
import { Company } from "@/app/(main)/master/company-master/services/company.types";
import { APIPATH } from "@/shared/constants/url";
import { jwtDecode } from "jwt-decode";

interface RefreshTokenResponse {
  status: boolean;
  message: string;
  data?: {
    refreshToken: string;
    user?: {
      userUUID: string;
      fullName?: string;
      email?: string;
      companies?: Company[];
    };
  };
}

export async function refreshTokenAction(companyUUID: string) {
  try {
    const res = await SERVERAPI<RefreshTokenResponse>(APIPATH.REFRESH_TOKEN, {
      method: "POST",
      body: JSON.stringify({ companyUUID }),
    });

    if (!res.status || !res.data?.refreshToken) {
      return {
        success: false,
        error: res.message || "Failed to refresh token",
      };
    }

    // Decode the new token to get expiration time
    let decodedToken: { exp?: number } | null = null;
    try {
      decodedToken = jwtDecode(res.data.refreshToken);
    } catch (e) {
      return {
        success: false,
        error: "Invalid token format received",
      };
    }

    return {
      success: true,
      refreshToken: res.data.refreshToken,
      accessTokenExpires: decodedToken?.exp ? decodedToken.exp * 1000 : undefined,
      user: res.data.user,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
