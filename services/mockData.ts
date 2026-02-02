
import { Driver, InventoryItem, InventoryType, Complaint, StopPlan, DriverStatus } from '../types';

// Fix: Added missing 'status' property to initial drivers to match the Driver interface
export const initialDrivers: Driver[] = [
  { id: '1', firstName: 'John', lastName: 'Doe', glsNumber: 'GLS-001', phone: '+49 123 456789', plate: 'B-XY-1234', isBeginner: false, status: DriverStatus.AVAILABLE, createdAt: new Date().toISOString() },
  { id: '2', firstName: 'Jane', lastName: 'Smith', glsNumber: 'GLS-002', phone: '+49 987 654321', plate: 'B-ZZ-5678', isBeginner: false, status: DriverStatus.AVAILABLE, createdAt: new Date().toISOString() },
];

export const initialInventory: InventoryItem[] = [
  { id: 'i1', type: InventoryType.CLOTHING, name: 'Warnschutzjacke', size: 'L', quantity: 50, history: [] },
  { id: 'i2', type: InventoryType.CLOTHING, name: 'Sicherheitsschuhe S3', size: '42', quantity: 20, history: [] },
  { id: 'i3', type: InventoryType.VEHICLE, name: 'Mercedes Sprinter', brand: 'Mercedes', plate: 'B-XY-1234', quantity: 1, history: [] },
  { id: 'i4', type: InventoryType.OTHER, name: 'AdBlue 10L', quantity: 15, isConsumable: true, history: [] },
  { id: 'i5', type: InventoryType.OTHER, name: 'Transportkarre (Sackkarre)', quantity: 8, isConsumable: false, history: [] },
];

export const initialComplaints: Complaint[] = [
  { id: 'c1', tourNumber: 'T-100', driverId: '1', packageNumber: 'PKG-77221', address: 'Alexanderplatz 1', postalCode: '10178', resolved: false },
  { id: 'c2', tourNumber: 'T-101', driverId: '2', packageNumber: 'PKG-99002', address: 'Friedrichstraße 20', postalCode: '10117', resolved: true, resolvedAt: new Date().toISOString() },
];

export const initialStops: StopPlan[] = [];
