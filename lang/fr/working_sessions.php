<?php

return [
    'title' => 'Sessions de travail',
    'single' => 'Session de travail',
    'fields' => [
        'id' => 'ID',
        'working_day_id' => 'ID jour de travail',
        'vehicle_id' => 'ID véhicule',
        'started_at' => 'Démarré à',
        'ended_at' => 'Terminé à',
        'activity' => 'Activité',
        'type' => 'Type',
        'driving_time' => 'Temps de conduite',
        'duration' => 'Durée',
        'driver' => 'Chauffeur',
    ],
    'types' => [
        'driving' => 'Conduite',
        'resting' => 'Repos',
        'working' => 'Travail',
        'break' => 'Pause',
        'standby' => 'En attente',
        'unavailable' => 'Indisponible',
        'unknown' => 'Inconnu',
    ],
]; 