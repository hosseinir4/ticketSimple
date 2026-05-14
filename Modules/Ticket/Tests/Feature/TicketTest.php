<?php

namespace Ticket\Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\Test;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Ticket\Models\Ticket;
use User\Models\User;
use function fake;

class TicketTest extends TestCase
{
    use RefreshDatabase;

    #[Test]
    public function it_create_ticket()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        Storage::fake('public');
        $file = UploadedFile::fake()->create('document.pdf', 1024);
        $title = fake()->title;
        $requestData = [
            'title' => $title,
            'body' => fake()->text,
            'file' => $file
        ];
        $response = $this->postJson('/api/ticket/', $requestData);
        $response->assertStatus(200);
        $this->assertDatabaseHas('tickets', [
            'title' => $title,
        ]);
    }

    #[Test]
    public function it_can_not_create_ticket_when_no_file()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);
        $requestData = [
            'title' => fake()->title,
            'body' => fake()->text
        ];
        $response = $this->postJson('/api/ticket/', $requestData);
        $response->assertStatus(401);
    }

    #[Test]
    public function it_can_confirm_ticket()
    {
        $ticket = Ticket::factory()->create();
        $admin = User::factory()->create();
        $permission = Permission::firstOrCreate(['name' => 'TicketLevelOne'],['name' => 'TicketLevelOne', 'guard_name' => 'sanctum']);
        $role = Role::firstOrCreate(['name' => 'AdminOne'],['name' => 'AdminOne', 'guard_name' => 'sanctum']);
        $role->syncPermissions($permission);
        $admin->assignRole($role);
        Sanctum::actingAs($admin);
        $response = $this->get('/api/ticket/'.$ticket->id.'/confirm');
        $response->assertStatus(200);
    }

    #[Test]
    public function it_can_not_confirm_ticket_with_no_permission()
    {
        $ticket = Ticket::factory()->create();
        $admin = User::factory()->create();
        Sanctum::actingAs($admin);
        $response = $this->get('/api/ticket/'.$ticket->id.'/confirm');
        $response->assertStatus(403);
    }

    #[Test]
    public function it_can_reject_ticket()
    {
        $ticket = Ticket::factory()->create();
        $admin = User::factory()->create();
        $permission = Permission::firstOrCreate(['name' => 'TicketLevelOne'],['name' => 'TicketLevelOne', 'guard_name' => 'sanctum']);
        $role = Role::firstOrCreate(['name' => 'AdminOne'],['name' => 'AdminOne', 'guard_name' => 'sanctum']);
        $role->syncPermissions($permission);
        $admin->assignRole($role);
        Sanctum::actingAs($admin);
        $requestData = [
            'note' => fake()->text
        ];
        $response = $this->post('/api/ticket/'.$ticket->id.'/reject',$requestData);
        $response->assertStatus(200);
        $this->assertDatabaseHas('tickets', [
            'id' => $ticket->id,
            'status' => Ticket::STATUS_REJECT
        ]);
    }
}
