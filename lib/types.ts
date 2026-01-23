export type Booking = {
  id: string;
  training_id: string;
  name: string;
  phone: string;
  status: 'active' | 'cancelled';
  created_at: string;
};

export type PublicBooking = {
  id: string;
  name: string;
};

export type TrainingStats = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  capacity: number;
  is_active: boolean;
  created_at: string;
  active_bookings: number;
  total_bookings: number;
  remaining: number;
  public_bookings?: PublicBooking[];
};
