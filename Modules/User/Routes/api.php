<?php

use Illuminate\Support\Facades\Route;
use User\Controllers\UserController;

Route::prefix('api')->group(function() {
    Route::post('/login', [UserController::class, 'login']);
    Route::post('/register', [UserController::class, 'register']);
});

Route::prefix('api')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);
});
