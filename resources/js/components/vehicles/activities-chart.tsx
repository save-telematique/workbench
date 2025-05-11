import {
    ActivityResource,
    WorkingSessionResource,
} from '@/types/resources';
import { useTranslation } from '@/utils/translation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ActivitiesChartProps {
    data: WorkingSessionResource[];
    summary: Array<{ activity: ActivityResource; total_minutes: number }>;
    type: 'working-sessions';
}

// Get color for an activity based on its name
const getActivityColor = (activity: ActivityResource | undefined): string => {
    if (!activity) return '#d1d5db';
    return activity.color || '#d1d5db';
};

// Format time for better display
const formatTime = (minutes: number): string => {
    // Round to whole minutes
    minutes = Math.round(minutes);
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return `${mins}m`;
    }
    
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

interface ChartItem {
    name: string;
    value: number;
    minutes: number;
    color: string;
}

export function ActivitiesChart({ data, summary, type }: ActivitiesChartProps) {
    const { __ } = useTranslation();
    const [chartData, setChartData] = useState<ChartItem[]>([]);
    
    useEffect(() => {
        // Use the summary data provided by the backend for working sessions
        const formattedData = summary.map((item) => ({
            name: item.activity.name,
            value: Math.round(item.total_minutes / 60 * 100) / 100,
            minutes: item.total_minutes,
            color: getActivityColor(item.activity),
        }));
        setChartData(formattedData);
    }, [summary]);

    if (!data.length || !summary.length) {
        return (
            <div className="flex items-center justify-center h-60 text-muted-foreground">
                {__('common.no_data_available')}
            </div>
        );
    }
    
    // Custom tooltip for the pie chart
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <Card className="shadow-lg border p-2 bg-white dark:bg-card">
                    <div className="font-medium">{data.name}</div>
                    <div className="text-sm">
                            <>
                                <span className="font-semibold">{formatTime(data.minutes)}</span>
                            </>
                    </div>
                </Card>
            );
        }
        return null;
    };
    
    // Custom Legend renderer
    const renderCustomLegend = (props: any) => {
        const { payload } = props;
        
        if (!payload) return null;
        
        return (
            <div className="flex flex-wrap justify-center gap-2 text-sm mt-2">
                {payload.map((entry: any, index: number) => (
                    <div key={`legend-${index}`} className="flex items-center mr-4 mb-1">
                        <div 
                            className="w-3 h-3 rounded-full mr-1" 
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle>
                        {type === 'working-sessions' 
                            ? __('vehicles.activities.charts.time_distribution')
                            : __('vehicles.activities.charts.activity_distribution')}
                    </CardTitle>
                    <CardDescription>
                        {type === 'working-sessions'
                            ? __('vehicles.activities.stats.time_summary')
                            : __('vehicles.activities.tabs.activity_changes')}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    innerRadius={30}
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                    labelLine={false}
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend content={renderCustomLegend} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                        <div className="mt-4 border-t pt-4">
                            <div className="grid grid-cols-2 gap-2">
                                {chartData.map((item, index) => (
                                    <div key={`summary-${index}`} className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div 
                                                className="w-3 h-3 rounded-full mr-2" 
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-sm font-medium">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-medium tabular-nums">
                                            {formatTime(item.minutes)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                </CardContent>
            </Card>
    );
} 