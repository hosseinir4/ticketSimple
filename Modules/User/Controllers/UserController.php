<?php

namespace User\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Hash;
use User\Models\User;
use User\Requests\LoginRequests;
use Illuminate\Support\Facades\Auth;
use User\Requests\RegisterRequests;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function login(LoginRequests $request)
    {
        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401);
        }

        $token = $user->createToken('token')->plainTextToken;
        return response()->json(['data' => [
            'token' => $token,
            'user' => $user
        ],'message' => 'logined'],200);
    }

    public function register(RegisterRequests $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('token')->plainTextToken;
        return response()->json(['data' => [
            'token' => $token,
            'user' => $user
        ],'message' => 'registered'],201);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json([
            'message' => 'Successfully logged out'
        ], 200);
    }
}
