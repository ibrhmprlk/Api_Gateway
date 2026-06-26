<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;
use App\Models\Plan;
use Carbon\Carbon;

class BillingController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $plan = Plan::whereRaw('LOWER(name) = ?', [$user->plan])->first();

        return response()->json([
            'plan'                => $plan,
            'user_plan'           => $user->plan,
            'subscription_status' => $user->subscription_status,
            'current_period_end'  => $user->current_period_end,
            'canceled_at'         => $user->canceled_at,
        ]);
    }

    public function checkout(Request $request)
    {
        $user = $request->user();
        $plan = Plan::whereRaw('LOWER(name) = ?', ['pro'])->firstOrFail();

        if ($user->plan === 'pro' && $user->subscription_status === 'active') {
            return response()->json(['message' => 'Zaten Pro plandasınız.'], 422);
        }

        $session = Session::create([
            'payment_method_types' => ['card'],
            'mode'                 => 'subscription',
            'customer_email'       => $user->email,
            'line_items'           => [[
                'price'    => $plan->stripe_price_id,
                'quantity' => 1,
            ]],
            'success_url' => config('app.frontend_url') . '/billing?success=true',
            'cancel_url'  => config('app.frontend_url') . '/billing?canceled=true',
            'metadata'    => ['user_id' => $user->id],
        ]);

        return response()->json(['checkout_url' => $session->url]);
    }

    public function cancel(Request $request)
    {
        $user = $request->user();

        if ($user->plan !== 'pro') {
            return response()->json(['message' => 'Aktif bir Pro aboneliğiniz yok.'], 422);
        }

        $subscriptions = \Stripe\Subscription::all([
            'customer' => $user->stripe_customer_id,
            'status'   => 'active',
        ]);

        if (!empty($subscriptions->data)) {
            \Stripe\Subscription::update($subscriptions->data[0]->id, [
                'cancel_at_period_end' => true,
            ]);
        }

        $user->update([
            'canceled_at'         => now(),
            'subscription_status' => 'canceled',
        ]);

        return response()->json(['message' => 'Aboneliğiniz dönem sonunda iptal edilecek.']);
    }

    public function reactivate(Request $request)
    {
        $user = $request->user();

        if ($user->plan !== 'pro' || $user->subscription_status !== 'canceled') {
            return response()->json(['message' => 'İptal edilmiş bir aboneliğiniz yok.'], 422);
        }

        $subscriptions = \Stripe\Subscription::all([
            'customer' => $user->stripe_customer_id,
        ]);

        if (!empty($subscriptions->data)) {
            \Stripe\Subscription::update($subscriptions->data[0]->id, [
                'cancel_at_period_end' => false,
            ]);
        }

        $user->update([
            'canceled_at'         => null,
            'subscription_status' => 'active',
        ]);

        return response()->json(['message' => 'Aboneliğiniz yeniden aktifleştirildi.']);
    }

    public function webhook(Request $request)
    {
        $payload   = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');

        try {
            $event = Webhook::constructEvent(
                $payload,
                $sigHeader,
                config('services.stripe.webhook_secret')
            );
        } catch (\Exception $e) {
            return response()->json(['message' => 'Geçersiz imza.'], 400);
        }

        switch ($event->type) {
            case 'checkout.session.completed':
                $session = $event->data->object;
                $userId  = $session->metadata->user_id;
                $user    = \App\Models\User::find($userId);

                if ($user && $session->subscription) {
                    $subscription = \Stripe\Subscription::retrieve($session->subscription);
                    $user->update([
                        'plan'                => 'pro',
                        'subscription_status' => 'active',
                        'stripe_customer_id'  => $session->customer,
                        'current_period_end'  => Carbon::createFromTimestamp($subscription->current_period_end),
                        'canceled_at'         => null,
                    ]);

                    // Pro'ya geçince mevcut key'lerin permissions'ını güncelle
                    $user->apiKeys()->update([
                        'permissions' => json_encode([
                            'weather'   => true,
                            'exchange'  => true,
                            'countries' => true,
                        ]),
                    ]);
                }
                break;

            case 'invoice.payment_succeeded':
                $invoice = $event->data->object;
                $user    = \App\Models\User::where('stripe_customer_id', $invoice->customer)->first();

                if ($user && $invoice->subscription) {
                    $subscription = \Stripe\Subscription::retrieve($invoice->subscription);
                    $user->update([
                        'subscription_status' => 'active',
                        'current_period_end'  => Carbon::createFromTimestamp($subscription->current_period_end),
                        'canceled_at'         => null,
                    ]);
                }
                break;

            case 'invoice.payment_failed':
                $invoice = $event->data->object;
                $user    = \App\Models\User::where('stripe_customer_id', $invoice->customer)->first();

                if ($user) {
                    $user->update(['subscription_status' => 'past_due']);
                }
                break;

            case 'customer.subscription.deleted':
                $subscription = $event->data->object;
                $user         = \App\Models\User::where('stripe_customer_id', $subscription->customer)->first();

                if ($user) {
                    $user->update([
                        'plan'                => 'free',
                        'subscription_status' => 'canceled',
                        'current_period_end'  => null,
                    ]);

                    // Free'ye düşünce key permissions'ları kısıtla
                    $user->apiKeys()->update([
                        'permissions' => json_encode([
                            'weather'   => true,
                            'exchange'  => false,
                            'countries' => false,
                        ]),
                    ]);
                }
                break;
        }

        return response()->json(['received' => true]);
    }
}
