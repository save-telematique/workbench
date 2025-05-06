<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Carbon;
use Stancl\Tenancy\Database\Concerns\BelongsToPrimaryModel;

class VehicleLocation extends Model
{
    use HasFactory, HasUuids, BelongsToPrimaryModel;

    public function getRelationshipToPrimaryModel(): string
    {
        return 'vehicle';
    }

    protected $fillable = [
        'vehicle_id',
        'latitude',
        'longitude',
        'speed',
        'heading',
        'satellites',
        'ignition',
        'moving',
        'altitude',
        'address',
        'address_details',
        'recorded_at',
        'device_message_id',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'speed' => 'integer',
        'heading' => 'integer',
        'satellites' => 'integer',
        'ignition' => 'boolean',
        'moving' => 'boolean',
        'altitude' => 'integer',
        'address_details' => 'json',
        'recorded_at' => 'datetime',
    ];

    /**
     * Get the vehicle that owns the location.
     */
    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    /**
     * Get the device message related to this location.
     */
    public function deviceMessage()
    {
        return $this->belongsTo(DeviceMessage::class);
    }

    /**
     * Get the latest location for a specific vehicle.
     *
     * @param string $vehicleId
     * @return VehicleLocation|null
     */
    public static function getLatestLocation(string $vehicleId)
    {
        $cacheKey = "vehicle:{$vehicleId}:latest-location";
        
        return Cache::remember($cacheKey, 300, function () use ($vehicleId) {
            return self::where('vehicle_id', $vehicleId)
                ->orderBy('recorded_at', 'desc')
                ->first();
        });
    }

    /**
     * Get locations for a specific vehicle for the current day.
     *
     * @param string $vehicleId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getDailyLocations(string $vehicleId)
    {
        $today = Carbon::today();
        $cacheKey = "vehicle:{$vehicleId}:daily-locations:{$today->toDateString()}";
        
        return Cache::remember($cacheKey, 3600, function () use ($vehicleId, $today) {
            return self::where('vehicle_id', $vehicleId)
                ->whereDate('recorded_at', $today)
                ->orderBy('recorded_at')
                ->get();
        });
    }

    /**
     * Get locations for a specific vehicle for the current week.
     *
     * @param string $vehicleId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getWeeklyLocations(string $vehicleId)
    {
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();
        $cacheKey = "vehicle:{$vehicleId}:weekly-locations:{$startOfWeek->toDateString()}";
        
        return Cache::remember($cacheKey, 6 * 3600, function () use ($vehicleId, $startOfWeek, $endOfWeek) {
            return self::where('vehicle_id', $vehicleId)
                ->whereBetween('recorded_at', [$startOfWeek, $endOfWeek])
                ->orderBy('recorded_at')
                ->get();
        });
    }

    /**
     * Invalidate cache for a vehicle when a new location is added.
     *
     * @param string $vehicleId
     * @return void
     */
    public static function invalidateCache(string $vehicleId)
    {
        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();
        
        Cache::forget("vehicle:{$vehicleId}:latest-location");
        Cache::forget("vehicle:{$vehicleId}:daily-locations:{$today->toDateString()}");
        Cache::forget("vehicle:{$vehicleId}:weekly-locations:{$startOfWeek->toDateString()}");
    }
} 