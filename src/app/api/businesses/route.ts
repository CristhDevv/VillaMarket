import { apiSuccess, apiError } from "@/lib/utils";
import { NextRequest } from "next/server";
import { getBusinesses } from "@/lib/businesses";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search     = searchParams.get("search") || "";
    const category   = searchParams.get("category") || "";
    const featured   = searchParams.get("featured") === "true";
    const page       = parseInt(searchParams.get("page") || "1");
    const limit      = parseInt(searchParams.get("limit") || "12");

    const result = await getBusinesses({ search, category, featured, page, limit });

    return apiSuccess({
      businesses: result.businesses,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    return apiError("Error al obtener negocios", 500);
  }
}
