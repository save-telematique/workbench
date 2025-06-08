<?php

namespace Tests\Unit;

use App\Enum\WorkflowActionType;
use App\Enum\WorkflowConditionOperator;
use App\Enum\WorkflowEventType;
use Tests\TestCase;

class WorkflowEnumTest extends TestCase
{
    public function test_workflow_event_type_enum_methods(): void
    {
        // Test that enum has required methods
        $eventType = WorkflowEventType::VEHICLE_LOCATION_UPDATED;
        
        $this->assertIsString($eventType->value);
        $this->assertIsString($eventType->label());
        $this->assertIsString($eventType->sourceModel());
        
        // Test grouped method returns proper structure
        $grouped = WorkflowEventType::grouped();
        $this->assertIsArray($grouped);
        $this->assertArrayHasKey('vehicle_location', $grouped);
        $this->assertArrayHasKey('geofences', $grouped);
        
        // Test each group has events
        foreach ($grouped as $category => $events) {
            $this->assertIsArray($events);
            $this->assertNotEmpty($events);
            
            foreach ($events as $event) {
                $this->assertInstanceOf(WorkflowEventType::class, $event);
            }
        }
    }

    public function test_workflow_condition_operator_enum_methods(): void
    {
        // Test that enum has required methods
        $operator = WorkflowConditionOperator::EQUALS;
        
        $this->assertIsString($operator->value);
        $this->assertIsString($operator->label());
        $this->assertIsBool($operator->requiresValue());
        $this->assertIsString($operator->valueType());
        
        // Test operators that should not require values
        $this->assertFalse(WorkflowConditionOperator::IS_NULL->requiresValue());
        $this->assertFalse(WorkflowConditionOperator::IS_NOT_NULL->requiresValue());
        $this->assertFalse(WorkflowConditionOperator::IS_TRUE->requiresValue());
        $this->assertFalse(WorkflowConditionOperator::IS_FALSE->requiresValue());
        $this->assertFalse(WorkflowConditionOperator::CHANGED->requiresValue());
        
        // Test operators that should require values
        $this->assertTrue(WorkflowConditionOperator::EQUALS->requiresValue());
        $this->assertTrue(WorkflowConditionOperator::GREATER_THAN->requiresValue());
        $this->assertTrue(WorkflowConditionOperator::CONTAINS->requiresValue());
        
        // Test grouped method returns proper structure
        $grouped = WorkflowConditionOperator::grouped();
        $this->assertIsArray($grouped);
        $this->assertArrayHasKey('comparison', $grouped);
        $this->assertArrayHasKey('string', $grouped);
        $this->assertArrayHasKey('null', $grouped);
        $this->assertArrayHasKey('boolean', $grouped);
        $this->assertArrayHasKey('change', $grouped);
    }

    public function test_workflow_action_type_enum_methods(): void
    {
        // Test that enum has required methods
        $actionType = WorkflowActionType::LOG_ALERT;
        
        $this->assertIsString($actionType->value);
        $this->assertIsString($actionType->label());
        $this->assertIsArray($actionType->applicableModels());
        $this->assertIsArray($actionType->requiredParameters());
        
        // Test LOG_ALERT specific values
        $this->assertEquals('log_alert', $actionType->value);
        $this->assertEquals(['*'], $actionType->applicableModels());
        $this->assertEquals(['message', 'level'], $actionType->requiredParameters());
        
        // Test grouped method returns proper structure
        $grouped = WorkflowActionType::grouped();
        $this->assertIsArray($grouped);
        $this->assertArrayHasKey('logging', $grouped);
        $this->assertContains(WorkflowActionType::LOG_ALERT, $grouped['logging']);
    }

    public function test_enum_data_transformation_structure(): void
    {
        // Test the structure that the controller should generate
        
        // Events structure
        $events = [];
        $groupedEvents = WorkflowEventType::grouped();
        
        foreach ($groupedEvents as $category => $eventTypes) {
            $categoryLabel = "test_category_label"; // Would be __("workflows.event_categories.{$category}")
            
            foreach ($eventTypes as $eventType) {
                $events[] = [
                    'key' => $eventType->value,
                    'label' => $eventType->label(),
                    'category' => $categoryLabel,
                ];
            }
        }
        
        $this->assertNotEmpty($events);
        $this->assertArrayHasKey('key', $events[0]);
        $this->assertArrayHasKey('label', $events[0]);
        $this->assertArrayHasKey('category', $events[0]);
        
        // Operators structure
        $operators = [];
        $groupedOperators = WorkflowConditionOperator::grouped();
        
        foreach ($groupedOperators as $category => $operatorTypes) {
            foreach ($operatorTypes as $operatorType) {
                $operators[] = [
                    'key' => $operatorType->value,
                    'label' => $operatorType->label(),
                    'category' => "test_category",
                    'requires_value' => $operatorType->requiresValue(),
                    'value_type' => $operatorType->valueType(),
                ];
            }
        }
        
        $this->assertNotEmpty($operators);
        $this->assertArrayHasKey('key', $operators[0]);
        $this->assertArrayHasKey('label', $operators[0]);
        $this->assertArrayHasKey('requires_value', $operators[0]);
        $this->assertArrayHasKey('value_type', $operators[0]);
        
        // Action types structure
        $actionTypes = [];
        $groupedActions = WorkflowActionType::grouped();
        
        foreach ($groupedActions as $category => $actionTypeList) {
            $categoryLabel = "test_category";
            
            foreach ($actionTypeList as $actionType) {
                $actionTypes[] = [
                    'key' => $actionType->value,
                    'label' => $actionType->label(),
                    'category' => $categoryLabel,
                    'applicable_models' => $actionType->applicableModels(),
                    'required_parameters' => $actionType->requiredParameters(),
                ];
            }
        }
        
        $this->assertNotEmpty($actionTypes);
        $this->assertArrayHasKey('key', $actionTypes[0]);
        $this->assertArrayHasKey('label', $actionTypes[0]);
        $this->assertArrayHasKey('applicable_models', $actionTypes[0]);
        $this->assertArrayHasKey('required_parameters', $actionTypes[0]);
    }
} 