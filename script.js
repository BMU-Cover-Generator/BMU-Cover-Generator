const STORAGE_KEY = 'cover_page_form_data';

const DEFAULT_DATA = {
      dept: "DEPARTMENT OF MARITIME LAW AND POLICY",
      topic: "Topic Placeholder Text",
      courseTitle: "Muslim Law",
      courseCode: "LLB 1122",
      teacher: "Jane Doe\nLecturer\nDepartment of Maritime Law and Policy",
      studentName: "John Doe",
      studentId: "123456",
      defaultDate: "DD/MM/YYYY"
    };

 const inputMap = {
      'in-dept': 'dept',
      'in-topic': 'topic',
      'in-coursetitle': 'courseTitle',
      'in-code': 'courseCode',
      'in-teacher': 'teacher',
      'in-student-name': 'studentName',
      'in-student-id': 'studentId',
      'in-date': 'date'
    };

    function saveToLocalStorage() {
      const formData = {};
      Object.keys(inputMap).forEach(id => {
        formData[id] = document.getElementById(id).value;
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }

    function loadFromLocalStorage() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return false;

      try {
        const formData = JSON.parse(saved);
        Object.keys(formData).forEach(id => {
          const el = document.getElementById(id);
          if (el) el.value = formData[id];
        });
        return true;
      } catch (e) {
        return false;
      }
    }

    function handleInputChange() {
      updatePreview();
      saveToLocalStorage();
    }

    function clearSavedData() {
      localStorage.removeItem(STORAGE_KEY);
      
      Object.keys(inputMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = (id === 'in-dept') ? DEFAULT_DATA.dept : '';
      });

      updatePreview();
    }

    function initializeDefaults() {
      const hasSaved = loadFromLocalStorage();

      if (!hasSaved) {
        document.getElementById('in-dept').value = DEFAULT_DATA.dept;
      }

      const setPlaceholder = (id, key) => {
        const el = document.getElementById(id);
        if (el) el.placeholder = DEFAULT_DATA[key];
      };

      setPlaceholder('in-topic', 'topic');
      setPlaceholder('in-coursetitle', 'courseTitle');
      setPlaceholder('in-code', 'courseCode');
      setPlaceholder('in-teacher', 'teacher');
      setPlaceholder('in-student-name', 'studentName');
      setPlaceholder('in-student-id', 'studentId');

      updatePreview();
    }

    function resizePreview() {
      const wrapper = document.getElementById('preview-wrapper');
      const page = document.getElementById('cover-preview');
      const containerWidth = wrapper.clientWidth;
      
      if (containerWidth < 794) {
        const scale = containerWidth / 794;
        page.style.transform = `scale(${scale})`;
        wrapper.style.height = `${1123 * scale}px`;
      } else {
        page.style.transform = 'scale(1)';
        wrapper.style.height = 'auto';
      }
    }

    function formatDate(dateStr) {
      if (!dateStr) return DEFAULT_DATA.defaultDate;
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }

    function updatePreview() {
      const getVal = (inputId, key) => document.getElementById(inputId).value.trim() || DEFAULT_DATA[key];

      document.getElementById('out-dept').innerText = document.getElementById('in-dept').value;
      document.getElementById('out-topic').innerText = getVal('in-topic', 'topic');
      document.getElementById('out-coursetitle').innerText = getVal('in-coursetitle', 'courseTitle');
      document.getElementById('out-code').innerText = getVal('in-code', 'courseCode');
      document.getElementById('out-teacher').innerText = getVal('in-teacher', 'teacher');
      document.getElementById('out-student-name').innerText = getVal('in-student-name', 'studentName');
      document.getElementById('out-student-id').innerText = getVal('in-student-id', 'studentId');
      
      const submitDateRaw = document.getElementById('in-date').value;
      document.getElementById('out-date').innerText = formatDate(submitDateRaw);
    }

    function toggleTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      document.getElementById('theme-icon').innerText = newTheme === 'dark' ? '☀️' : '🌙';
      document.getElementById('theme-text').innerText = newTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }

    function getPngDataUri(imgEl) {
      const canvas = document.createElement('canvas');
      canvas.width = imgEl.naturalWidth || imgEl.width || 380;
      canvas.height = imgEl.naturalHeight || imgEl.height || 380;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imgEl, 0, 0);
      return canvas.toDataURL('image/png');
    }

    function exportNativeTextPDF() {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const margin = 10;
      const outerX = margin;
      const outerY = margin;
      const outerWidth = 210 - (margin * 2);
      const outerHeight = 297 - (margin * 2);

      pdf.setDrawColor(148, 163, 184);
      pdf.setLineWidth(0.5);
      pdf.rect(outerX, outerY, outerWidth, outerHeight);

      const logoImg = document.getElementById('main-logo-img');

      if (logoImg) {
        const pngDataUri = getPngDataUri(logoImg);

        pdf.saveGraphicsState();
        pdf.setGState(new pdf.GState({ opacity: 0.07 }));
        pdf.addImage(pngDataUri, 'PNG', 55, 98.5, 100, 100);
        pdf.restoreGraphicsState();

        pdf.saveGraphicsState();
        pdf.setGState(new pdf.GState({ opacity: 1.0 }));
        pdf.addImage(pngDataUri, 'PNG', 90, 15, 30, 30);
        pdf.restoreGraphicsState();
      }

      pdf.setFont("times", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(11, 37, 69);
      pdf.text("BANGLADESH MARITIME UNIVERSITY", 105, 52, { align: "center" });

      pdf.setFont("times", "italic");
      pdf.setFontSize(10);
      pdf.setTextColor(51, 65, 85);
      pdf.text("We strive for Maritime Excellence", 105, 58, { align: "center" });

      const deptText = document.getElementById('out-dept').innerText;
      pdf.setFont("times", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(11, 37, 69);
      pdf.text(deptText, 105, 67, { align: "center" });
      
      const textWidth = pdf.getTextWidth(deptText);
      pdf.setLineWidth(0.4);
      pdf.line(105 - (textWidth / 2) - 2, 63, 105 + (textWidth / 2) + 2, 63);
      pdf.line(105 - (textWidth / 2) - 2, 69, 105 + (textWidth / 2) + 2, 69);

      pdf.setFontSize(18);
      pdf.text("ASSIGNMENT ON", 105, 98, { align: "center" });

      pdf.setFontSize(11);
      
      const topicText = document.getElementById('out-topic').innerText;
      const courseTitleText = document.getElementById('out-coursetitle').innerText;
      const courseCodeText = document.getElementById('out-code').innerText;

      const detailsX = 25;
      let startY = 118;

      pdf.text("TOPIC", detailsX, startY);
      pdf.text(":", detailsX + 35, startY);
      const topicLines = pdf.splitTextToSize(topicText, 115);
      pdf.text(topicLines, detailsX + 42, startY);
      startY += (topicLines.length * 6) + 4;

      pdf.text("COURSE TITLE", detailsX, startY);
      pdf.text(":", detailsX + 35, startY);
      pdf.text(courseTitleText, detailsX + 42, startY);
      startY += 10;

      pdf.text("COURSE CODE", detailsX, startY);
      pdf.text(":", detailsX + 35, startY);
      pdf.text(courseCodeText, detailsX + 42, startY);

      const footerY = 220;

      pdf.text("SUBMITTED TO -", detailsX, footerY);
      const teacherText = document.getElementById('out-teacher').innerText;
      pdf.setFont("times", "normal");
      const teacherLines = pdf.splitTextToSize(teacherText, 70);
      pdf.text(teacherLines, detailsX, footerY + 7);

      const studentX = 125;
      pdf.setFont("times", "bold");
      pdf.text("SUBMITTED BY -", studentX, footerY);
      
      const studentNameText = document.getElementById('out-student-name').innerText;
      const studentIdText = document.getElementById('out-student-id').innerText;

      pdf.text("NAME", studentX, footerY + 7);
      pdf.text(":", studentX + 18, footerY + 7);
      pdf.text(studentNameText, studentX + 23, footerY + 7);

      pdf.text("ID", studentX, footerY + 14);
      pdf.text(":", studentX + 18, footerY + 14);
      pdf.text(studentIdText, studentX + 23, footerY + 14);

      const dateText = document.getElementById('out-date').innerText;
      pdf.text(`DATE OF SUBMISSION : ${dateText}`, detailsX, footerY + 45);

      pdf.save("assignment-cover.pdf");
    }

    function exportPNG() {
      const element = document.getElementById('cover-preview');
      
      const originalTransform = element.style.transform;
      element.style.transform = 'none';

      html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        width: 794,
        height: 1123,
        windowWidth: 794,
        windowHeight: 1123,
        x: 0,
        y: 0,
        scrollX: 0,
        scrollY: 0
      }).then(canvas => {
        element.style.transform = originalTransform;

        const link = document.createElement('a');
        link.download = 'assignment-cover.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }

    window.addEventListener('resize', resizePreview);
    window.addEventListener('load', () => {
      initializeDefaults();
      resizePreview();
    });