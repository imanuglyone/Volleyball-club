export type PublicTrainingView = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  price: number;
  capacity: number;
  location_name?: string | null;
  address?: string | null;
  remaining: number;
  is_active?: boolean;
  active_bookings?: number;
};
