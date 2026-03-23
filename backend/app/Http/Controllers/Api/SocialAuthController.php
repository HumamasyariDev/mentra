<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Streak;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    /**
     * Supported OAuth providers.
     */
    private array $providers = ['google', 'facebook'];

    /**
     * Redirect to the OAuth provider.
     */
    public function redirect(string $provider): RedirectResponse
    {
        if (!in_array($provider, $this->providers)) {
            return redirect(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')) . '/login?error=unsupported_provider');
        }

        return Socialite::driver($provider)->stateless()->redirect();
    }

    /**
     * Handle the callback from the OAuth provider.
     */
    public function callback(string $provider): RedirectResponse
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));

        if (!in_array($provider, $this->providers)) {
            return redirect($frontendUrl . '/login?error=unsupported_provider');
        }

        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return redirect($frontendUrl . '/login?error=oauth_failed');
        }

        if (!$socialUser->getEmail()) {
            return redirect($frontendUrl . '/login?error=no_email');
        }

        $email = strtolower($socialUser->getEmail());

        // Find existing user by provider+provider_id OR by email
        $user = User::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if (!$user) {
            $user = User::where('email', $email)->first();
        }

        if ($user) {
            // Link social account if not already linked
            if (!$user->provider) {
                $user->update([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'email_verified_at' => $user->email_verified_at ?? now(),
                ]);
            }
        } else {
            // Create new user
            $user = User::create([
                'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                'email' => $email,
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
                'avatar' => $socialUser->getAvatar(),
                'password' => null, // Social users don't need a password
                'email_verified_at' => now(),
            ]);

            // Create streak for new user
            Streak::create(['user_id' => $user->id]);
        }

        // Generate Sanctum token
        $token = $user->createToken('auth-token')->plainTextToken;

        // Redirect to frontend with token
        return redirect($frontendUrl . '/auth/callback?token=' . $token);
    }
}
