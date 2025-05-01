import { CreateEventSchema, JoinEventSchema } from "@/shared/api";
import { prisma } from "../db";
import { isAuth, procedure, router } from "../trpc";
import { z } from "zod";
import {isAuthorEvent} from "@/server/middleware/isAuthorEvent/isAuthorEvent";

export const eventRouter = router({
  findMany: procedure.query(async ({ ctx: { user } }) => {
    const events = await prisma.event.findMany({
      include: {
        participations: true,
      },
    });

    return events.map(({ participations, ...event }) => ({
      ...event,
      isJoined: participations.some(({ userId }) => userId === user?.id),
    }));
  }),
  findUnique: procedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .use(isAuth)
    .query(({ input }) => {
      return prisma.event.findUnique({
        where: input,
        select: {
          title: true,
          description: true,
          date: true,
          authorId: true,
          participations: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });
    }),
  create: procedure
    .input(CreateEventSchema)
    .use(isAuth)
    .mutation(({ input, ctx: { user } }) => {
      return prisma.event.create({
        data: {
          authorId: user.id,
          ...input,
        },
      });
    }),
    delete: procedure
        .input(
            z.object({
                eventId: z.number().int(),
            })
        )
        .use(isAuth)
        .use(isAuthorEvent)
        .mutation(async ({ input }) => {
            return prisma.$transaction([
                prisma.participation.deleteMany({
                    where: {
                        eventId: input.eventId,
                    },
                }),
                // Удаляем взаимосвязи
                prisma.event.delete({
                    where: {
                        id: input.eventId,
                    },
                }),
            ]);
        }),
  update: procedure
      .input(
          z.object({
            eventId: z.number().int(),
            title: z.string().min(1),
            description: z.string().optional(),
            date: z.date()
          })
      )
      .use(isAuth) // Сначала проверяем авторизацию
      .use(isAuthorEvent) // Затем проверяем авторство
      .mutation(async ({ ctx, input }) => {
        // ctx содержит user и eventId
        return prisma.event.update({
          where: { id: ctx.eventId },
          data: {
            title: input.title,
            description: input.description,
            date: input.date,
            updatedAt: new Date()
          }
        });
      }),
  join: procedure
    .input(JoinEventSchema)
    .use(isAuth)
    .mutation(({ input, ctx: { user } }) => {
      return prisma.participation.create({
        data: {
          eventId: input.id,
          userId: user.id,
        },
      });
    }),
  leaveEvent: procedure
      .input(
          z.object({
            id: z.number(), // eventId
          })
      )
      .use(isAuth)
      .mutation(({ input, ctx: { user } }) => {
        return prisma.participation.deleteMany({
          where: {
            eventId: input.id,
            userId: user.id,
          },
        });
      }),

});
