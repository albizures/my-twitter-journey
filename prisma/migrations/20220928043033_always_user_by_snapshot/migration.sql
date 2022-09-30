/*
  Warnings:

  - Made the column `userId` on table `TwitterUserSnapshot` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TwitterUserSnapshot" DROP CONSTRAINT "TwitterUserSnapshot_userId_fkey";

-- AlterTable
ALTER TABLE "TwitterUserSnapshot" ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "TwitterUserSnapshot" ADD CONSTRAINT "TwitterUserSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TwitterUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
