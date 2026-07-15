import { AlertTriangle, Radio, Volleyball } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LoadingState() { return <div className="state-loading" aria-label="Загрузка" aria-busy="true"><div className="skeleton skeleton--hero"/><div className="skeleton skeleton--line"/><div className="skeleton skeleton--line skeleton--short"/></div>; }
export function EmptyState({ title, text }: { title: string; text: string }) { return <div className="state-card"><span className="state-card__icon"><Volleyball size={24}/></span><h2>{title}</h2><p>{text}</p></div>; }
export function ErrorState({ retry }: { retry?: () => void }) { return <div className="state-card state-card--error"><span className="state-card__icon"><AlertTriangle size={24}/></span><h2>Не удалось загрузить</h2><p>Проверьте соединение и попробуйте ещё раз.</p>{retry && <Button variant="secondary" onClick={retry}><Radio size={17}/>Повторить</Button>}</div>; }
