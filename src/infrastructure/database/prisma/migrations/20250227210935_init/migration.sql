-- CreateEnum
CREATE TYPE "Category" AS ENUM ('FOOD', 'MEAL', 'CASH');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "balanceFood" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "balanceMeal" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "balanceCash" DECIMAL(65,30) NOT NULL DEFAULT 0.00,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "merchant" TEXT NOT NULL,
    "mcc" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
