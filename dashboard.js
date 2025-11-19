/**
 * 水利团学工作台 - 简约版
 * 主要JavaScript文件
 */

// 工具函数
const utils = {
    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                func.apply(context, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // 文本截断
    truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    
    // 图标类名映射
    getIconClass(iconName) {
        const iconMap = {
            tools: 'fa-solid fa-tools',
            star: 'fa-solid fa-star',
            default: 'fa-solid fa-link'
        };
        return iconMap[iconName] || iconMap.default;
    }
};

// 网站基本信息初始化
function initSiteInfo() {
    const { siteInfo } = dashboardConfig;
    
    // 更新标题和描述
    document.title = siteInfo.title;
    const titleElement = document.getElementById('site-title');
    const subtitleElement = document.getElementById('site-subtitle');
    const copyrightElement = document.getElementById('copyright');
    const beianElement = document.getElementById('beian-link');
    
    if (titleElement) titleElement.textContent = siteInfo.title;
    if (subtitleElement) subtitleElement.textContent = siteInfo.subtitle;
    if (copyrightElement) copyrightElement.textContent = siteInfo.footer.text;
    if (beianElement) {
        beianElement.textContent = siteInfo.footer.beian;
        beianElement.href = siteInfo.footer.beianLink;
    }
}

// 创建快捷访问区域
function createQuickAccess() {
    const quickAccessContainer = document.getElementById('quick-access');
    const { quickAccess } = dashboardConfig;
    
    if (!quickAccess || quickAccess.length === 0) {
        quickAccessContainer.style.display = 'none';
        return;
    }
    
    quickAccess.forEach(item => {
        const iconClass = utils.getIconClass(item.icon);
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'quick-link';
        link.innerHTML = `<i class="${iconClass}"></i><span>${item.name}</span>`;
        
        if (item.external) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
        
        quickAccessContainer.appendChild(link);
    });
}

// 创建主导航区域
function createMainContent() {
    const mainContent = document.getElementById('main-content');
    const { tools } = dashboardConfig;
    
    // 移除加载指示器
    const loadingIndicator = mainContent.querySelector('.loading-indicator');
    if (loadingIndicator) {
        mainContent.removeChild(loadingIndicator);
    }
    
    if (!tools || tools.length === 0) {
        mainContent.innerHTML = '<div class="empty-state">暂无工具</div>';
        return;
    }
    
    // 创建工具网格容器
    const itemsGrid = document.createElement('div');
    itemsGrid.className = 'items-grid';
    
    // 添加所有工具
    tools.forEach(item => {
        const navItem = createNavItem(item);
        itemsGrid.appendChild(navItem);
    });
    
    mainContent.appendChild(itemsGrid);
}

// 创建导航项
function createNavItem(item) {
    const navItem = document.createElement('a');
    navItem.className = 'nav-item';
    
    // 根据设备调整描述文本长度
    const isMobile = window.innerWidth < 768;
    const descriptionText = isMobile ? 
        utils.truncateText(item.description, 40) : 
        item.description;
    
    if (item.status === 0) {
        navItem.classList.add('developing');
        navItem.href = 'javascript:void(0)';
        navItem.onclick = showDevModal;
        navItem.innerHTML = `
            <h3>${item.name}</h3>
            <p>${descriptionText}</p>
            <span class="status-tag dev">开发中</span>
        `;
        navItem.setAttribute('aria-label', `${item.name}（功能开发中）`);
    } else {
        navItem.href = item.url;
        
        if (item.external) {
            navItem.target = '_blank';
            navItem.rel = 'noopener noreferrer';
            navItem.innerHTML = `
                <h3>${item.name}</h3>
                <p>${descriptionText}</p>
                <span class="status-tag external">外部链接</span>
            `;
            navItem.setAttribute('aria-label', `${item.name}（外部链接）`);
        } else {
            // 为内部链接也添加标签，保持一致性
            navItem.innerHTML = `
                <h3>${item.name}</h3>
                <p>${descriptionText}</p>
                <span class="status-tag internal">内部工具</span>
            `;
            navItem.setAttribute('aria-label', `${item.name}（内部工具）`);
        }
    }

    return navItem;
}

// 禁用全局复制功能
function disableCopy() {
    // 禁用右键复制
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // 禁用Ctrl+C、Ctrl+X等快捷键
    document.addEventListener('keydown', function(e) {
        // 检查是否按下了Ctrl键（或Cmd键在Mac上）以及C、X、V、A等键
        if ((e.ctrlKey || e.metaKey) && 
            (e.keyCode === 67 || e.keyCode === 88 || e.keyCode === 86 || e.keyCode === 65)) {
            e.preventDefault();
            return false;
        }
        
        // 禁用F12开发者工具
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        
        // 禁用Ctrl+Shift+I（开发者工具）
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        
        // 禁用Ctrl+U（查看页面源代码）
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
    });

    // 禁用文本选择
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });

    // 禁用拖拽
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
}

// 显示"开发中"模态框
function showDevModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('dev-modal');
    if (modal) {
        modal.classList.add('active');
        
        // 点击背景关闭
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeDevModal();
            }
        });
        
        // ESC键关闭
        const closeOnEscape = (e) => {
            if (e.key === 'Escape') {
                closeDevModal();
                document.removeEventListener('keydown', closeOnEscape);
            }
        };
        document.addEventListener('keydown', closeOnEscape);
    }
}

// 关闭"开发中"模态框
function closeDevModal() {
    const modal = document.getElementById('dev-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}



// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 禁用复制功能
    disableCopy();
    
    // 基本信息初始化
    initSiteInfo();
    
    // 创建页面内容
    createQuickAccess();
    createMainContent();
});