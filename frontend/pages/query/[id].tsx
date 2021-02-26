import { useState, useEffect } from 'react';
import styles from '../../styles/Home.module.css';
import lstyles from '../../styles/loader.module.css';

import BarChart from '../../components/barchart';
import VacancyCard from '../../components/vacancycard';
import PageHeader from '../../components/pageheader';
import { ApiResponse } from '../api/query';

const Query = ({ query_params }) => {
	const [error, setError] = useState(null);
	const [data, setData] = useState<ApiResponse>(null);

	useEffect(() => {
		const wrap = async () => {
			try {
				console.log(JSON.stringify({str: query_params}))
				const res = await fetch(`/api/query/`, {
					method: 'POST',
					body: JSON.stringify({str: atob(window.location.pathname.replace('/query/', ''))}),
					headers: {
						'Content-Type': 'application/json'
					}
				});
				const json = await res.json();
				
				if (res.status !== 200) {
					throw new Error('Non 200' + json['error'])
				}
				setData(json);
			} catch (error) {
				setError(error);
			}
		};
		wrap();
	}, []);

	if (error && !data) {
		return (
			<>
				<PageHeader />
				<div>error xuy</div>
			</>
		);
	}

	if (data) {
		const vacancies = data.vacancies.map((e) => <VacancyCard {...e} />);
		return (
			<>
				<PageHeader />
				<div className="bg-white text-black pt-8 pb-16">
					<div className="w-1/2 mx-auto">
						<h3 className={styles.h3}>Результаты по запросу: {query_params}</h3>
						<BarChart data={data.graph.data} />
						<p className="font-bold ">
							Всего вакансий: {data.total} Топ 1% З/П: {data.top_dollar}{' '}
							Продвигаемые вакансии: {data.adverts}
							<br />
							Уникальных компаний: {data.unique_companies} Средняя З/П:{' '}
							{data.mean_salary}
						</p>
						<hr className="m-10" />
						{vacancies}
					</div>
				</div>
			</>
		);
	}
	return (
		<>
			<PageHeader />
			<div
			className="h-screen bg-white text-black"
			>

			<div className="w-min mx-auto pt-52 font-bold text-2xl">Loading...</div>
			</div>
		</>
	);
};

export async function getStaticPaths() {
	return {
		paths: [],
		fallback: true,
	};
}

export async function getStaticProps({ params }) {
	const decoded = Buffer.from(params.id, 'base64').toString();
	return {
		props: {
			query_params: decoded,
		},
	};
}

export default Query;
