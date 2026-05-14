<?php

namespace Ticket\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class BulkTicketRequests extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tickets' => 'required|array',
            'tickets.*' => 'required|numeric|exists:tickets,id',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json(['data' => $validator->errors(),'message' => 'wrong inputs'],401)
        );
    }
}
