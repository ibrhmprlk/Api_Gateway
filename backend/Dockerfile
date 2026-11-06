FROM php:8.4.27-fpm

RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev zip unzip libpq-dev libicu-dev libzip-dev \
    nginx supervisor \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_pgsql mbstring exif pcntl bcmath gd intl zip
RUN echo "max_execution_time=120" > /usr/local/etc/php/conf.d/custom.ini
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-interaction --optimize-autoloader

RUN php artisan filament:assets

RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

# Nginx ve Supervisor ayarları
RUN rm -f /etc/nginx/sites-enabled/default
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 10000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
