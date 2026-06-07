export interface RefuelRequest {
  requestId: string;
  stationId: string;
  stationName: string;
  requestedDate: string;
  fuelType: string;
  requestedQuantity: number;
  approvedQuantity?: number;
  deliveredQuantity?: number;
  scheduledDeliveryTime?: string;
  deliveryTime?: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'SCHEDULED' | 'DELIVERED' | 'REJECTED';
}

export interface StationLocation {
  stationId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status: 'NORMAL' | 'LOW' | 'CRITICAL';
}