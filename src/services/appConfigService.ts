import { fetchClient } from "./fetchClient";

export interface AppConfig {
    _id: string;
    isGlobalConfig: boolean;
    platformFeeFixed: number;
    platformFeePercentage: number;
    patientCancellationRefundPercentage: number;
    patientCancellationDoctorCompensationPercentage: number;
    patientCancellationPlatformFeePercentage: number;
    commissionRates: Record<string, number>;
}

export const appConfigService = {
    getConfig: async (): Promise<AppConfig> => {
        const response = await fetchClient.get("/appconfig");
        return response.data;
    },
    updateConfig: async (data: Partial<AppConfig>): Promise<AppConfig> => {
        const response = await fetchClient.patch("/appconfig", data);
        return response.data;
    }
};
