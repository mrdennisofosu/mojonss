// Title and short description at the top of a page, with optional buttons on the right.
function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-slate-600">{description}</p>}
      </div>
      {actions && (
        <div className="flex flex-col gap-2 sm:flex-row">{actions}</div>
      )}
    </div>
  );
}

export default PageHeader;
