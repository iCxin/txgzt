// 全局变量
let workbook = null;
let currentData = [];
let filteredData = [];

// 常量定义
const SPECIAL_BRANCHES = [
    '华南农业大学水利与土木工程学院临时团支部',
    '华南农业大学水利与土木工程学院暂缓就业临时团支部',
    '华南农业大学水利与土木工程学院延迟毕业临时团支部',
    '华南农业大学水利与土木工程学院出国留学（出境学习）团员团支部'
];
const COMMITTEE = '中国共产主义青年团华南农业大学水利与土木工程学院委员会';
const COLLEGE_NAME = '华南农业大学水利与土木工程学院';

// 添加颜色面板
const COLOR_PALETTE = [
    '#e6f7ff', '#fff2e8', '#feffe6', '#fcffe6', '#f4ffb8', 
    '#f6ffed', '#e6fffb', '#f9f0ff', '#fff0f6', '#e8f4ff'
];

// DOM元素
const fileInput = document.getElementById('fileInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');
const dataStatus = document.getElementById('dataStatus');
const previewTable = document.getElementById('previewTable');
const titleInput = document.getElementById('titleInput');
const architectureGrade = document.getElementById('architectureGrade');
const civilGrade = document.getElementById('civilGrade');
const graduateGrade = document.getElementById('graduateGrade');
const hideCompletedSwitch = document.getElementById('hideCompletedSwitch');
const tutorialModal = document.getElementById('tutorialModal');
const aboutModal = document.getElementById('aboutModal');
const mobileWarning = document.getElementById('mobileWarning');

// 初始化
function init() {
    // 设置事件监听器
    selectFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    importBtn.addEventListener('click', importData);
    exportBtn.addEventListener('click', exportToExcel);
    exportPdfBtn.addEventListener('click', exportToPdf);
    hideCompletedSwitch.addEventListener('change', updatePreview);
    titleInput.addEventListener('input', updatePreview);
    architectureGrade.addEventListener('change', updatePreview);
    civilGrade.addEventListener('change', updatePreview);
    graduateGrade.addEventListener('change', updatePreview);

    console.log('团籍注册整理初始化完成');
    console.log('DOM元素检查:');
    console.log('fileInput:', fileInput);
    console.log('exportBtn:', exportBtn);
    console.log('hideCompletedSwitch:', hideCompletedSwitch);

    // 检查是否为移动设备
    if (isMobileDevice()) {
        mobileWarning.style.display = 'flex';
    }

    // 设置默认值
    // 获取当前日期，格式为"M月D日"
    const today = new Date();
    const month = today.getMonth() + 1; // 月份
    const day = today.getDate(); // 日期
    
    // 设置默认标题
    titleInput.value = `${month}月${day}日团籍注册数据通报`;
    
    // 设置默认年级 - 改为更宽松的年级限制，避免过滤掉太多数据
    // 建筑学一般5年，所以往前推5年
    architectureGrade.value = today.getFullYear() - 5;
    // 土木一般4年，往前推4年
    civilGrade.value = today.getFullYear() - 4;
    // 研究生一般3年，往前推3年
    graduateGrade.value = today.getFullYear() - 3;
    
    // 默认不勾选"隐藏已完成"选项，显示所有班级
    hideCompletedSwitch.checked = false;
    
    console.log('设置默认年级筛选:', {
        architectureGrade: architectureGrade.value,
        civilGrade: civilGrade.value,
        graduateGrade: graduateGrade.value,
        hideCompleted: hideCompletedSwitch.checked
    });
    
    // 创建空预览表格
    createEmptyPreview();
}

// 创建空预览表格
function createEmptyPreview() {
    // 获取当前标题或使用默认格式化日期
    const titleText = titleInput.value || (() => {
        const today = new Date();
        const month = today.getMonth() + 1; // 月份
        const day = today.getDate(); // 日期
        return `${month}月${day}日团籍注册数据通报`;
    })();
    
    previewTable.innerHTML = `
        <table>
            <tr><th colspan="7" style="font-size: 14px; font-weight: bold; text-align: center;">${titleText}</th></tr>
            <tr>
                <th style="font-weight: bold; text-align: center;">年级</th>
                <th style="font-weight: bold; text-align: center;">组织名称</th>
                <th style="font-weight: bold; text-align: center;">应评议数</th>
                <th style="font-weight: bold; text-align: center;">应评已评率</th>
                <th style="font-weight: bold; text-align: center;">应注册数</th>
                <th style="font-weight: bold; text-align: center;">未注册数</th>
                <th style="font-weight: bold; text-align: center;">完成注册率</th>
            </tr>
            <tr><td colspan="7" style="text-align: center; color: #999; padding: 20px;">请选择并导入Excel文件</td></tr>
        </table>
    `;
}

// 从组织名称中提取年级
function extractGrade(org) {
    // 提取连续的4位数字作为年级
    const yearMatch = org.match(/(\d{4})/);
    if (yearMatch) {
        return parseInt(yearMatch[1]);
    }
    
    // 特殊情况：如果只有2位数字，可能是缩写形式（如"20级"表示"2020级"）
    const shortYearMatch = org.match(/(\d{2})级/);
    if (shortYearMatch) {
        const shortYear = parseInt(shortYearMatch[1]);
        // 假设20表示2020，21表示2021等
        const fullYear = shortYear >= 0 && shortYear <= 99 ? 2000 + shortYear : null;
        return fullYear;
    }
    
    return null;
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('fileName').textContent = file.name;
        importBtn.disabled = false;
    }
}

// 导入数据
async function importData() {
    const file = fileInput.files[0];
    if (!file) return;

    try {
        console.log('开始导入文件:', file.name);
        const data = await readExcelFile(file);
        workbook = data;
        
        // 添加调试日志
        console.log('Excel解析成功，开始处理数据');
        console.log('工作表名称:', workbook.SheetNames);
        
        processData();
        updatePreview();
        
        // 显示导入数据情况
        dataStatus.textContent = `已导入 ${currentData.length} 条数据，过滤后 ${filteredData.length} 条`;
        dataStatus.style.color = '#52c41a';
        
        // 调试信息
        console.log('导入成功，原始数据条数:', currentData.length);
        console.log('过滤后数据条数:', filteredData.length);
        if (filteredData.length > 0) {
            console.log('过滤后数据第一行:', filteredData[0]);
        }
    } catch (error) {
        console.error('导入失败:', error);
        console.error('错误堆栈:', error.stack);
        dataStatus.textContent = '导入失败，请检查文件格式是否正确';
        dataStatus.style.color = '#ff4d4f';
        alert('导入失败，请检查文件格式是否正确: ' + error.message);
    }
}

// 读取Excel文件
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                console.log('文件类型:', file.type);
                console.log('文件大小:', file.size, '字节');
                
                // 检查XLSX对象是否可用
                if (typeof XLSX === 'undefined') {
                    console.error('XLSX库未加载');
                    throw new Error('XLSX库未加载，请刷新页面重试');
                }
                
                const data = new Uint8Array(e.target.result);
                console.log('文件读取完成，开始解析');
                
                // 尝试解析Excel文件
                let options = { type: 'array' };
                
                // 对于xls格式，尝试使用特定的选项
                if (file.name.toLowerCase().endsWith('.xls')) {
                    console.log('检测到xls格式，使用特殊选项');
                    options.cellDates = true;
                    options.cellNF = true;
                    options.cellStyles = true;
                }
                
                const workbook = XLSX.read(data, options);
                console.log('Excel解析成功，工作表数量:', workbook.SheetNames.length);
                console.log('工作表名称:', workbook.SheetNames);
                resolve(workbook);
            } catch (error) {
                console.error('Excel解析错误:', error);
                reject(error);
            }
        };
        reader.onerror = function(e) {
            console.error('文件读取错误:', e);
            reject(new Error('文件读取失败'));
        };
        reader.readAsArrayBuffer(file);
    });
}

// 处理数据
function processData() {
    console.log('开始处理数据');
    if (!workbook) {
        console.error('workbook为空');
        throw new Error('Excel工作簿未加载');
    }

    try {
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        console.log('读取第一个工作表:', workbook.SheetNames[0]);
        
        // 尝试两种方式导入数据
        let jsonData;
        try {
            // 方式1：按行读取，适合标准表格
            console.log('尝试按行读取数据');
            jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            console.log('按行读取结果:', jsonData.length > 0 ? '成功' : '失败');
            
            // 如果表头为空或第一行数据为空，尝试方式2
            if (!jsonData.length || !jsonData[0].length) {
                console.warn('表头为空，尝试方式2');
                throw new Error('表头为空');
            }
            
            // 获取表头
            const headers = jsonData[0];
            console.log('检测到表头:', headers);
            
            // 处理数据行
            currentData = jsonData.slice(1).map(row => {
                const item = {};
                headers.forEach((header, index) => {
                    if (header) {
                        item[header] = row[index] || '';
                    }
                });
                return item;
            }).filter(item => Object.keys(item).length > 0);
            
            console.log('按行读取成功，获取数据行数:', currentData.length);
        } catch (error) {
            console.warn('按行读取失败，尝试直接读取:', error);
            
            // 方式2：直接读取，适合带表头的数据
            try {
                console.log('尝试直接读取数据');
                const options = {
                    raw: false,
                    dateNF: 'yyyy-mm-dd',
                    defval: ''
                };
                currentData = XLSX.utils.sheet_to_json(firstSheet, options);
                console.log('直接读取成功，获取数据行数:', currentData.length);
            } catch (err) {
                console.error('所有读取方式均失败:', err);
                throw new Error('无法读取Excel数据，请检查文件格式');
            }
        }
        
        // 检查是否成功读取到数据
        if (!currentData.length) {
            console.error('未读取到有效数据');
            throw new Error('未读取到有效数据，请检查文件内容');
        }
        
        console.log('读取到的数据第一行:', currentData[0]);
        
        // 标准化字段名称并直接替换当前数据
        currentData = standardizeFieldNames(currentData);
        console.log('字段标准化后第一行:', currentData[0]);
        
        // 过滤数据
        filterData();
    } catch (error) {
        console.error('处理数据时出错:', error);
        throw error;
    }
}

// 标准化字段名称
function standardizeFieldNames(data) {
    if (!data || !data.length) {
        console.warn('没有数据可标准化');
        return [];
    }
    
    console.log('原始数据第一行:', data[0]);
    console.log('原始数据字段名:', Object.keys(data[0]));
    
    // 应用字段映射
    return data.map((item, index) => {
        try {
            const newItem = {};
            
            // 检查原始字段是否存在
            const hasOrgName = 'organization_name' in item || '组织名称' in item;
            const hasAssessCount = 'should_assess_count' in item || '应评议数' in item;
            const hasAssessRate = 'assess_rate' in item || '应评已评率' in item;
            const hasRegisterCount = 'should_register_count' in item || '应进行年度注册团员数' in item;
            const hasUnregisterCount = 'unregister_count' in item || '未注册团员数' in item;
            const hasCompletionRate = 'completion_rate' in item || '完成团员年度注册率' in item;
            
            console.log(`行 ${index} 字段检查:`, {
                hasOrgName, hasAssessCount, hasAssessRate, 
                hasRegisterCount, hasUnregisterCount, hasCompletionRate
            });
            
            // 组织名称 - 可能的字段名包括 organization_name
            newItem['组织名称'] = item['组织名称'] || item['organization_name'] || '';
            
            // 应评议数
            newItem['应评议数'] = item['应评议数'] || item['should_assess_count'] || '';
            
            // 应评已评率
            newItem['应评已评率'] = item['应评已评率'] || item['assess_rate'] || '';
            
            // 应注册数
            newItem['应注册数'] = item['应进行年度注册团员数'] || item['should_register_count'] || '';
            
            // 未注册数
            newItem['未注册数'] = item['未注册团员数'] || item['unregister_count'] || '';
            
            // 完成注册率
            let completionRate = '';
            const rateValue = item['完成团员年度注册率'] || item['completion_rate'] || '';
            
            if (typeof rateValue === 'string') {
                completionRate = rateValue;
            } else if (typeof rateValue === 'number') {
                completionRate = String(rateValue);
            }
            
            // 确保百分比格式一致
            if (completionRate && typeof completionRate === 'string' && !completionRate.includes('%')) {
                completionRate += '%';
            }
            
            newItem['完成注册率'] = completionRate;
            
            // 记录映射结果
            if (index === 0) {
                console.log('标准化后的字段:', newItem);
            }
            
            return newItem;
        } catch (err) {
            console.error('处理数据行时出错:', err, '原始数据:', item);
            return {
                '组织名称': item['组织名称'] || item['organization_name'] || '',
                '应评议数': '',
                '应评已评率': '',
                '应注册数': '',
                '未注册数': '',
                '完成注册率': ''
            };
        }
    });
}

// 过滤数据
function filterData() {
    try {
        // 获取年级设置和隐藏已完成设置
        const architectureGradeValue = parseInt(architectureGrade.value);
        const civilGradeValue = parseInt(civilGrade.value);
        const graduateGradeValue = parseInt(graduateGrade.value);
        const hideCompleted = hideCompletedSwitch.checked;

        console.log('开始过滤数据，设置:', {
            architectureGrade: architectureGradeValue,
            civilGrade: civilGradeValue,
            graduateGrade: graduateGradeValue,
            hideCompleted: hideCompleted
        });
        
        console.log('过滤前数据量:', currentData.length);
        
        // 先简单打印几条数据，看看格式
        if (currentData.length > 0) {
            console.log('数据示例：');
            console.log(currentData[0]);
            if (currentData.length > 1) {
                console.log(currentData[1]);
            }
        }

        // 应用年级过滤和隐藏已完成的过滤
        filteredData = currentData
            .filter(item => {
                const orgName = item['组织名称'] || '';
                if (!orgName) return false;
                
                // 过滤掉特殊团支部和团委
                if (SPECIAL_BRANCHES.includes(orgName) || orgName === COMMITTEE) return false;
                
                // 如果启用了隐藏已完成的选项，检查是否全部完成
                if (hideCompleted) {
                    // 从字段获取数据
                    const unregistered = parseFloat(item['未注册数'] || 0);
                    let completionRate = 0;
                    
                    const rateValue = item['完成注册率'] || '';
                    if (typeof rateValue === 'string') {
                        // 提取百分比中的数字部分
                        const matches = rateValue.match(/(\d+(\.\d+)?)/);
                        completionRate = matches ? parseFloat(matches[1]) : 0;
                    } else if (typeof rateValue === 'number') {
                        completionRate = rateValue;
                    }
                    
                    if (unregistered === 0 || completionRate === 100) {
                        return false;
                    }
                }
                
                // 应用年级过滤
                const grade = extractGrade(orgName);
                if (!grade) {
                    console.log(`未识别年级的组织: ${orgName}，默认通过`);
                    return true; // 无法确定年级的保留
                }
                
                console.log(`检查组织 ${orgName} 年级: ${grade}`);
                
                // 根据不同专业应用不同的年级过滤标准
                if (orgName.includes('研究生')) {
                    const isPass = grade >= graduateGradeValue;
                    console.log(`研究生组织 ${orgName}, 年级 ${grade}, 最低年级限制 ${graduateGradeValue}, 通过: ${isPass}`);
                    return isPass;
                }
                
                if (orgName.includes('建筑学')) {
                    const isPass = grade >= architectureGradeValue;
                    console.log(`建筑学组织 ${orgName}, 年级 ${grade}, 最低年级限制 ${architectureGradeValue}, 通过: ${isPass}`);
                    return isPass;
                }
                
                if (orgName.includes('水利水电') || orgName.includes('土木')) {
                    const isPass = grade >= civilGradeValue;
                    console.log(`土木/水利组织 ${orgName}, 年级 ${grade}, 最低年级限制 ${civilGradeValue}, 通过: ${isPass}`);
                    return isPass;
                }
                
                // 其他情况使用土木工程的年级限制作为默认
                const isPass = grade >= civilGradeValue;
                console.log(`其他组织 ${orgName}, 年级 ${grade}, 使用土木限制 ${civilGradeValue}, 通过: ${isPass}`);
                return isPass;
            })
            .map(item => {
                const newItem = {};
                
                // 提取组织名称
                const orgName = item['组织名称'] || '';
                
                // 记录年级
                const grade = extractGrade(orgName);
                newItem['年级'] = grade ? `${grade}级` : '';
                
                // 处理组织名称
                newItem['组织名称'] = orgName.replace(COLLEGE_NAME, '');
                
                // 直接映射固定字段 - 确保0值显示为"0"而不是空白
                newItem['应评议数'] = formatNumberOrEmpty(item['应评议数']);
                newItem['应评已评率'] = formatNumberOrEmpty(item['应评已评率']);
                newItem['应注册数'] = formatNumberOrEmpty(item['应注册数']);
                newItem['未注册数'] = formatNumberOrEmpty(item['未注册数']);
                newItem['完成注册率'] = formatCompletionRate(item['完成注册率']);

                return newItem;
            })
            .sort((a, b) => {
                // 按年级和组织名称排序
                const gradeA = extractGrade(a['组织名称']) || 0;
                const gradeB = extractGrade(b['组织名称']) || 0;
                
                if (gradeA !== gradeB) return gradeA - gradeB;
                
                return a['组织名称'].localeCompare(b['组织名称'], 'zh-CN');
            });
            
        console.log('过滤完成，过滤前:', currentData.length, '过滤后:', filteredData.length);
        if (filteredData.length > 0) {
            console.log('过滤后数据示例:', filteredData[0]);
        }
    } catch (error) {
        console.error('过滤数据时发生错误:', error);
        filteredData = [];
    }
}

// 格式化数字或空值，确保0显示为"0"
function formatNumberOrEmpty(value) {
    if (value === 0 || value === '0') return '0';
    if (value === undefined || value === null || value === '') return '0';
    
    // 尝试转换为数字
    const num = parseFloat(value);
    if (!isNaN(num)) {
        // 如果是0，返回"0"
        if (num === 0) return '0';
        // 否则返回原始值的字符串
        return String(value);
    }
    
    return value || '0';
}

// 格式化完成率，确保带有百分号
function formatCompletionRate(rate) {
    if (rate === undefined || rate === null || rate === '') return '0%';
    
    // 已经是字符串并且包含百分号
    if (typeof rate === 'string' && rate.includes('%')) return rate;
    
    // 尝试转换为数字
    const num = parseFloat(rate);
    if (!isNaN(num)) {
        // 如果是0，返回"0%"
        if (num === 0) return '0%';
        // 否则添加百分号
        return num + '%';
    }
    
    // 如果是字符串但不包含百分号，添加百分号
    if (typeof rate === 'string' && rate.trim() !== '') return rate + '%';
    
    return '0%';
}

// 更新预览
function updatePreview() {
    console.log('更新预览表格');
    if (!workbook) {
        console.log('没有数据可预览');
        createEmptyPreview();
        return;
    }

    try {
        // 重新处理数据以应用过滤器
        processData();
        
        // 提取所有年级并为每个年级分配颜色
        const grades = [...new Set(filteredData.map(row => extractGrade(row['组织名称'])).filter(Boolean))].sort();
        const gradeColors = Object.fromEntries(grades.map((grade, index) => [grade, COLOR_PALETTE[index % COLOR_PALETTE.length]]));
        
        console.log('检测到以下年级:', grades);
        console.log('年级颜色映射:', gradeColors);
        
        // 获取当前标题
        const titleText = titleInput.value;
        
        // 生成表格行
        const tableRows = filteredData.map(item => {
            const grade = extractGrade(item['组织名称']);
            const bgColor = grade ? gradeColors[grade] : '';
            
            return `
                <tr style="background-color: ${bgColor}">
                    <td style="text-align: center;">${item['年级'] || ''}</td>
                    <td style="text-align: center;">${item['组织名称'] || ''}</td>
                    <td style="text-align: center;">${item['应评议数'] || '0'}</td>
                    <td style="text-align: center;">${item['应评已评率'] || '0'}</td>
                    <td style="text-align: center;">${item['应注册数'] || '0'}</td>
                    <td style="text-align: center;">${item['未注册数'] || '0'}</td>
                    <td style="text-align: center;">${item['完成注册率'] || '0%'}</td>
                </tr>
            `;
        }).join('');

        // 生成完整表格
        previewTable.innerHTML = `
            <table>
                <tr><th colspan="7" style="font-size: 14px; font-weight: bold; text-align: center;">${titleText}</th></tr>
                <tr>
                    <th style="font-weight: bold; text-align: center;">年级</th>
                    <th style="font-weight: bold; text-align: center;">组织名称</th>
                    <th style="font-weight: bold; text-align: center;">应评议数</th>
                    <th style="font-weight: bold; text-align: center;">应评已评率</th>
                    <th style="font-weight: bold; text-align: center;">应注册数</th>
                    <th style="font-weight: bold; text-align: center;">未注册数</th>
                    <th style="font-weight: bold; text-align: center;">完成注册率</th>
                </tr>
                ${tableRows || '<tr><td colspan="7" style="text-align: center; color: #999; padding: 20px;">没有符合条件的数据</td></tr>'}
            </table>
        `;

        // 更新导出按钮状态
        const hasData = filteredData.length > 0;
        exportBtn.disabled = !hasData;
        exportPdfBtn.disabled = !hasData;
        
        console.log('预览表格更新完成，显示', filteredData.length, '行数据');
    } catch (error) {
        console.error('更新预览失败:', error);
        alert('更新预览失败: ' + error.message);
    }
}

// 导出到Excel
function exportToExcel() {
    if (!filteredData.length) return;

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 准备数据
    const data = [
        [titleInput.value],
        ['年级', '组织名称', '应评议数', '应评已评率', '应注册数', '未注册数', '完成注册率'],
        ...filteredData.map(item => [
            item['年级'] || '',
            item['组织名称'] || '',
            item['应评议数'] || '0',
            item['应评已评率'] || '0',
            item['应注册数'] || '0',
            item['未注册数'] || '0',
            item['完成注册率'] || '0%'
        ])
    ];

    // 创建工作表
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // 设置列宽
    ws['!cols'] = [
        { wch: 10 }, // 年级
        { wch: 30 }, // 组织名称
        { wch: 12 }, // 应评议数
        { wch: 12 }, // 应评已评率
        { wch: 12 }, // 应注册数
        { wch: 12 }, // 未注册数
        { wch: 12 }  // 完成注册率
    ];
    
    // 合并标题单元格
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
    
    // 提取年级并为每个年级分配颜色
    const grades = [...new Set(filteredData.map(row => extractGrade(row['组织名称'])).filter(Boolean))];
    const gradeColors = Object.fromEntries(grades.map((grade, index) => [
        grade, COLOR_PALETTE[index % COLOR_PALETTE.length].replace('#', '')
    ]));
    
    // 应用单元格样式
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
                // 应用年级颜色
                if (C === 0) { // 年级列
                    const gradeValue = data[R][0];
                    if (gradeValue) {
                        const grade = extractGrade(gradeValue);
                        if (grade && gradeColors[grade]) {
                            baseStyle.fill = {
                                patternType: 'solid',
                                fgColor: { rgb: gradeColors[grade] }
                            };
                        }
                    }
                } else if (C === 1) { // 组织名称列
                    const orgName = data[R][1];
                    if (orgName) {
                        const grade = extractGrade(orgName);
                        if (grade && gradeColors[grade]) {
                            baseStyle.fill = {
                                patternType: 'solid',
                                fgColor: { rgb: gradeColors[grade] }
                            };
                        }
                    }
                    baseStyle.alignment.horizontal = 'left';
                }
            }

            if (!ws[cellRef].s) ws[cellRef].s = {};
            Object.assign(ws[cellRef].s, baseStyle);
        }
    }
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '团籍注册数据');
    
    // 导出文件
    // 获取当前日期作为文件名格式
    const today = new Date();
    const month = today.getMonth() + 1; // 月份
    const day = today.getDate(); // 日期
    
    // 导出Excel文件
    const filename = `${month}月${day}日团籍注册数据通报.xlsx`;
    XLSX.writeFile(wb, filename);
}

// 导出到PDF
async function exportToPdf() {
    if (!filteredData.length) return;

    try {
        // 显示加载提示
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255, 255, 255, 0.9); display: flex; justify-content: center; align-items: center; z-index: 9999;';
        loadingDiv.innerHTML = '<div style="padding: 20px; background: #fff; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">正在生成PDF，请稍候...</div>';
        document.body.appendChild(loadingDiv);

        // 获取当前日期作为文件名格式
        const today = new Date();
        const month = today.getMonth() + 1; // 月份
        const day = today.getDate(); // 日期
        
        // 创建临时元素
        const element = document.createElement('div');
        element.style.cssText = 'width: 210mm; background: white; padding: 10mm;';
        
        // 复制预览表格内容
        element.innerHTML = `
            <style>
                table { width: 100%; border-collapse: collapse; font-size: 12px; page-break-inside: avoid; }
                th, td { border: 1px solid black; padding: 6px; text-align: center; }
                th { background-color: white !important; font-weight: bold; }
                tr:first-child th { font-size: 16px; padding: 8px; }
            </style>
            ${previewTable.innerHTML}
        `;

        // 添加到文档以计算高度
        document.body.appendChild(element);
        const contentHeight = element.offsetHeight;
        document.body.removeChild(element);

        // 设置PDF选项
        const opt = {
            filename: `${month}月${day}日团籍注册数据通报.pdf`,
            margin: 0,
            image: { type: 'jpeg', quality: 1 },
            html2canvas: { scale: 2, useCORS: true, scrollX: 0, scrollY: 0 },
            jsPDF: { unit: 'mm', format: [210, (contentHeight * 15) / 96], orientation: 'portrait' }
        };

        // 生成PDF
        await html2pdf().set(opt).from(element).save();
        
        // 移除加载提示
        document.body.removeChild(loadingDiv);
    } catch (error) {
        console.error('导出PDF时出错:', error);
        alert('导出PDF失败: ' + error.message);
    }
}

// 显示教程
function showTutorial() {
    tutorialModal.style.display = 'flex';
}

// 关闭教程
function closeTutorial() {
    tutorialModal.style.display = 'none';
}

// 显示关于
function showAbout() {
    aboutModal.style.display = 'flex';
}

// 关闭关于
function closeAbout() {
    aboutModal.style.display = 'none';
}

// 关闭移动设备提示
function closeMobileWarning() {
    mobileWarning.style.display = 'none';
}

// 检查是否为移动设备
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init); 