-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('METERS', 'UNITS');

-- CreateTable
CREATE TABLE "Products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" "Unit" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);
