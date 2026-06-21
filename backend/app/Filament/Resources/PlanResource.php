<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PlanResource\Pages;
use App\Models\Plan;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class PlanResource extends Resource
{
    protected static ?string $model = Plan::class;
   protected static ?string $navigationIcon = 'heroicon-o-credit-card';
protected static ?string $navigationLabel = 'Planlar';
protected static ?string $modelLabel = 'Plan';
protected static ?string $pluralModelLabel = 'Planlar';
protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Plan Bilgileri')
                ->schema([
                    Forms\Components\TextInput::make('name')
                        ->label('Plan Adı')
                        ->required()
                        ->maxLength(255),

                    Forms\Components\TextInput::make('rate_limit_per_minute')
                        ->label('Dakika Limiti')
                        ->numeric()
                        ->required(),

                    Forms\Components\TextInput::make('price_monthly')
                        ->label('Aylık Fiyat ($)')
                        ->numeric()
                        ->required(),

                    Forms\Components\TextInput::make('stripe_price_id')
                        ->label('Stripe Price ID')
                        ->nullable(),

                    Forms\Components\KeyValue::make('api_access')
                        ->label('API Erişimleri')
                        ->keyLabel('API')
                        ->valueLabel('Erişim'),
                ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Plan Adı')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('rate_limit_per_minute')
                    ->label('Dakika Limiti')
                    ->sortable(),

                Tables\Columns\TextColumn::make('price_monthly')
                    ->label('Fiyat')
                    ->money('USD')
                    ->sortable(),

                Tables\Columns\TextColumn::make('stripe_price_id')
                    ->label('Stripe ID')
                    ->limit(30),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Oluşturulma')
                    ->dateTime('d.m.Y')
                    ->sortable(),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListPlans::route('/'),
            'create' => Pages\CreatePlan::route('/create'),
            'edit'   => Pages\EditPlan::route('/{record}/edit'),
        ];
    }
}
