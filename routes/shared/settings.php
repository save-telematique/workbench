<?php

use App\Actions\Settings\DeleteProfileAction;
use App\Actions\Settings\UpdateLocaleAction;
use App\Actions\Settings\UpdatePasswordAction;
use App\Actions\Settings\UpdateProfileAction;
use App\Http\Controllers\Settings\LocaleController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth', 'universal')->group(function () {
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', UpdateProfileAction::class)->name('profile.update');
    Route::delete('settings/profile', DeleteProfileAction::class)->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', UpdatePasswordAction::class)->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('settings.appearance');

    Route::get('settings/locale', [LocaleController::class, 'index'])->name('settings.locale');
    Route::post('settings/locale', UpdateLocaleAction::class)->name('settings.locale.update');
});
