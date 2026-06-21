<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
Route::get('/', function () {
    return view('welcome');
});
// Kullanıcıyı Google'a yönlendirir
Route::get('/auth/google/redirect', [AuthController::class, 'googleRedirect']);

// Google onayladıktan sonra buraya döner
Route::get('/auth/google/callback', [AuthController::class, 'googleCallback']);