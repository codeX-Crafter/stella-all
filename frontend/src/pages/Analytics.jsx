import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Brush,
  ReferenceArea,
} from "recharts";
import {
  History,
  TrendingUp,
  ShieldAlert,
  Map as MapIcon,
  Clock,
  Download,
  Zap,
  BarChart3,
  ChevronRight,
  Activity,
} from "lucide-react";
import rawTelemetry from "/data/telemetry.json";

const Analytics = () => {
  const fullTrajectory = rawTelemetry.trajectory_data || [];
  const metrics = rawTelemetry.metrics || {};
  const jamInfo = rawTelemetry.jamming_analysis || {};

  // High-performance sampling (1:10) for charts
  const chartData = useMemo(() => {
    return fullTrajectory
      .filter((_, idx) => idx % 10 === 0)
      .map((d) => ({
        t: Number(d.time.toFixed(1)),
        error: d.error,
        confidence: d.confidence,
        true_x: d.true_x,
        true_y: d.true_y,
        est_x: d.est_x,
        est_y: d.est_y,
      }));
  }, [fullTrajectory]);

  // Syncing map scale with Dashboard: Maps 0-45 units to viewBox
  const getMapX = (val) => (val / 45) * 300;
  const getMapY = (val) => 200 - (val / 45) * 200;

  return (
    <div className="min-h-screen bg-[#0a0c10] text-cyan-400 font-mono p-6 uppercase tracking-wider selection:bg-cyan-500/30">
      {/* HEADER: Identical to Dashboard Height & Style */}
      <div className="flex justify-between items-stretch border-2 border-cyan-500 bg-[#0f172a] mb-6 h-20 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
        <div className="flex items-center px-8 gap-12">
          <div className="border-r-2 border-cyan-900 pr-12">
            <h1 className="text-white font-black text-2xl tracking-tighter">
              ANALYTICS
            </h1>
            <p className="text-xs text-cyan-500 font-semibold">
              POST_MISSION_DEBRIEF
            </p>
          </div>

          <HeaderStat
            label="SUCCESS_RATE"
            value={`${metrics.mission_success_rate}%`}
            color="text-emerald-400"
          />
          <HeaderStat label="TOTAL_TIME" value="89.90s" />
          <HeaderStat
            label="MAX_DRIFT"
            value={`${metrics.max_position_error}m`}
            color="text-red-500"
          />
        </div>

        {/* <button className="px-12 bg-cyan-400 text-black font-black text-sm hover:bg-white transition-all flex items-center gap-2">
          <Download size={18}/> EXPORT_BLACK_BOX
        </button> */}
      </div>

      <div className="grid grid-cols-12 gap-6 h-[700px]">
        {/* LEFT PANEL: SPATIAL DATA */}
        <div className="col-span-4 flex flex-col gap-6">
          <section className="bg-[#111827] border-2 border-cyan-800 p-6 rounded-lg shadow-xl flex-1">
            <h2 className="text-white font-black text-sm flex items-center gap-2 mb-6 border-b-2 border-cyan-900 pb-2">
              <MapIcon size={18} className="text-cyan-400" /> PATH_DIVERGENCE
            </h2>

            <div className="h-64 w-full bg-black border border-cyan-900 relative rounded-md overflow-hidden mb-6">
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)",
                  backgroundSize: "30px 30px",
                }}
              />
              <svg className="w-full h-full p-4 overflow-visible">
                {/* True Ground Path (White) */}
                <polyline
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="1"
                  strokeDasharray="5,5"
                  opacity="0.3"
                  points={chartData
                    .map((d) => `${getMapX(d.true_x)},${getMapY(d.true_y)}`)
                    .join(" ")}
                />
                {/* Kalman Filter Estimated Path (Neon Cyan) */}
                <polyline
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="3"
                  className="drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  points={chartData
                    .map((d) => `${getMapX(d.est_x)},${getMapY(d.est_y)}`)
                    .join(" ")}
                />
              </svg>
              <div className="absolute bottom-2 right-2 text-[8px] flex flex-col items-end gap-1 font-bold">
                <span className="text-cyan-400">● EST_TRAJECTORY</span>
                <span className="text-white/40">○ TRUE_POSITION</span>
              </div>
            </div>

            <div className="space-y-4">
              <MetricLine label="AVG_RESIDUAL" value="0.18m" />
              <MetricLine
                label="PEAK_DIVERGENCE"
                value={`${metrics.max_position_error}m`}
                color="text-red-500"
              />
              <MetricLine
                label="SIGNAL_STRENGTH"
                value="98.2%"
                color="text-emerald-400"
              />
              <MetricLine label="SATELLITE_LOCK" value="12_SAT" />
            </div>
          </section>

          <section className="bg-red-950/20 border-2 border-red-900 p-5 rounded-lg">
            <h3 className="text-red-500 font-black text-xs mb-3 flex items-center gap-2 animate-pulse">
              <ShieldAlert size={16} /> JAMMING_IMPACT_REPORT
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/50 p-3 border border-red-900/50">
                <p className="text-red-900 text-[10px] font-black">
                  DRIFT_INCREASE
                </p>
                <p className="text-white text-xl font-black">104%</p>
              </div>
              <div className="bg-black/50 p-3 border border-red-900/50">
                <p className="text-red-900 text-[10px] font-black">
                  RECOVERY_TIME
                </p>
                <p className="text-white text-xl font-black">
                  {jamInfo.recovery_time}s
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* CENTER PANEL: GRAPHS (Matches Dashboard Layout) */}
        <div className="col-span-5 flex flex-col gap-6">
          <ChartContainer
            title="ERROR_LOG_CHART"
            icon={<BarChart3 size={18} />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#0ea5e910"
                  vertical={false}
                />
                <XAxis
                  dataKey="t"
                  stroke="#0ea5e940"
                  fontSize={10}
                  axisLine={false}
                />
                <YAxis stroke="#0ea5e940" fontSize={10} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "2px solid #06b6d4",
                    color: "#fff",
                  }}
                  itemStyle={{ color: "#22d3ee" }}
                />
                <ReferenceArea
                  x1={3}
                  x2={6}
                  fill="#ef4444"
                  fillOpacity={0.1}
                  label={{
                    value: "JAMMING",
                    position: "top",
                    fill: "#ef4444",
                    fontSize: 10,
                    fontWeight: "black",
                  }}
                />
                <Area
                  type="step"
                  dataKey="error"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  fill="#22d3ee"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>

          <ChartContainer
            title="KALMAN_FUSION_CONFIDENCE"
            icon={<Zap size={18} />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#0ea5e910"
                  vertical={false}
                />
                <XAxis
                  dataKey="t"
                  stroke="#0ea5e940"
                  fontSize={10}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#0ea5e940"
                  fontSize={10}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "2px solid #10b981",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                />
                <Brush
                  dataKey="t"
                  height={20}
                  stroke="#0ea5e920"
                  fill="#0a0c10"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* RIGHT PANEL: LOGS/TIMELINE (Matches Dashboard Log Style) */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="flex-1 bg-[#111827] border-2 border-cyan-800 p-6 rounded-lg flex flex-col overflow-hidden">
            <h2 className="text-white font-black text-sm flex items-center gap-2 mb-6 border-b-2 border-cyan-900 pb-2">
              <Clock size={18} className="text-cyan-400" /> MISSION_TIMELINE
            </h2>
            <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
              <TimelineItem
                time="00.0s"
                label="LAUNCH_INIT"
                status="SUCCESS"
                color="text-emerald-500"
              />
              <TimelineItem
                time="03.0s"
                label="SIGNAL_LOSS"
                status="JAM_DETECTED"
                color="text-red-500"
                highlight
              />
              <TimelineItem
                time="06.0s"
                label="SIGNAL_SYNC"
                status="RE-ACQUIRED"
                color="text-cyan-400"
              />
              <TimelineItem
                time="89.9s"
                label="MISSION_END"
                status="LANDED"
                color="text-emerald-500"
              />
            </div>
          </div>

          <div className="bg-cyan-400 p-5 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.2)]">
            <div className="flex items-center gap-2 mb-2 text-black font-black text-xs">
              <Activity size={16} /> ALGO_SUMMARY
            </div>
            <p className="text-black font-bold text-[10px] leading-tight">
              The Stella-Protocol successfully mitigated GNSS noise spikes.
              Residuals remained within safe operating limits during active
              jamming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- SHARED COMPONENTS (ALIGNED TO DASHBOARD) --- */

const HeaderStat = ({ label, value, color = "text-white" }) => (
  <div className="flex flex-col">
    <span className="text-cyan-600 text-[10px] font-black tracking-widest">
      {label}
    </span>
    <span
      className={`${color} text-2xl font-black leading-tight tracking-tighter`}
    >
      {value}
    </span>
  </div>
);

const ChartContainer = ({ title, icon, children }) => (
  <div className="bg-[#0f172a] border-2 border-cyan-800 p-6 rounded-lg flex-1 shadow-inner">
    <h2 className="text-white font-black text-sm flex items-center gap-2 mb-8">
      <span className="text-cyan-400">{icon}</span> {title}
    </h2>
    <div className="h-[75%]">{children}</div>
  </div>
);

const MetricLine = ({ label, value, color = "text-white" }) => (
  <div className="flex justify-between items-center border-b border-cyan-900/50 pb-2">
    <span className="text-cyan-700 font-black text-[10px]">{label}</span>
    <span className={`${color} font-black text-xs tracking-widest`}>
      {value}
    </span>
  </div>
);

const TimelineItem = ({ time, label, status, color, highlight }) => (
  <div
    className={`relative pl-6 border-l-2 ${highlight ? "border-red-600" : "border-cyan-900"}`}
  >
    <div
      className={`absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-[#0a0c10] border-2 ${highlight ? "border-red-600 shadow-[0_0_10px_red]" : "border-cyan-500"}`}
    />
    <div className="text-[10px] text-cyan-600 font-bold mb-1 tracking-tighter">
      {time}
    </div>
    <div className="text-white font-black text-xs mb-1">{label}</div>
    <div className={`${color} text-[10px] font-black`}>{status}</div>
  </div>
);

export default Analytics;
