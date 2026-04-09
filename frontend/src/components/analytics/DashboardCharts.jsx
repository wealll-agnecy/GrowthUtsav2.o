import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#60a5fa', '#3b82f6'];

const CustomTooltip = ({ active, payload, label, isDark }) => {
    if (active && payload && payload.length) {
        return (
            <div className={`p-3 rounded-4 shadow-2xl border ${isDark ? 'glass-panel border-white/10' : 'bg-white border-slate-200'}`} style={{ backdropFilter: 'blur(20px)' }}>
                <p className={`small fw-black text-uppercase tracking-widest mb-1 ${isDark ? 'text-white-50' : 'text-slate-500'}`}>{label}</p>
                <p className="h5 fw-black text-primary m-0">₹{payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

export const RevenueChart = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const tickColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15, 23, 42, 0.5)';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15, 23, 42, 0.05)';

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: tickColor, fontWeight: 'bold' }} 
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: tickColor, fontWeight: 'bold' }} 
                    />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#6366f1" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorRev)" 
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const TicketDistributionChart = ({ data, title }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const textColor = isDark ? 'rgba(255,255,255,0.6)' : '#0f172a';

    return (
        <div className="h-100 d-flex flex-column">
            <h5 className="fw-black small text-uppercase tracking-widest mb-4" style={{ color: textColor }}>{title}</h5>
            <div className="flex-grow-1" style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : '#fff', 
                                borderRadius: '15px', 
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                backdropFilter: 'blur(10px)'
                            }} 
                            itemStyle={{ color: isDark ? '#fff' : '#0f172a', fontWeight: 'bold' }}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle" 
                            formatter={(value) => <span className="small fw-bold text-uppercase tracking-tighter" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15, 23, 42, 0.6)' }}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export const CategoryPerformanceChart = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const tickColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15, 23, 42, 0.5)';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15, 23, 42, 0.05)';
    const textColor = isDark ? 'rgba(255,255,255,0.6)' : '#0f172a';

    return (
        <div style={{ width: '100%', height: 300 }}>
            <h5 className="fw-black small text-uppercase tracking-widest mb-4" style={{ color: textColor }}>Node Saturation by Category</h5>
            <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: tickColor, fontWeight: 'bold' }} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: tickColor, fontWeight: 'bold' }} 
                        />
                        <Tooltip 
                            cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15, 23, 42, 0.03)' }} 
                            contentStyle={{ 
                                backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : '#fff', 
                                borderRadius: '15px', 
                                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                                backdropFilter: 'blur(10px)'
                            }}
                            itemStyle={{ color: isDark ? '#fff' : '#0f172a', fontWeight: 'bold' }}
                        />
                        <Bar 
                            dataKey="sales" 
                            fill="url(#colorRev)" 
                            radius={[8, 8, 0, 0]} 
                            barSize={40}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : 'rgba(99, 102, 241, 0.3)'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
