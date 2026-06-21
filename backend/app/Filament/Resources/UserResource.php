<?php

namespace App\Filament\Resources;

use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class UserResource extends Resource
{
    protected static ?string $model = User::class;
    protected static ?string $navigationIcon = 'heroicon-o-users';
protected static ?string $navigationLabel = 'Kullanıcılar';
protected static ?string $modelLabel = 'Kullanıcı';
protected static ?string $pluralModelLabel = 'Kullanıcılar';
protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Kullanıcı Bilgileri')
                ->schema([
                    Forms\Components\TextInput::make('name')
                        ->label('Ad Soyad')
                        ->required()
                        ->maxLength(255),

                    Forms\Components\TextInput::make('email')
                        ->label('E-posta')
                        ->email()
                        ->required()
                        ->unique(ignoreRecord: true)
                        ->maxLength(255),

                    Forms\Components\Select::make('role')
                        ->label('Rol')
                        ->options([
                            'developer' => 'Developer',
                            'admin'     => 'Admin',
                        ])
                        ->required(),

                    Forms\Components\Select::make('plan')
                        ->label('Plan')
                        ->options([
                            'free' => 'Free',
                            'pro'  => 'Pro',
                        ])
                        ->required(),

                    Forms\Components\Select::make('subscription_status')
                        ->label('Abonelik Durumu')
                        ->options([
                            'active'   => 'Aktif',
                            'canceled' => 'İptal Edildi',
                            'past_due' => 'Ödeme Gecikmiş',
                        ]),

                    Forms\Components\DateTimePicker::make('current_period_end')
                        ->label('Dönem Bitiş Tarihi'),
                ])->columns(2),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Ad Soyad')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('email')
                    ->label('E-posta')
                    ->searchable(),

                Tables\Columns\TextColumn::make('role')
                    ->label('Rol')
                    ->badge()
                    ->color(fn (string $state): string => match($state) {
                        'admin'     => 'danger',
                        'developer' => 'primary',
                        default     => 'gray',
                    }),

                Tables\Columns\TextColumn::make('plan')
                    ->label('Plan')
                    ->badge()
                    ->color(fn (string $state): string => match($state) {
                        'pro'  => 'success',
                        'free' => 'gray',
                        default => 'gray',
                    }),

                Tables\Columns\TextColumn::make('subscription_status')
                    ->label('Abonelik')
                    ->badge()
                    ->color(fn (string $state): string => match($state) {
                        'active'   => 'success',
                        'canceled' => 'danger',
                        'past_due' => 'warning',
                        default    => 'gray',
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Kayıt Tarihi')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('role')
                    ->label('Rol')
                    ->options([
                        'developer' => 'Developer',
                        'admin'     => 'Admin',
                    ]),

                Tables\Filters\SelectFilter::make('plan')
                    ->label('Plan')
                    ->options([
                        'free' => 'Free',
                        'pro'  => 'Pro',
                    ]),
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
            'index'  => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit'   => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
