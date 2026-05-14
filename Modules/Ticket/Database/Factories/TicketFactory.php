<?php

namespace Ticket\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Ticket\Models\Ticket;
use User\Models\User;

class TicketFactory extends Factory
{
    protected $model = Ticket::class;

    protected $statuses = [Ticket::STATUS_WAIT,Ticket::STATUS_CONFIRM,Ticket::STATUS_APPROVED,Ticket::STATUS_REJECT];

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->title(),
            'body' => fake()->text(),
            'status' => $this->statuses[mt_rand(0, count($this->statuses) - 1)]
        ];
    }
}
