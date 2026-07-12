import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { AdminTrainingForm } from '@/components/AdminTrainingForm';
import { updateTraining } from '@/app/admin/actions';

type EditTrainingPageProps = { params: { id: string } };
export const dynamic = 'force-dynamic';

export default async function EditTrainingPage({ params }: EditTrainingPageProps) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from('trainings').select('id, date, start_time, end_time, price, capacity, is_active, location_name, address').eq('id', params.id).single();
  if (!data) return <div className="admin-empty"><h2>Тренировка не найдена</h2></div>;

  return <div className="admin-form-page">
    <Link href="/admin" className="admin-back"><ArrowLeft size={17}/>К тренировкам</Link>
    <div className="admin-form-heading"><span className="admin-eyebrow">НАСТРОЙКИ СОБЫТИЯ</span><h1>Редактирование</h1><p>Изменения сразу появятся на сайте и в Telegram-приложении.</p></div>
    <AdminTrainingForm action={updateTraining.bind(null, params.id)} submitLabel="Сохранить изменения" defaultValues={{ date:data.date, start_time:data.start_time, end_time:data.end_time, price:data.price, capacity:data.capacity, location_name:data.location_name ?? '', address:data.address ?? '', is_active:data.is_active }} />
  </div>;
}
