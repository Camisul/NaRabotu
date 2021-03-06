import { ChartProps } from "../../components/barchart"
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient }from 'redis';
import { promisify } from "util";
import { createHash } from 'crypto';
const sha1 = (s) => { 
  const h = createHash('sha1');
  h.update(s);
  return h.digest('hex');
}
const client = createClient({
  host: process.env.REDIS
});
const get = promisify(client.get).bind(client);
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export interface Company {
  name: string,
  logo?: string,
  site?: string
}

export interface Salary {
  amount: number,
  currency: 'RUB' | 'USD' | 'EUR' 
}
export interface Vacancy {
  title: string,
  isAdvert: boolean,
  salary: Salary,
  company: Company,
  link?: string,
}
export interface ApiResponse {
  total: number,
  adverts: number,
  unique_companies: number,
  top_dollar: number,
  graph: any,
  mean_salary: number,
  vacancies: Vacancy[]
}

function makeGraph(sample: Array<number>): Map<string, number>  {
  const min = Math.min(...sample);
  const max = Math.max(...sample);
  const step = (max - min) / 5;
  const groups = new Array(5).fill(0).map((e, ii) => [min + step * ii, min + (step * (ii + 1))]);
  const mkStrRange = (l: number, h: number): string => Math.floor(l / 1000) + 'k-' + Math.floor(h / 1000) + 'k';
  const mkPrc = (l: number, r: any[]): number => l / (r.length * 0.01);
  const res = new Map<string, number>(
      groups.map(([l, h]) =>
          [
              mkStrRange(l, h),
              mkPrc(
                  sample.filter(e => e >= l && e <= h).length,
                  sample
              )
          ]
      )
  );
  return res;
}


export default async (req: NextApiRequest, res: NextApiResponse) => {
  const mock: ApiResponse = {
    total: 1337,
    adverts: 69,
    unique_companies: 322,
    top_dollar: 12,
    mean_salary: 30_000,
    graph: {
      data: [...new Map<string, number>(
        [
          ['-10k', 10],
          ['10k-20k', 20],
          ['30k-45k', 30],
          ['45k-50k', 20],
          ['50k-100k', 10]
        ]
      ).entries()]
    },
    vacancies: [
      {
        title: 'asdf',
        isAdvert: false,
        salary: {
          amount: 30_000,
          currency: 'RUB',
        },
        company: {
          name: 'asdf',
          logo: 'https://via.placeholder.com/150',
          site: 'https://placeholder.com/',
        },
        link: 'https://hh.ru/',
      },
      {
        title: 'asdf',
        isAdvert: true,
        salary: {
          amount: 30_00,
          currency: 'USD',
        },
        company: {
          name: 'asdf',
          logo: 'https://via.placeholder.com/150',
          site: 'https://placeholder.com/',
        },
        link: 'https://hh.ru/',
      },
      {
        title: 'asdf',
        isAdvert: false,
        salary: {
          amount: 30_00,
          currency: 'EUR',
        },
        company: {
          name: 'asdf',
          logo: 'https://via.placeholder.com/150',
          site: 'https://placeholder.com/',
        },
        link: 'https://hh.ru/',
      },
      {
        title: 'asdf',
        isAdvert: false,
        salary: {
          amount: 30_000,
          currency: 'RUB',
        },
        company: {
          name: 'asdf',
          logo: 'https://via.placeholder.com/150',
          site: 'https://placeholder.com/',
        },
        link: 'https://hh.ru/',
      }
    ]
  };

  if (req.method === 'POST') {
    // Process a POST request
    
    const json = req.body || {};

    if (!json.hasOwnProperty('str'))
    {
      res.status(400).json({'error': 'bad request'});
      return;
    }
    console.log('Gruzum nhoooy');
    const ok = await fetch('http://backend:8000/api/fetch_more', {
      method: 'POST',
      body: JSON.stringify({query: json.str}),
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(r =>r.text());
    console.log(ok);
    const index = await get('index');
    if(!index) {
      
      res.status(500).json({
        message: 'No data indexed yet, try again later'
      });
      return;
    }
    const j_index = JSON.parse(index)
    let all_vac = await Promise.all(j_index.map(async (e) => {
      const x =  await get(sha1(e))
      return JSON.parse(x);
    }));
    //@ts-ignore
    all_vac = all_vac.filter(e => !!e && !!e['company'] );
    //@ts-ignore
    const test = (str, a ,b ) => {
      const re = new RegExp(str, 'i');
      return re.test(a) || re.test(b);
    } 
    //@ts-ignore
    all_vac = all_vac.filter(e => test(json.str, e.title, e.body))


    const salaries = all_vac.map(e => e['salary']).filter(e => e['currency'] == 'RUB').map(e => e['amount']);
    const pre = Math.floor(salaries.length * 0.01);
    const top1 = salaries.sort((a, b) => b - a).slice(0, pre);
    const unic = new Set();
    //const companies = all_vac.map(e => e['company']).filter(e => !!e).forEach(e => unic.add(e['name']));
    let response: ApiResponse = {
      total: 0,
      adverts: 0,
      unique_companies: 0,
      top_dollar: 0,
      graph: [],
      mean_salary: 0,
      vacancies: []
    };
    //@ts-ignore
    response.vacancies = all_vac;
    response.total = all_vac.length;
    response.adverts = all_vac.filter(e => !!e['isAdvert']).length;
    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    response.mean_salary = salaries.reduce(reducer) /  salaries.length;
    response.top_dollar = top1.length;
    response.unique_companies = unic.size;
    response.graph = {data: [...makeGraph(salaries)]}
    res.status(200).json(response);
    return;
  }
  res.status(200).json(mock)
}
