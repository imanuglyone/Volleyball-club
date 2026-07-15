import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
};

export function Field({ label, error, id, className = '', ...props }: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = error ? `${inputId}-error` : undefined;
  return <label className="field" htmlFor={inputId}>
    <span className="field__label">{label}</span>
    <input id={inputId} className={`field__input ${className}`.trim()} aria-invalid={Boolean(error)} aria-describedby={errorId} {...props}/>
    {error && <span id={errorId} className="field__error">{error}</span>}
  </label>;
}
