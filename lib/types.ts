export type Booking = {
  id: string;
  training_id: string;
  name: string;
  phone: string;
  status: 'active' | 'cancelled';
  created_at: string;
  profile_id?: string | null;
};

export type Profile = {
  id: string;
  telegram_user_id: number;
  telegram_username: string | null;
  first_name: string;
  last_name: string | null;
  display_name: string;
  phone: string | null;
  photo_url: string | null;
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
  location_name?: string | null;
  address?: string | null;
  is_active: boolean;
  created_at: string;
  active_bookings: number;
  total_bookings: number;
  remaining: number;
  public_bookings?: PublicBooking[];
};
