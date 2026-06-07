-- CreateTable
CREATE TABLE "Pump" (
    "id" SERIAL NOT NULL,
    "tankId" INTEGER NOT NULL,
    "name" TEXT,

    CONSTRAINT "Pump_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PumpReading" (
    "id" SERIAL NOT NULL,
    "pumpId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION,

    CONSTRAINT "PumpReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationInventory" (
    "id" SERIAL NOT NULL,
    "stationId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "batchNumber" TEXT,
    "expiryDate" TIMESTAMP(3),
    "quantityOnHand" DOUBLE PRECISION,

    CONSTRAINT "StationInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "barcode" TEXT,
    "name" TEXT,
    "categoryId" INTEGER,
    "price" DOUBLE PRECISION,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductRequest" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "stationId" INTEGER NOT NULL,
    "requestedQuantity" DOUBLE PRECISION,
    "status" TEXT,
    "requestedDate" TIMESTAMP(3),

    CONSTRAINT "ProductRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pump" ADD CONSTRAINT "Pump_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "Tank"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PumpReading" ADD CONSTRAINT "PumpReading_pumpId_fkey" FOREIGN KEY ("pumpId") REFERENCES "Pump"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationInventory" ADD CONSTRAINT "StationInventory_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "FillingStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationInventory" ADD CONSTRAINT "StationInventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRequest" ADD CONSTRAINT "ProductRequest_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRequest" ADD CONSTRAINT "ProductRequest_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "FillingStation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
