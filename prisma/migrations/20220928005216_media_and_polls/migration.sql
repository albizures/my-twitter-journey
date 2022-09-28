/*
  Warnings:

  - You are about to drop the column `hashMedia` on the `Tweet` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tweet" DROP COLUMN "hashMedia",
ADD COLUMN     "media" TEXT[],
ADD COLUMN     "polls" TEXT[];
