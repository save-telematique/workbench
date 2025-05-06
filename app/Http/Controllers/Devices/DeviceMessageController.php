<?php

namespace App\Http\Controllers\Devices;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\DeviceMessage;
use App\Services\VehicleLocationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeviceMessageController extends Controller
{
    protected $vehicleLocationService;

    public function __construct(VehicleLocationService $vehicleLocationService)
    {
        $this->vehicleLocationService = $vehicleLocationService;
        $this->authorizeResource(DeviceMessage::class, 'device_message');
    }

    /**
     * Display a listing of device messages for a specific device.
     *
     * @param Request $request
     * @param Device $device
     * @return \Inertia\Response
     */
    public function index(Request $request, Device $device)
    {
        $perPage = $request->input('per_page', 15);
        $date = $request->input('date') ? \Carbon\Carbon::parse($request->input('date')) : null;

        $messages = DeviceMessage::with('vehicleLocation')
            ->where('device_id', $device->id)
            ->when($date, function ($query, $date) {
                return $query->whereDate('created_at', $date);
            })
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        // Group messages by date
        $groupedMessages = $messages->groupBy(function ($message) {
            return $message->created_at->format('Y-m-d');
        });

        return Inertia::render('devices/messages', [
            'device' => $device,
            'messages' => $messages,
            'groupedDates' => $groupedMessages->keys(),
            'filters' => $request->only(['date', 'per_page']),
        ]);
    }
} 