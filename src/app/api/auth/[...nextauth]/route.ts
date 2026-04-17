import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getUserByUsername, createUser } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        isRegister: { label: "Register", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const existingUser = await getUserByUsername(credentials.username);

        if (credentials.isRegister === 'true') {
          if (existingUser) throw new Error('Usuario ya existe');
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          const newUser = {
            id: uuidv4(),
            username: credentials.username,
            password: hashedPassword,
            preferred_lang: 'es'
          };
          await createUser(newUser);
          return { id: newUser.id, name: newUser.username };
        }

        if (!existingUser) throw new Error('Usuario no encontrado');
        
        const isValid = await bcrypt.compare(credentials.password, existingUser.password);
        if (!isValid) throw new Error('Contraseña incorrecta');

          return { id: existingUser.id, name: existingUser.username };
        }
      })
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (token && session.user) {
          (session.user as any).id = token.id;
        }
        return session;
      }
    },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'secret-shhh',
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
