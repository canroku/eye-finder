interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`glass-card p-5 ${className}`}>
      {title && (
        <h3 className="mb-4 text-base font-semibold text-white">{title}</h3>
      )}
      {children}
    </div>
  );
}
