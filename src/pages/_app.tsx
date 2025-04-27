import type { AppProps as AppNextProps, AppContext } from "next/app";
import { trpc } from "@/shared/api";
import {SessionProvider, getSession, signOut} from "next-auth/react";
import "@/app/global.css";
import Link from "next/link";
import {BaseUrl} from "@/shared/routes/routes";
import Image from "next/image";
import styles from "./index.module.scss"
import logo from "../../public/Screenshot_1.png";


interface UserType {
    email: string;
    name: string;
    id: number;
}
export interface SessionType {
    expires: string;
    user: UserType
    status: string;
}
export interface AppProps extends AppNextProps {
    session: SessionType | null;
}

function App({ Component, pageProps }: AppProps) {
    return (
          <div className={styles.container}>
              <header className={styles.header}>
                  <Link href={BaseUrl.HOME}>
                      <Image src={logo} alt="Result University"/>
                  </Link>
                  {pageProps?.session?.user ?
                      <div className={styles.userWrapper}>
                          <p>{pageProps.session.user.name}</p>
                          <button
                              onClick={() => signOut()}
                              className="bg-red-500 text-white px-4 py-2 rounded"
                          >
                              Выйти
                          </button>
                          <Link href={BaseUrl.CREATE_EVENT}>
                              <button className={styles.btnCreateEvent}>Создать событие</button>
                          </Link>
                      </div>
                      : <Link href={BaseUrl.AUTH}>
                          <button>Войти</button>
                      </Link>
                  }

              </header>
              <div className="mt-20">
                  <SessionProvider session={pageProps.session}>
                      <Component {...pageProps} />
                  </SessionProvider>
              </div>
          </div>
  );
}

App.getInitialProps = async (ctx: AppContext) => {
    return {
        pageProps: {
            session: await getSession(ctx.ctx),
        },
    };
};

export default trpc.withTRPC(App);
