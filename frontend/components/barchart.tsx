import { Bar } from '@reactchartjs/react-chart.js'

const options = {
  scales: {
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          callback: (v,i,vv) => `${v}%`
        },
      },
    ],
  },
}
export interface Dataset {
  label: string,
  data: number[],
  backgroundColor: string[],
  borderColor: string[],
  borderWidth: number,
}

export interface ChartJsData {
  labels: string[],
  datasets: Dataset[]
}

export interface ChartProps {
  data: Map<string, number>
}
const repeatX = (x: any, times: number): any[] => new Array(times).fill(x);

const processData = (_data: Map<string, number>) => {
  const data = new Map(_data);
  const ret: ChartJsData = {} as ChartJsData;
  ret.labels = [...data.keys()];

  const dataset: Dataset = {} as Dataset;
  const values = [...data.values()];

  dataset.backgroundColor = repeatX('rgba(255, 99, 132, 0.2)', values.length);
  dataset.borderColor = repeatX('rgba(255, 99, 132, 1)', values.length);
  dataset.borderWidth = 1;
  dataset.label = 'Распределение деняг',
  dataset.data = values;

  ret.datasets = [
    dataset
  ];
  console.log(ret)
  return ret;
}
const VerticalBar = ({ data }: ChartProps) => {

  const processed = processData(data);
  return (
    <div className="">
    < //@ts-ignore 
      Bar data={processed} options={options} />
    </div>
  )
}
export default VerticalBar