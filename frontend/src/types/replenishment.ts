export interface RefuelRequest {
  requestId: string;
  stationId: string;
  stationName: string;
  requestedDate: string;
  fuelType: string;
  requestedQuantity: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED';
}

export interface StationLocation {
  stationId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: 'NORMAL' | 'LOW' | 'CRITICAL';
}