<?php

namespace App\Filament\Resources;

use App\Filament\Resources\RequestLogResource\Pages;
use App\Models\RequestLog;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class RequestLogResource extends Resource
{
    protected static ?string $model = RequestLog::class;
    protected static ?string $navigationIcon = 'heroicon-o-document-text';
    protected static ?string $navigationLabel = 'İstek Logları';
    protected static ?string $modelLabel = 'İstek Logu';
    protected static ?int $navigationSort = 4;

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Log Detayı')
                ->schema([
                    Forms\Components\TextInput::make('endpoint')
                        ->label('Endpoint')
                        ->disabled(),

                    Forms\Components\TextInput::make('method')
                        ->label('Method')
                        ->disabled(),

                    Forms\Components\TextInput::make('status_code')
                        ->label('Status Code')
                        ->disabled(),

                    Forms\Components\TextInput::make('response_time_ms')
                        ->label('Yanıt Süresi (ms)')
                        ->disabled(),

                    Forms\Components\TextInput::make('ip_address')
                        ->label('IP Adresi')
                        ->disabled(),

                    Forms\Components\Toggle::make('cache_hit')
                        ->label('Cache\'den Geldi')
                        ->disabled(),
                ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.email')
                    ->label('Kullanıcı')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('endpoint')
                    ->label('Endpoint')
                    ->searchable(),

                Tables\Columns\TextColumn::make('method')
                    ->label('Method')
                    ->badge(),

                Tables\Columns\TextColumn::make('status_code')
                    ->label('Status')
                    ->badge()
                    ->color(fn (int $state): string => match(true) {
                        $state >= 200 && $state < 300 => 'success',
                        $state >= 400 && $state < 500 => 'warning',
                        $state >= 500                 => 'danger',
                        default                       => 'gray',
                    }),

                Tables\Columns\TextColumn::make('response_time_ms')
                    ->label('Süre (ms)')
                    ->sortable(),

                Tables\Columns\TextColumn::make('ip_address')
                    ->label('IP'),

                Tables\Columns\IconColumn::make('cache_hit')
                    ->label('Cache')
                    ->boolean(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Tarih')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('method')
                    ->label('Method')
                    ->options([
                        'GET'    => 'GET',
                        'POST'   => 'POST',
                        'PUT'    => 'PUT',
                        'DELETE' => 'DELETE',
                    ]),

                Tables\Filters\Filter::make('errors')
                    ->label('Sadece Hatalar')
                    ->query(fn ($query) => $query->where('status_code', '>=', 400)),

                Tables\Filters\Filter::make('cache_hits')
                    ->label('Sadece Cache Hit')
                    ->query(fn ($query) => $query->where('cache_hit', true)),
            ])
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc');
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRequestLogs::route('/'),
            'view'  => Pages\ViewRequestLog::route('/{record}'),
        ];
    }
}