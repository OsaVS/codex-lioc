export interface Pump {
  pumpId: string;
  name: string;
}

export interface Tank {
  tankId: string;
  stationId: string;
  fuelType: string;
  capacity: number;
  currentLevel: number;
  isActive: boolean;
  pumps: Pump[];
}

export interface TankHistory {
  measuredTime: string;
  level: number;
}

export interface ManualDipstickEntry {
  tankId: string;
  measuredTime: string;
  dipstickValue: number; // in mm
  calculatedVolume: number; // in Liters
  operator: string;
}
