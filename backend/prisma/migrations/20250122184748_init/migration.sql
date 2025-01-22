/*
  Warnings:

  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `createdAt` on the `CompanyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `CompanyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `CompanyInfo` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ServiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ServiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `ServiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `serviceOrderId` on the `ServiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ServiceItem` table. All the data in the column will be lost.
  - You are about to drop the column `orderNumber` on the `ServiceOrder` table. All the data in the column will be lost.
  - You are about to drop the column `serviceId` on the `ServiceOrder` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - Added the required column `orderId` to the `ServiceItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `ServiceItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Service";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CompanyInfo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "CompanyInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CompanyInfo" ("address", "cnpj", "email", "id", "name", "phone", "userId") SELECT "address", "cnpj", "email", "id", "name", "phone", "userId" FROM "CompanyInfo";
DROP TABLE "CompanyInfo";
ALTER TABLE "new_CompanyInfo" RENAME TO "CompanyInfo";
CREATE UNIQUE INDEX "CompanyInfo_userId_key" ON "CompanyInfo"("userId");
CREATE TABLE "new_ServiceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "total" REAL NOT NULL,
    "orderId" TEXT NOT NULL,
    CONSTRAINT "ServiceItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ServiceOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ServiceItem" ("description", "id", "quantity", "total") SELECT "description", "id", "quantity", "total" FROM "ServiceItem";
DROP TABLE "ServiceItem";
ALTER TABLE "new_ServiceItem" RENAME TO "ServiceItem";
CREATE TABLE "new_ServiceOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "client" TEXT NOT NULL,
    "fleet" TEXT NOT NULL,
    "farm" TEXT,
    "description" TEXT,
    "total" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ServiceOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ServiceOrder" ("client", "createdAt", "date", "description", "fleet", "id", "status", "total", "updatedAt", "userId") SELECT "client", "createdAt", "date", "description", "fleet", "id", "status", "total", "updatedAt", "userId" FROM "ServiceOrder";
DROP TABLE "ServiceOrder";
ALTER TABLE "new_ServiceOrder" RENAME TO "ServiceOrder";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "password", "updatedAt") SELECT "createdAt", "email", "id", "password", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
