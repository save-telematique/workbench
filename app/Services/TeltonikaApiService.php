<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TeltonikaApiService
{
    protected string $baseUrl;
    protected string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.teltonika.url', 'https://api.teltonika.lt');
        $this->apiKey = config('services.teltonika.api_key');
    }

    /**
     * Get device information from the Teltonika API.
     *
     * @param string $imei The device IMEI
     * @return array|null The device data or null if it couldn't be retrieved
     */
    public function getDeviceInfo(string $imei): ?array
    {
        try {
            $response = $this->makeRequest('GET', "/devices/{$imei}");
            
            if ($response->successful()) {
                return $response->json();
            }
            
            Log::warning("Failed to get Teltonika device data", [
                'imei' => $imei,
                'status' => $response->status(),
                'response' => $response->body(),
            ]);
            
            return null;
        } catch (\Exception $e) {
            Log::error("Error fetching Teltonika device data", [
                'imei' => $imei,
                'error' => $e->getMessage(),
            ]);
            
            return null;
        }
    }

    /**
     * Get available firmware versions for a specific device model.
     *
     * @param string $model The device model
     * @return array|null List of available firmware versions or null on error
     */
    public function getAvailableFirmwareVersions(string $model): ?array
    {
        try {
            $response = $this->makeRequest('GET', "/firmware/available/{$model}");
            
            if ($response->successful()) {
                return $response->json();
            }
            
            Log::warning("Failed to get Teltonika firmware versions", [
                'model' => $model,
                'status' => $response->status(),
                'response' => $response->body(),
            ]);
            
            return null;
        } catch (\Exception $e) {
            Log::error("Error fetching Teltonika firmware versions", [
                'model' => $model,
                'error' => $e->getMessage(),
            ]);
            
            return null;
        }
    }

    /**
     * Make an API request to the Teltonika FOTA API.
     *
     * @param string $method HTTP method
     * @param string $endpoint API endpoint
     * @param array $params Request parameters
     * @return Response
     */
    protected function makeRequest(string $method, string $endpoint, array $params = []): Response
    {
        return Http::withHeaders([
            'Authorization' => "Bearer {$this->apiKey}",
            'Accept' => 'application/json',
        ])->$method("{$this->baseUrl}{$endpoint}", $params);
    }
} 