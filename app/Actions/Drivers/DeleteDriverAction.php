<?php

namespace App\Actions\Drivers;

use App\Models\Driver;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class DeleteDriverAction
{
    use AsAction;

    public function authorize(ActionRequest $request): bool
    {
        return $request->user()->can('delete', $request->driver);
    }

    /**
     * Execute the action.
     */
    public function handle(Driver $driver): void
    {
        $driver->delete();
    }

    public function asController(ActionRequest $request, Driver $driver)
    {
        $this->handle($driver);

        return to_route('drivers.index')
            ->with('success', __('drivers.messages.deleted_successfully'));
    }
} 