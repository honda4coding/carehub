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

export type PublicAppConfig = Pick<AppConfig, 
    'patientCancellationRefundPercentage' | 
    'patientCancellationDoctorCompensationPercentage' | 
    'patientCancellationPlatformFeePercentage'
>;

export const appConfigService = {
    getPublicConfig: async (): Promise<PublicAppConfig> => {
        const response = await fetchClient.get("/appconfig/public");
        return response.data;
    },
    getConfig: async (): Promise<AppConfig> => {
        const response = await fetchClient.get("/appconfig");
        return response.data;
    },
    updateConfig: async (data: Partial<AppConfig>): Promise<AppConfig> => {
        const response = await fetchClient.patch("/appconfig", data);
        return response.data;
    }
};
