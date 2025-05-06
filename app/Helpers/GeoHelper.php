<?php

namespace App\Helpers;

class GeoHelper
{
    public static function getHeadingStringFromAngle($angle)
    {
        // Define the cardinal points and their corresponding angle midpoints
        $cardinal_points = [
            'N' => 0,
            'NE' => 45,
            'E' => 90,
            'SE' => 135,
            'S' => 180,
            'SW' => 225,
            'W' => 270,
            'NW' => 315,
        ];

        // Determine the nearest cardinal point
        $nearest_point = 'N';
        $smallest_diff = 360;

        foreach ($cardinal_points as $point => $mid) {
            $diff = abs($angle - $mid);
            if ($diff > 180) {
                $diff = 360 - $diff;
            }
            if ($diff < $smallest_diff) {
                $smallest_diff = $diff;
                $nearest_point = $point;
            }
        }

        return $nearest_point . ' ' . $angle . '°';
    }

    /**
     * Calculates the great-circle distance between two points, with
     * the Vincenty formula.
     * @param float $latitudeFrom Latitude of start point in [deg decimal]
     * @param float $longitudeFrom Longitude of start point in [deg decimal]
     * @param float $latitudeTo Latitude of target point in [deg decimal]
     * @param float $longitudeTo Longitude of target point in [deg decimal]
     * @param float $earthRadius Mean earth radius in [m]
     * @return float Distance between points in [m] (same as earthRadius)
     */
    public static function vincentyGreatCircleDistance(
        $latitudeFrom,
        $longitudeFrom,
        $latitudeTo,
        $longitudeTo,
        $earthRadius = 6371000
    ) {
        // convert from degrees to radians
        $latFrom = deg2rad($latitudeFrom);
        $lonFrom = deg2rad($longitudeFrom);
        $latTo = deg2rad($latitudeTo);
        $lonTo = deg2rad($longitudeTo);

        $lonDelta = $lonTo - $lonFrom;
        $a = pow(cos($latTo) * sin($lonDelta), 2) +
            pow(cos($latFrom) * sin($latTo) - sin($latFrom) * cos($latTo) * cos($lonDelta), 2);
        $b = sin($latFrom) * sin($latTo) + cos($latFrom) * cos($latTo) * cos($lonDelta);

        $angle = atan2(sqrt($a), $b);
        return $angle * $earthRadius;
    }
}
