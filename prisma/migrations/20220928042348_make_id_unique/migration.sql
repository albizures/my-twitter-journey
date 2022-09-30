/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `TwitterUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TwitterUser_id_key" ON "TwitterUser"("id");
