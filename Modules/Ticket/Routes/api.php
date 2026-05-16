<?php

use Illuminate\Support\Facades\Route;
use Ticket\Controllers\TicketController;

Route::prefix('api/ticket')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [TicketController::class, 'tickets']);
    Route::post('/', [TicketController::class, 'create']);
    Route::get('/{ticket}/confirm', [TicketController::class, 'confirm'])->middleware('permission:TicketLevelOne');
    Route::post('/bulkConfirm', [TicketController::class, 'bulkConfirm'])->middleware('permission:TicketLevelOne');
    Route::get('/{ticket}/approve', [TicketController::class, 'approve'])->middleware('permission:TicketLevelTwo');
    Route::post('/bulkApprove', [TicketController::class, 'bulkApprove'])->middleware('permission:TicketLevelTwo');
    Route::post('/{ticket}/reject', [TicketController::class, 'reject'])
        ->middleware('permission:TicketLevelTwo|TicketLevelOne');
});

