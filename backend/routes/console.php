<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
/*
 * Her gece saat 00:05'te çalışır
 * 00:00'da değil — gece yarısı logların tamamının yazılması için 5 dk bekler
 * Bir önceki günün istatistiklerini usage_stats tablosuna yazar
 */
Schedule::command('stats:generate')->dailyAt('00:05');