# LIOC Web App - Updated API Requirements

Based on the finalized database ERD including Pumps, Stations, Manual Sensors, and Tanks, here are the required API endpoints for the Station Manager functionality.

## 1. Authentication & Users
- **`POST /api/auth/login`**
  - **Body**: `{ username, password }`
  - **Response**: `{ token, user: { userId, userName, role, stationId, regionId } }`
  - **Roles**: `STATION_MANAGER`, `REGIONAL_MANAGER`

## 2. Tanks & Pumps (Station Manager Dashboard)
- **`GET /api/stations/:stationId/tanks`**
  - **Response**: `[{ tankId, fuelType: "Petrol 92", capacity: 10000, currentLevel: 4500, pumps: [{ pumpId, name: "Pump 1" }] }]`
  - **Description**: Gets all tanks for the user's station along with the pumps directly connected to them. Used to plot the visual tank levels.

- **`GET /api/tanks/:tankId/history`**
  - **Query parameters**: `?days=7`
  - **Response**: `[{ measuredTime: "2026-06-01T10:00:00Z", level: 5000, type: "SENSOR" | "MANUAL" }]`
  - **Description**: Historic fuel level data to draw the Recharts analytics graph.

## 3. Measurements Input
- **`POST /api/tanks/:tankId/measurements/manual`**
  - **Body**: `{ measuredTime, measurement (dip stick value), userId }`
  - **Response**: `{ success: true, calculatedVolume }`
  - **Description**: Inserts a manual dip stick measurement as a sensor reading in the `Level` table.

- **`POST /api/pumps/:pumpId/readings`**
  - **Body**: `{ timestamp, readingValue }`
  - **Response**: `{ success: true }`
  - **Description**: Submits the daily/shiftly totalizer value for a specific pump.

## 4. Tank Analysis (For leak/theft detection)
- **`GET /api/tanks/:tankId/reconciliation`**
  - **Query parameters**: `?date=YYYY-MM-DD`
  - **Response**: `{ startingVolume, fuelDropped, sumPumpSales, endingVolumeExpected, endingVolumeActual, variance }`
  - **Description**: Compares tank level drops against pump sales to detect anomalies.

## 5. Replenishment (Fuel Requests)
- **`POST /api/requests/refuel`**
  - **Body**: `{ requestedDate, destinationStationId, typeId (fuel), requestedUserId }`
  - **Description**: Submits a manual replenishment request to the regional distribution manager.

## 6. Regional Manager API
- **`GET /api/regions/:regionId/stations`**
  - **Response**: `[{ stationId, name, address, latitude, longitude, status: "NORMAL" | "LOW" | "CRITICAL" }]`
  - **Description**: Returns all stations in a region for map plotting and status monitoring.

- **`GET /api/regions/:regionId/replenishment-requests`**
  - **Response**: `[{ requestId, stationId, requestedDate, requestedQuantity, fuelType, status }]`
  - **Description**: Fetches pending/historic fuel requests for the region.

- **`POST /api/requests/:requestId/decision`**
  - **Body**: `{ status: "APPROVED" | "REJECTED", decisionUserId, comments }`
  - **Description**: Approves or rejects a fuel replenishment request.
