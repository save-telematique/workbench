<?php

use App\Models\DataPointType;
use App\Models\Device;
use App\Models\DeviceDataPoint;
use App\Models\DeviceType;
use App\Models\Tenant;
use App\Services\DeviceTelemetryService;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

uses(RefreshDatabase::class);

describe('DeviceTelemetryService', function () {
    beforeEach(function () {
        $this->telemetryService = app(DeviceTelemetryService::class);
        
        // Create a tenant and device for testing
        $this->tenant = Tenant::factory()->create();
        $this->deviceType = DeviceType::factory()->create();
        $this->device = Device::factory()->create([
            'tenant_id' => $this->tenant->id,
            'device_type_id' => $this->deviceType->id,
        ]);
        
        // Create some data point types
        $this->atomicDataPointType1 = DataPointType::factory()->create([
            'name' => 'Speed',
            'category' => 'ATOMIC',
        ]);
        
        $this->atomicDataPointType2 = DataPointType::factory()->create([
            'name' => 'Fuel Level',
            'category' => 'ATOMIC',
        ]);
        
        $this->atomicDataPointType3 = DataPointType::factory()->create([
            'name' => 'Temperature',
            'category' => 'ATOMIC',
        ]);
    });

    it('gets all latest readings in a single query efficiently', function () {
        $baseTime = Carbon::now()->subHours(2);
        
        // Create historical data points for different types
        DeviceDataPoint::insert([
            [
                'device_id' => $this->device->id,
                'data_point_type_id' => $this->atomicDataPointType1->id,
                'value' => json_encode(50),
                'recorded_at' => $baseTime,
                'device_message_id' => 1,
            ],
            [
                'device_id' => $this->device->id,
                'data_point_type_id' => $this->atomicDataPointType1->id,
                'value' => json_encode(60), // Latest for speed
                'recorded_at' => $baseTime->addMinutes(30),
                'device_message_id' => 2,
            ],
            [
                'device_id' => $this->device->id,
                'data_point_type_id' => $this->atomicDataPointType2->id,
                'value' => json_encode(75), // Latest for fuel
                'recorded_at' => $baseTime->addMinutes(15),
                'device_message_id' => 3,
            ],
            [
                'device_id' => $this->device->id,
                'data_point_type_id' => $this->atomicDataPointType2->id,
                'value' => json_encode(70),
                'recorded_at' => $baseTime->addMinutes(10),
                'device_message_id' => 4,
            ],
            [
                'device_id' => $this->device->id,
                'data_point_type_id' => $this->atomicDataPointType3->id,
                'value' => json_encode(25), // Latest for temperature
                'recorded_at' => $baseTime->addMinutes(20),
                'device_message_id' => 5,
            ],
        ]);

        // Clear cache to ensure fresh queries
        Cache::flush();
        
        // Enable query logging to count queries
        DB::enableQueryLog();
        
        $result = $this->telemetryService->getAllLatestReadings($this->device);
        
        $queries = DB::getQueryLog();
        DB::disableQueryLog();
        
        // Should only have a few queries: the main query + cache lookups for data point types
        expect(count($queries))->toBeLessThan(5);
        
        // Verify we get the latest values for each data point type
        expect($result)->toHaveKey($this->atomicDataPointType1->id);
        expect($result)->toHaveKey($this->atomicDataPointType2->id);
        expect($result)->toHaveKey($this->atomicDataPointType3->id);
        
        expect($result[$this->atomicDataPointType1->id])->toBe(60); // Latest speed
        expect($result[$this->atomicDataPointType2->id])->toBe(75); // Latest fuel
        expect($result[$this->atomicDataPointType3->id])->toBe(25); // Latest temperature
    });

    it('returns empty array when device has no data points', function () {
        Cache::flush();
        
        $result = $this->telemetryService->getAllLatestReadings($this->device);
        
        expect($result)->toBeArray();
        expect($result)->toBeEmpty();
    });

    it('caches results for performance', function () {
        // Create a data point
        DeviceDataPoint::create([
            'device_id' => $this->device->id,
            'data_point_type_id' => $this->atomicDataPointType1->id,
            'value' => json_encode(100),
            'recorded_at' => Carbon::now(),
            'device_message_id' => 1,
        ]);

        Cache::flush();
        
        // First call - should hit database
        $result1 = $this->telemetryService->getAllLatestReadings($this->device);
        
        // Enable query logging for second call
        DB::enableQueryLog();
        
        // Second call - should use cache
        $result2 = $this->telemetryService->getAllLatestReadings($this->device);
        
        $queries = DB::getQueryLog();
        DB::disableQueryLog();
        
        // Should have minimal queries due to caching
        expect(count($queries))->toBeLessThanOrEqual(2); // Only cache-related queries
        expect($result1)->toBe($result2);
    });

    it('maintains compatibility with existing getLatestReading method', function () {
        DeviceDataPoint::create([
            'device_id' => $this->device->id,
            'data_point_type_id' => $this->atomicDataPointType1->id,
            'value' => json_encode(80),
            'recorded_at' => Carbon::now(),
            'device_message_id' => 1,
        ]);

        Cache::flush();
        
        $allReadings = $this->telemetryService->getAllLatestReadings($this->device);
        $singleReading = $this->telemetryService->getLatestReading($this->device, $this->atomicDataPointType1->id);
        
        expect($allReadings[$this->atomicDataPointType1->id])->toBe($singleReading);
    });
});