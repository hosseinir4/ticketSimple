<?php

namespace Ticket\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Ticket\Services\ApproveTicketService;
use Illuminate\Support\Facades\Log;

class TicketApproveJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $ticket_id;

    /**
     * Create a new job instance.
     */
    public function __construct($ticket_id)
    {
        $this->ticket_id = $ticket_id;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $res = ApproveTicketService::approve($this->ticket_id);
        if ($res){
            Log::channel('tickets')->info('attrmpt to approved ticket '.$this->ticket_id.' successfull');
        } else {
            TicketApproveJob::dispatch($this->ticket_id)->delay(now()->addSecond());
            Log::channel('tickets')->error('attrmpt to approved ticket '.$this->ticket_id.' failed');
        }
    }
}
