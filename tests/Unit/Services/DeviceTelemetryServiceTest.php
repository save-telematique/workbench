<?php

namespace Tests\Unit\Services;

use App\Enum\DataPointTypeCategory;
use App\Enum\MessageFields;
use App\Models\DataPointType;
use App\Models\Device;
use App\Models\DeviceDataPoint;
use App\Models\Tenant;
use App\Services\DeviceTelemetryService;
use Carbon\Carbon;
use Database\Seeders\DataPointTypeSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;
use Illuminate\Support\Facades\Log;

class DeviceTelemetryServiceTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;
    private Device $device;
    private DataPointType $speedType;
    private DataPointType $fuelPercentType;
    private DataPointType $fuelLitersType;
    private DataPointType $compositeFuelType;
    private DeviceTelemetryService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DataPointTypeSeeder::class);

        $this->tenant = Tenant::factory()->create();
        $this->tenant->makeCurrent();

        $this->device = Device::factory()->create(['tenant_id' => $this->tenant->id]);

        $this->speedType = DataPointType::findOrFail((int)MessageFields::SPEED->value);
        $this->fuelPercentType = DataPointType::findOrFail((int)MessageFields::FUEL_LEVEL_PERCENT->value);
        $this->fuelLitersType = DataPointType::findOrFail((int)MessageFields::FUEL_LEVEL_LITERS->value);

        $this->compositeFuelType = DataPointType::factory()->create([
            'id' => 500001, 
            'name' => 'Primary Fuel Level (Composite Test)',
            'category' => 'COMPOSITE',
            'processing_steps' => [
                [
                    'operation' => 'PRIORITY_PICK',
                    'sources' => [
                        ['id' => $this->fuelPercentType->id, 'priority' => 1],
                        ['id' => $this->fuelLitersType->id, 'priority' => 2],
                    ]
                ]
            ],
            'tenant_id' => null, 
        ]);

        $this->service = new DeviceTelemetryService();
    }

    // Helper method to create data points easily
    private function createDataPoint(DataPointType $type, $value, Carbon $recordedAt, ?Device $device = null): DeviceDataPoint
    {
        return DeviceDataPoint::factory()->create([
            'device_id' => $device?->id ?? $this->device->id,
            'vehicle_id' => $device?->vehicle_id ?? $this->device->vehicle_id, // Assuming device might have vehicle
            'data_point_type_id' => $type->id,
            'value' => $value, // Raw value, service might process/cast it based on type
            'recorded_at' => $recordedAt,
            'tenant_id' => $device?->tenant_id ?? $this->device->tenant_id,
        ]);
    }

    // --- Test cases for getLatestReading --- //

    public function testGetLatestReadingForAtomicTypeReturnsCorrectDataPoint(): void
    {
        $time1 = Carbon::now()->subMinutes(10);
        $time2 = Carbon::now()->subMinutes(5); // More recent
        $time3 = Carbon::now()->subMinutes(15);

        $this->createDataPoint($this->speedType, 50, $time1);
        $expectedDataPoint = $this->createDataPoint($this->speedType, 60, $time2); // This is the latest
        $this->createDataPoint($this->speedType, 40, $time3);

        $latest = $this->service->getLatestReading($this->device, $this->speedType->id);

        $this->assertNotNull($latest);
        $this->assertEquals($expectedDataPoint->id, $latest->id);
        $this->assertEquals(60, $latest->value); // Assuming value is stored directly
        $this->assertTrue($time2->eq($latest->recorded_at));
    }

    public function testGetLatestReadingForAtomicTypeReturnsNullWhenNoData(): void
    {
        $latest = $this->service->getLatestReading($this->device, $this->speedType->id);
        $this->assertNull($latest);
    }

    public function testGetLatestReadingForAtomicTypeUsesCache(): void
    {
        $time = Carbon::now()->subMinute();
        $originalValue = 70;
        $dataPoint = $this->createDataPoint($this->speedType, $originalValue, $time);

        $cacheKey = "device_telemetry_latest_{$this->device->id}_{$this->speedType->id}";
        // Ensure cache is clear at the start of this specific test for this key
        Cache::forget($cacheKey);

        // First call: should fetch from DB and store in cache
        $latest1 = $this->service->getLatestReading($this->device, $this->speedType->id);
        $this->assertNotNull($latest1);
        $this->assertEquals($originalValue, $latest1->value);
        $this->assertTrue(Cache::has($cacheKey), "Cache should have the item after first call.");

        // Modify the underlying data in the DB
        $newValueInDb = 80;
        $dataPoint->update(['value' => $newValueInDb]);

        // Second call: should still return the original value from cache
        $latest2 = $this->service->getLatestReading($this->device, $this->speedType->id);
        $this->assertNotNull($latest2);
        $this->assertEquals($originalValue, $latest2->value, "Second call should return original cached value.");

        // Forget the cache and call again
        Cache::forget($cacheKey);
        $this->assertFalse(Cache::has($cacheKey), "Cache should be clear after forget.");

        // Third call: should now fetch the updated value from DB
        $latest3 = $this->service->getLatestReading($this->device, $this->speedType->id);
        $this->assertNotNull($latest3);
        $this->assertEquals($newValueInDb, $latest3->value, "Third call should return updated DB value.");
        $this->assertTrue(Cache::has($cacheKey), "Cache should have the item again after third call.");

        // Clean up cache for subsequent tests
        Cache::forget($cacheKey);
    }

    public function testGetLatestReadingForNonExistentTypeReturnsNull(): void
    {
        Log::shouldReceive('warning')->once()->withArgs(function ($message) {
            return str_contains($message, 'DataPointType not found with ID: 999999');
        });
        // Allow other logs
        Log::shouldReceive('info')->zeroOrMoreTimes();
        Log::shouldReceive('warning')->zeroOrMoreTimes();

        $latest = $this->service->getLatestReading($this->device, 999999);
        $this->assertNull($latest);
    }

    // --- Tests for Composite Types with getLatestReading --- //

    public function testGetLatestReadingForCompositeTypePicksPrioritySource(): void
    {
        $timePercent = Carbon::now()->subMinutes(5);
        $timeLiters = Carbon::now()->subMinutes(10);

        $percentDataPoint = $this->createDataPoint($this->fuelPercentType, 80, $timePercent); // Priority 1
        $this->createDataPoint($this->fuelLitersType, 40, $timeLiters);    // Priority 2

        $latestComposite = $this->service->getLatestReading($this->device, $this->compositeFuelType->id);

        $this->assertNotNull($latestComposite);
        // The service is expected to return the *source* data point that was chosen
        $this->assertEquals($percentDataPoint->id, $latestComposite->id);
        $this->assertEquals(80, $latestComposite->value);
        $this->assertEquals($this->fuelPercentType->id, $latestComposite->data_point_type_id, "Returned point should be of the priority source type.");
    }

    public function testGetLatestReadingForCompositeTypeFallsBackToSecondarySource(): void
    {
        $timeLiters = Carbon::now()->subMinutes(7);

        // No data for fuelPercentType (priority 1)
        $litersDataPoint = $this->createDataPoint($this->fuelLitersType, 35, $timeLiters); // Priority 2

        $latestComposite = $this->service->getLatestReading($this->device, $this->compositeFuelType->id);

        $this->assertNotNull($latestComposite);
        $this->assertEquals($litersDataPoint->id, $latestComposite->id);
        $this->assertEquals(35, $latestComposite->value);
        $this->assertEquals($this->fuelLitersType->id, $latestComposite->data_point_type_id, "Returned point should be of the fallback source type.");
    }

    public function testGetLatestReadingForCompositeTypeReturnsNullIfNoSourcesHaveData(): void
    {
        // No data for either fuelPercentType or fuelLitersType
        $latestComposite = $this->service->getLatestReading($this->device, $this->compositeFuelType->id);
        $this->assertNull($latestComposite);
    }

    // --- Test cases for getReadingsForPeriod --- //

    public function testGetReadingsForPeriodForAtomicTypeReturnsCorrectData(): void
    {
        $periodStart = Carbon::now()->subHours(2);
        $periodEnd = Carbon::now()->subHour();

        // Data before period
        $this->createDataPoint($this->speedType, 30, $periodStart->copy()->subHour()); 
        // Data within period
        $dp1 = $this->createDataPoint($this->speedType, 50, $periodStart->copy()->addMinutes(10)); 
        $dp2 = $this->createDataPoint($this->speedType, 55, $periodStart->copy()->addMinutes(30));
        $dp3 = $this->createDataPoint($this->speedType, 60, $periodEnd->copy()->subMinutes(5)); 
        // Data at exact start/end boundaries (assuming inclusive)
        $dpStartBoundary = $this->createDataPoint($this->speedType, 48, $periodStart);
        $dpEndBoundary = $this->createDataPoint($this->speedType, 62, $periodEnd);
        // Data after period
        $this->createDataPoint($this->speedType, 70, $periodEnd->copy()->addHour());

        $readings = $this->service->getReadingsForPeriod($this->device, $this->speedType->id, $periodStart, $periodEnd);

        $this->assertCount(5, $readings);
        $this->assertTrue($readings->contains("id", $dp1->id));
        $this->assertTrue($readings->contains("id", $dp2->id));
        $this->assertTrue($readings->contains("id", $dp3->id));
        $this->assertTrue($readings->contains("id", $dpStartBoundary->id));
        $this->assertTrue($readings->contains("id", $dpEndBoundary->id));

        // Check order (assuming service returns ordered by recorded_at ascending)
        $this->assertEquals([
            $dpStartBoundary->id, $dp1->id, $dp2->id, $dp3->id, $dpEndBoundary->id
        ], $readings->sortBy('recorded_at')->pluck('id')->all());
    }

    public function testGetReadingsForPeriodForAtomicTypeReturnsEmptyCollectionWhenNoDataInPeriod(): void
    {
        $periodStart = Carbon::now()->subHours(2);
        $periodEnd = Carbon::now()->subHour();

        // Data before period
        $this->createDataPoint($this->speedType, 30, $periodStart->copy()->subHour()); 
        // Data after period
        $this->createDataPoint($this->speedType, 70, $periodEnd->copy()->addHour());

        $readings = $this->service->getReadingsForPeriod($this->device, $this->speedType->id, $periodStart, $periodEnd);

        $this->assertCount(0, $readings);
        $this->assertTrue($readings->isEmpty());
    }

    public function testGetReadingsForPeriodForAtomicTypeHandlesEmptySourceData(): void
    {
        $periodStart = Carbon::now()->subHours(2);
        $periodEnd = Carbon::now()->subHour();

        // No data points created for $this->speedType at all

        $readings = $this->service->getReadingsForPeriod($this->device, $this->speedType->id, $periodStart, $periodEnd);

        $this->assertCount(0, $readings);
        $this->assertTrue($readings->isEmpty());
    }

    public function testGetReadingsForPeriodForNonExistentTypeReturnsEmptyCollection(): void
    {
        $periodStart = Carbon::now()->subHours(2);
        $periodEnd = Carbon::now()->subHour();
        $nonExistentTypeId = 999999;

        Log::shouldReceive('warning')->once()->withArgs(function ($message) use ($nonExistentTypeId) {
            return str_contains($message, 'DataPointType not found with ID: ' . $nonExistentTypeId);
        });
        // Allow other logs
        Log::shouldReceive('info')->zeroOrMoreTimes();
        Log::shouldReceive('warning')->zeroOrMoreTimes();

        $readings = $this->service->getReadingsForPeriod($this->device, $nonExistentTypeId, $periodStart, $periodEnd);

        $this->assertCount(0, $readings);
        $this->assertTrue($readings->isEmpty());
    }

    // --- Test cases for getAggregatedReadings --- //

    public function testGetAggregatedReadingsCalculatesAvgCorrectly(): void
    {
        $periodStart = Carbon::now()->subHour();
        $periodEnd = Carbon::now();

        $this->createDataPoint($this->speedType, 50, $periodStart->copy()->addMinutes(10)); // Value: 50
        $this->createDataPoint($this->speedType, 60, $periodStart->copy()->addMinutes(20)); // Value: 60
        $this->createDataPoint($this->speedType, 70, $periodStart->copy()->addMinutes(30)); // Value: 70
        // Average = (50+60+70)/3 = 180/3 = 60

        // Data outside period, should be ignored
        $this->createDataPoint($this->speedType, 100, $periodStart->copy()->subMinute());
        $this->createDataPoint($this->speedType, 100, $periodEnd->copy()->addMinute());

        $average = $this->service->getAggregatedReadings($this->device, $this->speedType->id, $periodStart, $periodEnd, 'AVG');

        $this->assertEquals(60, $average);
    }

    public function testGetAggregatedReadingsCalculatesSumCorrectly(): void
    {
        $periodStart = Carbon::now()->subHour();
        $periodEnd = Carbon::now();

        $this->createDataPoint($this->speedType, 20, $periodStart->copy()->addMinutes(10)); // Value: 20
        $this->createDataPoint($this->speedType, 30, $periodStart->copy()->addMinutes(20)); // Value: 30
        $this->createDataPoint($this->speedType, 40, $periodStart->copy()->addMinutes(30)); // Value: 40
        // Sum = 20+30+40 = 90

        $sum = $this->service->getAggregatedReadings($this->device, $this->speedType->id, $periodStart, $periodEnd, 'SUM');

        $this->assertEquals(90, $sum);
    }

    public function testGetAggregatedReadingsFindsMinCorrectly(): void
    {
        $periodStart = Carbon::now()->subHour();
        $periodEnd = Carbon::now();

        $this->createDataPoint($this->speedType, 50, $periodStart->copy()->addMinutes(10));
        $this->createDataPoint($this->speedType, 25, $periodStart->copy()->addMinutes(20)); // Min value
        $this->createDataPoint($this->speedType, 75, $periodStart->copy()->addMinutes(30));

        $min = $this->service->getAggregatedReadings($this->device, $this->speedType->id, $periodStart, $periodEnd, 'MIN');

        $this->assertEquals(25, $min);
    }

    public function testGetAggregatedReadingsFindsMaxCorrectly(): void
    {
        $periodStart = Carbon::now()->subHour();
        $periodEnd = Carbon::now();

        $this->createDataPoint($this->speedType, 50, $periodStart->copy()->addMinutes(10));
        $this->createDataPoint($this->speedType, 100, $periodStart->copy()->addMinutes(20)); // Max value
        $this->createDataPoint($this->speedType, 75, $periodStart->copy()->addMinutes(30));

        $max = $this->service->getAggregatedReadings($this->device, $this->speedType->id, $periodStart, $periodEnd, 'MAX');

        $this->assertEquals(100, $max);
    }

    public function testGetAggregatedReadingsCountsCorrectly(): void
    {
        $periodStart = Carbon::now()->subHour();
        $periodEnd = Carbon::now();

        $this->createDataPoint($this->speedType, 50, $periodStart->copy()->addMinutes(10));
        $this->createDataPoint($this->speedType, 60, $periodStart->copy()->addMinutes(20));
        $this->createDataPoint($this->speedType, 70, $periodStart->copy()->addMinutes(30));
        // 3 points in period

        // Data outside period
        $this->createDataPoint($this->speedType, 100, $periodStart->copy()->subMinute());

        $count = $this->service->getAggregatedReadings($this->device, $this->speedType->id, $periodStart, $periodEnd, 'COUNT');

        $this->assertEquals(3, $count);
    }

    public function testGetAggregatedReadingsReturnsNullForUnsupportedAggregation(): void
    {
        $periodStart = Carbon::now()->subHour();
        $periodEnd = Carbon::now();

        Log::shouldReceive('warning')->once()->withArgs(function ($message) {
            return str_contains($message, 'Unsupported aggregation type: UNSUPPORTED_TYPE');
        });
        // Allow other logs
        Log::shouldReceive('info')->zeroOrMoreTimes();
        Log::shouldReceive('warning')->zeroOrMoreTimes();

        $this->createDataPoint($this->speedType, 50, $periodStart->copy()->addMinutes(10));

        $result = $this->service->getAggregatedReadings($this->device, $this->speedType->id, $periodStart, $periodEnd, 'UNSUPPORTED_TYPE');

        $this->assertNull($result);
    }

    public function testGetAggregatedReadingsReturnsAppropriateValueWhenNoDataInPeriod(): void
    {
        $periodStart = Carbon::now()->subHour();
        $periodEnd = Carbon::now();

        // For AVG, SUM, MIN, MAX, expect null if no data
        $this->assertNull($this->service->getAggregatedReadings($this->device, $this->speedType->id, $periodStart, $periodEnd, 'AVG'));
        $this->assertNull($this->service->getAggregatedReadings($this->device, $this->speedType->id, $periodStart, $periodEnd, 'SUM'));
        $this->assertNull($this->service->getAggregatedReadings($this->device, $this->speedType->id, $periodStart, $periodEnd, 'MIN'));
        $this->assertNull($this->service->getAggregatedReadings($this->device, $this->speedType->id, $periodStart, $periodEnd, 'MAX'));

        // For COUNT, expect 0 if no data
        $this->assertEquals(0, $this->service->getAggregatedReadings($this->device, $this->speedType->id, $periodStart, $periodEnd, 'COUNT'));
    }
} 