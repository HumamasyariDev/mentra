<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Mail\PasswordResetMail;
use App\Models\EmailOtp;
use App\Models\Streak;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Send a 6-digit OTP to the given email address.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        $email = strtolower($validated['email']);

        // Rate limit: max 1 OTP per email per 60 seconds
        $recent = EmailOtp::forEmail($email)
            ->where('created_at', '>', now()->subSeconds(60))
            ->first();

        if ($recent) {
            $retryAfter = 60 - now()->diffInSeconds($recent->created_at);
            return response()->json([
                'message' => 'Please wait before requesting a new code.',
                'retry_after' => (int) $retryAfter,
            ], 429);
        }

        // Check if email is already registered
        if (User::where('email', $email)->exists()) {
            return response()->json([
                'message' => 'This email is already registered.',
                'errors' => ['email' => ['This email is already registered.']],
            ], 422);
        }

        // Generate 6-digit code
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Delete old OTPs for this email
        EmailOtp::forEmail($email)->delete();

        // Create new OTP (expires in 10 minutes)
        $otp = EmailOtp::create([
            'email' => $email,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        // Send email
        Mail::to($email)->send(new OtpMail($code));

        return response()->json([
            'message' => 'Verification code sent to your email.',
        ]);
    }

    /**
     * Verify the OTP code and return a verification token.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        $email = strtolower($validated['email']);

        $otp = EmailOtp::forEmail($email)
            ->active()
            ->where('verified', false)
            ->latest()
            ->first();

        if (!$otp) {
            return response()->json([
                'message' => 'No valid verification code found. Please request a new one.',
            ], 422);
        }

        if ($otp->code !== $validated['code']) {
            return response()->json([
                'message' => 'Invalid verification code.',
            ], 422);
        }

        // Mark as verified and generate a one-time token
        $token = Str::random(64);
        $otp->update([
            'verified' => true,
            'token' => $token,
        ]);

        return response()->json([
            'message' => 'Email verified successfully.',
            'otp_token' => $token,
        ]);
    }

    /**
     * Register a new user (requires verified OTP token).
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::min(8)->max(64)->letters()->numbers()],
            'otp_token' => ['required', 'string', 'size:64'],
        ]);

        // Verify the OTP token
        $email = strtolower($validated['email']);
        $otp = EmailOtp::forEmail($email)
            ->where('token', $validated['otp_token'])
            ->where('verified', true)
            ->active()
            ->first();

        if (!$otp) {
            return response()->json([
                'message' => 'Email verification has expired or is invalid. Please verify your email again.',
                'errors' => ['otp_token' => ['Invalid or expired verification.']],
            ], 422);
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $email,
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        Streak::create(['user_id' => $user->id]);

        // Cleanup: delete all OTPs for this email
        EmailOtp::forEmail($email)->delete();

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('streak'),
            'token' => $token,
        ], 201);
    }

    /**
     * Send a password reset link to the given email.
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
        ]);

        $email = strtolower($validated['email']);

        // Rate limit: max 1 reset per email per 60 seconds
        $recent = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->where('created_at', '>', now()->subSeconds(60))
            ->first();

        if ($recent) {
            $retryAfter = 60 - now()->diffInSeconds($recent->created_at);
            return response()->json([
                'message' => 'Please wait before requesting a new reset link.',
                'retry_after' => (int) $retryAfter,
            ], 429);
        }

        // Check if user exists
        $user = User::where('email', $email)->first();
        if (!$user) {
            // Return success anyway to prevent email enumeration
            return response()->json([
                'message' => 'If an account with that email exists, a reset link has been sent.',
            ]);
        }

        // Generate token
        $token = Str::random(64);

        // Delete old tokens for this email
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Store new token
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        // Send email
        Mail::to($email)->send(new PasswordResetMail($token, $email));

        return response()->json([
            'message' => 'If an account with that email exists, a reset link has been sent.',
        ]);
    }

    /**
     * Reset password using the token from the email link.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(8)->max(64)->letters()->numbers()],
        ]);

        $email = strtolower($validated['email']);

        $record = DB::table('password_reset_tokens')
            ->where('email', $email)
            ->first();

        if (!$record || !Hash::check($validated['token'], $record->token)) {
            return response()->json([
                'message' => 'Invalid or expired reset token.',
            ], 422);
        }

        // Check expiry (60 minutes)
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            return response()->json([
                'message' => 'Reset token has expired. Please request a new one.',
            ], 422);
        }

        // Update password
        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Delete used token
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        return response()->json([
            'message' => 'Password has been reset successfully.',
        ]);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $email = strtolower($validated['email']);

        // Check if user exists
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            return response()->json([
                'message' => 'No account found with this email address.',
                'error_type' => 'email_not_found'
            ], 401);
        }

        // Check if user has password (not social-only account)
        if (!$user->password && $user->provider) {
            return response()->json([
                'message' => 'This account uses social login. Please sign in with ' . ucfirst($user->provider) . '.',
                'error_type' => 'social_only_account'
            ], 401);
        }

        // Check password
        if (!Auth::attempt(['email' => $email, 'password' => $validated['password']])) {
            return response()->json([
                'message' => 'Incorrect password. Please try again.',
                'error_type' => 'wrong_password'
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => $user->load('streak'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('streak');

        return response()->json([
            'user' => $user,
            'exp_to_next_level' => $user->exp_to_next_level,
        ]);
    }
}
