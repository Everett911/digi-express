-- CreateEnum
CREATE TYPE "public"."OrderStatus" AS ENUM ('PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."_OrderToProduct" DROP CONSTRAINT "_OrderToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_OrderToProduct" DROP CONSTRAINT "_OrderToProduct_B_fkey";

-- DropIndex
DROP INDEX "public"."CartItem_id_productId_key";

-- AlterTable
ALTER TABLE "public"."Account" ADD COLUMN     "issuer" TEXT;

-- AlterTable
ALTER TABLE "public"."CartItem" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "size" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "public"."Order" DROP COLUMN "orderTimeMs",
ADD COLUMN     "status" "public"."OrderStatus" NOT NULL DEFAULT 'PAID';

-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "rating",
ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "color" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isAvailableForPurchase" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "size" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "rating" JSONB,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'customer';

-- DropTable
DROP TABLE "public"."_OrderToProduct";

-- CreateTable
CREATE TABLE "public"."OrderItem" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "color" TEXT,
    "size" TEXT,
    "priceCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,
    "image" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deliveryDays" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "public"."OrderItem"("orderId" ASC);

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "public"."OrderItem"("productId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_userId_productId_color_size_key" ON "public"."CartItem"("userId" ASC, "productId" ASC, "color" ASC, "size" ASC);

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
