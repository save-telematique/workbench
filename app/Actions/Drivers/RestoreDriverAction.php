<?php

namespace App\Actions\Drivers;

use App\Models\Driver;
use Lorisleiva\Actions\ActionRequest;
use Lorisleiva\Actions\Concerns\AsAction;

class RestoreDriverAction
{
    use AsAction;

    public function authorize(ActionRequest $request, string $id): bool
    {
        $driver = Driver::withTrashed()->findOrFail($id);
        return $request->user()->can('restore', $driver);
    }

    /**
     * Execute the action.
     */
    public function handle(string $id): Driver
    {
        $driver = Driver::withTrashed()->findOrFail($id);
        $driver->restore();
        
        return $driver;
    }

    public function asController(ActionRequest $request, string $id)
    {
        $driver = $this->handle($id);

        return to_route('drivers.show', $driver)
            ->with('success', __('drivers.messages.restored_successfully'));
    }
} 