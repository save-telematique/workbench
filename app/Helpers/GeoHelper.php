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

    /**
     * Check if a point is inside a polygon using the ray casting algorithm.
     * 
     * @param float $latitude Point latitude
     * @param float $longitude Point longitude  
     * @param array $polygon Array of [lng, lat] coordinates representing the polygon
     * @return bool True if point is inside polygon, false otherwise
     */
    public static function pointInPolygon(float $latitude, float $longitude, array $polygon): bool
    {
        $count = count($polygon);
        $inside = false;

        for ($i = 0, $j = $count - 1; $i < $count; $j = $i++) {
            $xi = $polygon[$i][0]; // longitude
            $yi = $polygon[$i][1]; // latitude
            $xj = $polygon[$j][0]; // longitude  
            $yj = $polygon[$j][1]; // latitude

            if ((($yi > $latitude) !== ($yj > $latitude)) &&
                ($longitude < ($xj - $xi) * ($latitude - $yi) / ($yj - $yi) + $xi)) {
                $inside = !$inside;
            }
        }

        return $inside;
    }

    /**
     * Check if a point is inside a GeoJSON geometry.
     * 
     * @param float $latitude Point latitude
     * @param float $longitude Point longitude
     * @param array $geojson GeoJSON geometry object
     * @return bool True if point is inside geometry, false otherwise
     */
    public static function pointInGeoJSON(float $latitude, float $longitude, array $geojson): bool
    {
        if (!isset($geojson['type']) || !isset($geojson['coordinates'])) {
            return false;
        }

        switch ($geojson['type']) {
            case 'Polygon':
                // For polygons, coordinates[0] is the exterior ring
                $exteriorRing = $geojson['coordinates'][0];
                $isInside = self::pointInPolygon($latitude, $longitude, $exteriorRing);
                
                // Check holes (interior rings) - if point is in a hole, it's outside the polygon
                if ($isInside && count($geojson['coordinates']) > 1) {
                    for ($i = 1; $i < count($geojson['coordinates']); $i++) {
                        $hole = $geojson['coordinates'][$i];
                        if (self::pointInPolygon($latitude, $longitude, $hole)) {
                            $isInside = false;
                            break;
                        }
                    }
                }
                
                return $isInside;

            case 'MultiPolygon':
                // Check if point is in any of the polygons
                foreach ($geojson['coordinates'] as $polygonCoords) {
                    $polygonGeojson = [
                        'type' => 'Polygon',
                        'coordinates' => $polygonCoords
                    ];
                    if (self::pointInGeoJSON($latitude, $longitude, $polygonGeojson)) {
                        return true;
                    }
                }
                return false;

            case 'Point':
                // For point geofences, check if within a small radius (e.g., 100 meters)
                $pointLat = $geojson['coordinates'][1];
                $pointLng = $geojson['coordinates'][0];
                $distance = self::vincentyGreatCircleDistance($latitude, $longitude, $pointLat, $pointLng);
                return $distance <= 100; // 100 meter radius

            case 'Circle':
                // Custom circle type (not standard GeoJSON but common in geofencing)
                if (isset($geojson['center']) && isset($geojson['radius'])) {
                    $centerLat = $geojson['center'][1];
                    $centerLng = $geojson['center'][0];
                    $radius = $geojson['radius']; // in meters
                    $distance = self::vincentyGreatCircleDistance($latitude, $longitude, $centerLat, $centerLng);
                    return $distance <= $radius;
                }
                return false;

            default:
                return false;
        }
    }
}
