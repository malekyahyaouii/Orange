import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Linechart = ({ data }) => {
  return (
    <LineChart width={800} height={400} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="Mois" />
      <YAxis  dataKey="totalDuration" />
      <Tooltip />
      <Line type="monotone" dataKey="totalDuration" stroke="#8884d8" />
    </LineChart>
  );
};

export default Linechart;
