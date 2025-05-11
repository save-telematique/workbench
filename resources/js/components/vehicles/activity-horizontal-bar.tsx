import { ActivityResource, WorkingSessionResource } from '@/types/resources';
import { useTranslation } from '@/utils/translation';
import { format, parseISO, differenceInMinutes, startOfDay, isSameDay } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ActivityHorizontalBarProps {
    workingSessions: WorkingSessionResource[];
    minDuration?: number; // Optional prop with default value
}

// Define a type for gap entries
interface GapEntry {
    id: string;
    isGap: true;
    started_at: string;
    ended_at: string;
    duration: number;
}

// Type guard to check if a session is a gap
function isGap(session: WorkingSessionResource | GapEntry): session is GapEntry {
    return 'isGap' in session && session.isGap === true;
}

// Get color for an activity
const getActivityColor = (activity: ActivityResource | undefined): string => {
    // If activity has a color property, use it directly
    if (activity?.color) {
        return activity.color;
    }
    
    return '#d1d5db';
};

// Format time for display (hours and minutes)
const formatDuration = (minutes: number | undefined): string => {
    if (!minutes) return '0m';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return `${mins}m`;
    }
    
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

// Format time of day (HH:MM)
const formatTimeOfDay = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
        return format(parseISO(dateStr), 'HH:mm');
    } catch {
        return '';
    }
};

// Format date (YYYY-MM-DD)
const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
        return format(parseISO(dateStr), 'yyyy-MM-dd');
    } catch {
        return '';
    }
};

// Format date and time nicely
const formatDateAndTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
        return format(parseISO(dateStr), 'MMM d, yyyy - HH:mm');
    } catch {
        return '';
    }
};

// Format date for display (e.g., Jan 15, 2023)
const formatDateForDisplay = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    try {
        return format(parseISO(dateStr), 'MMM d, yyyy');
    } catch {
        return '';
    }
};

// Calculate segment width based on duration
const calculateWidth = (session: WorkingSessionResource | GapEntry, totalMinutes: number): number => {
    if (!session.duration) return 0;
    return (session.duration / totalMinutes) * 100;
};

export function ActivityHorizontalBar({ workingSessions, minDuration = 2 }: ActivityHorizontalBarProps) {
    const { __ } = useTranslation();
    const [minimumDuration, setMinimumDuration] = useState(minDuration);
    const [showGaps, setShowGaps] = useState(false);
    
    // Sort sessions by start time
    const sortedSessions = [...workingSessions].sort((a, b) => {
        const dateA = new Date(a.started_at || 0).getTime();
        const dateB = new Date(b.started_at || 0).getTime();
        return dateA - dateB;
    });
    
    // Filter out sessions shorter than minimum duration
    const filteredSessions = sortedSessions.filter(session => {
        return (session.duration || 0) >= minimumDuration;
    });

    // Find gaps between sessions
    const sessionsWithGaps = useMemo(() => {
        if (!showGaps || filteredSessions.length < 2) return filteredSessions;
        
        const result: (WorkingSessionResource | GapEntry)[] = [];
        
        for (let i = 0; i < filteredSessions.length; i++) {
            const currentSession = filteredSessions[i];
            result.push(currentSession);
            
            // If not the last session, check for gap with next session
            if (i < filteredSessions.length - 1) {
                const nextSession = filteredSessions[i + 1];
                
                if (currentSession.ended_at && nextSession.started_at) {
                    const currentEnd = parseISO(currentSession.ended_at);
                    const nextStart = parseISO(nextSession.started_at);
                    
                    // Calculate gap in minutes
                    const gapMinutes = differenceInMinutes(nextStart, currentEnd);
                    
                    // If gap is significant (more than 1 minute), add a gap entry
                    if (gapMinutes > 1) {
                        result.push({
                            id: `gap-${i}`,
                            isGap: true,
                            started_at: currentSession.ended_at,
                            ended_at: nextSession.started_at,
                            duration: gapMinutes
                        });
                    }
                }
            }
        }
        
        return result;
    }, [filteredSessions, showGaps]);

    // Find day change markers
    const dayChanges = useMemo(() => {
        if (filteredSessions.length === 0) return [];
        
        const changes: { date: Date, isExactStart: boolean }[] = [];
        let currentDay: Date | null = null;
        
        // Process each session to find day changes
        for (const session of filteredSessions) {
            if (!session.started_at) continue;
            
            const sessionStart = parseISO(session.started_at);
            const dayStart = startOfDay(sessionStart);
            
            // If this is a new day or the first session
            if (!currentDay || !isSameDay(currentDay, dayStart)) {
                // If it's not the first day and the session doesn't start exactly at midnight
                // add the day boundary
                if (currentDay) {
                    changes.push({
                        date: dayStart,
                        isExactStart: sessionStart.getHours() === 0 && 
                                     sessionStart.getMinutes() === 0 &&
                                     sessionStart.getSeconds() === 0
                    });
                }
                currentDay = dayStart;
            }
            
            // Check if session spans midnight
            if (session.ended_at) {
                const sessionEnd = parseISO(session.ended_at);
                const endDay = startOfDay(sessionEnd);
                
                // If session spans to the next day(s)
                if (!isSameDay(sessionStart, sessionEnd)) {
                    // Add day change for each day boundary crossed
                    const checkDay = new Date(dayStart);
                    checkDay.setDate(checkDay.getDate() + 1); // Start with next day
                    
                    while (checkDay < endDay) {
                        changes.push({
                            date: new Date(checkDay),
                            isExactStart: false
                        });
                        checkDay.setDate(checkDay.getDate() + 1);
                    }
                    
                    // Add the final day if not already the same as the end day
                    if (!isSameDay(checkDay, endDay) && endDay > dayStart) {
                        changes.push({
                            date: endDay,
                            isExactStart: false
                        });
                    }
                    
                    currentDay = endDay;
                }
            }
        }
        
        return changes;
    }, [filteredSessions]);
    
    // Group sessions by date
    const sessionsByDate = useMemo(() => {
        const groups: {[date: string]: (WorkingSessionResource | GapEntry)[] } = {};
        
        const allSessions = showGaps ? sessionsWithGaps : filteredSessions;
        
        allSessions.forEach(session => {
            if (!session.started_at) return;
            
            const date = formatDate(session.started_at);
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(session);
        });
        
        return groups;
    }, [filteredSessions, sessionsWithGaps, showGaps]);
    
    // Get dates in chronological order
    const dates = useMemo(() => 
        Object.keys(sessionsByDate).sort(), 
        [sessionsByDate]
    );
    
    // If no sessions, show empty state
    if (!filteredSessions.length) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{__('vehicles.activities.daily_timeline')}</div>
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="min-duration" className="text-xs">
                            {__('vehicles.activities.filters.minimum_duration')}:
                        </Label>
                        <Input
                            id="min-duration"
                            type="number"
                            value={minimumDuration}
                            onChange={(e) => setMinimumDuration(Number(e.target.value))}
                            className="h-7 w-16"
                            min={0}
                        />
                        <span className="text-xs text-muted-foreground">{__('vehicles.activities.filters.minutes')}</span>
                    </div>
                </div>
                <div className="flex items-center justify-center h-20 bg-gray-50 rounded-md border">
                    <p className="text-sm text-muted-foreground">{__('common.no_data_available')}</p>
                </div>
            </div>
        );
    }
    
    // Get first and last session timestamps
    const firstSessionTime = filteredSessions[0]?.started_at;
    const lastSessionTime = filteredSessions[filteredSessions.length - 1]?.ended_at;
    
    // Calculate total minutes for the timeline
    const displaySessions = showGaps ? sessionsWithGaps : filteredSessions;
    const totalMinutes = displaySessions.reduce((total, session) => {
        return total + (session.duration || 0);
    }, 0);
    
    // For determining day change positions
    const getPositionForTime = (timeStr: string | null | undefined): number => {
        if (!timeStr || !firstSessionTime) return 0;
        
        try {
            const time = parseISO(timeStr);
            const startTime = parseISO(firstSessionTime);
            const elapsedMinutes = differenceInMinutes(time, startTime);
            return (elapsedMinutes / totalMinutes) * 100;
        } catch {
            return 0;
        }
    };
    
    // Calculate positions for day changes based on actual time
    const dayChangePositions = dayChanges.map(change => {
        // Convert to string format for positioning calculation
        const timeStr = change.date.toISOString();
        return {
            date: change.date,
            isExactStart: change.isExactStart,
            position: getPositionForTime(timeStr)
        };
    }).filter(change => change.position > 0 && change.position < 100); // Only keep those within timeline bounds

    return (
        <div className="space-y-4 max-w-full">
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                    {firstSessionTime && lastSessionTime ? (
                        <span>{formatDateAndTime(firstSessionTime)} — {formatDateAndTime(lastSessionTime)}</span>
                    ) : (
                        __('vehicles.activities.daily_timeline')
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="show-gaps"
                            checked={showGaps}
                            onCheckedChange={setShowGaps}
                        />
                        <Label htmlFor="show-gaps" className="text-xs">
                            {__('vehicles.activities.show_gaps')}
                        </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="min-duration" className="text-xs">
                            {__('vehicles.activities.filters.minimum_duration')}:
                        </Label>
                        <Input
                            id="min-duration"
                            type="number"
                            value={minimumDuration}
                            onChange={(e) => setMinimumDuration(Number(e.target.value))}
                            className="h-7 w-16"
                            min={0}
                        />
                        <span className="text-xs text-muted-foreground">{__('vehicles.activities.filters.minutes')}</span>
                    </div>
                </div>
            </div>
            
            {/* Date markers */}
            {dates.length > 0 && (
                <div className="flex w-full justify-between px-1 text-xs font-medium">
                    {dates.map((date) => (
                        <div key={date} className="text-primary">
                            {formatDateForDisplay(date)}
                        </div>
                    ))}
                </div>
            )}
            
            {/* Time markers */}
            {firstSessionTime && lastSessionTime && (
                <div className="flex w-full justify-between px-1 text-xs text-muted-foreground">
                    <div>{formatTimeOfDay(firstSessionTime)}</div>
                    <div className="flex-1 flex justify-center">
                        {formatTimeOfDay(filteredSessions[Math.floor(filteredSessions.length / 2)]?.started_at)}
                    </div>
                    <div>{formatTimeOfDay(lastSessionTime)}</div>
                </div>
            )}
            
            <TooltipProvider>
                <div className="relative">
                    {/* Day change markers */}
                    {dayChangePositions.map((change, index) => {
                        const dateStr = format(change.date, 'yyyy-MM-dd');
                        
                        return (
                            <Tooltip key={`day-change-${dateStr}-${index}`}>
                                <TooltipTrigger asChild>
                                    <div 
                                        className="h-full cursor-pointer absolute min-w-[2px] bg-gradient-to-r from-primary/30 to-primary/50 border-x border-primary/80 z-20"
                                        style={{ 
                                            left: `${change.position}%`,
                                            width: '0.5%'
                                        }}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="space-y-1">
                                        <p className="font-medium">{__('vehicles.activities.day_change')}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateForDisplay(dateStr)}
                                        </p>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                    
                    <div className="flex items-center h-10 w-full bg-gray-50 rounded-md overflow-hidden">
                        {displaySessions.map((session, index) => {
                            const width = calculateWidth(session, totalMinutes);
                            if (width <= 0) return null;
                            
                            // If this is a gap, render a gap block
                            if (isGap(session)) {
                                return (
                                    <Tooltip key={`gap-${session.id}-${index}`}>
                                        <TooltipTrigger asChild>
                                            <div 
                                                className="h-full cursor-pointer relative min-w-[4px] bg-gray-200 border-x border-dashed border-gray-400"
                                                style={{ 
                                                    width: `${width}%`,
                                                }}
                                            >
                                                {width > 5 && (
                                                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-600 font-medium truncate px-1">
                                                        {formatDuration(session.duration)}
                                                    </div>
                                                )}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="space-y-1">
                                                <p className="font-medium">{__('vehicles.activities.gap')}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDateForDisplay(session.started_at)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatTimeOfDay(session.started_at)} - {formatTimeOfDay(session.ended_at)}
                                                </p>
                                                <p className="text-xs">
                                                    {__('vehicles.activities.duration')}: {formatDuration(session.duration)}
                                                </p>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }
                            
                            // Otherwise render a normal session block
                            const activityColor = getActivityColor(session.activity);
                            
                            return (
                                <Tooltip key={`session-${session.id}-${index}`}>
                                    <TooltipTrigger asChild>
                                        <div 
                                            className="h-full cursor-pointer relative min-w-[4px]"
                                            style={{ 
                                                width: `${width}%`,
                                                backgroundColor: activityColor
                                            }}
                                        >
                                            {width > 5 && (
                                                <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium truncate px-1">
                                                    {formatDuration(session.duration)}
                                                </div>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="space-y-1">
                                            <p className="font-medium">{session.activity?.name || __('common.unknown_activity')}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateForDisplay(session.started_at)}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatTimeOfDay(session.started_at)} - {
                                                    session.ended_at 
                                                        ? formatTimeOfDay(session.ended_at) 
                                                        : __('common.ongoing')
                                                }
                                            </p>
                                            <p className="text-xs">
                                                {__('vehicles.activities.duration')}: {formatDuration(session.duration)}
                                            </p>
                                            {session.driving_time > 0 && (
                                                <p className="text-xs">
                                                    {__('vehicles.activities.driving_time')}: {formatDuration(session.driving_time)}
                                                </p>
                                            )}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </div>
            </TooltipProvider>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-2 mt-2 max-w-full">
                {Array.from(new Set(filteredSessions.map(session => session.activity?.name))).filter(Boolean).map((activityName, index) => {
                    const activity = filteredSessions.find(s => s.activity?.name === activityName)?.activity;
                    const color = getActivityColor(activity);
                    
                    return (
                        <div key={`legend-${index}`} className="flex items-center space-x-2">
                            <div 
                                className="w-3 h-3 rounded-sm flex-shrink-0" 
                                style={{ backgroundColor: color }}
                            ></div>
                            <span className="text-xs truncate max-w-[150px]">{activityName}</span>
                        </div>
                    );
                })}
                
                {showGaps && (
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-sm flex-shrink-0 bg-gray-200 border border-dashed border-gray-400"></div>
                        <span className="text-xs">{__('vehicles.activities.gap')}</span>
                    </div>
                )}
            </div>
        </div>
    );
} 