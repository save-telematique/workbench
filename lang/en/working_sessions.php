<?php

return [
    'title' => 'Working Sessions',
    'single' => 'Working Session',
    'fields' => [
        'id' => 'ID',
        'working_day_id' => 'Working Day ID',
        'vehicle_id' => 'Vehicle ID',
        'started_at' => 'Started At',
        'ended_at' => 'Ended At',
        'activity' => 'Activity',
        'type' => 'Type',
        'driving_time' => 'Driving Time',
        'duration' => 'Duration',
        'driver' => 'Driver',
    ],
    'types' => [
        'driving' => 'Driving',
        'resting' => 'Resting',
        'working' => 'Working',
        'break' => 'Break',
        'standby' => 'Standby',
        'unavailable' => 'Unavailable',
        'unknown' => 'Unknown',
    ],
]; 