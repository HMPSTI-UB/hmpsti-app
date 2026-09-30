export type PaymentAccountType = "bank" | "e_wallet" | "qris";

export type PaymentAccount = {
  id: number;
  userId: string;
  type: PaymentAccountType;
  bankName: string;
  accountNumber: string | null;
  accountOwner: string;
  qrisImgUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type PaymentAccountInput = {
  type: PaymentAccountType;
  bankName: string;
  accountNumber: string | null;
  accountOwner: string;
  qrisImgUrl: string | null;
  isActive?: boolean;
};

export type PaymentOption = {
  id: number;
  type: PaymentAccountType;
  bankName: string;
  accountNumber: string | null;
  accountOwner: string;
  qrisImgUrl: string | null;
  sellerLabel: string;
};

export type AdminPaymentAccountRow = PaymentAccount & {
  ownerName: string | null;
  ownerEmail: string | null;
  storeName: string | null;
};
