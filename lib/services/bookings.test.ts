import { describe, expect, it, vi } from 'vitest';
import { cancelProfileBooking, createProfileBooking, listProfileBookings } from './bookings';

describe('profile booking isolation', () => {
  it('passes profile ownership into duplicate/capacity protected RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: [], error: null });
    await createProfileBooking({ rpc } as never, { trainingId: 'training', profileId: 'profile', name: 'Ира', phone: '+7900' });
    expect(rpc).toHaveBeenCalledWith('create_profile_booking', expect.objectContaining({ p_profile_id: 'profile' }));
  });
  it('filters list to the current profile and cancels one booking only', () => {
    const order = vi.fn(); const eq = vi.fn(() => ({ order })); const select = vi.fn(() => ({ eq })); const from = vi.fn(() => ({ select }));
    listProfileBookings({ from } as never, 'current-profile');
    expect(eq).toHaveBeenCalledWith('profile_id', 'current-profile');
    const rpc = vi.fn(); cancelProfileBooking({ rpc } as never, 'one-booking', 'current-profile');
    expect(rpc).toHaveBeenCalledWith('cancel_profile_booking', { p_booking_id: 'one-booking', p_profile_id: 'current-profile' });
  });
});
