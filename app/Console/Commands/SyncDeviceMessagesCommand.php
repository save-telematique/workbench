<?php

namespace App\Console\Commands;

use App\Models\Device;
use App\Models\DeviceMessage;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SyncDeviceMessagesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'device-messages:sync {--days=1}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize device messages from Save Telematique API';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info(__('devices.messages.sync.started'));

        try {
            // Get the timestamp of the last device message
            $lastMessage = DeviceMessage::orderBy('created_at', 'desc')->first();
            
            if ($lastMessage) {
                $lastTimestamp = $lastMessage->created_at->toDateTimeString();
                $this->info(__('devices.messages.sync.last_timestamp', ['timestamp' => $lastTimestamp]));
            } else {
                // If no messages exist, use a default date (e.g., 24 hours ago)
                $lastTimestamp = Carbon::now()->subDays($this->option('days'))->toDateTimeString();
                $this->info(__('devices.messages.sync.no_messages', ['timestamp' => $lastTimestamp]));
            }

            // Call the API to get messages after the last timestamp
            $apiUrl = 'https://beta.save-telematique.fr/api/messages';
            $response = Http::get($apiUrl, [
                'after' => $lastTimestamp,
            ]);

            if (!$response->successful()) {
                $this->error(__('devices.messages.sync.api_failed', ['status' => $response->status()]));
                Log::error("API call failed", [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                return Command::FAILURE;
            }

            $messages = $response->json('data', []);
            $count = count($messages);

            if ($count === 0) {
                $this->info(__('devices.messages.sync.no_new_messages'));
                return Command::SUCCESS;
            }

            $this->info(__('devices.messages.sync.found_messages', ['count' => $count]));
            
            // Process the messages in chunks to avoid memory issues
            $progressBar = $this->output->createProgressBar($count);
            $progressBar->start();
            
            $processed = 0;
            
            // Group messages by device_id to efficiently batch insert
            $deviceMessages = [];
            
            $devices = Device::all();

            foreach ($messages as $message) {
                // Prepare data for DeviceMessage model
                $device = $devices->firstWhere('id', $message['box_id']);

                if (!$device) {
                    continue;
                }

                $deviceMessages[] = [
                    'device_id' => $message['box_id'],
                    'message' => json_encode($message['message']),
                    'ip' => $message['ip'] ?? '0.0.0.0',
                    'created_at' => Carbon::parse($message['created_at'], 'UTC')->timezone('Europe/Paris'),
                    'updated_at' => Carbon::now(),
                ];

                $processed++;
                $progressBar->advance();
                
                // Insert in batches of 100
                if ($processed % 100 === 0 || $processed === $count) {
                    DeviceMessage::insert($deviceMessages);
                    $deviceMessages = [];
                }
            }
            
            // Insert any remaining messages
            if (!empty($deviceMessages)) {
                DeviceMessage::insert($deviceMessages);
            }
            
            $progressBar->finish();
            $this->newLine(2);
            
            $this->info(__('devices.messages.sync.success', ['count' => $processed]));
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error(__('devices.messages.sync.error', ['message' => $e->getMessage()]));
            Log::error("Device message sync failed", [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return Command::FAILURE;
        }
    }
} 