-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'SUCCESS', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "pwd" TEXT,
    "email" TEXT,
    "role" TEXT,
    "mobile" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "name" TEXT,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuelType" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "pricePerLitre" DOUBLE PRECISION,
    "octaneRating" DOUBLE PRECISION,

    CONSTRAINT "FuelType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FillingStation" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "ownerName" TEXT,
    "ownerMobile" TEXT,
    "regionId" INTEGER,
    "longitude" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,

    CONSTRAINT "FillingStation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tank" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "installationDate" TIMESTAMP(3),
    "typeId" INTEGER,
    "crossSectionalArea" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "isActive" BOOLEAN DEFAULT true,
    "automaticRefuelRequest" BOOLEAN DEFAULT false,
    "threshold" DOUBLE PRECISION,

    CONSTRAINT "Tank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sensor" (
    "id" SERIAL NOT NULL,
    "tankId" INTEGER NOT NULL,
    "measurementMethod" TEXT,
    "isBottomToOilLevel" BOOLEAN,
    "isActive" BOOLEAN DEFAULT true,

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "sensorId" INTEGER NOT NULL,
    "measuredTime" TIMESTAMP(3) NOT NULL,
    "measurement" DOUBLE PRECISION,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("sensorId","measuredTime")
);

-- CreateTable
CREATE TABLE "RefuelRequest" (
    "id" SERIAL NOT NULL,
    "requestedDate" TIMESTAMP(3),
    "destinationStationId" INTEGER,
    "typeId" INTEGER,
    "requestedUserId" INTEGER,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "decisionUserId" INTEGER,

    CONSTRAINT "RefuelRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER,
    "requestId" INTEGER,
    "note" TEXT,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FillingStationManager" (
    "userId" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,

    CONSTRAINT "FillingStationManager_pkey" PRIMARY KEY ("userId","stationId")
);

-- CreateTable
CREATE TABLE "RegionalDistributionManager" (
    "userId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,

    CONSTRAINT "RegionalDistributionManager_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "FillingStation" ADD CONSTRAINT "FillingStation_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tank" ADD CONSTRAINT "Tank_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "FillingStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tank" ADD CONSTRAINT "Tank_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "FuelType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "Tank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Level" ADD CONSTRAINT "Level_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "Sensor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefuelRequest" ADD CONSTRAINT "RefuelRequest_destinationStationId_fkey" FOREIGN KEY ("destinationStationId") REFERENCES "FillingStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefuelRequest" ADD CONSTRAINT "RefuelRequest_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "FuelType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefuelRequest" ADD CONSTRAINT "RefuelRequest_requestedUserId_fkey" FOREIGN KEY ("requestedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefuelRequest" ADD CONSTRAINT "RefuelRequest_decisionUserId_fkey" FOREIGN KEY ("decisionUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "FillingStation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RefuelRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FillingStationManager" ADD CONSTRAINT "FillingStationManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FillingStationManager" ADD CONSTRAINT "FillingStationManager_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "FillingStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalDistributionManager" ADD CONSTRAINT "RegionalDistributionManager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegionalDistributionManager" ADD CONSTRAINT "RegionalDistributionManager_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
