import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <span className={styles.logo}>❄️</span>
        <h1 className={styles.title}>Snow Cup</h1>
        <p className={styles.sub}>世界の降雪情報をリアルタイムで</p>
      </div>
    </header>
  );
}
