import { prisma } from "./../lib/prisma.js";

export async function tankHistory(tankId: number, days = 7) {
    try {
        const from = new Date();
        from.setDate(from.getDate() - days);

        // Use Level records (sensor readings) as historic data. If there are manual entries
        // stored elsewhere, merge them here when the model exists.
        const levels = await prisma.level.findMany({
            where: {
                measuredTime: { gte: from },
                sensor: { tankId },
            },
            orderBy: { measuredTime: 'desc' },
        });

        return levels.map((l) => ({
            measuredTime: l.measuredTime.toISOString(),
            level: l.measurement ?? null,
            type: 'SENSOR' as const,
        }));
    }
    catch (err: any) {
        console.error(err);
        throw new Error(err?.message || "INTERNAL_SERVER_ERROR");
    }
};

export async function createManualMeasurement(tankId: number, measuredTime: Date, measurement: number, userId: number) {
    try {
        const tank = await prisma.tank.findUnique({
            where: { id: tankId },
        });
        if (!tank) {
            throw new Error("Tank not found");
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error("User not found");
        }

        // Find or create sensor for manual measurements on this tank
        let sensor = await prisma.sensor.findFirst({
            where: {
                tankId,
                measurementMethod: "MANUAL",
            },
        });

        if (!sensor) {
            sensor = await prisma.sensor.create({
                data: {
                    tankId,
                    measurementMethod: "MANUAL",
                    isBottomToOilLevel: true,
                    isActive: true,
                },
            });
        }

        // Upsert the level measurement under this sensor
        await prisma.level.upsert({
            where: {
                sensorId_measuredTime: {
                    sensorId: sensor.id,
                    measuredTime,
                },
            },
            update: {
                measurement,
            },
            create: {
                sensorId: sensor.id,
                measuredTime,
                measurement,
            },
        });

        const calculatedVolume = tank.crossSectionalArea != null
            ? tank.crossSectionalArea * measurement
            : measurement;

        return {
            success: true,
            calculatedVolume,
        };
    }
    catch (err: any) {
        console.error(err);
        throw new Error(err?.message || "INTERNAL_SERVER_ERROR");
    }
}
