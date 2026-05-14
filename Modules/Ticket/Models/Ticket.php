<?php

namespace Ticket\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use File\Models\File;
use Ticket\Database\Factories\TicketFactory;

class Ticket extends Model
{
    use SoftDeletes,HasFactory;

    protected $guarded = [];

    public const STATUS_WAIT = 'wait';
    public const STATUS_CONFIRM = 'confirm';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECT = 'reject';
    public static array $statuses = [
        self::STATUS_WAIT,
        self::STATUS_CONFIRM,
        self::STATUS_APPROVED,
        self::STATUS_REJECT
    ];

    public function file()
    {
        return $this->hasOne(File::class);
    }

    protected static function newFactory() {
        return TicketFactory::new();
    }
}
