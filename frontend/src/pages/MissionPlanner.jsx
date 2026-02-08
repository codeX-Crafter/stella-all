import React, { useState, useRef } from "react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import {
  Map as MapIcon,
  Trash2,
  Navigation,
  GripVertical,
  Target,
  Send,
  Activity,
  Calendar,
  Layers,
  Wind,
  ShieldCheck,
  Zap,
  Cpu,
} from "lucide-react";

const MissionPlanner = () => {
  // --- MISSION PLANNING STATE ---
  const [waypoints, setWaypoints] = useState([
    { id: "1", x: 150, y: 150, alt: 50 },
    { id: "2", x: 450, y: 200, alt: 100 },
  ]);
  const [missionName, setMissionName] = useState("MISSION_007");
  const [isScheduled, setIsScheduled] = useState(false);
  const [selectedPayload, setSelectedPayload] = useState("EO/IR_SENSOR");

  const mapRef = useRef(null);

  const addLog = (msg) => {
    // Logic for log display can be added here
    console.log(`[SYS]: ${msg}`);
  };

  const handleMapClick = (e) => {
    if (isScheduled) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Auto-calculate relative altitude based on previous WP
    const lastAlt =
      waypoints.length > 0 ? waypoints[waypoints.length - 1].alt : 50;

    setWaypoints([
      ...waypoints,
      {
        id: Date.now().toString(),
        x,
        y,
        alt: lastAlt,
      },
    ]);
  };

  const removeWaypoint = (id) => {
    setWaypoints(waypoints.filter((wp) => wp.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-cyan-500 font-mono p-6 uppercase tracking-widest selection:bg-cyan-500/30">
      {/* HEADER: MISSION INTEL */}
      <header className="flex justify-between items-stretch border-2 border-cyan-500 bg-[#0f172a] mb-6 h-20 shadow-[0_0_20px_rgba(0,255,255,0.1)]">
        <div className="flex items-center px-8 gap-12">
          <div className="border-r-2 border-cyan-900 pr-12">
            <input
              value={missionName}
              onChange={(e) => setMissionName(e.target.value)}
              className="bg-transparent text-white font-black text-2xl tracking-tighter border-none focus:outline-none focus:ring-1 ring-cyan-500/50"
            />
            <p className="text-[10px] text-cyan-600 font-bold">
              PLANNING_STATUS: <span className="text-white">DRAFT_ALPHA</span>
            </p>
          </div>

          <PlanningStat
            icon={<Calendar size={14} />}
            label="SCHEDULED_FOR"
            value="T-02:45:00"
          />
          <PlanningStat
            icon={<Layers size={14} />}
            label="TOTAL_WPS"
            value={waypoints.length}
          />
          <PlanningStat
            icon={<Wind size={14} />}
            label="EST_FLIGHT_TIME"
            value={`${(waypoints.length * 12.5).toFixed(1)}s`}
          />
        </div>

        <button
          onClick={() => setIsScheduled(!isScheduled)}
          className={`px-12 font-black text-sm transition-all flex items-center gap-3 ${
            isScheduled
              ? "bg-emerald-500 text-black"
              : "bg-cyan-400 text-black hover:bg-white"
          }`}
        >
          {isScheduled ? (
            <>
              <ShieldCheck size={20} /> MISSION_LOCKED
            </>
          ) : (
            <>
              <Target size={20} /> SCHEDULE_MISSION
            </>
          )}
        </button>
      </header>

      <div className="grid grid-cols-12 gap-6 h-[700px]">
        {/* LEFT: SEQUENCE MANAGER */}
        <aside className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#111827] border-2 border-cyan-800 p-6 rounded-lg shadow-xl flex-1 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6 border-b-2 border-cyan-900 pb-2">
              <h2 className="text-white font-black text-sm flex items-center gap-2">
                <Navigation size={18} className="rotate-45 text-cyan-400" />{" "}
                FLIGHT_PATH
              </h2>
              <button
                onClick={() => setWaypoints([])}
                className="text-red-500 hover:text-white transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <Reorder.Group
              axis="y"
              values={waypoints}
              onReorder={setWaypoints}
              className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1"
            >
              {waypoints.map((wp, index) => (
                <Reorder.Item
                  key={wp.id}
                  value={wp}
                  className="p-4 border-2 border-cyan-900 bg-black/40 flex items-center justify-between group cursor-move hover:border-cyan-500 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <GripVertical
                      size={14}
                      className="text-cyan-900 group-hover:text-cyan-500"
                    />
                    <div>
                      <p className="text-[8px] text-cyan-700 font-black">
                        WP_0{index + 1}
                      </p>
                      <p className="text-white text-xs font-black">
                        {Math.round(wp.x)}X {Math.round(wp.y)}Y
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-cyan-700 font-black">ALT</p>
                    <p className="text-emerald-400 text-xs font-black">
                      {wp.alt}m
                    </p>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <div className="mt-6 pt-4 border-t-2 border-cyan-900">
              <p className="text-[9px] text-cyan-600 mb-3 font-black">
                PAYLOAD_CONFIG
              </p>
              <select
                value={selectedPayload}
                onChange={(e) => setSelectedPayload(e.target.value)}
                className="w-full bg-black border-2 border-cyan-900 p-2 text-[10px] text-white font-bold focus:border-cyan-500 outline-none"
              >
                <option>EO/IR_SENSOR</option>
                <option>SIGNAL_JAMMER_V2</option>
                <option>SAR_IMAGER</option>
              </select>
            </div>
          </div>
        </aside>

        {/* CENTER: TACTICAL MAP CHART */}
        <main className="col-span-6 bg-black border-2 border-cyan-900 relative rounded-lg overflow-hidden group">
          <div
            ref={mapRef}
            onClick={handleMapClick}
            className={`absolute inset-0 transition-opacity ${isScheduled ? "opacity-50 grayscale" : "opacity-100"}`}
            style={{
              backgroundImage:
                "linear-gradient(#00ffff05 1px, transparent 1px), linear-gradient(90deg, #00ffff05 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              cursor: isScheduled ? "not-allowed" : "crosshair",
            }}
          >
            {/* SVG Trajectory Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {waypoints.length > 1 && (
                <polyline
                  points={waypoints.map((w) => `${w.x},${w.y}`).join(" ")}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2"
                  strokeDasharray="10,5"
                  className="animate-[dash_20s_linear_infinite]"
                />
              )}
            </svg>

            {/* Waypoint Markers */}
            <AnimatePresence>
              {waypoints.map((wp, idx) => (
                <motion.div
                  key={wp.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: wp.x, top: wp.y }}
                >
                  <div className="relative group/wp">
                    <div className="w-8 h-8 border-2 border-cyan-500/30 rounded-full flex items-center justify-center group-hover/wp:border-cyan-400 transition-all">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
                    </div>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black border border-cyan-900 px-2 py-1 whitespace-nowrap z-30">
                      <p className="text-[8px] font-black text-white">
                        WAYPOINT_0{idx + 1}
                      </p>
                      <p className="text-[7px] font-bold text-emerald-400">
                        {wp.alt}M MSL
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Scale Overlay */}
            <div className="absolute bottom-6 left-6 flex gap-4 pointer-events-none">
              <div className="border-l-2 border-b-2 border-cyan-500 w-12 h-12" />
              <div className="text-[8px] font-black self-end">
                REF_GRID: 500m x 500m
              </div>
            </div>
          </div>

          {isScheduled && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
              <div className="bg-[#0f172a] border-2 border-emerald-500 p-4 animate-pulse">
                <p className="text-emerald-500 font-black text-xl italic tracking-tighter">
                  DATA_LOCKED_FOR_UPLINK
                </p>
              </div>
            </div>
          )}
        </main>

        {/* RIGHT: PRE-FLIGHT CHECKLIST */}
        <aside className="col-span-3 flex flex-col gap-6">
          <div className="bg-[#111827] border-2 border-cyan-800 p-6 rounded-lg shadow-xl flex-grow">
            <h2 className="text-white font-black text-sm flex items-center gap-2 mb-6 border-b-2 border-cyan-900 pb-2">
              <Activity size={18} className="text-cyan-400" /> PRE-FLIGHT_TASKS
            </h2>
            <div className="space-y-4">
              <CheckItem label="GPS_SIGNAL_QUALITY" status="OPTIMAL" />
              <CheckItem label="INERTIAL_SENSORS" status="CALIBRATED" />
              <CheckItem label="KALMAN_CORE_INIT" status="READY" />
              <CheckItem label="BATTERY_RESERVE" status="94%" />
              <CheckItem label="COMMS_ENCRYPTION" status="AES-256" />
            </div>

            <div className="mt-12 bg-black border-2 border-cyan-900 p-4">
              <div className="flex items-center gap-3 mb-4">
                <Cpu size={24} className="text-cyan-500" />
                <div>
                  <p className="text-white font-black text-[10px]">
                    UAV_LINK_STATUS
                  </p>
                  <p className="text-cyan-800 text-[8px] font-bold tracking-[0.2em]">
                    ENCRYPTED_HANDSHAKE
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <div className="w-12 h-1 bg-cyan-500 animate-pulse" />
                <div className="w-12 h-1 bg-cyan-900" />
                <div className="w-12 h-1 bg-cyan-500 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="bg-cyan-400 p-4 rounded-lg shadow-[0_0_20px_rgba(0,255,255,0.2)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap size={20} className="text-black" />
              <span className="text-black font-black text-xs">
                UAV_READY_FOR_SYNC
              </span>
            </div>
            <div className="w-2 h-2 rounded-full bg-black animate-ping" />
          </div>
        </aside>
      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const PlanningStat = ({ icon, label, value }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-1 text-cyan-600">
      {icon}{" "}
      <span className="text-[9px] font-black tracking-widest">{label}</span>
    </div>
    <span className="text-white text-xl font-black leading-tight tracking-tighter">
      {value}
    </span>
  </div>
);

const CheckItem = ({ label, status }) => (
  <div className="flex justify-between items-center border-b border-cyan-900/50 pb-2">
    <span className="text-cyan-700 font-black text-[9px]">{label}</span>
    <span className="text-emerald-400 font-black text-[9px]">{status}</span>
  </div>
);

export default MissionPlanner;
