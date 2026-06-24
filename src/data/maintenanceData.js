import { turbineFleetData } from "./mockData";

export const maintenanceWorkOrdersSeed = [
  {
    id: "WO-24031",
    turbineId: "WT-003",
    component: "Gearbox",
    maintenanceType: "Predictive Inspection",
    assignedEngineer: "Arun Patel",
    priority: "High",
    startDate: "2026-03-12",
    status: "Scheduled",
  },
  {
    id: "WO-24032",
    turbineId: "WT-012",
    component: "Hydraulic System",
    maintenanceType: "Corrective Maintenance",
    assignedEngineer: "Maya Singh",
    priority: "Critical",
    startDate: "2026-03-11",
    status: "In Progress",
  },
  {
    id: "WO-24033",
    turbineId: "WT-022",
    component: "Power Converter",
    maintenanceType: "Parts Replacement",
    assignedEngineer: "Ravi Kumar",
    priority: "Critical",
    startDate: "2026-03-13",
    status: "Waiting for Parts",
  },
  {
    id: "WO-24034",
    turbineId: "WT-007",
    component: "Generator",
    maintenanceType: "Condition Monitoring",
    assignedEngineer: "Sana Ali",
    priority: "Medium",
    startDate: "2026-03-14",
    status: "Scheduled",
  },
  {
    id: "WO-24035",
    turbineId: "WT-015",
    component: "Control System",
    maintenanceType: "Firmware + Diagnostics",
    assignedEngineer: "Karan Das",
    priority: "High",
    startDate: "2026-03-12",
    status: "In Progress",
  },
  {
    id: "WO-24036",
    turbineId: "WT-019",
    component: "Tower",
    maintenanceType: "Vibration Inspection",
    assignedEngineer: "Anita Roy",
    priority: "High",
    startDate: "2026-03-15",
    status: "Scheduled",
  },
  {
    id: "WO-24037",
    turbineId: "WT-004",
    component: "Pitch System",
    maintenanceType: "Actuator Calibration",
    assignedEngineer: "Arun Patel",
    priority: "Medium",
    startDate: "2026-03-09",
    status: "Completed",
  },
  {
    id: "WO-24038",
    turbineId: "WT-009",
    component: "Yaw System",
    maintenanceType: "Alignment Service",
    assignedEngineer: "Maya Singh",
    priority: "Medium",
    startDate: "2026-03-10",
    status: "Completed",
  },
];

export const sparePartsInventorySeed = [
  {
    partName: "Gearbox Seals",
    stockLevel: 32,
    usageRatePerWeek: 4,
    reorderPoint: 12,
  },
  {
    partName: "Main Bearings",
    stockLevel: 9,
    usageRatePerWeek: 3,
    reorderPoint: 10,
  },
  {
    partName: "Lubrication Pumps",
    stockLevel: 14,
    usageRatePerWeek: 1,
    reorderPoint: 6,
  },
  {
    partName: "Temperature Sensors",
    stockLevel: 18,
    usageRatePerWeek: 5,
    reorderPoint: 15,
  },
  {
    partName: "Pitch Actuator Kits",
    stockLevel: 5,
    usageRatePerWeek: 2,
    reorderPoint: 6,
  },
  {
    partName: "Hydraulic Hoses",
    stockLevel: 11,
    usageRatePerWeek: 2,
    reorderPoint: 8,
  },
];

export const maintenanceScheduleSeed = [
  {
    id: "SCH-1101",
    date: "2026-03-11",
    turbineId: "WT-012",
    activity: "Hydraulic pressure validation",
    technician: "Maya Singh",
  },
  {
    id: "SCH-1102",
    date: "2026-03-12",
    turbineId: "WT-003",
    activity: "Gearbox borescope inspection",
    technician: "Arun Patel",
  },
  {
    id: "SCH-1103",
    date: "2026-03-12",
    turbineId: "WT-015",
    activity: "SCADA communication diagnostics",
    technician: "Karan Das",
  },
  {
    id: "SCH-1104",
    date: "2026-03-13",
    turbineId: "WT-022",
    activity: "Converter module replacement prep",
    technician: "Ravi Kumar",
  },
  {
    id: "SCH-1105",
    date: "2026-03-14",
    turbineId: "WT-007",
    activity: "Generator vibration balancing",
    technician: "Sana Ali",
  },
  {
    id: "SCH-1106",
    date: "2026-03-15",
    turbineId: "WT-019",
    activity: "Tower structural vibration audit",
    technician: "Anita Roy",
  },
  {
    id: "SCH-1107",
    date: "2026-03-16",
    turbineId: "WT-017",
    activity: "Rotor blade ice sensor calibration",
    technician: "Ravi Kumar",
  },
  {
    id: "SCH-1108",
    date: "2026-03-17",
    turbineId: "WT-014",
    activity: "Bearing thermal trend inspection",
    technician: "Sana Ali",
  },
];

export const technicianSeed = [
  { name: "Arun Patel", availability: "Available" },
  { name: "Maya Singh", availability: "Partially Available" },
  { name: "Ravi Kumar", availability: "Busy" },
  { name: "Sana Ali", availability: "Available" },
  { name: "Karan Das", availability: "Busy" },
  { name: "Anita Roy", availability: "Available" },
];

export function getTurbineBaseContext() {
  return turbineFleetData.map((t) => ({
    id: t.id,
    health: t.health,
    operatingHours: t.operatingHours,
    vibration: t.vibration,
    gearboxTemp: t.gearboxTemp,
    generatorTemp: t.generatorTemp,
    availability: t.availability,
  }));
}
