<?php

namespace Ticket\Database\Seeders;

use Illuminate\Database\Seeder;
use Ticket\Models\Ticket;

class TicketSeeder extends Seeder
{
    public function run(): void
    {
        Ticket::factory()->count(5)->create();
    }
}
