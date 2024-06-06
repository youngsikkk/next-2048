import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Game2048 from '../components/Game2048.jsx';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>2048 Game</title>
        <meta name="description" content="Play the classic 2048 game!" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to 2048 Game!
        </h1>

        <p className={styles.description}>
          Let's play and have fun!
        </p>

        <Game2048 />
      </main>
    </div>
  );
}
