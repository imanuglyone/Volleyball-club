import type { TrainingStats } from '@/lib/types';

type TrainingFormProps = {
  action: (formData: FormData) => void;
  submitLabel: string;
  defaultValues?: Partial<TrainingStats>;
};

export function AdminTrainingForm({ action, submitLabel, defaultValues }: TrainingFormProps) {
  return (
    <form action={action} className="card space-y-4 p-6">
      <label className="block">
        <div className="label">{'\u0414\u0430\u0442\u0430'}</div>
        <input
          className="input"
          type="date"
          name="date"
          defaultValue={defaultValues?.date ?? ''}
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <div className="label">{'\u0412\u0440\u0435\u043c\u044f \u043d\u0430\u0447\u0430\u043b\u0430'}</div>
          <input
            className="input"
            type="time"
            name="start_time"
            defaultValue={defaultValues?.start_time?.slice(0, 5) ?? ''}
            required
          />
        </label>
        <label className="block">
          <div className="label">{'\u0412\u0440\u0435\u043c\u044f \u043e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u044f'}</div>
          <input
            className="input"
            type="time"
            name="end_time"
            defaultValue={defaultValues?.end_time?.slice(0, 5) ?? ''}
            required
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <div className="label">{'\u0426\u0435\u043d\u0430'}</div>
          <input
            className="input"
            type="number"
            name="price"
            min="0"
            defaultValue={defaultValues?.price ?? 0}
            required
          />
        </label>
        <label className="block">
          <div className="label">{'\u041b\u0438\u043c\u0438\u0442 \u043c\u0435\u0441\u0442'}</div>
          <input
            className="input"
            type="number"
            name="capacity"
            min="1"
            defaultValue={defaultValues?.capacity ?? 12}
            required
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <div className="label">{'\u0417\u0430\u043b (\u043d\u0430\u0437\u0432\u0430\u043d\u0438\u0435)'}</div>
          <input
            className="input"
            name="location_name"
            defaultValue={defaultValues?.location_name ?? ''}
            placeholder={'\u0411\u043e\u043b\u044c\u0448\u043e\u0439 \u0437\u0430\u043b'}
          />
        </label>
        <label className="block">
          <div className="label">{'\u0410\u0434\u0440\u0435\u0441'}</div>
          <input
            className="input"
            name="address"
            defaultValue={defaultValues?.address ?? ''}
            placeholder={'\u0423\u043b. \u041f\u0440\u0438\u043c\u0435\u0440\u043d\u0430\u044f, 12'}
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={defaultValues?.is_active ?? true}
          className="h-4 w-4"
        />
        {'\u0410\u043a\u0442\u0438\u0432\u043d\u0430 \u0434\u043b\u044f \u043f\u0443\u0431\u043b\u0438\u0447\u043d\u043e\u0439 \u0437\u0430\u043f\u0438\u0441\u0438'}
      </label>

      <button type="submit" className="btn-primary">
        {submitLabel}
      </button>
    </form>
  );
}
