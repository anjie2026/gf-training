import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { insertLead, getAllLeads, deleteLeadById } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  leads: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(128),
        contact: z.string().min(1).max(256),
        audienceType: z.enum(['beginner', 'sales', 'entrepreneur']),
        message: z.string().max(1000).optional(),
      }))
      .mutation(async ({ input }) => {
        await insertLead(input);
        return { success: true };
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: '僅限管理員存取' });
        }
        return getAllLeads();
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: '僅限管理員存取' });
        }
        await deleteLeadById(input.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
