// One list, two looks:
//   tablets and larger -> a real table
//   phones             -> a stack of cards (tables are hard to use on a phone)
//
// columns: [{ key, header, render?(row), isActions? }]
//   The first normal column becomes the card title on phones.
//   A column with isActions: true holds buttons (shown at the bottom of each card).
function DataTable({ columns, rows, rowKey }) {
  const dataColumns = columns.filter((column) => !column.isActions);
  const actionColumns = columns.filter((column) => column.isActions);
  const [titleColumn, ...otherColumns] = dataColumns;

  const cell = (column, row) =>
    column.render ? column.render(row) : row[column.key];

  return (
    <div>
      {/* Table: tablets and larger */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={`px-4 py-3 ${column.isActions ? "text-right" : ""}`}
                >
                  {column.isActions ? (
                    <span className="sr-only">{column.header}</span>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={rowKey(row)} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 align-middle ${column.isActions ? "text-right" : ""}`}
                  >
                    {cell(column, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards: phones */}
      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li
            key={rowKey(row)}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="text-slate-900">{cell(titleColumn, row)}</div>

            <dl className="mt-3 space-y-2 text-sm">
              {otherColumns.map((column) => (
                <div
                  key={column.key}
                  className="flex items-center justify-between gap-3"
                >
                  <dt className="text-slate-500">{column.header}</dt>
                  <dd className="text-right text-slate-900">
                    {cell(column, row)}
                  </dd>
                </div>
              ))}
            </dl>

            {actionColumns.map((column) => (
              <div
                key={column.key}
                className="mt-4 flex flex-wrap gap-2 [&>*]:min-w-[7rem] [&>*]:flex-1"
              >
                {" "}
                {cell(column, row)}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DataTable;
