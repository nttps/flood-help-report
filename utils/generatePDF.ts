import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import "@fontsource/sarabun"; // Import the Google Font
import { pdfFonts } from '~/assets/fonts/vfs_fonts.js'
import { format } from 'date-fns';
import { textAlign } from 'html2canvas/dist/types/css/property-descriptors/text-align';
import { th } from "date-fns/locale";
    
// Add the Sarabun font to jsPDF
const addSarabunFont = (doc: any) => {
  // Add the base64 encoded Sarabun font
  doc.addFileToVFS("Sarabun-Regular.ttf", pdfFonts['THSarabunNew Bold.ttf']);
  doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
  doc.setFont("Sarabun"); // Set the font for the document
};
  // Helper function to format date with Buddhist Era year
export const formatDateTH = (date: Date | string, formatString: string = 'dd MMM yyyy') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    const formatted = format(dateObj, formatString, { locale: th })
    const buddhistYear = dateObj.getFullYear() + 543
    return formatted.replace(dateObj.getFullYear().toString(), buddhistYear.toString())
  }


const generatePDF = (dataHead: any) => {
const doc = new jsPDF('p', 'mm', 'a4'); // p คือ portrait (แนวตั้ง), mm คือหน่วยมิลลิเมตร

  // Load and set Sarabun font
  addSarabunFont(doc);

 // Define the title and timestamp
  const title = 'สรุปจำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอันเนื่องมาจากการกระทำของกองกำลังจากนอกประเทศ ปี 2568';
  const timestamp = formatDateTH(new Date(), 'dd/MM/yyyy HH:mm:ss');

  // Title - Centered
  doc.setFontSize(16);
  const titleWidth = doc.getTextWidth(title); // Calculate the width of the title text
  const titleX = (210 - titleWidth) / 2; // Calculate the X position to center the title (210mm is the width of A4 paper)
  doc.text(title, titleX, 10); // Place the title at the calculated X and fixed Y position (20mm from top)

 doc.setFontSize(8);
  doc.text(`ข้อมูล ณ วันที่\n${timestamp}`, 220 - doc.getTextWidth(`ข้อมูล ณ วันที่\n${timestamp}`), 5); // Adjust X to be at the far right

// Define the headers for the table
// กำหนด headers โดยใช้ \n แทน <br />
const headers = [
  [{
    content: 'จังหวัด',
    colSpan: 2,
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }, {
      content: 'ครั้งที่',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }, {
      content: 'วันที่',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }, {
      content: 'จำนวน\nก.ช.ก.จ',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }, {
      content: 'ไม่ผ่าน\nLinkage',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }, {
      content: 'ส่งออมสิน',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }, {
      content: 'วันที่โอนเงิน',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }, {
      content: 'ครั้งที่',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }, {
      content: 'โอนสำเร็จ',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }, {
      content: 'โอนไม่สำเร็จ',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }, {
      content: 'ส่งคืนจังหวัด\nตรวจสอบ',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }, {
      content: 'จังหวัดส่งคืน\nผลตรวจสอบ',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }, {
      content: 'สละสิทธิ์',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }, {
      content: 'ข้อมูล\nคงค้าง',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'center',
        valign: 'middle',
      }
    }
  ]
];

// Initialize body rows array
  let bodyRows = [];
  
  // Total summary row
  const totalRow = [
    {
      content: 'จังหวัด :',
      colSpan: 2,
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color,
        valign: 'middle',
      }
    },
    '', '', '',
    {
      content:  `Sum:\n${dataHead.reduce((total: any, current: any) => total + current.person_qty, 0).toLocaleString()}`,
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'right' 
      }
    },
    {
      content: `Sum:\n${dataHead.reduce((total: any, current: any) => total + current.failed_linkage, 0).toLocaleString()}`,
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'right' 
      }
    },
    {
      content: `Sum:\n${dataHead.reduce((total: any, current: any) => total + current.send_bank, 0).toLocaleString()}`,
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'right' 
      }
    },
    {
      content: `Count (Unique):\n${dataHead.reduce((total: any, current: any) => total + current.count_payment_date, 0).toLocaleString()}`,
      colSpan: 2,
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'right' 
      }
    },
    {
      content: `Sum:\n${dataHead.reduce((total: any, current: any) => total + current.successful_payments, 0).toLocaleString()}`,
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'right' 
      }
    },
    {
      content: `Sum:\n${dataHead.reduce((total: any, region: any) => {
        return total + region.sub.filter((i: any) => i.status_confirm === 'ยืนยันแล้ว').reduce((subTotal: any, item: any) => subTotal + item.unsuccessful_payments, 0);
      }, 0).toLocaleString()}`,
      textAlign: 'right',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'right' 
      }
    },
    {
      content: `Sum:\n${dataHead.reduce((total: any, region: any) => {
        return total + region.sub.filter((i: any) => i.status_confirm === 'ยืนยันแล้ว').reduce((subTotal: any, item: any) => subTotal + item.count_back_to_province, 0);
      }, 0).toLocaleString()}`,
      textAlign: 'right',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'right' 
      }
    },  
    {
      content: `Sum:\n${dataHead.reduce((total: any, region: any) => {
        return total + region.sub.filter((i: any) => i.status_confirm === 'ยืนยันแล้ว').reduce((subTotal: any, item: any) => subTotal + item.send_from_province, 0);
      }, 0).toLocaleString()}`,
      textAlign: 'right',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'right' 
      }
    },    
    {
      content: 'Sum:\n 0',
      textAlign: 'right',
      styles: {
        fontStyle: 'bold',
        textColor: 'black' , // Dark blue font color
        halign: 'right' 
      }
    },   
    {
      content:  `Sum:\n${dataHead.reduce((total: any, region: any) => {
        return total + region.sub.filter(i => i.status_confirm === 'ยืนยันแล้ว').reduce((subTotal, item) => subTotal + item.outstanding, 0);
      }, 0).toLocaleString()}`,
      textAlign: 'right',
      styles: {
        fontStyle: 'bold',
        textColor: 'black', // Dark blue font color
        halign: 'right' 
      }
    }, 
   
   
  ];
  bodyRows.push(totalRow);
  // Loop through each head item to create rows with merged cells and background color
  dataHead.forEach((head) => {
    // Main head row with merged cells and background color
    bodyRows.push([
      {
        content: head.p_name || "",
        colSpan: 2,
        styles: {
          fontStyle: 'bold',
          textColor: 'black' ,// Dark blue font color
          fillColor: [240, 240, 240] 
        }
      
      },
      {
        content: head.payment_round || "",
        styles: {
          fontStyle: 'bold',
          textColor: 'black',// Dark blue font color 
          fillColor: [240, 240, 240]
        }
      }, // Payment round
      { content: "", fillColor: [240, 240, 240] , styles: {
          fontStyle: 'bold',
          textColor: 'black',// Dark blue font color 
          fillColor: [240, 240, 240]
        } }, // Date
      { content: head.person_qty.toLocaleString(), styles: {
          fontStyle: 'bold',
          textColor: 'black',// Dark blue font color 
        fillColor: [240, 240, 240],
          halign: 'right' 
        } }, // Light gray
      { content: head.failed_linkage.toLocaleString(), styles: {
          fontStyle: 'bold',
          textColor: 'black',// Dark blue font color 
        fillColor: [240, 240, 240],
          halign: 'right' 
        } }, // Light gray
      { content: head.send_bank.toLocaleString(), styles: {
          fontStyle: 'bold',
          textColor: 'black',// Dark blue font color 
        fillColor: [240, 240, 240],
          halign: 'right' 
        } }, // Light gray
      { content: "", fillColor: [240, 240, 240], styles: {
          fontStyle: 'bold',
          textColor: 'black',// Dark blue font color 
          fillColor: [240, 240, 240]
        }  }, // Date
      { content: head.count_payment_date.toLocaleString(), styles: {
          fontStyle: 'bold',
          textColor: 'black',// Dark blue font color 
        fillColor: [240, 240, 240],
          halign: 'right'
        } }, // Light gray
      { content: head.sub.reduce((total: any, current: any) => total + current.successful_payments, 0).toLocaleString(), styles: {
          fontStyle: 'bold',
          textColor: 'black',// Dark blue font color 
        fillColor: [240, 240, 240],
          halign: 'right'
        } }, // Light gray
      { content: head.sub.filter(i => i.status_confirm === 'ยืนยันแล้ว')
        .reduce((total: any, current: any) => total + current.unsuccessful_payments, 0).toLocaleString(), styles: {
          fontStyle: 'bold',
          textColor: 'black',// Dark blue font color 
        fillColor: [240, 240, 240],
          halign: 'right'
        } }, // Light gray
      { content: head.sub.filter(i => i.status_confirm === 'ยืนยันแล้ว')
        .reduce((total: any, current: any) => total + current.count_back_to_province, 0).toLocaleString(), styles: {
          fontStyle: 'bold',
          textColor: 'black',// Dark blue font color 
        fillColor: [240, 240, 240],
          halign: 'right'
        } }, // Light gray
      { content:  head.sub.filter(i => i.status_confirm === 'ยืนยันแล้ว')
        .reduce((total: any, current: any) => total + current.send_from_province, 0).toLocaleString(), styles: {
          fontStyle: 'bold',
          textColor: 'black',// Dark blue font color 
        fillColor: [240, 240, 240],
          halign: 'right'
        } }, // Light gray
      { content: "0", styles: {
          fontStyle: 'bold',
          textColor: 'black',// Dark blue font color 
        fillColor: [240, 240, 240],
          halign: 'right'
        }  }, // Date
      { content: head.sub.filter(i => i.status_confirm === 'ยืนยันแล้ว')
        .reduce((total: any, current: any) => total + current.outstanding, 0).toLocaleString(), styles: {
          fontStyle: 'bold',
          textColor: 'black',// Dark blue font color 
        fillColor: [240, 240, 240],
          halign: 'right'
        }  }, // Date
      
    ]);

    // Loop through each sub item and add its data below the main head row with different background
    head.sub.forEach((subItem) => {
      bodyRows.push([
        {
          content: head.p_name || "",
          colSpan: 2,
          styles: {
            fontStyle: 'bold',
            valign: 'middle',
            halign: 'center',
            textColor: 'black' // Dark blue font color
          }
        }, // Province name in sub
        
        { content: subItem.commit_no || "", styles: { halign: 'center', } }, // Payment round
        { content: subItem.commit_date ? formatDateTH(subItem.commit_date) : "", styles: { halign: 'center', } }, // Date in subrow
        { content: subItem.person_qty.toLocaleString() || "", styles: { halign: 'right', } },
        { content: subItem.failed_linkage.toLocaleString() || "", styles: { halign: 'right', } },    
        { content: subItem.send_bank.toLocaleString() || "", styles: { halign: 'right', } },   
        { content: subItem.latest_payment_date ? formatDateTH(subItem.latest_payment_date) : "", styles: { halign: 'right', } },
        { content: subItem.payment_sequence.toLocaleString() || "", styles: { halign: 'right', } },   
        { content: subItem.successful_payments.toLocaleString(), styles: { halign: 'right', textColor: [59, 130, 246] } }, // Green font for successful
        { content: subItem.unsuccessful_payments.toLocaleString(), styles: { halign: 'right', } }, // Red font for unsuccessful
        { content: subItem.count_back_to_province.toLocaleString(), styles: { halign: 'right', textColor: subItem.count_back_to_province > 0 ? [153, 0, 0] : 'black' } }, // Red font for unsuccessful
        { content: subItem.send_from_province.toLocaleString(), styles: { halign: 'right', textColor:  subItem.send_from_province > 0 ? [153, 0, 0] : 'black' } }, // Red font for unsuccessful
        { content: "0", styles: { halign: 'right', } }, // Red font for unsuccessful
        { content: subItem.status_confirm == 'ยืนยันแล้ว' ? subItem.outstanding.toLocaleString() : 0, styles: { halign: 'right',textColor : 'black', fillColor: subItem.status_confirm == 'ยืนยันแล้ว' && subItem.outstanding > 0 ? [248, 113, 113] : [144,219,146] } }, // Red font for unsuccessful
      ]);
    });
  });
  
  // กำหนดระยะขอบและตำแหน่งเริ่มต้น
const marginLeft = 2; // ระยะห่างจากขอบซ้าย
const marginRight = 2; // ระยะห่างจากขอบขวา
const pageWidth = doc.internal.pageSize.width; // ความกว้างของหน้ากระดาษ
// คำนวณตำแหน่งซ้าย-ขวา
const availableWidth = pageWidth - marginLeft - marginRight; // ความกว้างที่ใช้ได้
const startX = marginLeft; // ตำแหน่งเริ่มต้นจากขอบซ้าย
const startY = 18; // ตำแหน่งเริ่มต้นจากขอบบน

  // Generate the table
  autoTable(doc, {
    head: headers,
    body: bodyRows,
    startY: startY, 
    startX: startX,
    margin: { left: marginLeft, right: marginRight }, // ระยะขอบ
    styles: {
      font: "Sarabun", // Use Sarabun font
      fontSize: 9,
      cellPadding: 2,
      lineColor: [0, 0, 0], // Black border color
       lineWidth: 0.1, // Border thickness
    },
    theme: 'grid',
    headStyles: { fillColor: [212, 212, 216], fontStyle: 'bold', textColor: 'black' }, // Light gray header background
    columnStyles: {
      //0: { cellWidth: 11 },
      1: { cellWidth: 23 },
      2: { cellWidth: 10 },
      3: { cellWidth: 18 },
      4: { cellWidth: 12 },
      5: { cellWidth: 13 },
      6: { cellWidth: 15 },
      7: { cellWidth: 18 },
      8: { cellWidth: 10 },
      9: { cellWidth: 14 },
      10: { cellWidth: 13 },
      11: { cellWidth: 16 },
      12: { cellWidth: 18 },
      13: { cellWidth: 13 },
      14: { cellWidth: 10 },


      // Adjust widths as necessary for each column
    },
    autoColumnWidth: true // ใช้ความกว้างอัตโนมัติ
  });

  // Save the PDF
  //doc.save('report.pdf');

  // Generate the PDF blob
  doc.save("สรุปจำนวนผู้ขอรับเงินช่วยเหลือผู้ประสบอันเนื่องมาจากการกระทำของกองกำลังจากนอกประเทศ ปี 2568");

  // // Open the PDF in a new tab or preview it
  // const pdfURL = URL.createObjectURL(pdfBlob);
  // window.open(pdfURL, "_blank"); // Opens in a new tab
};

export default generatePDF;