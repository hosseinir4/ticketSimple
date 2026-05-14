<?php

namespace Ticket\Services;

use Ticket\Models\Ticket;

class ApproveTicketService
{
    public static function approve($ticket_id)
    {
        $ticket = Ticket::find($ticket_id);
        if (mt_rand(0,1)){
            $ticket->status = Ticket::STATUS_APPROVED;
            $ticket->save();
            return true;
        } else {
            return false;
        }

    }
}
