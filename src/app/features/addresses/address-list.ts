import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Address, CreateAddressPayload } from '../../core/models/address.model';
import { AddressesService } from './addresses.service';

const EMPTY_FORM: CreateAddressPayload = {
  recipientName: '',
  phoneNumber: '',
  city: '',
  district: '',
  ward: '',
  streetAddress: '',
  isDefault: false,
};

@Component({
  selector: 'app-address-list',
  imports: [FormsModule],
  templateUrl: './address-list.html',
})
export class AddressList {
  private readonly addressesService = inject(AddressesService);

  readonly addresses = signal<Address[]>([]);
  readonly loading = signal(true);
  readonly editingId = signal<string | null>(null);
  readonly form = signal<CreateAddressPayload>({ ...EMPTY_FORM });
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.addresses.set(await this.addressesService.findAll());
    } finally {
      this.loading.set(false);
    }
  }

  startCreate(): void {
    this.form.set({ ...EMPTY_FORM });
    this.error.set(null);
    this.editingId.set('new');
  }

  startEdit(address: Address): void {
    this.form.set({
      recipientName: address.recipientName,
      phoneNumber: address.phoneNumber,
      city: address.city,
      district: address.district,
      ward: address.ward,
      streetAddress: address.streetAddress,
      isDefault: address.isDefault,
    });
    this.error.set(null);
    this.editingId.set(address.id);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  updateForm<K extends keyof CreateAddressPayload>(key: K, value: CreateAddressPayload[K]): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.error.set(null);
    try {
      const id = this.editingId();
      if (id && id !== 'new') {
        await this.addressesService.update(id, this.form());
      } else {
        await this.addressesService.create(this.form());
      }
      this.editingId.set(null);
      await this.load();
    } catch {
      this.error.set('Không thể lưu địa chỉ. Vui lòng kiểm tra lại thông tin.');
    } finally {
      this.saving.set(false);
    }
  }

  async remove(id: string): Promise<void> {
    if (!confirm('Xoá địa chỉ này?')) return;
    await this.addressesService.remove(id);
    await this.load();
  }

  async setDefault(id: string): Promise<void> {
    await this.addressesService.setDefault(id);
    await this.load();
  }

  addressLine(address: Address): string {
    return [address.streetAddress, address.ward, address.district, address.city].join(', ');
  }
}
