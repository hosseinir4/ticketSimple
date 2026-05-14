<?php

namespace Ticket\Controllers;

use App\Http\Controllers\Controller;
use File\Models\File;
use Ticket\Jobs\TicketApproveJob;
use Ticket\Models\Ticket;
use Ticket\Requests\BulkTicketRequests;
use Ticket\Requests\CreateRequests;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function create(CreateRequests $request)
    {
        $ticket = Ticket::create([
            'user_id' => auth()->user()->id,
            'title' => $request->title,
            'body' => $request->body
        ]);

        $path = $request->file('file')->store('files', 'public');
        $savedFile = File::create([
            'ticket_id' => $ticket->id,
            'url' => Storage::url($path),
            'mime_type' => $request->file->getMimeType(),
            'size' => $request->file->getSize()
        ]);

        return response()->json(['data' => [
            'ticket' => $ticket
        ],'message' => 'Ticket created'],200);
    }

    public function confirm($ticket)
    {
        $ticket = Ticket::find($ticket);
        $ticket->status = Ticket::STATUS_CONFIRM;
        $ticket->save();
        return response()->json(['data' => null,'message' => 'Ticket updated'],200);
    }

    public function bulkConfirm(BulkTicketRequests $requests)
    {
        foreach ($requests->tickets as $ticket){
            $ticket = Ticket::find($ticket);
            $ticket->status = Ticket::STATUS_CONFIRM;
            $ticket->save();
        }
        return response()->json(['data' => [
            'tickets' => $requests->tickets
        ],'message' => 'Tickets updated'],200);
    }

    public function approve($ticket)
    {
        TicketApproveJob::dispatch($ticket);
        return response()->json(['data' => null,'message' => 'Tickets will be updated'],200);
    }

    public function bulkApprove(BulkTicketRequests $requests)
    {
        foreach ($requests->tickets as $ticket){
            TicketApproveJob::dispatch($ticket);
        }
        return response()->json(['data' => [
            'tickets' => $requests->tickets
        ],'message' => 'Tickets will be updated'],200);
    }

    public function reject($ticket,Request $request)
    {
        $request->validate([
            'note' => 'required|string|max:2555',
        ]);

        $ticket = Ticket::find($ticket);
        $ticket->status = Ticket::STATUS_REJECT;
        $ticket->note = $request->note;
        $ticket->save();
        return response()->json(['data' => null,'message' => 'Ticket rejected'],200);
    }
}
