import styles from './logo.module.css';
const Loog =  ({small}) => {
  if(small) {
    return(
      <div className={styles.logoContainer}>
        <img width={64} src="/Narabotu.svg"/>
        <h1 className={styles.logoText_small}>NaRabotu</h1>
      </div>
    )
  }

  return(
    <div className={styles.logoContainer}>
      <img src="/Narabotu.svg"/>
      <h1 className={styles.logoText}>NaRabotu</h1>
    </div>
  )
}
export default Loog;