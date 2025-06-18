<?php

namespace App\Http\Controllers\Devices;

use App\Http\Controllers\Controller;
use App\Models\Device;
use App\Models\DeviceMessage;
use App\Models\VehicleLocation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeviceMessageController extends Controller
{
    public function __construct()
    {
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
        $date = $request->input('date') ? \Carbon\Carbon::parse($request->input('date')) : today();

        // Load device with all necessary relationships for consistent display
        $device->load([
            'type',
            'vehicle.tenant',
            'vehicle.model.vehicleBrand',
            'tenant'
        ]);

        $messages = DeviceMessage::with('location')
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
        
        // Get all locations for the day, regardless of pagination
        $allLocations = VehicleLocation::whereIn('device_message_id', function ($query) use ($device, $date) {
            $query->select('id')
                ->from('device_messages')
                ->where('device_id', $device->id)
                ->whereDate('created_at', $date);
        })
        ->orderBy('recorded_at', 'asc')
        ->get(['id', 'latitude', 'longitude', 'speed', 'heading', 'ignition', 'moving', 'recorded_at', 'address']);

        return Inertia::render('devices/messages', [
            'device' => $device,
            'messages' => $messages,
            'date' => $date->toDateString(),
            'filters' => $request->only(['date', 'per_page']),
            'allLocations' => $allLocations
        ]);
    }

    public function list(Request $request)
    {
        $request->validate([
            'after' => 'required|date'
        ]);

        $messages = \App\Models\DeviceMessage::where('created_at', '>', $request->after)
            ->get();

        return response()->json([
            'data' => $messages,
            'count' => $messages->count(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'packets' => 'array|required',
            'packets.*.imei' => 'required',
            'packets.*.message' => 'required',
            'packets.*.ip' => 'required',
        ]);

        foreach ($request->packets as $packet) {
            
            $box = Device::where('imei', $packet['imei'])->first();

            if ($box === null) {
                continue;
            }

            $message = $box->messages()->create([
                'raw' => '',
                'message' => $packet['message'],
                'ip' => $packet['ip'],
            ]);

            try {
                $message->process();
            } catch (\Exception $e) {
                \Sentry\captureException($e);
            }
        }
    }
} 