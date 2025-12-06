import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

/**
 * Service for exporting data to various formats.
 * Pure function implementation.
 */
export const exportService = {
  exportCSV(filename, data) {
    if (!data || data.length === 0) return;
    const headers = "Time Period,Consumption (kWh)\n";
    const rows = data.map(r => `${r.label},${r.value}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
  },

  exportPDF(filename, data, title, totalKwh) {
    if (!data || data.length === 0) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(40, 167, 69); 
    doc.text("EnerGreen Analytics Report", 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`View: ${title}`, 14, 36);
    doc.text(`Total Consumption: ${totalKwh.toFixed(2)} kWh`, 14, 42);

    const tableData = data.map(r => [r.label, r.value + ' kWh']);
    autoTable(doc, {
      startY: 50,
      head: [['Time Period', 'Consumption']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [40, 167, 69] } 
    });
    doc.save(`${filename}.pdf`);
  },

  async exportWord(filename, data, title, totalKwh) {
    if (!data || data.length === 0) return;
    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: "Time Period", bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "Consumption (kWh)", bold: true })] }),
        ],
      }),
      ...data.map(r => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(r.label)] }),
            new TableCell({ children: [new Paragraph(String(r.value))] }),
          ],
        })
      )
    ];

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: "EnerGreen Analytics Report", heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: `Generated: ${new Date().toLocaleString()}` }),
          new Paragraph({ text: `View: ${title}` }),
          new Paragraph({ text: `Total: ${totalKwh.toFixed(2)} kWh` }),
          new Paragraph({ text: "" }), 
          new Table({
            rows: tableRows,
            width: { size: 100, type: "pct" }
          })
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
  }
};
