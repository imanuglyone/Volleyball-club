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
  phone_verified_at?: string | null;
  photo_url: string | null;
};

export type PublicBooking = {
  id: string;
  name: string;
};

export type TrainingSummary = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  capacity: number;
  location_name?: string | null;
  address?: string | null;
  is_active: boolean;
  active_bookings: number;
  total_bookings: number;
  remaining: number;
};

export type TrainingStats = TrainingSummary & {
  created_at: string;
  public_bookings?: PublicBooking[];
};
