import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import {Context} from "@/server/context";
import {prisma} from "@/server/db";

const t = initTRPC.context<Context>().create({
    transformer: superjson,
});
export const isAuthorEvent = t.middleware(async (opts) => {
    const { ctx, input, next } = opts;

    if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    // 2. Проверяем наличие eventId во входных данных
    if (!input || typeof input !== 'object' || !('eventId' in input)) {
        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Отсутствует ID события в запросе"
        });
    }
    const eventId = input.eventId;


    // 3. Проверяем существование события и авторство
    try {
        const event = await prisma.event.findUnique({
            where: { id: Number(eventId) },
            select: { authorId: true }
        });

        if (!event) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Событие не найдено"
            });
        }

        if (event.authorId !== ctx.user.id) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "Вы не являетесь автором этого события"
            });
        }

        // 4. Если все проверки пройдены - передаем eventId в контекст
        return next({
            ctx: {
                ...ctx,
                eventId: Number(eventId)
            }
        });

    } catch (error) {
        if (error instanceof TRPCError) {
            throw error;
        }
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Ошибка при проверке авторства"
        });
    }
});