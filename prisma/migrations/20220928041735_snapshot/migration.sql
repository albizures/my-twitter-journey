/*
  Warnings:

  - You are about to drop the column `banner` on the `TwitterUserSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `geo` on the `TwitterUserSnapshot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TwitterUserSnapshot" DROP COLUMN "banner",
DROP COLUMN "geo";
