<?php

namespace App\Services;

use App\Models\Vehicle;
use App\Models\VehicleLocation;
use App\Models\DeviceMessage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Collection;

class VehicleLocationService
{
    /**
     * Store a new vehicle location.
     *
     * @param array $data Location data
     * @return VehicleLocation
     */
    public function storeLocation(array $data): VehicleLocation
    {
        $location = VehicleLocation::create($data);
        
        // Invalidate cache for this vehicle
        VehicleLocation::invalidateCache($location->vehicle_id);
        
        return $location;
    }
    
    /**
     * Get the latest location for a vehicle.
     *
     * @param string $vehicleId
     * @return VehicleLocation|null
     */
    public function getLatestLocation(string $vehicleId): ?VehicleLocation
    {
        return VehicleLocation::getLatestLocation($vehicleId);
    }
    
    /**
     * Get daily locations for a vehicle.
     *
     * @param string $vehicleId
     * @param \DateTimeInterface|null $date
     * @return Collection
     */
    public function getDailyLocations(string $vehicleId, ?\DateTimeInterface $date = null): Collection
    {
        $date = $date ?: Carbon::today();
        $cacheKey = "vehicle:{$vehicleId}:daily-locations:{$date->format('Y-m-d')}";
        
        return Cache::remember($cacheKey, 3600, function () use ($vehicleId, $date) {
            return VehicleLocation::where('vehicle_id', $vehicleId)
                ->whereDate('recorded_at', $date)
                ->orderBy('recorded_at')
                ->get();
        });
    }
    
    /**
     * Get weekly locations for a vehicle.
     *
     * @param string $vehicleId
     * @param \DateTimeInterface|null $startDate
     * @return Collection
     */
    public function getWeeklyLocations(string $vehicleId, ?\DateTimeInterface $startDate = null): Collection
    {
        $startDate = $startDate ?: Carbon::now()->startOfWeek();
        $endDate = Carbon::instance(clone $startDate)->addDays(6);
        $cacheKey = "vehicle:{$vehicleId}:weekly-locations:{$startDate->format('Y-m-d')}";
        
        return Cache::remember($cacheKey, 6 * 3600, function () use ($vehicleId, $startDate, $endDate) {
            return VehicleLocation::where('vehicle_id', $vehicleId)
                ->whereBetween('recorded_at', [$startDate, $endDate])
                ->orderBy('recorded_at')
                ->get();
        });
    }
    
    /**
     * Get locations for a specific time range.
     *
     * @param string $vehicleId
     * @param \DateTimeInterface $startDate
     * @param \DateTimeInterface $endDate
     * @return Collection
     */
    public function getLocationsByTimeRange(
        string $vehicleId,
        \DateTimeInterface $startDate,
        \DateTimeInterface $endDate
    ): Collection {
        $cacheKey = "vehicle:{$vehicleId}:range-locations:{$startDate->format('Y-m-d')}:{$endDate->format('Y-m-d')}";
        
        return Cache::remember($cacheKey, 6 * 3600, function () use ($vehicleId, $startDate, $endDate) {
            return VehicleLocation::where('vehicle_id', $vehicleId)
                ->whereBetween('recorded_at', [$startDate, $endDate])
                ->orderBy('recorded_at')
                ->get();
        });
    }
    
    /**
     * Calculate total distance traveled by a vehicle in a given time range.
     *
     * @param string $vehicleId
     * @param \DateTimeInterface $startDate
     * @param \DateTimeInterface $endDate
     * @return float Distance in kilometers
     */
    public function calculateDistance(
        string $vehicleId,
        \DateTimeInterface $startDate,
        \DateTimeInterface $endDate
    ): float {
        $cacheKey = "vehicle:{$vehicleId}:distance:{$startDate->format('Y-m-d')}:{$endDate->format('Y-m-d')}";
        
        return Cache::remember($cacheKey, 12 * 3600, function () use ($vehicleId, $startDate, $endDate) {
            $locations = $this->getLocationsByTimeRange($vehicleId, $startDate, $endDate);
            
            $distance = 0;
            $previousLocation = null;
            
            foreach ($locations as $location) {
                if ($previousLocation) {
                    $distance += $this->haversineDistance(
                        $previousLocation->latitude,
                        $previousLocation->longitude,
                        $location->latitude,
                        $location->longitude
                    );
                }
                
                $previousLocation = $location;
            }
            
            return $distance;
        });
    }
    
    /**
     * Calculate the Haversine distance between two points.
     *
     * @param float $lat1
     * @param float $lon1
     * @param float $lat2
     * @param float $lon2
     * @return float Distance in kilometers
     */
    private function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // in kilometers
        
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);
            
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        
        return $earthRadius * $c;
    }
    
    /**
     * Create a command to generate monthly partitions for vehicle locations table.
     * This should be scheduled to run monthly.
     *
     * @param int $monthsAhead
     * @return void
     */
    public function createPartition(int $monthsAhead = 1): void
    {
        $futureDate = now()->addMonths($monthsAhead);
        $partitionName = $futureDate->format('Y_m');
        $startDate = $futureDate->startOfMonth()->format('Y-m-d');
        $endDate = $futureDate->addMonth()->startOfMonth()->format('Y-m-d');
        
        // Check if partition already exists
        $partitionExists = DB::select(
            "SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = 'vehicle_locations_$partitionName' AND n.nspname = 'public'"
        );
        
        if (!$partitionExists) {
            DB::statement("CREATE TABLE vehicle_locations_$partitionName PARTITION OF vehicle_locations
                            FOR VALUES FROM ('$startDate') TO ('$endDate')");
        }
    }
} 