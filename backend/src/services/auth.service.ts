import bcrypt from "bcryptjs";
import { PrismaClient, Prisma, Role } from "@prisma/client";

const prisma = new PrismaClient();

export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  name?: string | undefined;
  role: Role | string;
  stationId?: number | undefined;
  regionId?: number | undefined;
}) {
  try {
    const hashed = await bcrypt.hash(data.password, 10);

    const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          username: data.username,
          email: data.email,
          password: hashed,
          name: data.name ?? null,
          role: (data.role as any) ?? null,
        },
        select: { id: true, username: true, email: true, name: true, role: true },
      });

      // if manager, create related manager records as requested
      if (data.role === "MANAGER") {
        if (data.stationId) {
          const station = await tx.fillingStation.findUnique({
            where: { id: data.stationId },
          });

          if (!station) {
            throw new Error("Filling station not found");
          }

          await tx.fillingStationManager.create({
            data: {
              userId: user.id,
              stationId: data.stationId,
            },
          });
        }
        if (data.regionId) {
          const region = await tx.region.findUnique({
            where: { id: data.regionId },
          });

          if (!region) {
            throw new Error("Region not found");
          }

          await tx.regionalDistributionManager.create({
            data: {
              userId: user.id,
              regionId: data.regionId,
            },
          });
        }
      }

      return user;
    });

    return created;
  } catch (e: any) {
    // runtime import of PrismaClientKnownRequestError can be missing in some setups
    // so detect unique constraint errors by the `code` field instead
    if (e?.code === "P2002") {
      const target = (e.meta as any)?.target;

      if (Array.isArray(target)) {
        if (target.includes("username")) {
          throw new Error("Username already in use");
        }
        if (target.includes("email")) {
          throw new Error("Email already in use");
        }
      }

      throw new Error("Unique field already in use");
    }

    throw e;
  }
}

export async function authenticateUser(usernameOrEmail: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    },
  });

  if (!user || !user.password) return null;

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;

  return { id: user.id, username: user.username, email: user.email, role: user.role };
}
