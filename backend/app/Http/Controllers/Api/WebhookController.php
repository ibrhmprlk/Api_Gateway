<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Webhook;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Events\WebhookTriggered;

class WebhookController extends Controller
{
    public function index(Request $request)
    {
        $webhooks = $request->user()
            ->webhooks()
            ->with('logs')
            ->latest()
            ->get();

        return response()->json($webhooks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'url'   => ['required', 'url', 'max:500'],
            'event' => ['required', 'in:limit_reached,key_expired,request_failed'],
        ]);

        $secret = 'whsec_' . Str::random(32);

        $webhook = Webhook::create([
            'user_id'   => $request->user()->id,
            'url'       => $request->url,
            'event'     => $request->event,
            'secret'    => $secret,
            'is_active' => true,
        ]);

        return response()->json($webhook, 201);
    }

    public function update(Request $request, $id)
    {
        $webhook = Webhook::find($id);

        if (!$webhook) {
            return response()->json(['message' => 'Webhook bulunamadı.'], 404);
        }

        if ($webhook->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Bu işlem için yetkiniz yok.'], 403);
        }

        $request->validate([
            'url'       => ['sometimes', 'url', 'max:500'],
            'event'     => ['sometimes', 'in:limit_reached,key_expired,request_failed'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $webhook->update($request->only(['url', 'event', 'is_active']));

        return response()->json($webhook);
    }

    public function destroy(Request $request, $id)
    {
        $webhook = Webhook::find($id);

        if (!$webhook) {
            return response()->json(['message' => 'Webhook bulunamadı.'], 404);
        }

        if ($webhook->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Bu işlem için yetkiniz yok.'], 403);
        }

        $webhook->delete();

        return response()->json(['message' => 'Webhook silindi.']);
    }

    public function test(Request $request, $id)
    {
        $webhook = Webhook::find($id);

        if (!$webhook) {
            return response()->json(['message' => 'Webhook bulunamadı.'], 404);
        }

        if ($webhook->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Bu işlem için yetkiniz yok.'], 403);
        }

        $payload = [
            'event'     => 'test',
            'message'   => 'Bu bir test bildirimidir.',
            'timestamp' => now()->toISOString(),
        ];

        $signature = hash_hmac('sha256', json_encode($payload), $webhook->secret);

        try {
            $response = \Illuminate\Support\Facades\Http::withHeaders([
                'X-Webhook-Secret'    => $webhook->secret,
                'X-Webhook-Signature' => $signature,
                'Content-Type'        => 'application/json',
            ])->post($webhook->url, $payload);

            broadcast(new WebhookTriggered($webhook, 'test', $request->user()->id));

            return response()->json([
                'message'     => 'Test isteği gönderildi.',
                'status_code' => $response->status(),
                'success'     => $response->successful(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Webhook URL\'e ulaşılamadı: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function logs(Request $request, $id)
    {
        $webhook = Webhook::find($id);

        if (!$webhook) {
            return response()->json(['message' => 'Webhook bulunamadı.'], 404);
        }

        if ($webhook->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Bu işlem için yetkiniz yok.'], 403);
        }

        $logs = $webhook->logs()
            ->latest('created_at')
            ->paginate(20);

        return response()->json($logs);
    }
}