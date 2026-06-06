import { prisma } from "./../lib/prisma.js";

export async function getStationTanks(stationId: number) {
    try {
        const tanks = await prisma.tank.findMany({
            where: { stationId },
            include: {
                type: true,
                pumps: {
                    include: {
                        readings: {
                            orderBy: { timestamp: 'desc' },
                            take: 1,
                        },
                    },
                },
                sensors: {
                    include: {
                        levels: {
                            orderBy: { measuredTime: 'desc' },
                            take: 1,
                        },
                    },
                },
            },
        });

        return tanks.map((t) => {
            // compute capacity if possible (crossSectionalArea * height)
            const capacity = (t.crossSectionalArea != null && t.height != null)
                ? t.crossSectionalArea * t.height
                : null;

            // find latest level across sensors
            let latestLevel: { measuredTime: Date; measurement?: number | undefined } | null = null;
            for (const s of t.sensors ?? []) {
                const lvl = s.levels && s.levels[0];
                if (lvl) {
                    if (!latestLevel || new Date(lvl.measuredTime) > new Date(latestLevel.measuredTime)) {
                        latestLevel = { measuredTime: new Date(lvl.measuredTime), measurement: lvl.measurement ?? undefined };
                    }
                }
            }

            // currentLevel: if measurement present and we have crossSectionalArea, convert to volume
            const currentLevel = latestLevel
                ? (t.crossSectionalArea != null && latestLevel.measurement != null
                    ? (t.crossSectionalArea * latestLevel.measurement)
                    : latestLevel.measurement ?? null)
                : null;

            const pumps = (t.pumps ?? []).map((p) => {
                const latest = p.readings && p.readings[0];
                return {
                    pumpId: p.id,
                    readingValue: latest ? latest.value ?? null : null,
                    readingTimestamp: latest ? latest.timestamp : null,
                };
            });

            return {
                tankId: t.id,
                fuelName: t.type?.name ?? null,
                capacity,
                currentLevel,
                pumps,
            };
        });
    } catch (err) {
        console.error("Error fetching station tanks:", err);
        throw new Error("Failed to fetch station tanks");
    }
}