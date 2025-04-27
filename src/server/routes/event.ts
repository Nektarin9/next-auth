import { CreateEventSchema, JoinEventSchema } from "@/shared/api";
import { prisma } from "../db";
import { isAuth, procedure, router } from "../trpc";
import { z } from "zod";
import {TRPCError} from "@trpc/server";
import {omit} from "next/dist/shared/lib/router/utils/omit";

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
  update: procedure
      .input(
          z.object({
            eventId: z.number().int(),
            authorId: z.number().int(),
            ...CreateEventSchema.shape // Включаем все поля из CreateEventSchema
          })
      )
      .use(isAuth)
      .mutation(async ({ input, ctx: { user } }) => {
        // Проверяем что пользователь - автор события
        if (input.authorId !== user.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Вы не можете редактировать это событие'
          });
        }
        return prisma.event.update({
          where: { id: input.eventId },
          data: {
            ...omit(input, ['eventId', 'authorId']),
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
