import './DataTable.css';

/* FIXED: every page that uses this component defines columns as
 * { key, header, render: (row) => ... } - but this file previously read
 * col.label (always undefined, so every table header rendered blank) and
 * called col.render(row[col.key], row) (passing the raw cell value as the
 * first arg instead of the row, so every render() in every page received
 * the wrong argument). Both are corrected to match actual usage. */
export default function DataTable({ columns = [], data = [], onRowClick, footer }) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr className="data-table__head-row">
            {columns.map((col) => (
              <th
                key={col.key}
                className="data-table__th font-label-sm"
                style={{ textAlign: col.align || 'left' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id || i}
              className={`data-table__row${onRowClick ? ' data-table__row--clickable' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="data-table__td font-body-md"
                  style={{ textAlign: col.align || 'left' }}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="data-table__empty font-body-md"
              >
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {footer && <div className="data-table__footer">{footer}</div>}
    </div>
  );
}
