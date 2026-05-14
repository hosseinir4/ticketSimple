<?php
namespace File\Models;

use Illuminate\Database\Eloquent\Model;
use Ticket\Models\Ticket;

class File extends Model
{
    protected $guarded = [];

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }
}
