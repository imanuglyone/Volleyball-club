export function LoadingState() { return <div className="space-y-3" aria-label="Загрузка"><div className="skeleton h-40"/><div className="skeleton h-28"/></div>; }
export function EmptyState({ title, text }: { title: string; text: string }) { return <div className="state-card"><h2>{title}</h2><p>{text}</p></div>; }
export function ErrorState({ retry }: { retry?: () => void }) { return <div className="state-card"><h2>Не удалось загрузить</h2><p>Проверьте соединение и попробуйте ещё раз.</p>{retry && <button className="button-secondary" onClick={retry}>Повторить</button>}</div>; }
