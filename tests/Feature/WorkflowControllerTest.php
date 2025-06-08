<?php

namespace Tests\Feature;

use App\Enum\WorkflowActionType;
use App\Enum\WorkflowConditionOperator;
use App\Enum\WorkflowEventType;
use App\Models\User;
use App\Models\Workflow;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WorkflowControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed the permission system
        $this->artisan('db:seed', ['--class' => 'PermissionSeeder']);

        $this->user = User::factory()->create();
        $this->user->assignRole('super_admin');
    }

    public function test_create_page_loads_enum_data(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('workflows.create'));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('workflows/create')
                ->has('events')
                ->has('operators') 
                ->has('actionTypes')
                ->where('events.0.key', WorkflowEventType::VEHICLE_LOCATION_UPDATED->value)
                ->where('operators.0.key', WorkflowConditionOperator::EQUALS->value)
                ->where('actionTypes.0.key', WorkflowActionType::LOG_ALERT->value)
            );
    }

    public function test_edit_page_loads_enum_data(): void
    {
        $workflow = Workflow::factory()->create();

        $response = $this->actingAs($this->user)
            ->get(route('workflows.edit', $workflow));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('workflows/edit')
                ->has('workflow')
                ->has('events')
                ->has('operators')
                ->has('actionTypes')
                ->where('events.0.category', __('workflows.event_categories.vehicle_location'))
                ->where('operators.0.requires_value', true)
                ->where('actionTypes.0.applicable_models.0', '*')
            );
    }

    public function test_enum_data_includes_required_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('workflows.create'));

        $response->assertOk();
        
        $events = $response->getOriginalContent()->getData()['page']['props']['events'];
        $operators = $response->getOriginalContent()->getData()['page']['props']['operators'];
        $actionTypes = $response->getOriginalContent()->getData()['page']['props']['actionTypes'];

        // Verify events have required structure
        $this->assertArrayHasKey('key', $events[0]);
        $this->assertArrayHasKey('label', $events[0]);
        $this->assertArrayHasKey('category', $events[0]);

        // Verify operators have required structure with enum methods
        $this->assertArrayHasKey('key', $operators[0]);
        $this->assertArrayHasKey('label', $operators[0]);
        $this->assertArrayHasKey('requires_value', $operators[0]);
        $this->assertArrayHasKey('value_type', $operators[0]);

        // Verify action types have required structure
        $this->assertArrayHasKey('key', $actionTypes[0]);
        $this->assertArrayHasKey('label', $actionTypes[0]);
        $this->assertArrayHasKey('category', $actionTypes[0]);
        $this->assertArrayHasKey('applicable_models', $actionTypes[0]);
        $this->assertArrayHasKey('required_parameters', $actionTypes[0]);
    }

    public function test_test_endpoint_validates_workflow_components(): void
    {
        // Create workflow without triggers
        $workflow = Workflow::factory()->create();

        $response = $this->actingAs($this->user)
            ->postJson(route('workflows.test', $workflow));

        $response->assertStatus(422)
            ->assertJson([
                'error' => __('workflows.validation.no_triggers')
            ]);
    }

    public function test_test_endpoint_validates_workflow_actions(): void
    {
        // Create workflow with triggers but no actions
        $workflow = Workflow::factory()->create();
        $workflow->triggers()->create([
            'event_type' => WorkflowEventType::VEHICLE_LOCATION_UPDATED->value,
            'order' => 1,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson(route('workflows.test', $workflow));

        $response->assertStatus(422)
            ->assertJson([
                'error' => __('workflows.validation.no_actions')
            ]);
    }

    public function test_store_handles_validation_errors_properly(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('workflows.store'), []);

        // Should redirect back with errors (not crash)
        $response->assertRedirect();
    }

    public function test_toggle_handles_errors_gracefully(): void
    {
        $workflow = Workflow::factory()->create();
        $originalStatus = $workflow->is_active;

        $response = $this->actingAs($this->user)
            ->post(route('workflows.toggle', $workflow));

        $response->assertRedirect();
        
        // Verify the status was actually toggled
        $workflow->refresh();
        $this->assertNotEquals($originalStatus, $workflow->is_active);
    }

    public function test_destroy_handles_errors_gracefully(): void
    {
        $workflow = Workflow::factory()->create();

        $response = $this->actingAs($this->user)
            ->delete(route('workflows.destroy', $workflow));

        $response->assertRedirect()
            ->assertSessionHas('success', __('workflows.messages.deleted'));

        $this->assertSoftDeleted($workflow);
    }
} 