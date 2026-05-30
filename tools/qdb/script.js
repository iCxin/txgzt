// 每页显示的最大行数（两列布局时总行数）
let ROWS_PER_PAGE = 54;
let ROWS_PER_COLUMN = 27;

// 当前页码
let currentPage = 1;
let totalPages = 1;
let signInData = [];

// 缩放相关变量
let currentZoom = 1;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

// 创建表格HTML
function createTableHTML(data) {
    return `
        <thead>
            <tr>
                <th>姓名</th>
                <th>行政班级</th>
                <th>签到</th>
            </tr>
        </thead>
        <tbody>
            ${data.map(row => `
                <tr>
                    <td>${row['姓名'] || ''}</td>
                    <td>${row['行政班级'] || ''}</td>
                    <td></td>
                </tr>
            `).join('')}
        </tbody>
    `;
}

// 创建签到表页面
function createSignInPage(title, tableData) {
    const page = document.createElement('div');
    page.className = 'certificate-page';
    
    // 添加标题
    const titleElement = document.createElement('h1');
    titleElement.textContent = title;
    page.appendChild(titleElement);
    
    // 创建表格容器
    const tablesContainer = document.createElement('div');
    tablesContainer.className = 'tables-container';
    
    // 判断是否需要两列布局
    if (tableData.length > ROWS_PER_COLUMN) {
        // 左列表格
        const leftColumn = document.createElement('div');
        leftColumn.className = 'table-column';
        const leftTable = document.createElement('table');
        leftTable.innerHTML = createTableHTML(tableData.slice(0, ROWS_PER_COLUMN));
        leftColumn.appendChild(leftTable);
        
        // 右列表格
        const rightColumn = document.createElement('div');
        rightColumn.className = 'table-column';
        const rightTable = document.createElement('table');
        rightTable.innerHTML = createTableHTML(tableData.slice(ROWS_PER_COLUMN));
        rightColumn.appendChild(rightTable);
        
        tablesContainer.appendChild(leftColumn);
        tablesContainer.appendChild(rightColumn);
    } else {
        // 单列表格
        const singleColumn = document.createElement('div');
        singleColumn.className = 'table-column';
        const table = document.createElement('table');
        table.innerHTML = createTableHTML(tableData);
        singleColumn.appendChild(table);
        tablesContainer.appendChild(singleColumn);
    }
    
    page.appendChild(tablesContainer);
    return page;
}

// 更新预览
function updatePreview() {
    const container = document.querySelector('.certificate-pages');
    const title = document.getElementById('title').value;
    
    if (!signInData.length) {
        // 创建空预览
        const emptyPage = createEmptyPreviewPage();
        container.innerHTML = '';
        container.appendChild(emptyPage);
        emptyPage.classList.add('active');
        return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 计算总页数
    totalPages = Math.ceil(signInData.length / ROWS_PER_PAGE);
    
    // 创建所有页面
    for (let i = 0; i < totalPages; i++) {
        const startIdx = i * ROWS_PER_PAGE;
        const endIdx = Math.min(startIdx + ROWS_PER_PAGE, signInData.length);
        const pageData = signInData.slice(startIdx, endIdx);
        
        const page = createSignInPage(title, pageData);
        container.appendChild(page);
        
        if (i === currentPage - 1) {
            page.classList.add('active');
        }
    }
    
    // 更新分页控制
    updatePaginationControls();
    
    // 应用当前缩放
    applyZoom();
    
    // 启用打印按钮
    document.querySelector('.print-btn').disabled = false;
}

// 创建空预览页面
function createEmptyPreviewPage() {
    const page = document.createElement('div');
    page.className = 'certificate-page';
    
    const title = document.getElementById('title').value || '签到表';
    
    page.innerHTML = `
        <h1>${title}</h1>
        <div class="tables-container">
            <div class="table-column">
                <table>
                    <thead>
                        <tr>
                            <th>姓名</th>
                            <th>行政班级</th>
                            <th>签到</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colspan="3" class="empty-hint">请导入数据</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    return page;
}

// 设置事件监听器
function setupEventListeners() {
    // 选择文件按钮
    document.getElementById('selectFileBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });

    // 文件选择处理
    document.getElementById('fileInput').addEventListener('change', (event) => {
        const file = event.target.files[0];
        const fileName = document.getElementById('fileName');
        if (file) {
            fileName.textContent = file.name;
            fileName.style.color = '#52c41a';  // 设置为绿色
            document.getElementById('importBtn').disabled = false;
        } else {
            fileName.textContent = '请选择文件：要求为包含姓名、行政班级的表格';
            fileName.style.color = '#ff4d4f';  // 恢复默认颜色
            document.getElementById('importBtn').disabled = true;
        }
    });

    // 导入按钮
    document.getElementById('importBtn').addEventListener('click', importExcel);
}

// 导入Excel文件
function importExcel() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const importBtn = document.getElementById('importBtn');
    const dataStatus = document.getElementById('dataStatus');
    const fileName = document.getElementById('fileName');
    
    if (!file) {
        alert('请先选择文件');
        return;
    }
    
    // 禁用导入按钮并显示加载状态
    importBtn.disabled = true;
    dataStatus.textContent = '正在导入数据...';
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            let jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            if (jsonData.length === 0) {
                throw new Error('表格中没有数据');
            }
            
            // 验证必要的列
            const requiredColumns = ['姓名', '行政班级'];
            const missingColumns = requiredColumns.filter(col => 
                !jsonData.some(row => col in row)
            );
            
            if (missingColumns.length > 0) {
                throw new Error(`缺少必要的列：${missingColumns.join(', ')}`);
            }

            // 对数据进行排序：先按班级排序，班级相同则按姓名排序
            jsonData.sort((a, b) => {
                const classCompare = a['行政班级'].localeCompare(b['行政班级'], 'zh-CN');
                if (classCompare !== 0) {
                    return classCompare;
                }
                return a['姓名'].localeCompare(b['姓名'], 'zh-CN');
            });
            
            // 更新数据
            signInData = jsonData;
            dataStatus.textContent = `已成功导入 ${jsonData.length} 条数据`;
            dataStatus.style.color = '#52c41a';
            fileName.style.color = '#52c41a';
            
            // 重置页码
            currentPage = 1;
            
            // 更新预览
            updatePreview();
            
        } catch (error) {
            console.error('导入错误:', error);
            dataStatus.textContent = '导入失败：' + (error.message || '文件格式错误');
            dataStatus.style.color = '#ff4d4f';
            fileName.style.color = '#ff4d4f';
            fileName.textContent = '请选择文件：要求为包含姓名、行政班级的表格';
            importBtn.disabled = false;
        }
    };
    
    reader.onerror = function() {
        dataStatus.textContent = '文件读取失败';
        dataStatus.style.color = '#ff4d4f';
        fileName.style.color = '#ff4d4f';
        fileName.textContent = '请选择文件：要求为包含姓名、行政班级的表格';
        importBtn.disabled = false;
    };
    
    reader.readAsArrayBuffer(file);
}

// 更新分页控制
function updatePaginationControls() {
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
    
    // 更新页面显示
    document.querySelectorAll('.certificate-page').forEach((page, index) => {
        if (index === currentPage - 1) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
}

// 更新缩放级别显示
function updateZoomLevel() {
    document.querySelector('.zoom-level').textContent = `${Math.round(currentZoom * 100)}%`;
}

// 应用缩放
function applyZoom() {
    document.querySelectorAll('.certificate-page').forEach(page => {
        page.style.transform = `scale(${currentZoom})`;
    });
}

// 缩放控制
function changeZoom(direction) {
    if (direction === 'in' && currentZoom < MAX_ZOOM) {
        currentZoom = Math.min(currentZoom + ZOOM_STEP, MAX_ZOOM);
    } else if (direction === 'out' && currentZoom > MIN_ZOOM) {
        currentZoom = Math.max(currentZoom - ZOOM_STEP, MIN_ZOOM);
    }
    updateZoomLevel();
    applyZoom();
}

// 重置缩放
function resetZoom() {
    currentZoom = 1;
    updateZoomLevel();
    applyZoom();
}

// 初始化页面时自动调整缩放以适应窗口
function initializeZoom() {
    const container = document.querySelector('.certificate-pages');
    const page = document.querySelector('.certificate-page');
    if (!container || !page) return;

    const containerHeight = container.clientHeight - 48;
    const containerWidth = container.clientWidth - 48;
    const pageHeight = 297;
    const pageWidth = 210;

    const heightRatio = containerHeight / pageHeight;
    const widthRatio = containerWidth / pageWidth;
    currentZoom = Math.min(heightRatio, widthRatio, 1) * 0.95;

    updateZoomLevel();
    applyZoom();
}

// 显示教程弹窗
function showTutorial() {
    document.getElementById('tutorialModal').classList.add('active');
}

// 关闭教程弹窗
function closeTutorial() {
    document.getElementById('tutorialModal').classList.remove('active');
}

// 显示关于弹窗
function showAbout() {
    document.getElementById('aboutModal').classList.add('active');
}

// 关闭关于弹窗
function closeAbout() {
    document.getElementById('aboutModal').classList.remove('active');
}

// 关闭移动设备提示
function closeMobileWarning() {
    const warning = document.getElementById('mobileWarning');
    if (warning) {
        warning.style.display = 'none';
    }
}

// 检查是否需要显示移动设备提示
function checkMobileWarning() {
    if (window.innerWidth <= 768) {
        document.getElementById('mobileWarning').style.display = 'flex';
    }
}

// 调整每页行数
function adjustRows(action) {
    const input = document.getElementById('rowsPerPage');
    let value = parseInt(input.value);
    
    if (action === 'increase') {
        value = Math.min(value + 1, 100);
    } else {
        value = Math.max(value - 1, 1);
    }
    
    updateRowsPerPage(value);
}

// 更新每页行数
function updateRowsPerPage(value) {
    const newValue = Math.max(1, Math.min(parseInt(value) || 27, 100));
    document.getElementById('rowsPerPage').value = newValue;
    
    // 更新行数变量
    ROWS_PER_COLUMN = newValue;
    ROWS_PER_PAGE = newValue * 2;
    
    // 重新计算总页数和更新预览
    if (signInData.length > 0) {
        const oldPage = currentPage;
        const oldTotalPages = totalPages;
        totalPages = Math.ceil(signInData.length / ROWS_PER_PAGE);
        
        // 如果当前页超出新的总页数，则调整到最后一页
        currentPage = Math.min(oldPage, totalPages);
        
        // 更新预览
        updatePreview();
        
        // 如果总页数没有变化，恢复到原来的页码
        if (oldTotalPages === totalPages && oldPage <= totalPages) {
            currentPage = oldPage;
            updatePaginationControls();
        }
    }
}

// 初始化页面
function initializePage() {
    // 设置默认文件名提示
    document.getElementById('fileName').textContent = '请选择文件：要求为包含姓名、行政班级的表格';
    
    // 创建初始预览
    updatePreview();
    
    // 设置事件监听器
    setupEventListeners();
    
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePaginationControls();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePaginationControls();
        }
    });
    
    document.getElementById('title').addEventListener('input', () => {
        updatePreview();
    });
    
    // 初始化缩放
    initializeZoom();
    
    // 检查移动设备
    checkMobileWarning();
    
    // 设置默认行数
    document.getElementById('rowsPerPage').value = ROWS_PER_COLUMN;
}

// 初始化
document.addEventListener('DOMContentLoaded', initializePage);

// 窗口大小改变时重新调整缩放
window.addEventListener('resize', () => {
    initializeZoom();
    checkMobileWarning();
}); 