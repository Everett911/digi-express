import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "../../../../../../lib/auth";
import { prisma } from "../../../../../../lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function sanitizeFilename(value: string) {
  return value.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "");
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const filename = `${sanitizeFilename(product.name) || "product"}.json`;

  return new NextResponse(JSON.stringify(product, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
