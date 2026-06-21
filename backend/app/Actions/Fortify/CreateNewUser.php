<?php

namespace App\Actions\Fortify;

use App\Models\ApiKey;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    public function create(array $input): User
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => $this->passwordRules(),
        ])->validate();

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'role' => 'developer',
            'plan' => 'free',
            'subscription_status' => 'active',
        ]);

        // Kayıtta otomatik API key oluştur
        ApiKey::create([
            'user_id' => $user->id,
            'key' => 'gw_' . Str::random(40),
            'name' => 'Default Key',
            'is_active' => true,
            'permissions' => ['weather' => true, 'exchange' => true, 'countries' => true],
        ]);

        return $user;
    }
}