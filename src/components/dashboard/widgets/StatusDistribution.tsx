import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { listAppointments } from '../../../api/appointments';

const StatusDistribution: React.FC = () => {
    const [data, setData] = useState([
        { name: 'Scheduled', value: 0, count: 0, color: '#0061BC' },
        { name: 'Completed', value: 0, count: 0, color: '#ADCFFF' },
        { name: 'Cancelled', value: 0, count: 0, color: '#5C6B89' },
        { name: 'No-Show', value: 0, count: 0, color: '#D1DBE8' },
    ]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDistribution = async () => {
            setLoading(true);
            try {
                // Fetch up to 100 recent appointments to calculate distribution
                const res = await listAppointments({ PageIndex: 0, PageSize: 100 });
                const list = Array.isArray(res) ? res : ((res?.data as any)?.items || (res?.data as any)?.data || (res?.data as any)?.appointments || (Array.isArray(res?.data) ? res.data : []) || []);
                
                if (list && list.length > 0) {
                    let scheduled = 0;
                    let completed = 0;
                    let cancelled = 0;
                    let noShow = 0;

                    list.forEach((appt: any) => {
                        const status = appt.status || appt.Status;
                        // 1=Scheduled, 2=InProgress, 3=Completed, 4=NoShow, 5=Cancelled, 6=WaitingList
                        if (status === 3) completed++;
                        else if (status === 5) cancelled++;
                        else if (status === 4) noShow++;
                        else scheduled++; // Default others to scheduled/active
                    });

                    const totalAppts = list.length;
                    setTotal(totalAppts);

                    setData([
                        { name: 'Scheduled', count: scheduled, value: Math.round((scheduled / totalAppts) * 100), color: '#0061BC' },
                        { name: 'Completed', count: completed, value: Math.round((completed / totalAppts) * 100), color: '#ADCFFF' },
                        { name: 'Cancelled', count: cancelled, value: Math.round((cancelled / totalAppts) * 100), color: '#5C6B89' },
                        { name: 'No-Show', count: noShow, value: Math.round((noShow / totalAppts) * 100), color: '#D1DBE8' },
                    ]);
                } else {
                    setTotal(0);
                    setData(data.map(d => ({ ...d, value: 0, count: 0 })));
                }
            } catch (error) {
                console.error("Failed to fetch appointment distribution:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDistribution();
    }, []);

    const size = 180;
    const strokeWidth = 14;
    const radius = 20; 
    
    const halfStroke = strokeWidth / 2;
    const straightLength = size - strokeWidth - 2 * radius;
    const arcLength = (Math.PI * radius) / 2;
    const totalLength = 4 * straightLength + 4 * arcLength;
    
    let currentOffset = 0;

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col min-h-[280px]">
            <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-8">Status Distribution</h3>
            
            {loading ? (
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="animate-spin text-slate-300" size={32} />
                </div>
            ) : total === 0 ? (
                <div className="flex-1 flex justify-center items-center text-sm text-slate-500">
                    No data available
                </div>
            ) : (
                <div className="flex items-center justify-between gap-6 flex-1">
                    {/* Legend */}
                    <div className="space-y-4">
                        {data.map((item) => (
                            <div key={item.name} className="flex items-center gap-3">
                                <div 
                                    className="w-4 h-4 rounded-full flex-shrink-0" 
                                    style={{ backgroundColor: item.color }}
                                />
                                <div>
                                    <p className="text-xs font-bold text-slate-400 leading-tight">{item.name}</p>
                                    <p className="text-base font-black text-slate-800">{item.value}%</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Rounded Square Chart */}
                    <div className="relative flex items-center justify-center shrink-0">
                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
                            {/* Segments */}
                            {data.map((item, index) => {
                                const segmentLength = (item.value / 100) * totalLength;
                                const dashArray = `${segmentLength} ${totalLength - segmentLength}`;
                                const dashOffset = -currentOffset;
                                currentOffset += segmentLength;

                                if (item.value === 0) return null;

                                return (
                                    <rect
                                        key={index}
                                        x={halfStroke}
                                        y={halfStroke}
                                        width={size - strokeWidth}
                                        height={size - strokeWidth}
                                        rx={radius}
                                        ry={radius}
                                        fill="none"
                                        stroke={item.color}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={dashArray}
                                        strokeDashoffset={dashOffset}
                                        strokeLinecap="butt"
                                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                                    />
                                );
                            })}
                        </svg>

                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-5xl font-black text-slate-900 leading-none">{total}</span>
                            <span className="text-sm font-bold text-slate-500 tracking-[0.2em] mt-3">TOTAL</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusDistribution;
