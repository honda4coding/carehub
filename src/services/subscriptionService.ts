import { fetchClient } from "./fetchClient";

export interface SubscriptionFeature {
    code: string;
    name: string;
    enabled: boolean;
}

export interface SubscriptionLimit {
    code: string;
    value: number;
}

export interface SubscriptionPlan {
    _id: string;
    name: string;
    price: number;
    durationInDays: number;
    isActive: boolean;
    features: SubscriptionFeature[];
    limits: SubscriptionLimit[];
}

export interface DoctorSubscription {
    _id: string;
    doctorId: string;
    subscriptionId: SubscriptionPlan;
    startDate: string;
    endDate: string | null;
    status: "active" | "expired" | "cancelled";
}

export const subscriptionService = {
    /** GET /subscriptions */
    getPlans: async (): Promise<SubscriptionPlan[]> => {
        const res = await fetchClient.get("/subscriptions");
        return res.data?.plans || res.data || [];
    },

    /** GET /doctorsubscriptions/my-subscription */
    getMySubscription: async (): Promise<DoctorSubscription | null> => {
        try {
            const res = await fetchClient.get("/doctorsubscriptions/my-subscription");
            return res.data?.subscription || res.data;
        } catch (error: any) {
            if (error.status === 404 || error.message?.includes("No active subscription")) return null;
            throw error;
        }
    },

    /** POST /payments/checkout */
    checkoutSubscription: async (planId: string): Promise<{ paymentUrl: string }> => {
        const res = await fetchClient.post("/payments/checkout", {
            purpose: "subscription",
            referenceId: planId,
            paymentMethod: "card"
        });
        return { paymentUrl: res.data?.paymentUrl };
    },

    /** POST /appointmens/:id/schedule-followup */
    scheduleFollowUp: async (appointmentId: string, payload: { followUpScheduledDate: string, graceWindowHours?: number }): Promise<void> => {
        await fetchClient.post(`/appointmens/${appointmentId}/schedule-followup`, payload);
    },

    /** PATCH /appointmens/:id/override-followup */
    overrideFollowUp: async (appointmentId: string): Promise<void> => {
        await fetchClient.patch(`/appointmens/${appointmentId}/override-followup`, {});
    }
};
