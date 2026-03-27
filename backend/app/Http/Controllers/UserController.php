<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Check if authenticated user is admin
     */
    private function checkAdmin()
    {
        if (!Auth::user()->is_admin) {
            abort(403, 'Unauthorized. Admin access required.');
        }
    }

    /**
     * Display a listing of users
     */
    public function index()
    {
        $this->checkAdmin();

        $users = User::select('id', 'name', 'email', 'level', 'total_exp', 'is_admin', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    /**
     * Store a newly created user
     */
    public function store(Request $request)
    {
        $this->checkAdmin();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'is_admin' => 'boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_admin' => $validated['is_admin'] ?? false,
            'level' => 1,
            'total_exp' => 0,
            'current_exp' => 0,
        ]);

        return response()->json($user, 201);
    }

    /**
     * Display the specified user
     */
    public function show(string $id)
    {
        $this->checkAdmin();

        $user = User::findOrFail($id);
        return response()->json($user);
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, string $id)
    {
        $this->checkAdmin();

        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'sometimes|nullable|string|min:8',
            'is_admin' => 'sometimes|boolean',
            'level' => 'sometimes|integer|min:1',
            'total_exp' => 'sometimes|integer|min:0',
        ]);

        if (isset($validated['password']) && $validated['password']) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json($user);
    }

    /**
     * Remove the specified user
     */
    public function destroy(string $id)
    {
        $this->checkAdmin();

        $user = User::findOrFail($id);

        // Prevent deleting yourself
        if ($user->id === Auth::id()) {
            return response()->json([
                'message' => 'You cannot delete your own account.'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.'
        ]);
    }
}
