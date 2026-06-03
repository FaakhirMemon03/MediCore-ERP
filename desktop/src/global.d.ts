export interface ElectronAPI {
  checkLicense: (storeId: string) => Promise<{
    isValid: boolean;
    daysRemaining: number;
    gracePeriodActive: boolean;
    plan: string;
    expiryDate: string;
    status: string;
  }>;
  login: (username: string, password: string) => Promise<any>;
  changePassword: (newPassword: string, tempToken: string) => Promise<any>;
  setConfig: (key: string, value: string) => Promise<boolean>;
  getConfig: (key: string) => Promise<string | null>;
  openDevTools: () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
