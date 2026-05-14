<?php

use App\Providers\AppServiceProvider;

return [
    AppServiceProvider::class,
    \User\Providers\UserServiceProvider::class,
    \Ticket\Providers\TicketServiceProvider::class,
    \File\Providers\FileServiceProvider::class
];
