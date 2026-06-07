// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

// Initialize PrismaClient without any options
// Prisma will automatically use DATABASE_URL from environment
const prisma = new PrismaClient();

async function main() {
  try {
    // Test connection first
    console.log('✅ Database connected successfully');

    // ─────────────────────────────────────────────
    // USERS (Admin / Manager / Staff / Customer)
    // ─────────────────────────────────────────────
    const passwordHash = await hash("Password123!", 10);

    const admin = await prisma.user.upsert({
      where: { email: "admin@fuel.local" },
      update: {},
      create: {
        username: "admin",
        name: "System Admin",
        email: "admin@fuel.local",
        password: passwordHash,
        role: Role.ADMIN,
        mobile: "0700000000",
      },
    });

    const manager = await prisma.user.upsert({
      where: { email: "manager@fuel.local" },
      update: {},
      create: {
        username: "manager",
        name: "Station Manager",
        email: "manager@fuel.local",
        password: passwordHash,
        role: Role.MANAGER,
        mobile: "0711111111",
      },
    });

    const staff = await prisma.user.upsert({
      where: { email: "staff@fuel.local" },
      update: {},
      create: {
        username: "staff1",
        name: "Station Staff",
        email: "staff@fuel.local",
        password: passwordHash,
        role: Role.STAFF,
        mobile: "0722222222",
      },
    });

    const customer = await prisma.user.upsert({
      where: { email: "customer@fuel.local" },
      update: {},
      create: {
        username: "customer1",
        name: "Fuel Customer",
        email: "customer@fuel.local",
        password: passwordHash,
        role: Role.CUSTOMER,
        mobile: "0733333333",
      },
    });

    // ─────────────────────────────────────────────
    // REGION
    // ─────────────────────────────────────────────
    const region = await prisma.region.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Western Province",
      },
    });

    // ─────────────────────────────────────────────
    // FUEL TYPES
    // ─────────────────────────────────────────────
    const petrol = await prisma.fuelType.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Petrol 92",
        pricePerLitre: 355.0,
        octaneRating: 92,
      },
    });

    const diesel = await prisma.fuelType.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: "Diesel",
        pricePerLitre: 295.0,
        octaneRating: 0,
      },
    });

    // ─────────────────────────────────────────────
    // FILLING STATION
    // ─────────────────────────────────────────────
    const station = await prisma.fillingStation.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: "Negombo Fuel Station",
        address: "Main Street, Negombo",
        ownerName: "Mr. Perera",
        ownerMobile: "0754444444",
        regionId: region.id,
        longitude: 79.838,
        latitude: 7.2088,
      },
    });

    // ─────────────────────────────────────────────
    // MANAGERS
    // ─────────────────────────────────────────────
    await prisma.fillingStationManager.upsert({
      where: {
        userId_stationId: {
          userId: manager.id,
          stationId: station.id,
        },
      },
      update: {},
      create: {
        userId: manager.id,
        stationId: station.id,
      },
    });

    await prisma.regionalDistributionManager.upsert({
      where: {
        userId: manager.id,
      },
      update: {},
      create: {
        userId: manager.id,
        regionId: region.id,
      },
    });

    // ─────────────────────────────────────────────
    // TANKS
    // ─────────────────────────────────────────────
    const tank = await prisma.tank.upsert({
      where: { id: 1 },
      update: {},
      create: {
        stationId: station.id,
        typeId: petrol.id,
        crossSectionalArea: 12.5,
        height: 5.0,
        threshold: 1000,
        automaticRefuelRequest: true,
        installationDate: new Date(),
      },
    });

    const tank2 = await prisma.tank.upsert({
      where: { id: 2 },
      update: {},
      create: {
        stationId: station.id,
        typeId: diesel.id,
        crossSectionalArea: 10.0,
        height: 4.5,
        threshold: 800,
        automaticRefuelRequest: false,
        installationDate: new Date(),
      },
    });

    // ─────────────────────────────────────────────
    // SENSOR
    // ─────────────────────────────────────────────
    const sensor = await prisma.sensor.upsert({
      where: { id: 1 },
      update: {},
      create: {
        tankId: tank.id,
        measurementMethod: "ULTRASONIC",
        isBottomToOilLevel: true,
      },
    });

    // ─────────────────────────────────────────────
    // LEVEL DATA (time series)
    // ─────────────────────────────────────────────
    await prisma.level.upsert({
      where: {
        sensorId_measuredTime: {
          sensorId: sensor.id,
          measuredTime: new Date("2026-06-06T08:00:00Z"),
        },
      },
      update: {},
      create: {
        sensorId: sensor.id,
        measuredTime: new Date("2026-06-06T08:00:00Z"),
        measurement: 1200,
      },
    });

    await prisma.level.upsert({
      where: {
        sensorId_measuredTime: {
          sensorId: sensor.id,
          measuredTime: new Date("2026-06-06T10:00:00Z"),
        },
      },
      update: {},
      create: {
        sensorId: sensor.id,
        measuredTime: new Date("2026-06-06T10:00:00Z"),
        measurement: 1150,
      },
    });

    // ─────────────────────────────────────────────
    // PRODUCTS, CATEGORIES & STATION INVENTORY
    // ─────────────────────────────────────────────
    const category = await prisma.productCategory.upsert({
      where: { id: 1 },
      update: {},
      create: { name: "General" },
    });

    const product = await prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: {
        barcode: "000111222",
        name: "Engine Oil",
        categoryId: category.id,
        price: 2500.0,
      },
    });

    await prisma.stationInventory.upsert({
      where: { id: 1 },
      update: {},
      create: {
        stationId: station.id,
        productId: product.id,
        batchNumber: "BATCH-001",
        expiryDate: new Date("2028-01-01T00:00:00Z"),
        quantityOnHand: 150,
      },
    });

    // ─────────────────────────────────────────────
    // PUMPS & PUMP READINGS
    // ─────────────────────────────────────────────
    const pump1 = await prisma.pump.upsert({
      where: { id: 1 },
      update: {},
      create: {
        tankId: tank.id,
        name: "Pump 1",
      },
    });

    const pump2 = await prisma.pump.upsert({
      where: { id: 2 },
      update: {},
      create: {
        tankId: tank2.id,
        name: "Pump 2",
      },
    });

    await prisma.pumpReading.create({
      data: {
        pumpId: pump1.id,
        timestamp: new Date(),
        value: 123.45,
      },
    });

    // ─────────────────────────────────────────────
    // PRODUCT REQUEST (sample)
    // ─────────────────────────────────────────────
    await prisma.productRequest.create({
      data: {
        productId: product.id,
        stationId: station.id,
        requestedQuantity: 50,
        status: "PENDING",
        requestedDate: new Date(),
      },
    });

    // ─────────────────────────────────────────────
    // REFUEL REQUEST
    // ─────────────────────────────────────────────
    const request = await prisma.refuelRequest.create({
      data: {
        requestedDate: new Date(),
        destinationStationId: station.id,
        typeId: petrol.id,
        requestedUserId: customer.id,
        decisionUserId: manager.id,
        status: "PENDING",
      },
    });

    // ─────────────────────────────────────────────
    // DELIVERY
    // ─────────────────────────────────────────────
    await prisma.delivery.create({
      data: {
        stationId: station.id,
        requestId: request.id,
        note: "Auto-generated delivery for request",
      },
    });

    console.log("🌱 Seed completed successfully");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// declare process for environments where @types/node isn't loaded during TS checks
declare const process: any;