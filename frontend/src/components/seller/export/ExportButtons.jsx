// import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
// import jsPDF from "jspdf";

import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;
// import "jspdf-autotable";
// import autoTable from "jspdf-autotable";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DescriptionIcon from "@mui/icons-material/Description";

const ExportButtons = ({
  data,
  columns,
  fileName = "export",
  excelLabel = "Excel",
  csvLabel = "CSV",
  pdfLabel = "PDF",
  title = "",
}) => {
  const getFormattedDateTime = () => {
    const now = new Date();
    const pad = (n) => (n < 10 ? "0" + n : n);
    return `${pad(now.getDate())}-${pad(
      now.getMonth() + 1,
    )}-${now.getFullYear()}_${pad(now.getHours())}h-${pad(
      now.getMinutes(),
      // )}'-${pad(now.getSeconds())}s`;
    )}p`;
  };

  const exportToExcel = async () => {
    //   const exportData = data.map((row, idx) => {
    //     const obj = {};
    //     columns.forEach((col) => {
    //       obj[col.label] = col.render ? col.render(row, idx) : row[col.key];
    //     });
    //     return obj;
    //   });
    //   const ws = XLSX.utils.json_to_sheet(exportData, { origin: 1 });
    //   if (title) {
    //     XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: "A1" });
    //     ws["!merges"] = [
    //       {
    //         s: { r: 0, c: 0 },
    //         e: { r: 0, c: columns.length - 1 },
    //       },
    //     ];
    //     const titleCell = ws["A1"];
    //     if (!titleCell.s) titleCell.s = {};
    //     titleCell.s = {
    //       alignment: { horizontal: "center", vertical: "center" },
    //       font: { bold: true, sz: 14 },
    //     };
    //   }
    //   const colWidths = columns.map((col) => {
    //     const headerLength = col.label.length;
    //     const maxCellLength = exportData.reduce((max, row) => {
    //       const cellValue = row[col.label] ? row[col.label].toString() : "";
    //       return Math.max(max, cellValue.length);
    //     }, 0);
    //     return { wch: Math.max(headerLength, maxCellLength) + 2 };
    //   });
    //   ws["!cols"] = colWidths;

    //   const wb = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    //   const excelBuffer = XLSX.write(wb, {
    //     bookType: "xlsx",
    //     type: "array",
    //     cellStyles: true,
    //   });
    //   const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    //   saveAs(blob, `${fileName}_${getFormattedDateTime()}.xlsx`);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    if (title) {
      const titleRow = worksheet.addRow([title]);
      worksheet.mergeCells(1, 1, 1, columns.length);
      titleRow.getCell(1).font = { bold: true, size: 14 };
      titleRow.getCell(1).alignment = { horizontal: "center" };
      worksheet.addRow([]); // dòng trống
    }
    const headerRow = worksheet.addRow(columns.map((col) => col.label));
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "808080" },
      };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
    data.forEach((row, idx) => {
      worksheet.addRow(
        columns.map((col) =>
          col.render ? col.render(row, idx) : row[col.key],
        ),
      );
    });
    worksheet.columns.forEach((col) => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, (cell) => {
        const val = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, val.length);
      });
      col.width = maxLength + 2;
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${fileName}_${getFormattedDateTime()}.xlsx`);
  };

  // Xuất CSV
  const exportToCSV = () => {
    const headers = columns.map((col) => col.label);
    const csvData = data.map((row, idx) =>
      columns.map(
        (col) =>
          `"${col.render ? col.render(row, idx) : (row[col.key] ?? "")}"`,
      ),
    );
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");
    const bom = "\ufeff";
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    // saveAs(blob, `${fileName}.csv`);
    saveAs(blob, `${fileName}_${getFormattedDateTime()}.csv`);
  };

  const exportToPDF = () => {
    const tableHeader = columns.map((col) => col.label);
    const tableBody = data.map((row, idx) =>
      columns.map((col) =>
        col.render ? col.render(row, idx) : (row[col.key] ?? ""),
      ),
    );
    // Nếu số cột > 7 thì xoay ngang trang
    const isWide = columns.length > 7;
    const docDefinition = {
      pageOrientation: isWide ? "landscape" : "portrait",
      content: [
        title ? { text: title, style: "header" } : null,
        {
          table: {
            headerRows: 1,
            widths: Array(columns.length).fill("auto"), // Chia đều cột
            body: [tableHeader, ...tableBody],
          },
          layout: {
            fillColor: function (rowIndex, node, columnIndex) {
              return rowIndex === 0 ? "#eeeeee" : null;
            },
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => "#cccccc",
            vLineColor: () => "#cccccc",
            paddingLeft: () => 2,
            paddingRight: () => 2,
            paddingTop: () => 2,
            paddingBottom: () => 2,
          },
        },
      ].filter(Boolean),
      styles: {
        header: { fontSize: 14, bold: true, margin: [0, 0, 0, 8] },
        tableHeader: { bold: true, fontSize: 10, color: "black" },
      },
      defaultStyle: {
        font: "Roboto",
        fontSize: 9,
        noWrap: false,
      },
    };
    pdfMake
      .createPdf(docDefinition)
      .download(`${fileName}_${getFormattedDateTime()}.pdf`);

    //   const doc = new jsPDF();

    //   // Thêm tiêu đề
    //   if (title) {
    //     doc.setFontSize(14);
    //     doc.setFont("helvetica", "bold");
    //     // doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, {
    //     //   align: "center",
    //     // });
    //     doc.text(removeAccents(title), doc.internal.pageSize.getWidth() / 2, 15, {
    //       align: "center",
    //     });
    //   }

    //   // Chuẩn bị dữ liệu bảng
    //   // const tableColumn = columns.map((col) => col.label);
    //   // const tableRows = data.map((row, idx) =>
    //   //   columns.map((col) =>
    //   //     col.render ? col.render(row, idx) : row[col.key] ?? ""
    //   //   )
    //   // );
    //   function removeAccents(str) {
    //     if (!str) return "";
    //     return str
    //       .toString()
    //       .replace(/Đ/g, "D")
    //       .replace(/đ/g, "d")
    //       .normalize("NFD")
    //       .replace(/[\u0300-\u036f]/g, "");
    //   }

    //   const tableColumn = columns.map((col) => removeAccents(col.label));
    //   const tableRows = data.map((row, idx) =>
    //     columns.map((col) =>
    //       removeAccents(col.render ? col.render(row, idx) : row[col.key] ?? "")
    //     )
    //   );

    //   // doc.autoTable({
    //   autoTable(doc, {
    //     startY: title ? 25 : 10,
    //     head: [tableColumn],
    //     body: tableRows,
    //     styles: { fontSize: 10, cellPadding: 3 },
    //     headStyles: {
    //       fillColor: [66, 66, 66],
    //       textColor: 255,
    //       fontStyle: "bold",
    //     },
    //     alternateRowStyles: { fillColor: [240, 240, 240] },
    //   });

    //   doc.save(`${fileName}_${getFormattedDateTime()}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToExcel}
        className="bg-green-500 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
      >
        <DescriptionIcon />
        {excelLabel}
      </button>
      <button
        onClick={exportToCSV}
        className="bg-blue-600 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center gap-2"
      >
        <FileCopyIcon />
        {csvLabel}
      </button>

      <button
        onClick={exportToPDF}
        className="bg-red-500 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
      >
        <PictureAsPdfIcon />
        {pdfLabel}
      </button>
    </div>
  );
};

export default ExportButtons;
