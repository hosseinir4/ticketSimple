<?php

namespace User\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use User\Models\User;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $permissionOne = Permission::firstOrCreate(['name' => 'TicketLevelOne'],['name' => 'TicketLevelOne', 'guard_name' => 'sanctum']);
        $permissionTwo = Permission::firstOrCreate(['name' => 'TicketLevelTwo'],['name' => 'TicketLevelTwo', 'guard_name' => 'sanctum']);

        $user1 = User::query()->firstOrCreate(['email' => 'admin_level_one@mail.com'],[
            'name' => 'Admin One',
            'email' => 'admin_level_one@mail.com',
            'password' => Hash::make('12345678one'),
        ]);

        $user2 = User::query()->firstOrCreate(['email' => 'admin_level_two@mail.com'],[
            'name' => 'Admin Two',
            'email' => 'admin_level_two@mail.com',
            'password' => Hash::make('12345678two'),
        ]);

        $role1 = Role::firstOrCreate(['name' => 'AdminOne'],['name' => 'AdminOne', 'guard_name' => 'sanctum']);
        $role2 = Role::firstOrCreate(['name' => 'AdminTwo'],['name' => 'AdminTwo', 'guard_name' => 'sanctum']);

        $role1->syncPermissions($permissionOne);
        $role2->syncPermissions($permissionTwo);

        $user1->assignRole($role1);
        $user2->assignRole($role2);
    }
}
