import { useEffect, useState } from "react";
import { Vacancy } from "../pages/api/query";

const getSymbol = (s) => ({'RUB': '₽', 'USD': '$', 'EUR': '€'})[s]
const numFmt = (n: number): string => new Intl.NumberFormat('ru-RU').format(n);

const getUsdToRub = async () => {
  if(!window.usd2rub) {
    const resp = await fetch('https://www.cbr-xml-daily.ru/daily_json.js').then(e => e.text());
    const o = JSON.parse(resp);
    //@ts-ignore
    const usdt= o.Valute.USD.Value;
    window.usd2rub = usdt;
  }
  return window.usd2rub;
}
const VacancyCard = ({company, title, salary, isAdvert, link}: Vacancy) => {
  const [inRub, setInRub] = useState(0);
  
  useEffect(() => {
    if(salary.currency === 'RUB') {
      return;
    }
    getUsdToRub().then(RUB => {
      setInRub(Math.floor(RUB * salary.amount));
    })
  }, [])

  if (salary.currency !== 'RUB') {
  
  }

  return (
    <div className="shadow-md border  border-gray-400 grid grid-cols-5 rounded-lg m-5 p-5">
      <div className="w-16 ml-4">
        {
          company.logo &&
          <img className="rounded-full h-16 object-contain" src={company.logo} alt={company.name}/>
        }
      </div>
      <div className="col-span-3">
        <h3 className="font-bold text-lg"><a className="hover:text-blue-500" href={link}>{title}</a></h3>
        <h4><a href={company.site} className="hover:text-blue-400">{company.name}</a>
        {isAdvert && <small className="text-yellow-500 px-3" >Эта вакансия продвигается</small>}
        </h4>
      </div>
      <div>
        <h2 className="font-bold text-2xl">{numFmt(salary.amount)}{getSymbol(salary.currency)}</h2>
        {
          salary.hasOwnProperty('currency') && salary.currency !== 'RUB' && inRub !== 0 && <small className="text-gray-500">~{numFmt(inRub)}{getSymbol('RUB')}</small>
        }
      </div>
    </div>
  )
}

export default VacancyCard;
