# CREATE_ALERT Workflow Action

The `CREATE_ALERT` action allows workflows to automatically create alerts when specific conditions are met. This is useful for creating notifications about important events like speed violations, geofence entries/exits, device issues, etc.

## Action Configuration

### Required Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `title` | string | Alert title (supports interpolation) | `"Speed Limit Exceeded"` |
| `content` | string | Alert content/description (supports interpolation) | `"Vehicle {vehicle.registration} exceeded speed limit"` |
| `severity` | string | Alert severity level | `"info"`, `"warning"`, `"error"`, `"success"` |

### Optional Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|

| `metadata` | object | Additional metadata (supports interpolation) | `{"location": {"lat": "{event.latitude}"}}` |
| `expires_at` | string | Expiration date (relative or absolute) | `"+1 day"`, `"2024-12-31 23:59:59"` |

## Parameter Interpolation

All string parameters support variable interpolation using curly braces `{}`. Available variables include:

### Event Variables

- `{event.type}` - The workflow event type
- `{event.*}` - Any field from the event data (e.g., `{event.current_speed}`, `{event.latitude}`)
- `{timestamp}` - Current timestamp

### Model Variables

- `{model.id}` - Source model ID
- `{model.type}` - Source model type (e.g., "Vehicle", "Device")

#### Vehicle-Specific Variables

- `{vehicle.name}` - Vehicle name
- `{vehicle.registration}` - Vehicle registration number

### System Variables

- `{tenant.id}` - Tenant ID (or "central" for system-wide events)

## Alert Types

Common alert types include:

- `info` - Informational alerts
- `warning` - Warning alerts
- `error` - Error alerts  
- `success` - Success notifications
- `maintenance` - Maintenance alerts
- `security` - Security alerts
- `system` - System alerts
- `notification` - General notifications

## Severity Levels

Alert severity levels (strictly validated):

- `info` - Low priority information
- `warning` - Medium priority warnings
- `error` - High priority errors
- `success` - Positive confirmations

## Example Configurations

### Speed Limit Violation

```json
{
  "action_type": "create_alert",
  "parameters": {
    "title": "Speed Limit Exceeded",
    "content": "Vehicle {vehicle.registration} exceeded speed limit at {timestamp}. Current speed: {event.current_speed} km/h, Limit: {event.speed_limit} km/h",
    "severity": "warning",
    "metadata": {
      "violation_details": {
        "current_speed": "{event.current_speed}",
        "speed_limit": "{event.speed_limit}", 
        "exceeded_by": "{event.exceeded_by}",
        "location": {
          "latitude": "{event.latitude}",
          "longitude": "{event.longitude}"
        }
      }
    }
  }
}
```

### Geofence Entry Alert

```json
{
  "action_type": "create_alert",
  "parameters": {
    "title": "Vehicle Entered Restricted Zone",
    "content": "Vehicle {vehicle.registration} entered geofence '{event.geofence_name}' at {event.entry_time}",
    "severity": "error",
    "metadata": {
      "geofence_id": "{event.geofence_id}",
      "geofence_name": "{event.geofence_name}",
      "entry_location": {
        "latitude": "{event.latitude}",
        "longitude": "{event.longitude}"
      }
    }
  }
}
```

### Device Offline Alert

```json
{
  "action_type": "create_alert", 
  "parameters": {
    "title": "Device Offline",
    "content": "Device {model.id} has gone offline and is no longer transmitting data",
    "severity": "warning",
    "expires_at": "+7 days"
  }
}
```

### Maintenance Reminder

```json
{
  "action_type": "create_alert",
  "parameters": {
    "title": "Maintenance Due",
    "content": "Vehicle {vehicle.registration} is due for maintenance. Odometer reading: {event.odometer_km} km",
    "severity": "info", 
    "expires_at": "+30 days",
    "metadata": {
      "maintenance_type": "regular_service",
      "odometer_reading": "{event.odometer_km}",
      "next_service_due": "{event.next_service_km}"
    }
  }
}
```

## Usage with Workflow Events

The CREATE_ALERT action works with all workflow event types:

### Vehicle Events

- `VEHICLE_LOCATION_UPDATED` - Track location changes
- `VEHICLE_SPEED_EXCEEDED` - Monitor speeding violations
- `VEHICLE_ENTERED_GEOFENCE` / `VEHICLE_EXITED_GEOFENCE` - Geofence monitoring
- `VEHICLE_IGNITION_ON` / `VEHICLE_IGNITION_OFF` - Ignition monitoring
- `VEHICLE_MOVEMENT_STARTED` / `VEHICLE_MOVEMENT_STOPPED` - Movement tracking

### Driver Events

- `DRIVER_CARD_INSERTED` / `DRIVER_CARD_REMOVED` - Driver identification
- `DRIVER_ACTIVITY_CHANGED` - Driver status changes
- `DRIVER_DRIVING_TIME_EXCEEDED` - Compliance monitoring

### Device Events

- `DEVICE_ONLINE` / `DEVICE_OFFLINE` - Connectivity monitoring
- `DEVICE_MESSAGE_RECEIVED` - Data transmission tracking
- `DEVICE_ERROR` - Error detection

## Alert Management

Created alerts:

1. **Tenant Isolation**: Automatically inherit the tenant from the source model
2. **Entity Association**: Linked to the triggering entity (Vehicle, Driver, Device, etc.)
3. **User Management**: Can be marked as read/unread by users
4. **Expiration**: Optionally expire after a specified time
5. **Metadata**: Store additional structured data for later analysis

## Error Handling

The action validates parameters and returns errors for:

- Missing required parameters (`title`, `content`, `severity`)
- Invalid severity levels (not in: info, warning, error, success)
- Invalid date formats for `expires_at`
- Database constraint violations

## Integration with Alert System

Created alerts automatically appear in:

- Main alerts listing page
- Entity-specific alert sections (on Vehicle, Driver, Device detail pages)  
- Alert count badges and notifications
- Alert filtering and search functionality

All alerts are subject to existing permission checks and tenant isolation rules. 