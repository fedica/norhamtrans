
export enum InventoryType {
  CLOTHING = 'Clothing',
  VEHICLE = 'Vehicle',
  OTHER = 'Other'
}

export enum VehicleStatus {
  ACTIVE = 'Active',
  ALLOCATED = 'Allocated',
  SERVICE = 'Service'
}

export enum DriverStatus {
  AVAILABLE = 'Available',
  FEHLT = 'Fehlt',
  URLAUB = 'Urlaub',
  SICK = 'Sick'
}

export enum TourStatus {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export enum TourType {
  FEST = 'Fest Tour',
  SPRINGER = 'Springer'
}

export interface InventoryAssignment {
  id: string;
  driverId: string;
  itemId: string;
  quantity: number;
  date: string;
  signature: string;
  returnedAt?: string;
  driverPlateAtTime?: string; 
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  glsNumber: string;
  phone: string;
  plate: string;
  isBeginner: boolean;
  status: DriverStatus;
  createdAt: string;
  vacationStart?: string;
  vacationEnd?: string;
  sickStart?: string;
  sickEnd?: string;
}

export interface InventoryItem {
  id: string;
  type: InventoryType;
  name: string;
  size?: string;
  quantity: number;
  isConsumable?: boolean;
  brand?: string;
  plate?: string;
  assignedTo?: string;
  signature?: string;
  assignmentDate?: string;
  vehicleStatus?: VehicleStatus;
  serviceLocation?: string;
  huExpiration?: string;
  history?: InventoryAssignment[];
}

export interface StopPlan {
  id: string;
  date: string;
  addresses: string;
  packages: number;
  stops: number;
}

export interface Tour {
  id: string;
  tourNumber: string;
  city: string;
  driverId: string;
  beginnerDriverId?: string;
  vehiclePlate: string;
  date: string;
  status: TourStatus;
  tourType: TourType;
  progress: number;
  totalPackages: number;
  totalStops: number;
}

export interface Complaint {
  id: string;
  tourNumber: string;
  driverId: string;
  packageNumber: string;
  address: string;
  postalCode: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface ControlChecklist {
  id: string;
  driverId: string;
  date: string;
  safetyNet: boolean;
  fireExtinguisher: boolean;
  safeShoes: boolean;
  cleanliness: boolean;
  signature?: string;
}
