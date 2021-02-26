import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Logo from '../components/logo'
import Search from '../components/searchbar'

import { ChevronDown } from 'react-feather'
export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>NaRabotu</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <Logo />
        <Search />

        <div className="text-center cursor-pointer" onClick={(e) => {
          document.querySelector('#a').scrollIntoView({ 
            behavior: 'smooth' 
          });
        }}>
          <h3 className={styles.h3}>
          Это чё?
          </h3>
          <ChevronDown className="mx-auto" size={48}/>  

        </div>
      </main>
      <footer className={styles.footer}>
        <h1 id="a" className={styles.h1}>
        Это чё?
        </h1>
        <p style={{marginTop: '2rem'}}>       
          В чем смысл анекдота <b>«Купил мужик шляпу, а она ему как раз»</b>?
          Ответ на этот вопрос был давно дан на сервисе Мыловару.
          Звучит он так: Своеобразная шутка над шутками, когда ожидается некое смешное завершение, ан нет, вопреки ожиданиям, шутки нет. Что вводит слушателя в ступор и человек смеется не столько над шуткой, сколько над неожиданной банальностью, над своей реакцией.
          Суть анекдота в действии от обратного, ты ждешь неожиданный поворот и остроумную иронию, а получаешь просто хороший и логичный исход ситуации.
          Помимо прочего подобные анекдоты = <b>тест на шизофрению</b>.
        </p>
        <br/>
        <blockquote className={`${styles.quote} mx-auto w-max`}>
          <p>Фермерша вызвала врача и попросила его осмотреть её поросёнка:<br/>
          - Не могу понять, он так плохо прибавляет в весе...<br/>
          - Но почему вы обратились ко мне?! - возмутился врач. - Вы же прекрасно могли вызвать ветеринара.<br/>
          - Ах, не сердитесь, доктор, я совершенно не доверяю нашему ветеринару: он такой тощенький...</p>
          <a className="block text-right mt-4" href="https://www.anekdot.ru/id/748598/"><i>https://www.anekdot.ru/id/748598/</i></a>
        </blockquote>
      </footer>
    </div>
  )
}
