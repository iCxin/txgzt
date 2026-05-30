// 工具列表数据
const tools = [
    {
        id: 'activity-cert',
        title: '活动证明生成',
        description: '快速生成规范的活动证明，一键导出，让活动证明制作更加便捷。',
        url: 'hdzm',
        status: 1 // 1表示已完成，0表示开发中
    },
    {
        id: 'sign-in',
        title: '签到表生成',
        description: '一键生成活动签到表，支持PDF导出。',
        url: 'qdb',
        status: 1
    },
    {
        id: 'fee-manage',
        title: '团费整理',
        description: '自动整理团费数据，快速生成团费通报。',
        url: 'tf',
        status: 1
    },
    {
        id: 'annual-review',
        title: '团籍注册整理',
        description: '自动整理年度评议、团籍注册数据，快速生成团籍注册通报。',
        url: 'tj',
        status: 1
    },
    {
        id: 'graduate-transfer',
        title: '毕业生转接整理',
        description: '自动整理毕业生转接数据，快速生成毕业生转接通报。',
        url: 'bys',
        status: 0
    },
    {
        id: 'fee-manage',
        title: '公示生成',
        description: '一键生成院网公示，支持Word、PDF导出。',
        url: 'gs',
        status: 0
    },

    // 在此处添加新工具，格式如下：
    // {
    //     id: '工具唯一标识',
    //     title: '工具名称',
    //     description: '工具描述',
    //     url: '工具目录/index.html',
    //     status: 1 // 1表示已完成，0表示开发中
    // }
];

// 生成工具卡片
function renderTools() {
    const toolsGrid = document.getElementById('toolsGrid');
    toolsGrid.innerHTML = tools.map(tool => `
        <a href="${tool.status ? tool.url : 'javascript:void(0)'}" 
           class="tool-card ${tool.status ? '' : 'developing'}" 
           data-tool-id="${tool.id}"
           ${tool.status ? '' : 'onclick="showDevModal(event)"'}>
            <h2 class="tool-title">${tool.title}</h2>
            <p class="tool-desc">${tool.description}</p>
            ${tool.status ? '' : '<span class="dev-tag">开发中</span>'}
        </a>
    `).join('');
}

// 显示开发中提示弹窗
function showDevModal(event) {
    event.preventDefault();
    document.getElementById('devModal').classList.add('active');
}

// 关闭开发中提示弹窗
function closeDevModal() {
    document.getElementById('devModal').classList.remove('active');
}

// 页面加载完成后渲染工具列表
document.addEventListener('DOMContentLoaded', renderTools); 