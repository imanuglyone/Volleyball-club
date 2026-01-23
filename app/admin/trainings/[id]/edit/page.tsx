import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { AdminTrainingForm } from '@/components/AdminTrainingForm';
import { updateTraining } from '@/app/admin/actions';

type EditTrainingPageProps = {
  params: { id: string };
};

export default async function EditTrainingPage({ params }: EditTrainingPageProps) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from('trainings').select('*').eq('id', params.id).single();

  if (!data) {
    return <div className="text-steel-200">{'\u0422\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430.'}</div>;
  }

  return (
    <div>
      <h1 className="heading text-2xl font-semibold text-white">{'\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c \u0442\u0440\u0435\u043d\u0438\u0440\u043e\u0432\u043a\u0443'}</h1>
      <div className="mt-6">
        <AdminTrainingForm
          action={updateTraining.bind(null, params.id)}
          submitLabel={'\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c'}
          defaultValues={{
            date: data.date,
            start_time: data.start_time,
            end_time: data.end_time,
            price: data.price,
            capacity: data.capacity,
            is_active: data.is_active
          }}
        />
      </div>
    </div>
  );
}
