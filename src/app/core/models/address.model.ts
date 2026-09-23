export interface Address {
  id: string;
  recipientName: string;
  phoneNumber: string;
  city: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressPayload {
  recipientName: string;
  phoneNumber: string;
  city: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault?: boolean;
}

export type UpdateAddressPayload = Partial<CreateAddressPayload>;
