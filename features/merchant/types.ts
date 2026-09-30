export type MerchantStatus = "PENDING" | "APPROVED" | "REJECTED";

export type MerchantInfoData = {
  id: number;
  userId: string;
  storeName: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  status: MerchantStatus;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt: Date | null;
};

export type MerchantApplicationInput = {
  storeName: string;
  description: string | null;
  phone: string | null;
  address: string | null;
};

export type MerchantApplicationRow = MerchantInfoData & {
  userName: string | null;
  userEmail: string | null;
};

export type MerchantQueryParams = {
  status?: MerchantStatus | "ALL";
  search?: string;
};
