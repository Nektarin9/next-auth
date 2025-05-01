import { prisma } from "@/server/db";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Требуется email и пароль");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Неверные учетные данные");
        }

        // Проверяем только зашифрованный пароль
        const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
        );

        if (!isPasswordValid) {
          throw new Error("Неверные учетные данные");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
    // Новый провайдер для регистрации
    CredentialsProvider({
      id: "register", // Уникальный идентификатор
      name: "Register",
      credentials: {
        name: { label: "Name", type: "text", required: true },
        email: { label: "Email", type: "email", required: true },
        password: { label: "Password", type: "password", required: true },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Необходимо заполнить все поля");
        }

        // Проверяем, что пользователь не существует
        const existingUser = await prisma.user.findUnique({
          where: {email: credentials.email},
        });

        if (existingUser) {
          throw new Error("Пользователь с таким email уже существует");
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(credentials.password, 10);

        // Создаем нового пользователя
        const user = await prisma.user.create({
          data: {
            name: credentials.name,
            email: credentials.email,
            password: hashedPassword,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      session.user.id = Number(token.sub);
      return session;
    },
  },
};

export default NextAuth(authOptions);
