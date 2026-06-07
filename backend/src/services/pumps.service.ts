import { prisma } from "./../lib/prisma.js";

export async function addPumpReading(pumpId: number, timestamp: Date, readingValue: number) {
    try {
        const pump = await prisma.pump.findUnique({
            where: { id: pumpId }
        });
        if (!pump) {
            throw new Error("Pump not found");
        }

        await prisma.pumpReading.create({
            data: {
                pumpId,
                timestamp,
                value: readingValue,
            }
        });

        return { success: true };
    }
    catch (err: any) {
        console.error(err);
        throw new Error(err?.message || "INTERNAL_SERVER_ERROR");
    }
}
