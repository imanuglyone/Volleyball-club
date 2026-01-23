import { createTraining } from '@/app/admin/actions';
import { AdminTrainingForm } from '@/components/AdminTrainingForm';

export const dynamic = 'force-dynamic';

export default function NewTrainingPage() {
  return (
    <div>
      <h1 className="heading text-2xl font-semibold text-white">{'\u041d\u043e\u0432\u0430\u044f \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0430'}</h1>
      <div className="mt-6">
        <AdminTrainingForm action={createTraining} submitLabel={'\u0421\u043e\u0437\u0434\u0430\u0442\u044c'} />
      </div>
    </div>
  );
}
