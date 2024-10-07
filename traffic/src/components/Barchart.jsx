import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Barchart = ({ data }) => {
  return (
    <BarChart
      width={1000}
      height={500}
      data={data}
      margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        dataKey="_id"
        tick={{ angle: -30, textAnchor: 'end' }}
        interval={0}
      />
      <YAxis />
      <Tooltip />
      <Bar dataKey="totalDuration" fill="#4caf50"  />
    </BarChart>
  );
};

export default Barchart;
