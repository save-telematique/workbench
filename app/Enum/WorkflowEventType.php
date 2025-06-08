<?php

namespace App\Enum;

enum WorkflowEventType: string
{
    // Vehicle location events (triggered in ProcessGpsDataJob)
    case VEHICLE_LOCATION_UPDATED = 'vehicle_location_updated';
    case VEHICLE_IGNITION_ON = 'vehicle_ignition_on';
    case VEHICLE_IGNITION_OFF = 'vehicle_ignition_off';
    case VEHICLE_MOVEMENT_STARTED = 'vehicle_movement_started';
    case VEHICLE_MOVEMENT_STOPPED = 'vehicle_movement_stopped';
    case VEHICLE_SPEED_EXCEEDED = 'vehicle_speed_exceeded';
    
    // Geofence events (triggered in ProcessGpsDataJob)
    case VEHICLE_ENTERED_GEOFENCE = 'vehicle_entered_geofence';
    case VEHICLE_EXITED_GEOFENCE = 'vehicle_exited_geofence';

    /**
     * Get human-readable label for the event type.
     */
    public function label(): string
    {
        return match ($this) {
            self::VEHICLE_LOCATION_UPDATED => __('workflows.events.vehicle_location_updated'),
            self::VEHICLE_IGNITION_ON => __('workflows.events.vehicle_ignition_on'),
            self::VEHICLE_IGNITION_OFF => __('workflows.events.vehicle_ignition_off'),
            self::VEHICLE_MOVEMENT_STARTED => __('workflows.events.vehicle_movement_started'),
            self::VEHICLE_MOVEMENT_STOPPED => __('workflows.events.vehicle_movement_stopped'),
            self::VEHICLE_SPEED_EXCEEDED => __('workflows.events.vehicle_speed_exceeded'),
            self::VEHICLE_ENTERED_GEOFENCE => __('workflows.events.vehicle_entered_geofence'),
            self::VEHICLE_EXITED_GEOFENCE => __('workflows.events.vehicle_exited_geofence'),
        };
    }

    /**
     * Get the source model type for this event.
     */
    public function sourceModel(): string
    {
        return match ($this) {
            self::VEHICLE_LOCATION_UPDATED,
            self::VEHICLE_IGNITION_ON,
            self::VEHICLE_IGNITION_OFF,
            self::VEHICLE_MOVEMENT_STARTED,
            self::VEHICLE_MOVEMENT_STOPPED,
            self::VEHICLE_SPEED_EXCEEDED,
            self::VEHICLE_ENTERED_GEOFENCE,
            self::VEHICLE_EXITED_GEOFENCE => 'Vehicle',
        };
    }

    /**
     * Get available events grouped by category.
     */
    public static function grouped(): array
    {
        return [
            'vehicle_location' => [
                self::VEHICLE_LOCATION_UPDATED,
                self::VEHICLE_IGNITION_ON,
                self::VEHICLE_IGNITION_OFF,
                self::VEHICLE_MOVEMENT_STARTED,
                self::VEHICLE_MOVEMENT_STOPPED,
                self::VEHICLE_SPEED_EXCEEDED,
            ],
            'geofences' => [
                self::VEHICLE_ENTERED_GEOFENCE,
                self::VEHICLE_EXITED_GEOFENCE,
            ],
        ];
    }
} 