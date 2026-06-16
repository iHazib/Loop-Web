import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Activity, Globe, Zap, ChevronRight, ArrowUpRight, RefreshCw, Shield, Database, TrendingUp } from 'lucide-react';

const navItems = ['Overview', 'Retail', 'Logistics', 'Distribution', 'Protection'];

const metrics = [
  { label: 'GMV', value: '£4.87M', change: '+18.4%', up: true, icon: Globe },
  { label: 'Margin', value: '31.2%', change: '+2.1pp', up: true, icon: Activity },
  { label: 'Sell-Through', value: '82%', change: '+4.7pp', up: true, icon: Zap },
  { label: 'Risk Index', value: 'Low', change: '2 alerts', up: true, icon: Database },
];

const activityFeed = [
  { node: 'Amazon UK', event: 'Listing sync complete', time: '2m ago', status: 'ok' },
  { node: 'TikTok Shop', event: 'Demand spike detected', time: '8m ago', status: 'warn' },
  { node: 'Counterfeit Radar', event: 'Rogue seller flagged', time: '14m ago', status: 'warn' },
  { node: 'FBA Fulfilment', event: 'Shipment dispatched', time: '1h ago', status: 'ok' },
  { node: 'DTC Store', event: 'New order received', time: '2h ago', status: 'info' },
];

const chartData = [40, 55, 50, 70, 65, 80, 75, 88, 85, 95, 90, 100];
const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'];

export function DashboardSection() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <section className="w-full bg-[#060606] py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-red/5 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-red/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-[1200px] mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-brand-red uppercase mb-3 block">• Live Demo</span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-5xl md:text-6xl font-medium tracking-tighter text-white leading-[1.05]"
            >
              Your operating<br />dashboard.
            </motion.h2>
          </div>
          <p className="text-gray-500 text-sm max-w-xs font-light">
            All channels. Last 28 days. Real-time single view of everything — synced across every retail, logistics and protection layer.
          </p>
        </div>

        {/* Dashboard Shell */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-3xl border border-white/8 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
          style={{ background: 'linear-gradient(160deg, #151515 0%, #0f0f0f 100%)' }}
        >
          {/* Window Chrome */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#111]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-1.5 border border-white/5">
              <div className="w-2 h-2 rounded-full bg-brand-red" />
              <span className="text-xs font-mono text-gray-400">loopretail.io / dashboard</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-[10px] font-mono">Live</span>
            </div>
          </div>

          {/* Sidebar + Content */}
          <div className="flex">
            {/* Sidebar */}
            <div className="w-56 border-r border-white/5 p-4 flex flex-col gap-1 hidden md:flex shrink-0">
              <div className="flex items-center gap-2 px-3 py-2 mb-4">
                <div className="w-5 h-5 rounded bg-brand-red flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-sm" />
                </div>
                <div>
                  <span className="text-sm font-display font-semibold text-white block">Halcyon Foods</span>
                  <span className="text-[9px] font-mono tracking-widest text-brand-red">SCALE PLAN</span>
                </div>
              </div>
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    activeTab === item
                      ? 'bg-brand-red/15 text-brand-red border border-brand-red/20'
                      : 'text-gray-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item === 'Overview' && <BarChart3 size={14} />}
                  {item === 'Retail' && <Globe size={14} />}
                  {item === 'Logistics' && <Activity size={14} />}
                  {item === 'Distribution' && <TrendingUp size={14} />}
                  {item === 'Protection' && <Shield size={14} />}
                  {item}
                  {activeTab === item && <ChevronRight size={12} className="ml-auto" />}
                </button>
              ))}

              <div className="mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-red to-[#8b0000] flex items-center justify-center text-[9px] font-bold text-white">H</div>
                  <div>
                    <p className="text-xs text-white font-medium">Halcyon Foods</p>
                    <p className="text-[9px] text-gray-500">admin@loopretail.io</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-5 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Top bar */}
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-display text-white text-lg font-medium">{activeTab}</h3>
                      <p className="text-[10px] text-gray-500 font-mono">Last updated: just now</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-[10px] font-mono tracking-widest text-brand-red border border-brand-red/30 px-3 py-1.5 rounded-lg hover:bg-brand-red/10 transition-colors">
                      FULL REPORT <ArrowUpRight size={10} />
                    </button>
                  </div>

                  {/* Metric cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                    {metrics.map((m, i) => {
                      const Icon = m.icon;
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white/3 border border-white/5 rounded-2xl p-4 hover:border-brand-red/20 hover:bg-brand-red/5 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <Icon size={14} className="text-gray-500 group-hover:text-brand-red transition-colors" />
                            <span className={`text-[9px] font-mono ${m.up ? 'text-green-400' : 'text-brand-red'}`}>{m.change}</span>
                          </div>
                          <p className="font-display text-xl font-semibold text-white tracking-tight">{m.value}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{m.label}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Chart + Feed */}
                  <div className="grid md:grid-cols-5 gap-3">
                    {/* Bar chart */}
                    <div className="md:col-span-3 bg-white/3 border border-white/5 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-5">
                        <p className="text-xs font-medium text-white">Channel growth velocity</p>
                        <span className="text-[9px] font-mono text-gray-500">12-week rolling · indexed to week 1</span>
                      </div>
                      <div className="flex items-end gap-1.5 h-28">
                        {chartData.map((val, i) => (
                          <div
                            key={i}
                            className="flex-1 flex flex-col items-center gap-1 cursor-pointer group"
                            onMouseEnter={() => setHoveredBar(i)}
                            onMouseLeave={() => setHoveredBar(null)}
                          >
                            <AnimatePresence>
                              {hoveredBar === i && (
                                <motion.span
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  className="text-[8px] font-mono text-white"
                                >
                                  {val}%
                                </motion.span>
                              )}
                            </AnimatePresence>
                            <motion.div
                              initial={{ scaleY: 0 }}
                              animate={{ scaleY: 1 }}
                              transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' }}
                              style={{ height: `${val}%`, originY: 1 }}
                              className={`w-full rounded-t-sm transition-colors ${
                                hoveredBar === i ? 'bg-brand-red' : 'bg-white/10 group-hover:bg-white/20'
                              }`}
                            />
                            <span className="text-[7px] font-mono text-gray-600">{weeks[i].replace('W', '')}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Activity feed */}
                    <div className="md:col-span-2 bg-white/3 border border-white/5 rounded-2xl p-5">
                      <p className="text-xs font-medium text-white mb-4">Activity Feed</p>
                      <div className="space-y-3">
                        {activityFeed.map((item, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            className="flex items-start gap-2.5"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                              item.status === 'ok' ? 'bg-green-400' : item.status === 'warn' ? 'bg-yellow-400' : 'bg-blue-400'
                            }`} />
                            <div className="min-w-0">
                              <p className="text-[10px] text-white font-medium truncate">{item.node}</p>
                              <p className="text-[9px] text-gray-500 truncate">{item.event}</p>
                            </div>
                            <span className="text-[8px] font-mono text-gray-600 shrink-0 ml-auto">{item.time}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
