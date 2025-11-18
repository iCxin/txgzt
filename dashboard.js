/**
 * 水利团学工作台导航站
 * 主要JavaScript文件
 * 响应式优化版 2.0
 */

// 全局变量与设备检测
const isMobile = window.innerWidth < 768;
const isTablet = window.innerWidth >= 768 && window.innerWidth < 992;
const isLandscape = window.matchMedia('(orientation: landscape)').matches;

// 工具函数集
const utils = {
    // 防抖函数
    debounce(func, wait, immediate) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
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
            tools: 'fa-solid fa-toolbox',
            link: 'fa-solid fa-link',
            download: 'fa-solid fa-download',
            star: 'fa-solid fa-star',
            study: 'fa-solid fa-book',
            volunteer: 'fa-solid fa-hands-helping',
            school: 'fa-solid fa-school',
            compass: 'fa-solid fa-compass',
            chart: 'fa-solid fa-chart-line',
            tasks: 'fa-solid fa-tasks',
            users: 'fa-solid fa-users',
            calendar: 'fa-solid fa-calendar-alt',
            file: 'fa-solid fa-file-alt',
            dashboard: 'fa-solid fa-tachometer-alt',
            tools: 'fa-solid fa-tools',
            book: 'fa-solid fa-book',
            graduation: 'fa-solid fa-graduation-cap',
            default: 'fa-solid fa-circle'
        };
        
        return iconMap[iconName] || iconMap.default;
    }
};

// 网站基本信息初始化
function initSiteInfo() {
    const { siteInfo } = dashboardConfig;
    
    // 更新标题和描述
    document.title = siteInfo.title;
    document.getElementById('site-title').textContent = siteInfo.title;
    document.getElementById('site-subtitle').textContent = siteInfo.subtitle;
    document.getElementById('copyright').textContent = siteInfo.footer.text;
    
    // 更新备案信息
    const beianLink = document.getElementById('beian-link');
    beianLink.textContent = siteInfo.footer.beian;
    beianLink.href = siteInfo.footer.beianLink;
    
    // 处理自定义logo
    if (siteInfo.logo) {
        const logoImg = document.createElement('img');
        logoImg.src = siteInfo.logo;
        logoImg.alt = siteInfo.title;
        logoImg.classList.add('site-logo');
        
        const logoCircle = document.querySelector('.logo-circle');
        if (logoCircle) {
            logoCircle.innerHTML = '';
            logoCircle.appendChild(logoImg);
        }
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
    
    // 限制移动端显示的快捷链接数量
    const itemsToShow = isMobile ? Math.min(quickAccess.length, 4) : quickAccess.length;
    const displayedItems = quickAccess.slice(0, itemsToShow);
    
    displayedItems.forEach((item) => {
        const iconClass = utils.getIconClass(item.icon);
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'quick-link';
        
        if (item.external) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.setAttribute('aria-label', `${item.name} (外部链接)`);
        } else {
            link.setAttribute('aria-label', item.name);
        }
        
        // 在移动端简化显示
        if (isMobile) {
            link.innerHTML = `<i class="${iconClass}"></i>`;
            link.title = item.name;
        } else {
            link.innerHTML = `
                <i class="${iconClass}"></i>
                <span>${item.name}</span>
            `;
        }
        
        quickAccessContainer.appendChild(link);
    });
    
    // 如果移动端有更多链接，添加"更多"按钮
    if (isMobile && quickAccess.length > 4) {
        const moreLink = document.createElement('a');
        moreLink.href = 'javascript:void(0)';
        moreLink.className = 'quick-link more-link';
        moreLink.innerHTML = '<i class="fa-solid fa-ellipsis"></i>';
        moreLink.title = '更多';
        moreLink.setAttribute('aria-label', '查看更多快捷链接');
        
        moreLink.addEventListener('click', function() {
            showAllQuickLinks(quickAccess);
        });
        
        quickAccessContainer.appendChild(moreLink);
    }
}

// 显示所有快捷链接（移动端）
function showAllQuickLinks(quickAccess) {
    const modal = document.createElement('div');
    modal.className = 'all-links-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'all-links-content';
    
    // 添加标题
    const modalTitle = document.createElement('h3');
    modalTitle.textContent = '快捷访问';
    modalTitle.style.textAlign = 'center';
    modalTitle.style.marginBottom = '20px';
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
    closeBtn.setAttribute('aria-label', '关闭');
    
    const linksGrid = document.createElement('div');
    linksGrid.className = 'links-grid';
    
    quickAccess.forEach(item => {
        const iconClass = utils.getIconClass(item.icon);
        const link = document.createElement('a');
        link.href = item.url;
        link.className = 'quick-link-grid-item';
        
        if (item.external) {
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        }
        
        link.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${item.name}</span>
        `;
        
        linksGrid.appendChild(link);
    });
    
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(linksGrid);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // 禁用滚动
    document.body.style.overflow = 'hidden';
    
    // 绑定关闭事件
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBtn.click();
        }
    });
    
    // 添加键盘支持
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeBtn.click();
            document.removeEventListener('keydown', escHandler);
        }
    });
}

// 创建主导航区域
function createMainContent() {
    const mainContent = document.getElementById('main-content');
    const { categories } = dashboardConfig;
    
    // 移除加载指示器
    const loadingIndicator = mainContent.querySelector('.loading-indicator');
    if (loadingIndicator) {
        mainContent.removeChild(loadingIndicator);
    }
    
    if (!categories || categories.length === 0) {
        mainContent.innerHTML = '<div class="empty-state">暂无导航内容</div>';
        return;
    }
    
    // 为每个分类创建一个区域
    categories.forEach((category, catIndex) => {
        const categorySection = document.createElement('section');
        categorySection.className = 'category-section';
        categorySection.id = `category-${category.id}`;
        
        // 分类标题
        const iconClass = utils.getIconClass(category.icon);
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        
        // 添加可折叠功能（移动端）
        if (isMobile) {
            categoryHeader.classList.add('collapsible');
            categoryHeader.classList.add('expanded'); // 默认展开状态
        }
        
        categoryHeader.innerHTML = `
            <i class="${iconClass}"></i>
            <h2>${category.name}</h2>
            ${isMobile ? '<i class="fa-solid fa-chevron-up toggle-icon"></i>' : ''}
        `;
        
        // 分类下的导航项
        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'items-grid';
        
        // 在移动端默认显示内容（不折叠）
        if (isMobile) {
            itemsGrid.style.display = 'grid';
        }
        
        if (category.items && category.items.length > 0) {
            // 响应式布局：控制每行的卡片数量
            let gridTemplateColumns;
            if (isMobile) {
                gridTemplateColumns = 'repeat(2, 1fr)'; // 移动端两列
            } else if (isTablet) {
                gridTemplateColumns = 'repeat(2, 1fr)';
            } else {
                // 根据屏幕宽度动态计算，但至少显示2列，最多显示4列
                const columnCount = Math.min(Math.max(Math.floor(window.innerWidth / 320), 2), 4);
                gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
            }
            itemsGrid.style.gridTemplateColumns = gridTemplateColumns;
            
            category.items.forEach((item) => {
                const navItem = createNavItem(item);
                itemsGrid.appendChild(navItem);
            });
        } else {
            itemsGrid.innerHTML = '<div class="empty-category">该分类下暂无内容</div>';
        }
        
        categorySection.appendChild(categoryHeader);
        categorySection.appendChild(itemsGrid);
        mainContent.appendChild(categorySection);
        
        // 为移动端添加折叠/展开功能
        if (isMobile) {
            categoryHeader.addEventListener('click', function() {
                const isExpanded = itemsGrid.style.display !== 'none';
                
                // 切换显示状态
                itemsGrid.style.display = isExpanded ? 'none' : 'grid';
                
                // 切换图标方向
                const toggleIcon = this.querySelector('.toggle-icon');
                if (toggleIcon) {
                    toggleIcon.classList.toggle('fa-chevron-down', isExpanded);
                    toggleIcon.classList.toggle('fa-chevron-up', !isExpanded);
                }
                
                // 切换展开样式
                this.classList.toggle('expanded', !isExpanded);
            });
        }
    });
}

// 创建导航项
function createNavItem(item) {
    const navItem = document.createElement('a');
    navItem.className = 'nav-item';
    
    // 移动端缩短描述文本
    const descriptionText = isMobile ? 
        utils.truncateText(item.description, 35) : 
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
            navItem.innerHTML = `
                <h3>${item.name}</h3>
                <p>${descriptionText}</p>
            `;
            navItem.setAttribute('aria-label', item.name);
        }
    }

    return navItem;
}

// 显示"开发中"模态框
function showDevModal(event) {
    if (event) event.preventDefault();
    document.getElementById('dev-modal').classList.add('active');
    
    // 添加键盘支持
    function closeOnEscape(e) {
        if (e.key === 'Escape') {
            closeDevModal();
            document.removeEventListener('keydown', closeOnEscape);
        }
    }
    
    document.addEventListener('keydown', closeOnEscape);
    
    // 点击背景关闭
    const modal = document.getElementById('dev-modal');
    modal.addEventListener('click', function modalClick(e) {
        if (e.target === this) {
            closeDevModal();
            modal.removeEventListener('click', modalClick);
        }
    });
}

// 关闭"开发中"模态框
function closeDevModal() {
    const modal = document.getElementById('dev-modal');
    modal.classList.remove('active');
}

// 搜索功能
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn');
    
    // 创建搜索结果容器
    const searchResults = document.createElement('div');
    searchResults.className = 'search-results';
    document.querySelector('.search-box').appendChild(searchResults);
    
    // 搜索按钮点击事件
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (query.length === 0) return;
        
        performSearch(query, searchResults);
    });
    
    // 按下回车键搜索
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim().toLowerCase();
            if (query.length === 0) return;
            
            performSearch(query, searchResults);
        }
    });
    
    // 实时搜索（输入时即时显示结果）- 使用防抖提升性能
    searchInput.addEventListener('input', utils.debounce(() => {
        const query = searchInput.value.trim().toLowerCase();
        if (query.length >= 2) { // 至少输入2个字符才开始搜索
            performSearch(query, searchResults);
        } else {
            searchResults.classList.remove('active');
        }
    }, 300));
    
    // 点击文档其他地方关闭搜索结果
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            searchResults.classList.remove('active');
        }
    });
    
    // 添加搜索框焦点动画
    searchInput.addEventListener('focus', () => {
        searchInput.parentElement.classList.add('search-focused');
    });
    
    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.classList.remove('search-focused');
    });
}

// 执行搜索
function performSearch(query, resultsContainer) {
    // 收集所有导航项
    const allItems = [];
    
    dashboardConfig.categories.forEach(category => {
        if (category.items && category.items.length > 0) {
            category.items.forEach(item => {
                allItems.push({
                    ...item,
                    category: category.name
                });
            });
        }
    });
    
    // 添加快捷访问项
    if (dashboardConfig.quickAccess) {
        dashboardConfig.quickAccess.forEach(item => {
            allItems.push({
                ...item,
                category: '快捷访问'
            });
        });
    }
    
    // 搜索匹配 - 移动端限制结果数量
    const maxResults = isMobile ? 5 : 10;
    
    // 基于相关性排序
    const results = allItems.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const descMatch = item.description && item.description.toLowerCase().includes(query);
        return nameMatch || descMatch;
    })
    .sort((a, b) => {
        // 名称匹配优先级高于描述匹配
        const aNameMatch = a.name.toLowerCase().includes(query);
        const bNameMatch = b.name.toLowerCase().includes(query);
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        
        // 名称匹配位置越前排序越靠前
        if (aNameMatch && bNameMatch) {
            return a.name.toLowerCase().indexOf(query) - b.name.toLowerCase().indexOf(query);
        }
        
        return 0;
    })
    .slice(0, maxResults);
    
    // 显示结果
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-result-item">没有找到相关结果</div>';
    } else {
        resultsContainer.innerHTML = results.map((item) => `
            <div class="search-result-item"
                 data-url="${item.url}" 
                 data-status="${item.status || 1}" 
                 data-external="${item.external || false}">
                <h4>${item.name}</h4>
                <p>${item.category} - ${utils.truncateText(item.description || '', isMobile ? 30 : 60)}</p>
            </div>
        `).join('');
        
        // 为搜索结果添加点击事件
        document.querySelectorAll('.search-result-item').forEach(resultItem => {
            resultItem.addEventListener('click', () => {
                const url = resultItem.dataset.url;
                const status = parseInt(resultItem.dataset.status);
                const isExternal = resultItem.dataset.external === 'true';
                
                if (status === 0) {
                    showDevModal();
                } else {
                    if (isExternal) {
                        window.open(url, '_blank');
                    } else {
                        window.location.href = url;
                    }
                }
                
                resultsContainer.classList.remove('active');
            });
        });
    }
    
    resultsContainer.classList.add('active');
    
    // 移动端优化：限制结果容器高度，添加滚动
    if (isMobile) {
        resultsContainer.style.maxHeight = '60vh';
    }
}

// 检查URL中的参数（支持直接搜索）
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    
    if (searchQuery) {
        const searchInput = document.getElementById('search-input');
        const searchResults = document.querySelector('.search-results');
        
        searchInput.value = searchQuery;
        performSearch(searchQuery.toLowerCase(), searchResults);
    }
}

// 初始化回到顶部按钮
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 检测暗色模式并添加相应的类
function detectDarkMode() {
    const checkDarkMode = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode-compatible');
        } else {
            document.body.classList.remove('dark-mode-compatible');
        }
    };
    
    // 初始检查
    checkDarkMode();
    
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', checkDarkMode);
}

// 添加设备适配的视口类
function addViewportClasses() {
    const setViewportClass = () => {
        const width = window.innerWidth;
        const body = document.body;
        
        body.classList.remove('viewport-xs', 'viewport-sm', 'viewport-md', 'viewport-lg', 'viewport-xl');
        
        if (width < 576) {
            body.classList.add('viewport-xs');
        } else if (width < 768) {
            body.classList.add('viewport-sm');
        } else if (width < 992) {
            body.classList.add('viewport-md');
        } else if (width < 1200) {
            body.classList.add('viewport-lg');
        } else {
            body.classList.add('viewport-xl');
        }
        
        if (window.matchMedia('(orientation: landscape)').matches) {
            body.classList.add('landscape');
        } else {
            body.classList.remove('landscape');
        }
    };
    
    // 初始设置
    setViewportClass();
    
    // 监听窗口大小变化
    window.addEventListener('resize', setViewportClass);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 基本信息初始化
    initSiteInfo();
    
    // 创建页面内容
    createQuickAccess();
    createMainContent();
    
    // 搜索功能
    initSearch();
    checkUrlParams();
    
    // 回到顶部按钮
    initBackToTop();
    
    // 暗色模式和设备适配
    detectDarkMode();
    addViewportClasses();
}); 