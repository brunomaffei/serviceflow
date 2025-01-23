/*
  Warnings:

  - You are about to alter the column `quantity` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('PF', 'PJ');

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "quantity" SET DATA TYPE INTEGER;

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "companyName" TEXT,
    "tradingName" TEXT,
    "stateRegistration" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Client_userId_idx" ON "Client"("userId");

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
