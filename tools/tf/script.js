// 全局变量
let originalData = [];
let processedData = [];

// 常量定义
const SPECIAL_BRANCHES = [
    '华南农业大学水利与土木工程学院临时团支部',
    '华南农业大学水利与土木工程学院暂缓就业临时团支部',
    '华南农业大学水利与土木工程学院延迟毕业临时团支部',
    '华南农业大学水利与土木工程学院出国留学（出境学习）团员团支部'
];
const COMMITTEE = '中国共产主义青年团华南农业大学水利与土木工程学院委员会';
const COLLEGE_NAME = '华南农业大学水利与土木工程学院';
const COLOR_PALETTE = ['#FFF2CC', '#DCE6F1', '#EBF1DE', '#F2DCDB', '#E5E0EC', '#FFE5CC', '#E6FFE6', '#FFE6FF', '#E6E6FF', '#FFFFE6'];

// 页面初始化
document.addEventListener('DOMContentLoaded', initializePage);

// 获取默认年级设置
function getDefaultGrades() {
    const today = new Date();
    const academicYear = (today.getMonth() + 1) >= 9 ? today.getFullYear() : today.getFullYear() - 1;
    const gradeOffset = Math.floor((academicYear - 2024) / 1);
    
    return {
        architecture: 2020 + gradeOffset,
        civil: 2021 + gradeOffset,
        graduate: 2022 + gradeOffset
    };
}

// 提取年级信息
function extractGrade(org) {
    if (org.includes('研究生')) {
        const gradeMatch = org.match(/(\d{4})级研究生/);
        if (gradeMatch) return parseInt(gradeMatch[1]);
    }
    const match = org.match(/(\d{4})级/);
    return match ? parseInt(match[1]) : null;
}

// 初始化页面
function initializePage() {
    const today = new Date();
    const titleInput = document.getElementById('titleInput');
    titleInput.value = `${today.getFullYear()}年${(today.getMonth() + 1).toString().padStart(2, '0')}月${today.getDate().toString().padStart(2, '0')}日团费通报`;
    titleInput.style.textAlign = 'center';

    updateGradeSelectors();
    setupEventListeners();
    checkMobileWarning();
    createEmptyPreview();
}

// 设置事件监听器
function setupEventListeners() {
    document.getElementById('selectFileBtn').addEventListener('click', () => document.getElementById('fileInput').click());
    document.getElementById('fileInput').addEventListener('change', handleFileSelect);
    document.getElementById('importBtn').addEventListener('click', importExcel);
    document.getElementById('exportBtn').addEventListener('click', exportExcel);
    document.getElementById('exportPdfBtn').addEventListener('click', exportPDF);
    document.getElementById('architectureGrade').addEventListener('change', updateDataAndPreview);
    document.getElementById('civilGrade').addEventListener('change', updateDataAndPreview);
    document.getElementById('graduateGrade').addEventListener('change', updateDataAndPreview);
    document.getElementById('hideCompletedSwitch').addEventListener('change', updateDataAndPreview);
    document.getElementById('titleInput').addEventListener('change', () => {
        processedData.length === 0 ? createEmptyPreview() : updatePreview();
    });
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    const fileName = document.getElementById('fileName');
    const importBtn = document.getElementById('importBtn');
    
    fileName.textContent = file ? file.name : '请选择文件：要求为包含团费数据的Excel表格';
    fileName.style.color = file ? '#52c41a' : '#ff4d4f';
    importBtn.disabled = !file;
}

// 更新年级选择器
function updateGradeSelectors(grades) {
    const selectors = ['architectureGrade', 'civilGrade', 'graduateGrade'].map(id => document.getElementById(id));
    const defaultGrades = getDefaultGrades();
    const currentYear = new Date().getFullYear();
    const startYear = Math.min(defaultGrades.architecture, defaultGrades.civil, defaultGrades.graduate) - 2;
    const endYear = currentYear;

    selectors.forEach(select => {
        select.innerHTML = '';
        select.style.textAlign = 'center';
        
        for(let year = startYear; year <= endYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = `${year}级`;
            select.appendChild(option.cloneNode(true));
        }
    });

    selectors[0].value = defaultGrades.architecture;
    selectors[1].value = defaultGrades.civil;
    selectors[2].value = defaultGrades.graduate;

    if (grades?.length) {
        grades.forEach(grade => {
            if (grade < startYear || grade > endYear) {
                const option = document.createElement('option');
                option.value = grade;
                option.textContent = `${grade}级`;
                selectors.forEach(select => {
                    if (!select.querySelector(`option[value="${grade}"]`)) {
                        select.appendChild(option.cloneNode(true));
                    }
                });
            }
        });
    }
}

// 更新数据和预览
function updateDataAndPreview() {
    if (originalData.length > 0) {
        processData();
        updatePreview();
        const exportBtns = ['exportBtn', 'exportPdfBtn'].map(id => document.getElementById(id));
        exportBtns.forEach(btn => btn.disabled = false);
        
        const dataStatus = document.getElementById('dataStatus');
        dataStatus.textContent = `已更新 ${processedData.length} 条数据`;
        dataStatus.style.color = '#52c41a';
    }
}

// 处理数据
function processData() {
    const architectureGrade = parseInt(document.getElementById('architectureGrade').value);
    const civilGrade = parseInt(document.getElementById('civilGrade').value);
    const graduateGrade = parseInt(document.getElementById('graduateGrade').value);
    const hideCompleted = document.getElementById('hideCompletedSwitch').checked;

    processedData = originalData
        .filter(row => {
            const org = row['组织'] || '';
            if (SPECIAL_BRANCHES.includes(org) || org === COMMITTEE) return false;
            if (hideCompleted && (row['未交团员数'] === 0 || row['未交团员数'] === '0')) return false;

            const grade = extractGrade(org);
            if (!grade) return true;

            if (org.includes('研究生')) return grade >= graduateGrade;
            if (org.includes('建筑学')) return grade >= architectureGrade;
            if (org.includes('水利水电') || org.includes('土木')) return grade >= civilGrade;

            return false;
        })
        .map(row => ({
            ...row,
            '组织': (row['组织'] || '').replace(COLLEGE_NAME, '')
        }))
        .sort((a, b) => {
            const gradeA = extractGrade(a['组织']) || 0;
            const gradeB = extractGrade(b['组织']) || 0;
            
            if (gradeA !== gradeB) return gradeA - gradeB;
            
            const getSpecialtyOrder = org => {
                if (org.includes('建筑学')) return 1;
                if (org.includes('水利水电')) return 2;
                if (org.includes('土木')) return 3;
                if (org.includes('研究生')) return 4;
                return 5;
            };
            
            const orderA = getSpecialtyOrder(a['组织']);
            const orderB = getSpecialtyOrder(b['组织']);
            
            return orderA !== orderB ? orderA - orderB : a['组织'].localeCompare(b['组织'], 'zh-CN');
        });
}

// 生成空预览表格
function createEmptyPreview() {
    document.getElementById('previewTable').innerHTML = `
        <table>
            <tr><th colspan="3" style="font-size: 14px; font-weight: bold; text-align: center;">${document.getElementById('titleInput').value}</th></tr>
            <tr>
                <th style="font-weight: bold; text-align: center;">组织</th>
                <th style="font-weight: bold; text-align: center;">应交费团员数</th>
                <th style="font-weight: bold; text-align: center;">未交团员数</th>
            </tr>
            <tr><td colspan="3" style="text-align: center; color: #999; padding: 20px;">请选择并导入Excel文件</td></tr>
        </table>
    `;
}

// 更新预览
function updatePreview() {
    if (processedData.length === 0) {
        createEmptyPreview();
        return;
    }

    const grades = [...new Set(processedData.map(row => extractGrade(row['组织'])).filter(Boolean))].sort();
    const gradeColors = Object.fromEntries(grades.map((grade, index) => [grade, COLOR_PALETTE[index % COLOR_PALETTE.length]]));

    const tableRows = processedData.map(row => {
        const grade = extractGrade(row['组织']);
        const bgColor = grade ? gradeColors[grade] : '';
        return `
            <tr style="background-color: ${bgColor}">
                <td style="text-align: center;">${row['组织'] || ''}</td>
                <td style="text-align: center;">${row['应交费团员数'] === 0 ? '0' : (row['应交费团员数'] || '0')}</td>
                <td style="text-align: center;">${row['未交团员数'] === 0 ? '0' : (row['未交团员数'] || '0')}</td>
            </tr>
        `;
    }).join('');

    document.getElementById('previewTable').innerHTML = `
        <table>
            <tr><th colspan="3" style="font-size: 14px; font-weight: bold; text-align: center;">${document.getElementById('titleInput').value}</th></tr>
            <tr>
                <th style="font-weight: bold; text-align: center;">组织</th>
                <th style="font-weight: bold; text-align: center;">应交费团员数</th>
                <th style="font-weight: bold; text-align: center;">未交团员数</th>
            </tr>
            ${tableRows}
        </table>
    `;
}

// 导入Excel
function importExcel() {
    const file = document.getElementById('fileInput').files[0];
    const importBtn = document.getElementById('importBtn');
    const dataStatus = document.getElementById('dataStatus');
    
    if (!file) {
        alert('请先选择文件');
        return;
    }
    
    importBtn.disabled = true;
    dataStatus.textContent = '正在导入数据...';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const workbook = XLSX.read(new Uint8Array(e.target.result), {type: 'array'});
            originalData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
            
            if (originalData.length === 0) throw new Error('表格中没有数据');
            
            const grades = [...new Set(originalData.map(row => extractGrade(row['组织'])).filter(Boolean))];
            updateGradeSelectors(grades);
            processData();
            updatePreview();
            
            dataStatus.textContent = `已成功导入 ${originalData.length} 条数据`;
            dataStatus.style.color = '#52c41a';
            ['exportBtn', 'exportPdfBtn'].forEach(id => document.getElementById(id).disabled = false);
            
        } catch (error) {
            console.error('导入错误:', error);
            dataStatus.textContent = '导入失败：' + (error.message || '文件格式错误');
            dataStatus.style.color = '#ff4d4f';
            importBtn.disabled = false;
            ['exportBtn', 'exportPdfBtn'].forEach(id => document.getElementById(id).disabled = true);
        }
    };
    
    reader.onerror = function() {
        dataStatus.textContent = '文件读取失败';
        dataStatus.style.color = '#ff4d4f';
        importBtn.disabled = false;
        ['exportBtn', 'exportPdfBtn'].forEach(id => document.getElementById(id).disabled = true);
    };
    
    reader.readAsArrayBuffer(file);
}

// 导出Excel
function exportExcel() {
    const today = new Date();
    const data = [
        [document.getElementById('titleInput').value],
        ['组织', '应交费团员数', '未交团员数'],
        ...processedData.map(row => [
            row['组织'],
            row['应交费团员数'] === 0 ? 0 : (row['应交费团员数'] || 0),
            row['未交团员数'] === 0 ? 0 : (row['未交团员数'] || 0)
        ])
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    ws['!cols'] = [{ wch: 50 }, { wch: 15 }, { wch: 15 }];
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

    const grades = [...new Set(processedData.map(row => extractGrade(row['组织'])).filter(Boolean))];
    const gradeColors = Object.fromEntries(grades.map((grade, index) => [
        grade, COLOR_PALETTE[index % COLOR_PALETTE.length].replace('#', '')
    ]));

    const range = XLSX.utils.decode_range(ws['!ref']);
    for(let R = range.s.r; R <= range.e.r; R++) {
        for(let C = range.s.c; C <= range.e.c; C++) {
            const cellRef = XLSX.utils.encode_cell({r: R, c: C});
            if(!ws[cellRef]) continue;

            const baseStyle = {
                font: { name: '宋体', sz: 11, color: { rgb: "000000" } },
                alignment: { vertical: 'center', horizontal: 'center' },
                border: {
                    top: { style: 'thin', color: { rgb: "000000" } },
                    bottom: { style: 'thin', color: { rgb: "000000" } },
                    left: { style: 'thin', color: { rgb: "000000" } },
                    right: { style: 'thin', color: { rgb: "000000" } }
                }
            };

            if (R === 0) {
                baseStyle.font.sz = 16;
                baseStyle.font.bold = true;
            } else if (R === 1) {
                baseStyle.font.bold = true;
            } else {
                if (C === 0) baseStyle.alignment.horizontal = 'left';
                
                const grade = extractGrade(data[R][0]);
                if (grade && gradeColors[grade]) {
                    baseStyle.fill = {
                        patternType: 'solid',
                        fgColor: { rgb: gradeColors[grade] }
                    };
                }
            }

            if (!ws[cellRef].s) ws[cellRef].s = {};
            Object.assign(ws[cellRef].s, baseStyle);
        }
    }

    XLSX.utils.book_append_sheet(wb, ws, '团费通报');

    try {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: false, type: 'binary' });
        const buf = new ArrayBuffer(wbout.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
        
        const blob = new Blob([buf], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `团费统计截至${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日.xlsx`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    } catch (e) {
        console.error('Export failed:', e);
        alert('导出失败，请重试');
    }
}

// 导出PDF
async function exportPDF() {
    try {
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.9); display: flex; justify-content: center; align-items: center; z-index: 9999;';
        loadingDiv.innerHTML = '<div style="padding: 20px; background: #fff; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">正在生成PDF，请稍候...</div>';
        document.body.appendChild(loadingDiv);

        const today = new Date();
        const element = document.createElement('div');
        element.style.cssText = 'width: 210mm; background: white; padding: 10mm;';
        
        element.innerHTML = `
            <style>
                table { width: 100%; border-collapse: collapse; font-size: 12px; page-break-inside: avoid; }
                th, td { border: 1px solid black; padding: 6px; text-align: center; }
                th { background-color: white !important; font-weight: bold; }
                tr:first-child th { font-size: 16px; padding: 8px; }
            </style>
            ${document.getElementById('previewTable').outerHTML}
        `;

        document.body.appendChild(element);
        const contentHeight = element.offsetHeight;
        document.body.removeChild(element);

        const opt = {
            filename: `团费统计截至${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日.pdf`,
            margin: 0,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0 },
            jsPDF: { unit: 'mm', format: [210, (contentHeight * 20) / 96], orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(element).save();
        document.body.removeChild(loadingDiv);
    } catch (error) {
        console.error('PDF导出错误:', error);
        alert('PDF导出失败，请重试');
        const loadingDiv = document.querySelector('div[style*="position: fixed"]');
        if (loadingDiv) document.body.removeChild(loadingDiv);
    }
}

// 检查是否为移动设备
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

// 检查并显示移动设备提示
function checkMobileWarning() {
    if (isMobileDevice()) {
        document.getElementById('mobileWarning').style.display = 'flex';
    }
}

// 关闭移动设备提示
function closeMobileWarning() {
    document.getElementById('mobileWarning').style.display = 'none';
}

// 弹窗相关
function showTutorial() {
    document.getElementById('tutorialModal').classList.add('active');
}

function closeTutorial() {
    document.getElementById('tutorialModal').classList.remove('active');
}

function showAbout() {
    document.getElementById('aboutModal').classList.add('active');
}

function closeAbout() {
    document.getElementById('aboutModal').classList.remove('active');
}

window.addEventListener('resize', checkMobileWarning); 