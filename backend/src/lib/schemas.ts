import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(["ADMIN", "MANAGER", "STAFF", "CUSTOMER"]),
  stationId: z.number().int().positive().optional(),
  regionId: z.number().int().positive().optional(),
}).superRefine((val, ctx) => {
  if (val.role === "MANAGER") {
    if (!val.stationId && !val.regionId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "MANAGER role requires either stationId or regionId",
      });
    }
  }
});

export const loginSchema = z.object({
  usernameOrEmail: z.string().min(1),
  password: z.string().min(1),
});
