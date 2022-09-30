/*
  Warnings:

  - Added the required column `text` to the `Tweet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tweet" ADD COLUMN     "text" TEXT NOT NULL;
