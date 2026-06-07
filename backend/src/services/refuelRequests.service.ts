import { prisma } from "../lib/prisma.js";
import { RequestStatus } from "@prisma/client";

export async function createRefuelRequest(
    requestedDate: Date,
    destinationStationId: number,
    typeId: number,
    requestedUserId: number
) {
    try {
        const station = await prisma.fillingStation.findUnique({
            where: { id: destinationStationId }
        });
        if (!station) {
            throw new Error("Filling station not found");
        }

        const fuelType = await prisma.fuelType.findUnique({
            where: { id: typeId }
        });
        if (!fuelType) {
            throw new Error("Fuel type not found");
        }

        const user = await prisma.user.findUnique({
            where: { id: requestedUserId }
        });
        if (!user) {
            throw new Error("User not found");
        }

        const refuelRequest = await prisma.refuelRequest.create({
            data: {
                requestedDate,
                destinationStationId,
                typeId,
                requestedUserId,
                status: RequestStatus.PENDING,
                decisionUserId: null,
            }
        });

        return refuelRequest;
    }
    catch (err: any) {
        console.error(err);
        throw new Error(err?.message || "INTERNAL_SERVER_ERROR");
    }
}
