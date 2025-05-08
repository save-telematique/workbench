<?php

use App\Enum\MessageFields;
use App\Events\NewDeviceDataPoint;
use App\Jobs\ProcessDeviceMessage;
use App\Models\DataPointType;
use App\Models\Device;
use App\Models\DeviceDataPoint;
use App\Models\DeviceMessage;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase; // Still potentially needed for base test setup if not purely Pest
use Database\Seeders\DataPointTypeSeeder;

uses(RefreshDatabase::class); // Use Pest's way to refresh DB

beforeEach(function () {
    // Ensure data point types are seeded before each test
    $this->seed(DataPointTypeSeeder::class);
});

test('it processes a device message and creates data points with transformations', function () {
    Event::fake([NewDeviceDataPoint::class]);

    // Arrange
    $device = Device::factory()->create();
    $vehicle = Vehicle::factory()->create();
    $device->vehicle()->associate($vehicle)->save();

    $recordedAtUtc = Carbon::now()->subMinutes(5)->toIso8601String();
    $odometerRawValueMeters = 123456000; // In meters as per typical raw data

    $messageContent = [
        'messageTimeUtc' => $recordedAtUtc,
        'fields' => [
            (string) MessageFields::TOTAL_ODOMETER->value => $odometerRawValueMeters,
            (string) MessageFields::IGNITION->value => 1,
            (string) MessageFields::GPS_DATA->value => [
                'latitude' => 48.8584,
                'longitude' => 2.2945,
                'altitude' => 30,
                'angle' => 90,
                'satellites' => 10,
                'speed' => 50,
            ],
            '999999' => 'some_other_value' // Unknown field, should be ignored
        ]
    ];

    $deviceMessage = DeviceMessage::factory()->create([
        'device_id' => $device->id,
        'message' => $messageContent,
        'processed_at' => null,
    ]);

    // Act
    ProcessDeviceMessage::dispatchSync($deviceMessage);

    // Assert
    $deviceMessage->refresh();
    expect($deviceMessage->processed_at)->not->toBeNull();

    // Assert Odometer data point
    $odometerDataPoint = DeviceDataPoint::where('device_message_id', $deviceMessage->id)
        ->where('data_point_type_id', MessageFields::TOTAL_ODOMETER->value)
        ->first();

    expect($odometerDataPoint)->not->toBeNull()
        ->and($odometerDataPoint->device_id)->toBe($device->id)
        ->and($odometerDataPoint->vehicle_id)->toBe($vehicle->id)
        ->and($odometerDataPoint->value)->toEqual(123456) // Check value is converted to KM (int or float)
        ->and($odometerDataPoint->recorded_at->eq(Carbon::parse($recordedAtUtc)))->toBeTrue();

    // Assert Ignition data point
    $ignitionDataPoint = DeviceDataPoint::where('device_message_id', $deviceMessage->id)
        ->where('data_point_type_id', MessageFields::IGNITION->value)
        ->first();
    expect($ignitionDataPoint)->not->toBeNull()
        ->and($ignitionDataPoint->value)->toBeTrue(); // Check value is boolean true

    // Assert GPS data point
    $gpsDataPoint = DeviceDataPoint::where('device_message_id', $deviceMessage->id)
        ->where('data_point_type_id', MessageFields::GPS_DATA->value)
        ->first();
    expect($gpsDataPoint)->not->toBeNull()
        ->and($gpsDataPoint->value)->toEqual($messageContent['fields'][MessageFields::GPS_DATA->value]); // GPS value stored as is (object)

    // Assert unknown field was ignored
    $unknownDataPoint = DeviceDataPoint::where('device_message_id', $deviceMessage->id)
        ->where('data_point_type_id', 999999)
        ->first();
    expect($unknownDataPoint)->toBeNull();

    // Assert events were dispatched
    Event::assertDispatched(NewDeviceDataPoint::class, 3); // Odometer, Ignition, GPS

    Event::assertDispatched(NewDeviceDataPoint::class, fn (NewDeviceDataPoint $event) => $event->deviceDataPoint->id === $odometerDataPoint->id);
    Event::assertDispatched(NewDeviceDataPoint::class, fn (NewDeviceDataPoint $event) => $event->deviceDataPoint->id === $ignitionDataPoint->id);
    Event::assertDispatched(NewDeviceDataPoint::class, fn (NewDeviceDataPoint $event) => $event->deviceDataPoint->id === $gpsDataPoint->id);
});
