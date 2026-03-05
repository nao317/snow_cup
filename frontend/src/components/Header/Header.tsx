import { Snowflake } from "lucide-react";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Snowflake className={styles.logo} size={32} strokeWidth={1.5} />
        <h1 className={styles.title}>Snow Cup</h1>
        <p className={styles.sub}>世界の降雪情報をリアルタイムで</p>
      </div>
    </header>
  );
}
