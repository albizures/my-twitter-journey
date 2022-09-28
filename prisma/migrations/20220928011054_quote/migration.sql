/*
  Warnings:

  - You are about to drop the column `isQuote` on the `Tweet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tweet" DROP COLUMN "isQuote",
ADD COLUMN     "quote" TEXT;
