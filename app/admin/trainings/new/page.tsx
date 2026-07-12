import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createTraining } from '@/app/admin/actions';
import { AdminTrainingForm } from '@/components/AdminTrainingForm';

export const dynamic = 'force-dynamic';

export default function NewTrainingPage() {
  return <div className="admin-form-page">
    <Link href="/admin" className="admin-back"><ArrowLeft size={17}/>К тренировкам</Link>
    <div className="admin-form-heading"><span className="admin-eyebrow">НОВОЕ СОБЫТИЕ</span><h1>Новая тренировка</h1><p>Укажите время, площадку и количество мест.</p></div>
    <AdminTrainingForm action={createTraining} submitLabel="Создать тренировку" />
  </div>;
}
