<?php

namespace App\Http\Controllers\Devices;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Device;

class DeviceEdgeController extends Controller
{
    public function index(Request $request)
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

        $devices = Device::all();

        foreach ($request->packets as $packet) {

            $device = $devices->where('imei', $packet['imei'])->first();

            if ($device === null) {
                continue;
            }

            $message = $device->messages()->create([
                'raw' => '',
                'message' => $packet['message'],
                'ip' => $packet['ip'],
            ]);

            try {
                $message->process();
            } catch (\Exception $e) {
                Log::error($e->getMessage());
            }
        }
    }
}
