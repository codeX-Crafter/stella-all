import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation2,
  Target,
  ShieldAlert,
  Cpu,
  Terminal,
  BarChart3,
  Zap,
  Globe,
} from "lucide-react";
import rawTelemetry from "/data/telemetry.json";

const telemetryData = rawTelemetry.trajectory_data || [];

const waypoints = [
  { id: 1, x: 10.2, y: 10.5, label: "ASCENT_A" },
  { id: 2, x: 22.5, y: 28.0, label: "MID_VECTOR" },
  { id: 3, x: 41.5, y: 39.2, label: "APEX_REACHED" },
  { id: 4, x: 20.1, y: 15.4, label: "DESCENT_B" },
  { id: 5, x: 0.5, y: 0.2, label: "TOUCHDOWN" },
];

const DETECTION_THRESHOLD = 1.8;

const Dashboard = () => {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [reachedWaypoints, setReachedWaypoints] = useState([]);

  const requestRef = useRef();
  const startTimeRef = useRef(null);

  const current = telemetryData[frameIndex] || telemetryData[0];
  const isJamming = current.time >= 3 && current.time <= 6;

  const getX = (val) => `${(val / 45) * 100}%`;
  const getY = (val) => `${100 - (val / 45) * 100}%`;

  const animate = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = (timestamp - startTimeRef.current) / 1000;
    const nextFrame = telemetryData.findIndex((f) => f.time >= elapsed);

    if (nextFrame !== -1 && nextFrame < telemetryData.length) {
      setFrameIndex(nextFrame);
      const data = telemetryData[nextFrame];

      // Proximity Detection logic (preserved)
      waypoints.forEach((wp) => {
        const dist = Math.sqrt(
          Math.pow(data.est_x - wp.x, 2) + Math.pow(data.est_y - wp.y, 2),
        );
        // Using a functional update to ensure state is based on latest reachedWaypoints
        if (dist < DETECTION_THRESHOLD) {
          setReachedWaypoints((prev) =>
            prev.includes(wp.id) ? prev : [...prev, wp.id],
          );
        }
      });
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(requestRef.current);
      startTimeRef.current = null;
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isRunning]); // Removed reachedWaypoints from deps to prevent animation jitter

  return (
    <div className="min-h-screen bg-[#0a0c10] text-cyan-400 font-mono p-6 uppercase selection:bg-cyan-500/30">
      {/* HEADER: High-Contrast */}
      <div className="flex justify-between items-stretch border-2 border-cyan-500 bg-[#0f172a] mb-6 h-20 shadow-[0_0_20px_rgba(0,255,255,0.1)] relative z-50">
        <div className="flex items-center px-8 gap-12">
          <div className="border-r-2 border-cyan-900 pr-12">
            <h1 className="text-white font-black text-2xl tracking-tighter ">
              DASHBOARD
            </h1>
            <p className="text-xs text-cyan-500 font-semibold">
              SYSTEM_ACTIVE{" "}
            </p>
          </div>

          <HeaderStat
            label="MISSION_CLOCK"
            value={`T+ ${current.time.toFixed(2)}s`}
            highlight
          />
          <HeaderStat label="NAV_MODE" value={current.nav_mode} highlight />

          {/* REAL-TIME OBJECTIVE COUNTER */}
          <div className="flex flex-col">
            <span className="text-cyan-600 text-[10px] font-black tracking-widest">
              OBJECTIVES
            </span>
            <span
              className={`text-2xl font-black leading-tight tracking-tighter ${reachedWaypoints.length === waypoints.length ? "text-emerald-400" : "text-white"}`}
            >
              {reachedWaypoints.length} / {waypoints.length}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-16 transition-all font-black text-lg ${
            isRunning
              ? "bg-red-600 text-white hover:bg-red-500"
              : "bg-cyan-400 text-black hover:bg-white"
          }`}
        >
          {isRunning ? "ABORT_LOG" : "EXECUTE"}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[700px]">
        {/* MAP SECTION */}
        <div className="col-span-8 bg-black border-2 border-cyan-900 relative rounded-lg overflow-hidden shadow-inner">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(#00ffff 1px, transparent 1px), linear-gradient(90deg, #00ffff 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {waypoints.map((wp) => (
            <div
              key={wp.id}
              className="absolute transition-transform"
              style={{ left: getX(wp.x), top: getY(wp.y) }}
            >
              <div className="relative -translate-x-1/2 -translate-y-1/2">
                <Target
                  size={24}
                  className={
                    reachedWaypoints.includes(wp.id)
                      ? "text-emerald-400 drop-shadow-[0_0_10px_#10b981]"
                      : "text-cyan-900"
                  }
                />
                <span
                  className={`absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold bg-black px-1 ${reachedWaypoints.includes(wp.id) ? "text-emerald-400" : "text-cyan-800"}`}
                >
                  {wp.label}
                </span>
              </div>
            </div>
          ))}

          <motion.div
            className="absolute z-50"
            animate={{ left: getX(current.est_x), top: getY(current.est_y) }}
            transition={{ duration: 0.1, ease: "linear" }}
          >
            <div className="relative -translate-x-1/2 -translate-y-1/2">
              <Navigation2
                className={`fill-current ${isJamming ? "text-red-500" : "text-cyan-400"} drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]`}
                size={32}
              />
            </div>
          </motion.div>
        </div>

        {/* RIGHT PANE */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="bg-[#111827] border-2 border-cyan-800 p-6 rounded-lg shadow-xl">
            <h2 className="text-white font-black text-sm flex items-center gap-2 mb-6 border-b-2 border-cyan-900 pb-2">
              <BarChart3 size={18} className="text-cyan-400" />{" "}
              RESIDUAL_ANALYSIS
            </h2>
            <div className="space-y-6">
              <BigStat
                label="ESTIMATION_ERROR"
                value={current.error.toFixed(5)}
                color={current.error > 1 ? "text-red-500" : "text-emerald-400"}
              />
              <BigStat
                label="CONFIDENCE_SCORE"
                value={`${current.confidence.toFixed(2)}%`}
              />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-black/50 p-3 border border-cyan-900">
                  <p className="text-cyan-600 text-[10px] font-bold">X_COORD</p>
                  <p className="text-white text-xl font-black">
                    {current.est_x.toFixed(2)}
                  </p>
                </div>
                <div className="bg-black/50 p-3 border border-cyan-900">
                  <p className="text-cyan-600 text-[10px] font-bold">Y_COORD</p>
                  <p className="text-white text-xl font-black">
                    {current.est_y.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0f172a] border-2 border-cyan-800 p-6 rounded-lg flex flex-col overflow-hidden">
            <h2 className="text-white font-black text-sm flex items-center gap-2 mb-4">
              <Terminal size={18} className="text-cyan-400" /> MISSION_LOGS
            </h2>
            <div className="flex-1 overflow-y-auto space-y-3 font-bold text-xs scrollbar-hide">
              <p className="text-cyan-600 border-l-2 border-cyan-600 pl-2 bg-cyan-600/5 py-1">
                [SYS] BOOTING_KALMAN_ENGINE...
              </p>
              {isJamming && (
                <p className="text-white bg-red-600 px-2 py-1 flex items-center gap-2 animate-pulse font-black text-[10px]">
                  <ShieldAlert size={14} /> ALERT: GNSS_JAMMING_ACTIVE
                </p>
              )}
              {reachedWaypoints.map((id) => (
                <p
                  key={id}
                  className="text-emerald-400 border-l-2 border-emerald-400 pl-2 bg-emerald-400/5 py-1"
                >
                  [OBJ] CAPTURED: WAYPOINT_0{id}
                </p>
              ))}
              <p className="text-cyan-500/60">[TELEMETRY] STREAMING_DATA...</p>
            </div>
          </div>

          <div className="bg-cyan-400 p-4 rounded-lg flex justify-between items-center shadow-[0_0_20px_rgba(0,255,255,0.2)]">
            <div className="flex gap-6">
              <StatusIcon icon={<Cpu size={16} />} label="CPU" />
              <StatusIcon icon={<Zap size={16} />} label="PWR" />
              <StatusIcon
                icon={<Globe size={16} />}
                label="SAT"
                warning={isJamming}
              />
            </div>
            <span className="text-black font-black text-xs">SYS_OK</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeaderStat = ({ label, value, color = "text-white", highlight }) => (
  <div className="flex flex-col">
    <span className="text-cyan-600 text-[10px] font-black tracking-widest">
      {label}
    </span>
    <span
      className={`${color} ${highlight ? "text-2xl" : "text-xl"} font-black leading-tight tracking-tighter`}
    >
      {value}
    </span>
  </div>
);

const BigStat = ({ label, value, color = "text-white" }) => (
  <div>
    <div className="flex justify-between items-end mb-1">
      <span className="text-cyan-700 text-[11px] font-black">{label}</span>
      <span className={`${color} text-lg font-black tracking-widest`}>
        {value}
      </span>
    </div>
    <div className="h-2 bg-black border border-cyan-900 overflow-hidden">
      <motion.div
        className={`h-full ${color.includes("red") ? "bg-red-500" : "bg-cyan-500"}`}
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 0.5 }}
      />
    </div>
  </div>
);

const StatusIcon = ({ icon, label, warning }) => (
  <div
    className={`flex items-center gap-2 ${warning ? "text-red-700" : "text-black"}`}
  >
    {icon}
    <span className="font-black text-[10px]">{label}</span>
  </div>
);

export default Dashboard;
