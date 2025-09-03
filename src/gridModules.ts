import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import {
  RowGroupingModule,
  PivotModule,
  SetFilterModule,
  FiltersToolPanelModule,
  ColumnsToolPanelModule,
  MenuModule,
  StatusBarModule,
  ExcelExportModule,
  ClipboardModule,
  IntegratedChartsModule, 
  LicenseManager,
} from "ag-grid-enterprise";
import { AgChartsEnterpriseModule } from "ag-charts-enterprise";

LicenseManager.setLicenseKey(import.meta.env.VITE_AG_GRID_LICENSE_KEY);

ModuleRegistry.registerModules([
  AllCommunityModule,
  ClipboardModule,
  RowGroupingModule,
  PivotModule,
  SetFilterModule,
  FiltersToolPanelModule,
  ColumnsToolPanelModule,
  MenuModule,
  StatusBarModule,
  ExcelExportModule,
  IntegratedChartsModule.with(AgChartsEnterpriseModule),
]);
