<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommandPaletteTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_with_permission_can_search()
    {
        // Create a user with permissions
        $adminUser = User::factory()->create();
        $adminUser->givePermissionTo(['view_users', 'view_vehicles', 'view_devices', 'view_tenants']);

        $response = $this
            ->actingAs($adminUser)
            ->getJson(route('api.search', ['query' => 'admin']));

        $response->assertStatus(200);
        // Results should be an array of search results with standardized format
        $response->assertJsonStructure([
            '*' => [
                'id',
                'title',
                'description',
                'resource_type',
                'url',
                'icon'
            ]
        ]);
    }

    public function test_user_without_permission_gets_empty_results()
    {
        $regularUser = User::factory()->create();
        // Not giving the permission

        $response = $this
            ->actingAs($regularUser)
            ->getJson(route('api.search', ['query' => 'admin']));

        $response->assertStatus(200);
        $response->assertJson([]);
    }

    public function test_user_can_search_with_empty_query()
    {
        $adminUser = User::factory()->create();
        $adminUser->givePermissionTo('view_users');

        $response = $this
            ->actingAs($adminUser)
            ->getJson(route('api.search', ['query' => '']));

        $response->assertStatus(200);
        $response->assertJson([]);
    }

    public function test_user_can_filter_search_by_types()
    {
        $adminUser = User::factory()->create();
        $adminUser->givePermissionTo(['view_users', 'view_vehicles']);

        // Search only users
        $response = $this
            ->actingAs($adminUser)
            ->getJson(route('api.search', [
                'query' => 'test',
                'types' => 'users'
            ]));

        $response->assertStatus(200);
        // If we find results, ensure they're only users
        if (count($response->json()) > 0) {
            $response->assertJsonPath('0.resource_type', 'user');
        }
        
        // Search with multiple types
        $response = $this
            ->actingAs($adminUser)
            ->getJson(route('api.search', [
                'query' => 'test',
                'types' => 'users,vehicles'
            ]));

        $response->assertStatus(200);
    }
} 