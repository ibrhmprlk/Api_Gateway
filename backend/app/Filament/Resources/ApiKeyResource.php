<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ApiKeyResource\Pages;
use App\Models\ApiKey;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ApiKeyResource extends Resource
{
    protected static ?string $model = ApiKey::class;
   protected static ?string $navigationIcon = 'heroicon-o-key';
protected static ?string $navigationLabel = 'API Keyler';
protected static ?string $modelLabel = 'API Key';
protected static ?string $pluralModelLabel = 'API Keyler';
protected static ?int $navigationSort = 3;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Key Bilgileri')
                ->schema([
                    Forms\Components\Select::make('user_id')
                        ->label('Kullanıcı')
                        ->relationship('user', 'email')
                        ->searchable()
                        ->required(),

                    Forms\Components\TextInput::make('name')
                        ->label('Key Adı')
                        ->required()
                        ->maxLength(255),

                    Forms\Components\TextInput::make('key')
                        ->label('API Key')
                        ->disabled()
                        ->maxLength(255),

                    Forms\Components\Toggle::make('is_active')
                        ->label('Aktif')
                        ->default(true),

                    Forms\Components\DateTimePicker::make('expires_at')
                        ->label('Son Kullanım Tarihi')
                        ->nullable(),

                    Forms\Components\DateTimePicker::make('last_used_at')
                        ->label('Son Kullanım')
                        ->disabled()
                        ->nullable(),
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

                Tables\Columns\TextColumn::make('name')
                    ->label('Key Adı')
                    ->searchable(),

                Tables\Columns\TextColumn::make('key')
                    ->label('Key')
                    ->limit(20)
                    ->copyable(),

                Tables\Columns\IconColumn::make('is_active')
                    ->label('Aktif')
                    ->boolean(),

                Tables\Columns\TextColumn::make('last_used_at')
                    ->label('Son Kullanım')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),

                Tables\Columns\TextColumn::make('expires_at')
                    ->label('Son Kullanım Tarihi')
                    ->dateTime('d.m.Y')
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Oluşturulma')
                    ->dateTime('d.m.Y')
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('is_active')
                    ->label('Durum')
                    ->options([
                        '1' => 'Aktif',
                        '0' => 'Pasif',
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
            'index'  => Pages\ListApiKeys::route('/'),
            'create' => Pages\CreateApiKey::route('/create'),
            'edit'   => Pages\EditApiKey::route('/{record}/edit'),
        ];
    }
}
