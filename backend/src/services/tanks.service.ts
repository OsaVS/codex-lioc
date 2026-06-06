import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

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