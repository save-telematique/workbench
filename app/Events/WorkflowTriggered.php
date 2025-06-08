<?php

namespace App\Events;

use App\Enum\WorkflowEventType;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Queue\SerializesModels;
use Illuminate\Database\Eloquent\Model;

class WorkflowTriggered
{
    use InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public WorkflowEventType $eventType,
        public Model $sourceModel,
        public array $eventData = [],
        public ?array $previousData = null
    ) {}

    /**
     * Get the tenant ID from the source model.
     */
    public function getTenantId(): ?string
    {
        if (method_exists($this->sourceModel, 'tenant') && $this->sourceModel->tenant) {
            return $this->sourceModel->tenant->id;
        }

        if (property_exists($this->sourceModel, 'tenant_id')) {
            return $this->sourceModel->tenant_id;
        }

        return null;
    }

    /**
     * Get the model type name.
     */
    public function getModelType(): string
    {
        return class_basename($this->sourceModel);
    }

    /**
     * Get the model ID.
     */
    public function getModelId(): string
    {
        return (string) $this->sourceModel->getKey();
    }

    /**
     * Create and dispatch a workflow triggered event for vehicle location update.
     */
    public static function vehicleLocationUpdated(Model $vehicle, array $locationData, ?array $previousLocation = null): void
    {
        event(new static(
            WorkflowEventType::VEHICLE_LOCATION_UPDATED,
            $vehicle,
            $locationData,
            $previousLocation
        ));
    }

    /**
     * Create and dispatch a workflow triggered event for ignition on.
     */
    public static function vehicleIgnitionOn(Model $vehicle, array $locationData = []): void
    {
        event(new static(
            WorkflowEventType::VEHICLE_IGNITION_ON,
            $vehicle,
            $locationData
        ));
    }

    /**
     * Create and dispatch a workflow triggered event for ignition off.
     */
    public static function vehicleIgnitionOff(Model $vehicle, array $locationData = []): void
    {
        event(new static(
            WorkflowEventType::VEHICLE_IGNITION_OFF,
            $vehicle,
            $locationData
        ));
    }

    /**
     * Create and dispatch a workflow triggered event for movement started.
     */
    public static function vehicleMovementStarted(Model $vehicle, array $locationData = []): void
    {
        event(new static(
            WorkflowEventType::VEHICLE_MOVEMENT_STARTED,
            $vehicle,
            $locationData
        ));
    }

    /**
     * Create and dispatch a workflow triggered event for movement stopped.
     */
    public static function vehicleMovementStopped(Model $vehicle, array $locationData = []): void
    {
        event(new static(
            WorkflowEventType::VEHICLE_MOVEMENT_STOPPED,
            $vehicle,
            $locationData
        ));
    }

    /**
     * Create and dispatch a workflow triggered event for speed exceeded.
     */
    public static function vehicleSpeedExceeded(Model $vehicle, float $currentSpeed, float $speedLimit): void
    {
        event(new static(
            WorkflowEventType::VEHICLE_SPEED_EXCEEDED,
            $vehicle,
            [
                'current_speed' => $currentSpeed,
                'speed_limit' => $speedLimit,
                'exceeded_by' => $currentSpeed - $speedLimit,
            ]
        ));
    }

    /**
     * Create and dispatch a workflow triggered event for vehicle entering a geofence.
     */
    public static function vehicleEnteredGeofence(Model $vehicle, Model $geofence, array $locationData = []): void
    {
        event(new static(
            WorkflowEventType::VEHICLE_ENTERED_GEOFENCE,
            $vehicle,
            array_merge($locationData, [
                'geofence_id' => $geofence->id,
                'geofence_name' => $geofence->name,
                'geofence_type' => $geofence->type ?? 'polygon',
                'entry_time' => now()->toISOString(),
            ])
        ));
    }

    /**
     * Create and dispatch a workflow triggered event for vehicle exiting a geofence.
     */
    public static function vehicleExitedGeofence(Model $vehicle, Model $geofence, array $locationData = [], ?array $entryData = null): void
    {
        event(new static(
            WorkflowEventType::VEHICLE_EXITED_GEOFENCE,
            $vehicle,
            array_merge($locationData, [
                'geofence_id' => $geofence->id,
                'geofence_name' => $geofence->name,
                'geofence_type' => $geofence->type ?? 'polygon',
                'exit_time' => now()->toISOString(),
                'duration_inside' => $entryData ? now()->diffInSeconds($entryData['entry_time'] ?? now()) : null,
            ]),
            $entryData
        ));
    }
} 