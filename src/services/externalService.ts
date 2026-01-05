import { apiClient } from "@/lib/api";

export interface ProcessResponse {
    success: boolean;
    processed: {
        UAN: string;
        MemberName: string;
        GrossWages: number;
        EPFWages: number;
        EPSWages: number;
        EDLIWages: number;
        EPFContributionRemitted: number;
        EPSContributionRemitted: number;
        EPFAndEPSDiffRemitted: number;
        NCPDays: number;
        RefundOfAdvances: number;
    }[];
    missing: any[];
    txtData: string;
}

export const externalService = {
    processPayment: async (eventName: string, sheetId: string): Promise<ProcessResponse> => {
        return await apiClient.post<ProcessResponse>('/external/process', {
            eventName,
            sheetId
        });
    }
};
