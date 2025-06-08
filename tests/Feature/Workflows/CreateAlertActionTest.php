<?php

namespace Tests\Feature\Workflows;

use App\Events\WorkflowTriggered;
use App\Enum\WorkflowActionType;
use App\Enum\WorkflowEventType;
use App\Models\Alert;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Workflow;
use App\Models\WorkflowAction;
use App\Services\WorkflowActionExecutor;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CreateAlertActionTest extends TestCase
{
    use RefreshDatabase;

    private WorkflowActionExecutor $executor;
    private Tenant $tenant;
    private User $user;
    private Vehicle $vehicle;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->executor = new WorkflowActionExecutor();
        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $this->vehicle = Vehicle::factory()->create(['tenant_id' => $this->tenant->id]);
    }

    public function test_creates_alert_with_required_parameters()
    {
        $action = WorkflowAction::factory()->make([
            'action_type' => WorkflowActionType::CREATE_ALERT->value,
            'parameters' => [
                'title' => 'Speed Limit Exceeded',
                'content' => 'Vehicle exceeded speed limit',
                'severity' => 'warning',
            ],
        ]);

        $event = new WorkflowTriggered(
            WorkflowEventType::VEHICLE_SPEED_EXCEEDED,
            $this->vehicle,
            ['current_speed' => 95, 'speed_limit' => 70, 'latitude' => 45.5, 'longitude' => 2.5]
        );

        $result = $this->executor->execute($action, $event, $this->createMockExecution());

        $this->assertTrue($result['success']);
        $this->assertArrayHasKey('alert_id', $result['data']);

        $alert = Alert::find($result['data']['alert_id']);
        $this->assertNotNull($alert);
        $this->assertEquals('Speed Limit Exceeded', $alert->title);
        $this->assertEquals('warning', $alert->type);
        $this->assertEquals('warning', $alert->severity);
        $this->assertEquals($this->vehicle->id, $alert->alertable_id);
        $this->assertEquals(Vehicle::class, $alert->alertable_type);
        $this->assertEquals($this->tenant->id, $alert->tenant_id);
    }

    public function test_interpolates_variables_in_alert_content()
    {
        $action = WorkflowAction::factory()->make([
            'action_type' => WorkflowActionType::CREATE_ALERT->value,
            'parameters' => [
                'title' => 'Vehicle {vehicle.registration} Alert',
                'content' => 'Vehicle {vehicle.name} with registration {vehicle.registration} had an event at {timestamp}',
                'severity' => 'info',
            ],
        ]);

        $event = new WorkflowTriggered(
            WorkflowEventType::VEHICLE_LOCATION_UPDATED,
            $this->vehicle,
            ['latitude' => 45.5, 'longitude' => 2.5]
        );

        $result = $this->executor->execute($action, $event, $this->createMockExecution());

        $this->assertTrue($result['success']);
        
        $alert = Alert::find($result['data']['alert_id']);
        $this->assertStringContainsString($this->vehicle->registration, $alert->title);
        $this->assertStringContainsString($this->vehicle->name, $alert->content);
        $this->assertStringContainsString($this->vehicle->registration, $alert->content);
    }

    public function test_handles_metadata_with_interpolation()
    {
        $action = WorkflowAction::factory()->make([
            'action_type' => WorkflowActionType::CREATE_ALERT->value,
            'parameters' => [
                'title' => 'Geofence Alert',
                'content' => 'Vehicle entered restricted area',
                'severity' => 'error',
                'metadata' => [
                    'geofence_name' => '{event.geofence_name}',
                    'vehicle_info' => [
                        'registration' => '{vehicle.registration}',
                        'name' => '{vehicle.name}',
                    ],
                    'location' => [
                        'latitude' => '{event.latitude}',
                        'longitude' => '{event.longitude}',
                    ],
                ],
            ],
        ]);

        $event = new WorkflowTriggered(
            WorkflowEventType::VEHICLE_ENTERED_GEOFENCE,
            $this->vehicle,
            [
                'geofence_name' => 'Restricted Zone A',
                'latitude' => 45.5,
                'longitude' => 2.5,
            ]
        );

        $result = $this->executor->execute($action, $event, $this->createMockExecution());

        $this->assertTrue($result['success']);
        
        $alert = Alert::find($result['data']['alert_id']);
        $this->assertEquals('Restricted Zone A', $alert->metadata['geofence_name']);
        $this->assertEquals($this->vehicle->registration, $alert->metadata['vehicle_info']['registration']);
        $this->assertEquals('45.5', $alert->metadata['location']['latitude']);
    }

    public function test_sets_expiration_date_when_provided()
    {
        $action = WorkflowAction::factory()->make([
            'action_type' => WorkflowActionType::CREATE_ALERT->value,
            'parameters' => [
                'title' => 'Temporary Alert',
                'content' => 'This alert will expire',
                'severity' => 'info',
                'expires_at' => '+1 day',
            ],
        ]);

        $event = new WorkflowTriggered(
            WorkflowEventType::VEHICLE_LOCATION_UPDATED,
            $this->vehicle,
            ['latitude' => 45.5, 'longitude' => 2.5]
        );

        $result = $this->executor->execute($action, $event, $this->createMockExecution());

        $this->assertTrue($result['success']);
        
        $alert = Alert::find($result['data']['alert_id']);
        $this->assertNotNull($alert->expires_at);
        $this->assertTrue($alert->expires_at->isFuture());
    }

    public function test_fails_with_missing_required_parameters()
    {
        $action = WorkflowAction::factory()->make([
            'action_type' => WorkflowActionType::CREATE_ALERT->value,
            'parameters' => [
                'title' => 'Alert',
                // Missing content and severity
            ],
        ]);

        $event = new WorkflowTriggered(
            WorkflowEventType::VEHICLE_LOCATION_UPDATED,
            $this->vehicle,
            ['latitude' => 45.5, 'longitude' => 2.5]
        );

        $result = $this->executor->execute($action, $event, $this->createMockExecution());

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Missing required parameter', $result['error']);
    }

    public function test_fails_with_invalid_severity()
    {
        $action = WorkflowAction::factory()->make([
            'action_type' => WorkflowActionType::CREATE_ALERT->value,
            'parameters' => [
                'title' => 'Alert',
                'content' => 'Content',
                'severity' => 'invalid_severity',
            ],
        ]);

        $event = new WorkflowTriggered(
            WorkflowEventType::VEHICLE_LOCATION_UPDATED,
            $this->vehicle,
            ['latitude' => 45.5, 'longitude' => 2.5]
        );

        $result = $this->executor->execute($action, $event, $this->createMockExecution());

        $this->assertFalse($result['success']);
        $this->assertStringContainsString('Invalid severity', $result['error']);
    }

    public function test_works_for_different_model_types()
    {
        // Test with a different model type (User in this case)
        $action = WorkflowAction::factory()->make([
            'action_type' => WorkflowActionType::CREATE_ALERT->value,
            'parameters' => [
                'title' => 'User Alert',
                'content' => 'Alert for user',
                'severity' => 'info',
            ],
        ]);

        $event = new WorkflowTriggered(
            WorkflowEventType::VEHICLE_LOCATION_UPDATED,
            $this->user,
            ['some_data' => 'value']
        );

        $result = $this->executor->execute($action, $event, $this->createMockExecution());

        $this->assertTrue($result['success']);
        
        $alert = Alert::find($result['data']['alert_id']);
        $this->assertEquals($this->user->id, $alert->alertable_id);
        $this->assertEquals(User::class, $alert->alertable_type);
    }

    private function createMockExecution()
    {
        return new class {
            public $id = 1;
        };
    }
} 