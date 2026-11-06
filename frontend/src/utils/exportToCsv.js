function exportToCsv(filename, rows) {
  if (!rows || !rows.length) {
    return;
  }
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(","),
    ...rows.map(
      (row) => headers.map((header) => {
        const val = row[header];
        if (val === null || val === void 0) {
          return '""';
        }
        const strVal = typeof val === "object" ? JSON.stringify(val) : String(val);
        return `"${strVal.replace(/"/g, '""')}"`;
      }).join(",")
    )
  ].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename.replace(/\.csv$/, "")}_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
export {
  exportToCsv
};
