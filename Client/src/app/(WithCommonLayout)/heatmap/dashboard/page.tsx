"use client";

import React, { useEffect, useState } from 'react';
import Container from '@/src/components/UI/Container';
import InteractiveHeatmap from '@/src/components/modules/Home/InteractiveHeatmap';
import { getDashboard } from '@/src/services/AnalyticsService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const POLL_INTERVAL = 15000; // 15 seconds

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const resp = await getDashboard();
      setData(resp.data);
    } catch (err) {
      // ignore for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    const id = setInterval(fetch, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  // Transformations
  const crimesPerHour = (data?.crimesPerHour || []).map((r: any) => ({
    hour: r.hour ? new Date(r.hour).toLocaleTimeString([], { hour: '2-digit' }) : r.hour,
    count: r.count || r.cnt || 0,
  }));

  const trend = (data?.trend || []).map((r: any) => ({ day: r.day, cnt: r.cnt, ma_7d: r.ma_7d }));

  const typeDist = (data?.typeDist || []).map((r: any) => ({ name: r.category || r.category, value: parseInt(r.cnt || r.count || 0, 10) }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Container>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Real-time Crime Dashboard</h1>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2">
              <section className="mb-6 bg-white p-4 rounded shadow-sm">
                <h2 className="font-semibold mb-2">Crimes per Hour (24h)</h2>
                {crimesPerHour.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={crimesPerHour}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-sm text-gray-500 p-6">No recent data available for the last 24 hours.</div>
                )}
              </section>

              <section className="mb-6 bg-white p-4 rounded shadow-sm">
                <h2 className="font-semibold mb-2">Crime Trend (90d with 7-day MA)</h2>
                {trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="colorCnt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="cnt" stroke="#8884d8" fillOpacity={1} fill="url(#colorCnt)" />
                    <Line type="monotone" dataKey="ma_7d" stroke="#FF8042" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-sm text-gray-500 p-6">Insufficient historical data to render trend.</div>
                )}
              </section>

              <section className="mb-4 bg-white p-4 rounded shadow-sm">
                <h2 className="font-semibold mb-2">Time Patterns (hour of day)</h2>
                <pre className="mt-2 bg-slate-100 p-3 rounded">{JSON.stringify(data?.timePatterns, null, 2)}</pre>
              </section>
            </div>

            <aside>
              <section className="mb-6 bg-white p-4 rounded shadow-sm">
                <h3 className="font-semibold mb-2">Hotspots (top 10)</h3>
                <ul className="space-y-2 max-h-44 overflow-auto">
                  {(data?.hotspots || []).map((h: any) => (
                    <li key={h.district} className="flex justify-between">
                      <div>
                        <div className="font-medium">{h.district}</div>
                        <div className="text-xs text-gray-500">{h.lat},{h.lon}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{h.cnt}</div>
                        <div className="text-xs text-gray-500">incidents</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mb-6 bg-white p-4 rounded shadow-sm">
                <h3 className="font-semibold mb-2">Crime Type Distribution</h3>
                {typeDist.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={typeDist} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} label>
                        {typeDist.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-sm text-gray-500 p-6">No crime type distribution found.</div>
                )}
              </section>

              <section className="bg-white p-4 rounded shadow-sm">
                <h3 className="font-semibold mb-2">Response Effectiveness</h3>
                {data?.responseEffectiveness ? (
                  <pre className="mt-2 bg-slate-100 p-3 rounded">{JSON.stringify(data?.responseEffectiveness, null, 2)}</pre>
                ) : (
                  <div className="text-sm text-gray-500 p-4">No response time data available.</div>
                )}
              </section>
            </aside>

            <div className="col-span-3 mt-6">
              <h3 className="font-semibold mb-2">Map Overview</h3>
              <div className="h-96 rounded overflow-hidden">
                <InteractiveHeatmap />
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
