import { fetchClient } from "./fetchClient";

export interface Wallet {
    _id: string;
    userId: string;
    availableBalance: number;
    pendingBalance: number;
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    _id: string;
    userId: string;
    amount: number;
    type: 'online_booking_payment' | 'payout_withdrawal' | 'refund' | 'cancellation_fee' | 'platform_commission';
    referenceId?: string;
    notes?: string;
    createdAt: string;
}

export interface PayoutRequest {
    _id: string;
    userId: string | any;
    amount: number;
    status: 'pending' | 'paid' | 'rejected';
    paymentMethod: 'instapay' | 'vodafone_cash' | 'bank_transfer' | 'other';
    paymentDetails: string;
    adminNotes?: string;
    createdAt: string;
    updatedAt: string;
}

export const walletService = {
    // Wallet
    getMyWallet: async (): Promise<Wallet> => {
        const response = await fetchClient.get("/wallet/my-wallet");
        return response.data;
    },
    getMyTransactions: async (): Promise<Transaction[]> => {
        const response = await fetchClient.get("/wallet/my-transactions");
        return response.data;
    },

    // Payout
    requestPayout: async (data: { amount: number; paymentMethod: string; paymentDetails: string }): Promise<PayoutRequest> => {
        const response = await fetchClient.post("/payout/request", data);
        return response.data;
    },
    getMyPayouts: async (): Promise<PayoutRequest[]> => {
        const response = await fetchClient.get("/payout/my-requests");
        return response.data;
    },

    // Admin
    getAllPayoutRequests: async (): Promise<PayoutRequest[]> => {
        const response = await fetchClient.get("/payout/all");
        return response.data;
    },
    updatePayoutStatus: async (requestId: string, status: 'paid' | 'rejected', adminNotes?: string): Promise<PayoutRequest> => {
        const response = await fetchClient.patch(`/payout/${requestId}/status`, { status, adminNotes });
        return response.data;
    }
};
