import type { TrainingStats } from '@/lib/types';
import { AdminSubmitButton } from '@/components/admin/AdminSubmitButton';
import { getSurfaceFeatureFlags } from '@/lib/feature-flags';

type TrainingFormProps = {
  action: (formData: FormData) => void;
  submitLabel: string;
  defaultValues?: Partial<TrainingStats>;
};

export function AdminTrainingForm({ action, submitLabel, defaultValues }: TrainingFormProps) {
  const { adminV2 } = getSurfaceFeatureFlags();
  if (!adminV2) return (
    <form action={action} className="admin-training-form admin-training-form--compat">
      <label className="block"><div className="label">Дата</div><input className="input" type="date" name="date" defaultValue={defaultValues?.date ?? ''} required/></label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><div className="label">Время начала</div><input className="input" type="time" name="start_time" defaultValue={defaultValues?.start_time?.slice(0, 5) ?? ''} required/></label>
        <label className="block"><div className="label">Время окончания</div><input className="input" type="time" name="end_time" defaultValue={defaultValues?.end_time?.slice(0, 5) ?? ''} required/></label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><div className="label">Цена</div><input className="input" type="number" name="price" min="0" defaultValue={defaultValues?.price ?? 0} required/></label>
        <label className="block"><div className="label">Лимит мест</div><input className="input" type="number" name="capacity" min="1" defaultValue={defaultValues?.capacity ?? 12} required/></label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><div className="label">Зал</div><input className="input" name="location_name" defaultValue={defaultValues?.location_name ?? ''}/></label>
        <label className="block"><div className="label">Адрес</div><input className="input" name="address" defaultValue={defaultValues?.address ?? ''}/></label>
      </div>
      <label className="admin-switch"><input type="checkbox" name="is_active" defaultChecked={defaultValues?.is_active ?? true}/><span><strong>Активна для публичной записи</strong></span></label>
      <AdminSubmitButton label={submitLabel}/>
    </form>
  );
  return (
    <form action={action} className="admin-training-form">
      <div className="admin-form-section-title"><span>01</span><strong>Дата и время</strong></div>
      <label className="block">
        <div className="label">Дата</div>
        <input className="input" type="date" name="date" defaultValue={defaultValues?.date ?? ''} required/>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><div className="label">Время начала</div><input className="input" type="time" name="start_time" defaultValue={defaultValues?.start_time?.slice(0, 5) ?? ''} required/></label>
        <label className="block"><div className="label">Время окончания</div><input className="input" type="time" name="end_time" defaultValue={defaultValues?.end_time?.slice(0, 5) ?? ''} required/></label>
      </div>

      <div className="admin-form-section-title"><span>02</span><strong>Условия</strong></div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><div className="label">Цена, ₽</div><input className="input" type="number" name="price" min="0" defaultValue={defaultValues?.price ?? 0} required/></label>
        <label className="block"><div className="label">Лимит мест</div><input className="input" type="number" name="capacity" min="1" defaultValue={defaultValues?.capacity ?? 12} required/></label>
      </div>

      <div className="admin-form-section-title"><span>03</span><strong>Площадка</strong></div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block"><div className="label">Зал</div><input className="input" name="location_name" defaultValue={defaultValues?.location_name ?? ''} placeholder="Большой зал"/></label>
        <label className="block"><div className="label">Адрес</div><input className="input" name="address" defaultValue={defaultValues?.address ?? ''} placeholder="Улица и номер дома"/></label>
      </div>

      <label className="admin-switch">
        <input type="checkbox" name="is_active" defaultChecked={defaultValues?.is_active ?? true}/>
        <span><strong>Открыть запись</strong><small>Тренировка появится на сайте и в приложении</small></span>
      </label>

      <div className="admin-form-actions">
        <span>Проверьте дату, время и вместимость</span>
        <AdminSubmitButton label={submitLabel}/>
      </div>
    </form>
  );
}
