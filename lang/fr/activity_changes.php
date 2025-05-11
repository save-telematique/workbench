<?php

return [
    'title' => 'Changements d\'activité',
    'single' => 'Changement d\'activité',
    'fields' => [
        'id' => 'ID',
        'working_day_id' => 'ID jour de travail',
        'vehicle_id' => 'ID véhicule',
        'recorded_at' => 'Enregistré à',
        'activity' => 'Activité',
        'type' => 'Type',
        'driver' => 'Chauffeur',
    ],
    'types' => [
        'manual' => 'Manuel',
        'automatic' => 'Automatique',
        'system' => 'Système',
        'unknown' => 'Inconnu',
    ],
]; 