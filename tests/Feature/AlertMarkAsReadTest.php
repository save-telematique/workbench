<?php

namespace Tests\Feature;

use App\Actions\Alerts\CreateAlertAction;
use App\Models\Alert;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlertMarkAsReadTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_assigned_to_alert_can_mark_it_as_read()
    {
        // Créer un tenant et un utilisateur
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->assignRole('tenant_admin');
        
        // Créer un véhicule
        $vehicle = Vehicle::factory()->create(['tenant_id' => $tenant->id]);
        
        // Créer une alerte et l'assigner automatiquement
        $alertData = [
            'title' => 'Test Alert',
            'content' => 'Test content',
            'type' => 'system',
            'severity' => 'info',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $vehicle->id,
            'tenant_id' => $tenant->id,
            'created_by' => $user->id,
        ];
        
        $createAction = new CreateAlertAction();
        $alert = $createAction->handle($alertData);
        
        // Vérifier que l'utilisateur est assigné à l'alerte
        $this->assertTrue($alert->users()->where('user_id', $user->id)->exists());
        
        // Vérifier que l'alerte n'est pas marquée comme lue initialement
        $this->assertFalse($alert->isReadBy($user));
        
        // L'utilisateur doit pouvoir marquer l'alerte comme lue
        $response = $this->actingAs($user)
            ->post(route('alerts.mark-as-read', $alert));
        
        $response->assertRedirect();
        
        // Vérifier que l'alerte est maintenant marquée comme lue
        $alert->refresh();
        $this->assertTrue($alert->isReadBy($user));
    }
    
    public function test_user_not_assigned_to_alert_cannot_mark_it_as_read()
    {
        // Créer deux tenants et deux utilisateurs
        $tenant1 = Tenant::factory()->create();
        $tenant2 = Tenant::factory()->create();
        
        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);
        $user1->assignRole('tenant_admin');
        
        $user2 = User::factory()->create(['tenant_id' => $tenant2->id]);
        $user2->assignRole('tenant_admin');
        
        // Créer un véhicule pour le tenant 1
        $vehicle = Vehicle::factory()->create(['tenant_id' => $tenant1->id]);
        
        // Créer une alerte pour le tenant 1
        $alertData = [
            'title' => 'Test Alert',
            'content' => 'Test content',
            'type' => 'system',
            'severity' => 'info',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $vehicle->id,
            'tenant_id' => $tenant1->id,
            'created_by' => $user1->id,
        ];
        
        $createAction = new CreateAlertAction();
        $alert = $createAction->handle($alertData);
        
        // Vérifier que user1 est assigné mais pas user2
        $this->assertTrue($alert->users()->where('user_id', $user1->id)->exists());
        $this->assertFalse($alert->users()->where('user_id', $user2->id)->exists());
        
        // User2 ne doit pas pouvoir marquer l'alerte comme lue (403)
        $response = $this->actingAs($user2)
            ->post(route('alerts.mark-as-read', $alert));
        
        $response->assertForbidden();
    }
    
    public function test_user_can_mark_alert_as_unread()
    {
        // Créer un tenant et un utilisateur
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->assignRole('tenant_admin');
        
        // Créer un véhicule
        $vehicle = Vehicle::factory()->create(['tenant_id' => $tenant->id]);
        
        // Créer une alerte
        $alertData = [
            'title' => 'Test Alert',
            'content' => 'Test content',
            'type' => 'system',
            'severity' => 'info',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $vehicle->id,
            'tenant_id' => $tenant->id,
            'created_by' => $user->id,
        ];
        
        $createAction = new CreateAlertAction();
        $alert = $createAction->handle($alertData);
        
        // Marquer comme lu d'abord
        $alert->markAsReadFor($user);
        $this->assertTrue($alert->isReadBy($user));
        
        // Ensuite marquer comme non lu
        $response = $this->actingAs($user)
            ->post(route('alerts.mark-as-unread', $alert));
        
        $response->assertRedirect();
        
        // Vérifier que l'alerte n'est plus marquée comme lue
        $alert->refresh();
        $this->assertFalse($alert->isReadBy($user));
    }
    
    public function test_central_user_can_mark_central_alert_as_read()
    {
        // Créer un utilisateur central
        $user = User::factory()->create(['tenant_id' => null]);
        $user->assignRole('central_admin');
        
        // Créer un véhicule central
        $vehicle = Vehicle::factory()->create(['tenant_id' => null]);
        
        // Créer une alerte centrale
        $alertData = [
            'title' => 'Central Alert',
            'content' => 'Central content',
            'type' => 'system',
            'severity' => 'warning',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $vehicle->id,
            'tenant_id' => null,
            'created_by' => $user->id,
        ];
        
        $createAction = new CreateAlertAction();
        $alert = $createAction->handle($alertData);
        
        // Vérifier que l'utilisateur central est assigné
        $this->assertTrue($alert->users()->where('user_id', $user->id)->exists());
        
        // L'utilisateur central doit pouvoir marquer l'alerte comme lue
        $response = $this->actingAs($user)
            ->post(route('alerts.mark-as-read', $alert));
        
        $response->assertRedirect();
        
        // Vérifier que l'alerte est marquée comme lue
        $alert->refresh();
        $this->assertTrue($alert->isReadBy($user));
    }

    public function test_user_can_mark_unassigned_alert_as_read_if_eligible()
    {
        // Créer un tenant et un utilisateur
        $tenant = Tenant::factory()->create();
        $user = User::factory()->create(['tenant_id' => $tenant->id]);
        $user->assignRole('tenant_admin');
        
        // Créer un véhicule
        $vehicle = Vehicle::factory()->create(['tenant_id' => $tenant->id]);
        
        // Créer une alerte DIRECTEMENT (sans utiliser CreateAlertAction pour simuler le bug)
        // Ceci simule les alertes créées par WorkflowActionExecutor qui bypasse l'auto-assignment
        $alert = Alert::create([
            'title' => 'Unassigned Alert',
            'content' => 'This alert was not auto-assigned',
            'type' => 'system',
            'severity' => 'warning',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $vehicle->id,
            'tenant_id' => $tenant->id,
            'created_by' => $user->id,
            'is_active' => true,
        ]);
        
        // Vérifier que l'utilisateur n'est PAS assigné initialement
        $this->assertFalse($alert->users()->where('user_id', $user->id)->exists());
        
        // L'utilisateur devrait pouvoir marquer l'alerte comme lue grâce à l'auto-assignment
        $response = $this->actingAs($user)
            ->post(route('alerts.mark-as-read', $alert));
        
        $response->assertRedirect();
        
        // Vérifier que l'utilisateur est maintenant assigné ET que l'alerte est marquée comme lue
        $alert->refresh();
        $this->assertTrue($alert->users()->where('user_id', $user->id)->exists());
        $this->assertTrue($alert->isReadBy($user));
    }

    public function test_unauthorized_user_still_cannot_mark_alert_as_read()
    {
        // Créer deux tenants et deux utilisateurs
        $tenant1 = Tenant::factory()->create();
        $tenant2 = Tenant::factory()->create();
        
        $user1 = User::factory()->create(['tenant_id' => $tenant1->id]);
        $user1->assignRole('tenant_admin');
        
        $user2 = User::factory()->create(['tenant_id' => $tenant2->id]);
        $user2->assignRole('tenant_admin');
        
        // Créer un véhicule pour le tenant 1
        $vehicle = Vehicle::factory()->create(['tenant_id' => $tenant1->id]);
        
        // Créer une alerte directement pour le tenant 1 (sans auto-assignment)
        $alert = Alert::create([
            'title' => 'Cross-Tenant Alert',
            'content' => 'Alert for different tenant',
            'type' => 'system',
            'severity' => 'error',
            'alertable_type' => Vehicle::class,
            'alertable_id' => $vehicle->id,
            'tenant_id' => $tenant1->id,
            'created_by' => $user1->id,
            'is_active' => true,
        ]);
        
        // User2 (from different tenant) ne doit toujours pas pouvoir marquer l'alerte comme lue
        $response = $this->actingAs($user2)
            ->post(route('alerts.mark-as-read', $alert));
        
        $response->assertForbidden();
        
        // Vérifier que user2 n'a pas été assigné
        $this->assertFalse($alert->users()->where('user_id', $user2->id)->exists());
    }
}
