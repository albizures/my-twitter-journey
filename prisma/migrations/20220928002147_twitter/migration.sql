-- CreateTable
CREATE TABLE "TwitterUser" (
    "id" TEXT NOT NULL,
    "lastTimeChecked" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TwitterUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tweet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hashtags" TEXT[],
    "mentions" TEXT[],
    "replayTo" TEXT,
    "hashMedia" BOOLEAN NOT NULL,
    "isQuote" BOOLEAN NOT NULL,
    "source" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "sensitive" BOOLEAN NOT NULL,
    "conversationId" TEXT,

    CONSTRAINT "Tweet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TwitterUserSnapshot" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "followerCount" INTEGER NOT NULL,
    "followingCount" INTEGER NOT NULL,
    "tweetCount" INTEGER NOT NULL,
    "geo" TEXT NOT NULL,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "banner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,
    "verified" BOOLEAN NOT NULL,

    CONSTRAINT "TwitterUserSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TwitterUserSnapshot_username_key" ON "TwitterUserSnapshot"("username");

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TwitterUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tweet" ADD CONSTRAINT "Tweet_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Tweet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TwitterUserSnapshot" ADD CONSTRAINT "TwitterUserSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TwitterUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
