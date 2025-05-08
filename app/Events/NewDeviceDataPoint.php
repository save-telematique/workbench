<?php

namespace App\Events;

use App\Models\DeviceDataPoint;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewDeviceDataPoint
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /** @var \App\Models\DeviceDataPoint[] */
    public array $deviceDataPoints;

    /**
     * Create a new event instance.
     * @param \App\Models\DeviceDataPoint[] $deviceDataPoints
     */
    public function __construct(array $deviceDataPoints)
    {
        $this->deviceDataPoints = $deviceDataPoints;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [];

    }
}
