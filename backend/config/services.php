<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],
/*
 * OpenWeatherMap API key'i
 * GatewayController'da hava durumu sorgularında kullanılır
 */
'openweathermap' => [
    'key' => env('OPENWEATHERMAP_KEY'),
],
/*
 * Stripe ödeme sistemi
 * BillingController'da kullanılır
 */
'stripe' => [
    'key'             => env('STRIPE_KEY'),
    'secret'          => env('STRIPE_SECRET'),
    'webhook_secret'  => env('STRIPE_WEBHOOK_SECRET'),
    'pro_price_id'    => env('STRIPE_PRO_PRICE_ID'),
],
/*
 * Google OAuth — Socialite ile kullanılır
 * AuthController'daki googleRedirect ve googleCallback metodlarında kullanılır
 */
'google' => [
    'client_id'     => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect'      => env('GOOGLE_REDIRECT_URI'),
],
'restcountries' => [
    'key' => env('RESTCOUNTRIES_KEY'),
],
/*
 * ExchangeRate API key'i
 * GatewayController'da döviz kuru sorgularında kullanılır
 */
'exchangerate' => [
    'key' => env('EXCHANGERATE_KEY'),
],
    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

];
