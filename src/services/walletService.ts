import { fetchClient } from "./fetchClient";

export interface Wallet {
    _id: string;
    userId: string;
    availableBalance: number;
    pendingBalance: number;
    grossRevenue?: number;
    feesPaid?: number;
    netBalance?: number;
    myCurrentCommissionRate?: number;
    myCurrentPlanName?: string;
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
    receiptPhoto?: {
        secure_url: string;
        public_id: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface PayoutProfile {
    isSetup: boolean;
    hasPendingRequest?: boolean;
    lastRejectedReason?: string | null;
    paymentMethod?: 'instapay' | 'vodafone_cash' | 'bank_transfer' | 'other';
    accountDetails?: string;
    idPhoto?: {
        secure_url: string;
        public_id: string;
    };
    isSuspended?: boolean;
    suspendReason?: string;
}

export interface PayoutChangeRequest {
    _id: string;
    userId: string | any;
    newPaymentMethod: 'instapay' | 'vodafone_cash' | 'bank_transfer' | 'other';
    newAccountDetails: string;
    idPhotoUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    adminNotes?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedTransactions {
    transactions: Transaction[];
    pagination: PaginationMeta;
}

export interface PaginatedPayouts {
    payouts: PayoutRequest[];
    pagination: PaginationMeta;
}

export interface PaginatedAdminPayouts {
    data: PayoutRequest[];
    pagination: PaginationMeta;
}

export interface PaginatedAdminChangeRequests {
    data: PayoutChangeRequest[];
    pagination: PaginationMeta;
}

export const walletService = {
    // Wallet
    getMyWallet: async (): Promise<Wallet> => {
        const response = await fetchClient.get("/wallet/my-wallet");
        return response.data;
    },
    getMyTransactions: async (page = 1, limit = 10): Promise<PaginatedTransactions> => {
        const response = await fetchClient.get(`/wallet/my-transactions?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Payout Profile
    getMyPayoutProfile: async (): Promise<PayoutProfile> => {
        const response = await fetchClient.get("/payout/profile");
        return response.data;
    },
    setupPayoutProfile: async (formData: FormData): Promise<PayoutProfile> => {
        const response = await fetchClient.post("/payout/profile/setup", formData);
        return response.data;
    },
    requestPayoutChange: async (formData: FormData): Promise<PayoutChangeRequest> => {
        const response = await fetchClient.post("/payout/request-change", formData);
        return response.data;
    },
    getMyPayoutMethods: async (): Promise<any[]> => {
        const response = await fetchClient.get("/payout/my-methods");
        return response.data;
    },

    // Payout
    requestPayout: async (data: { amount: number, selectedMethodId?: string }): Promise<PayoutRequest> => {
        const response = await fetchClient.post("/payout/request", data);
        return response.data;
    },
    getMyPayouts: async (page = 1, limit = 10): Promise<PaginatedPayouts> => {
        const response = await fetchClient.get(`/payout/my-requests?page=${page}&limit=${limit}`);
        return response.data;
    },

    // Admin Payouts
    getAllPayoutRequests: async (page = 1, limit = 10, search = "", status = ""): Promise<PaginatedAdminPayouts> => {
        let url = `/payout/all?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (status && status !== 'all') url += `&status=${status}`;
        const response = await fetchClient.get(url);
        return response.data;
    },
    updatePayoutStatus: async (formData: FormData, requestId: string): Promise<PayoutRequest> => {
        const response = await fetchClient.patch(`/payout/${requestId}/status`, formData);
        return response.data;
    },

    // Admin Change Requests
    getAllChangeRequests: async (page = 1, limit = 10, search = "", status = ""): Promise<PaginatedAdminChangeRequests> => {
        let url = `/payout/admin/change-requests?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (status && status !== 'all') url += `&status=${status}`;
        const response = await fetchClient.get(url);
        return response.data;
    },
    updateChangeRequestStatus: async (requestId: string, status: 'approved' | 'rejected', adminNotes?: string): Promise<PayoutChangeRequest> => {
        const response = await fetchClient.patch(`/payout/admin/change-requests/${requestId}/status`, { status, adminNotes });
        return response.data;
    },
    suspendPayoutProfile: async (userId: string, isSuspended: boolean, suspendReason?: string) => {
        const response = await fetchClient.patch(`/payout/admin/suspend-wallet`, { userId, isSuspended, suspendReason });
        return response.data;
    },

    // Finance Dashboard
    getWalletStats: async (): Promise<any> => {
        const response = await fetchClient.get("/wallet/admin/stats");
        return response.data;
    },
    manualWalletAdjust: async (data: { targetUserId: string, amount: number, reason: string, balanceType: string }): Promise<any> => {
        const response = await fetchClient.post("/wallet/admin/adjust", data);
        return response.data;
    },
    getUserWalletBalances: async (userId: string): Promise<{ availableBalance: number, pendingBalance: number }> => {
        const response = await fetchClient.get(`/wallet/admin/user-wallet/${userId}`);
        return response.data;
    }
};
