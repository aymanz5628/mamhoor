"use client";

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

interface DashboardChartsProps {
  statusData: { name: string; value: number; color: string }[];
  activityData: { date: string; count: number }[];
}

export function StatusPieChart({ statusData }: { statusData: DashboardChartsProps['statusData'] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>جاري تحميل الرسوم...</div>;

  const data = statusData.filter(d => d.value > 0);

  if (data.length === 0) {
    return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>لا توجد بيانات لعرضها</div>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value} مادة`, '']}
            contentStyle={{ 
              borderRadius: 'var(--radius-lg)', 
              border: 'none', 
              boxShadow: 'var(--shadow-md)',
              fontFamily: 'var(--font-body)',
              direction: 'rtl'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityBarChart({ activityData }: { activityData: DashboardChartsProps['activityData'] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>جاري تحميل الرسوم...</div>;

  if (activityData.length === 0) {
    return <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>لا توجد نشاطات لعرضها</div>;
  }

  return (
    <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={activityData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-body)' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-body)' }}
            allowDecimals={false}
            dx={-10}
          />
          <Tooltip 
            cursor={{ fill: 'var(--bg-secondary)' }}
            contentStyle={{ 
              borderRadius: 'var(--radius-lg)', 
              border: 'none', 
              boxShadow: 'var(--shadow-md)',
              fontFamily: 'var(--font-body)',
              direction: 'rtl'
            }}
            formatter={(value: number) => [`${value} نشاط`, '']}
          />
          <Bar 
            dataKey="count" 
            fill="var(--indigo)" 
            radius={[4, 4, 0, 0]} 
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
