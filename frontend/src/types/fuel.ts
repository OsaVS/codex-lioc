export interface Pump {
  pumpId: string;
  name: string;
}

export interface Tank {
  tankId: string;
  stationId: string;
  fuelType: string;
  capacity: number; // cross sectional area * height
  currentLevel: number;
  isActive: boolean;
  pumps: Pump[];
}

export interface TankHistory {
  measuredTime: string;
  level: number;
}
