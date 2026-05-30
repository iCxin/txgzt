document.addEventListener('DOMContentLoaded', function() {
    const solitaireDataTextarea = document.getElementById('solitaireData');
    const fullListTextarea = document.getElementById('fullList');
    const compareBtn = document.getElementById('compareBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultList = document.getElementById('resultList');
    const presetListSelect = document.getElementById('presetListSelect');
    const savePresetBtn = document.getElementById('savePresetBtn');
    const deletePresetBtn = document.getElementById('deletePresetBtn');

    // 示例数据，方便测试
    const exampleSolitaireData = `#接龙
已加入入团积极分子培训群

1. 23水利3班张三
2. 23水利1李四
3. 24土木6班王五
4. 24土木1赵六
5. 24土木一班孙七
6. 23土木6班 周八
7. 24研究生班吴九
8. 24土木1班郑十
9. 23建筑1钱一
10. 24水利3冯二
11. 24土木5班朱三
12. 23水利3班秦四
13. 24研究生许五
14. 23土木3魏六
15. 24土木3蒋七
16. 24水利3班沈八
17. 24建筑1班韩九
18. 24研究生杨十
19. 24土木4班胡一
20. 24土木3班刘二
21. 24水利2班 陈三
22. 24建筑2林四
23. 24水利3班 黄五
24. 24水利1班曹六`;

    const exampleFullList = `钱一
李四
秦四
魏六
周八
韩九
林四
曹六
陈三
黄五
冯二
沈八
赵六
郑十
孙七
刘二
蒋七
胡一
朱三
王五
许五
吴九
杨十`;

    // 点击示例按钮填充示例数据
    document.addEventListener('dblclick', function(e) {
        if (e.target === solitaireDataTextarea && !solitaireDataTextarea.value) {
            solitaireDataTextarea.value = exampleSolitaireData;
        } else if (e.target === fullListTextarea && !fullListTextarea.value) {
            fullListTextarea.value = exampleFullList;
        }
    });

    // 比较功能
    compareBtn.addEventListener('click', function() {
        const solitaireData = solitaireDataTextarea.value.trim();
        const fullList = fullListTextarea.value.trim();

        if (!solitaireData || !fullList) {
            alert('请填写微信接龙数据和完整名单！');
            return;
        }

        const missingPeople = compareLists(solitaireData, fullList);
        displayResults(missingPeople);
    });

    // 清空按钮
    clearBtn.addEventListener('click', function() {
        solitaireDataTextarea.value = '';
        fullListTextarea.value = '';
        resultList.innerHTML = '';
    });

    // 核心比较函数
    function compareLists(solitaireData, fullList) {
        // 处理完整名单
        const nameList = fullList.split('\n')
            .map(name => name.trim())
            .filter(name => name.length > 0);
        
        // 处理接龙数据，提取名字
        const solitaireLines = solitaireData.split('\n');
        const solitaireNames = [];
        
        // 正则表达式匹配接龙中的名字（带序号的行）
        const nameRegex = /^\d+[\.\s、]+(.+)$/;
        
        for (const line of solitaireLines) {
            const match = line.trim().match(nameRegex);
            if (match && match[1]) {
                const content = match[1].trim();
                // 从内容中提取名字（通常是最后2-3个字）
                const extractedNames = extractNameFromContent(content, nameList);
                if (extractedNames.length > 0) {
                    solitaireNames.push(...extractedNames);
                }
            }
        }
        
        // 找出未接龙的人
        const missingPeople = nameList.filter(name => !solitaireNames.includes(name));
        
        return missingPeople;
    }

    // 从内容中提取名字的函数
    function extractNameFromContent(content, nameList) {
        // 直接检查内容是否包含名单中的名字
        const foundNames = [];
        for (const name of nameList) {
            if (content.includes(name)) {
                foundNames.push(name);
            }
        }
        return foundNames;
    }

    // 显示结果
    function displayResults(missingPeople) {
        resultList.innerHTML = '';
        
        if (missingPeople.length === 0) {
            resultList.innerHTML = '<p>所有人都已接龙！</p>';
            return;
        }
        
        missingPeople.forEach(name => {
            const nameElement = document.createElement('div');
            nameElement.classList.add('result-item');
            nameElement.textContent = name;
            resultList.appendChild(nameElement);
        });
    }

    // 预设名单相关
    function getPresets() {
        return JSON.parse(localStorage.getItem('fullListPresets') || '{}');
    }
    function setPresets(presets) {
        localStorage.setItem('fullListPresets', JSON.stringify(presets));
    }
    function refreshPresetSelect() {
        const presets = getPresets();
        presetListSelect.innerHTML = '<option value="">选择预设名单</option>';
        Object.keys(presets).forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            presetListSelect.appendChild(option);
        });
    }
    // 选择预设名单，填充输入框
    presetListSelect.addEventListener('change', function() {
        const presets = getPresets();
        const selected = presetListSelect.value;
        if (selected && presets[selected]) {
            fullListTextarea.value = presets[selected];
        }
    });
    // modal相关
    const presetModal = document.getElementById('presetModal');
    const presetNameInput = document.getElementById('presetNameInput');
    const modalConfirmBtn = document.getElementById('modalConfirmBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    let modalSaveCallback = null;
    function showPresetModal(callback) {
        presetModal.style.display = 'flex';
        presetNameInput.value = '';
        presetNameInput.focus();
        modalSaveCallback = callback;
    }
    function hidePresetModal() {
        presetModal.style.display = 'none';
        modalSaveCallback = null;
    }
    modalCancelBtn.onclick = hidePresetModal;
    modalConfirmBtn.onclick = function() {
        const name = presetNameInput.value.trim();
        if (!name) {
            presetNameInput.focus();
            return;
        }
        if (modalSaveCallback) modalSaveCallback(name);
        hidePresetModal();
    };
    presetNameInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') modalConfirmBtn.click();
    });
    // 通用消息弹窗
    const msgModal = document.getElementById('msgModal');
    const msgModalText = document.getElementById('msgModalText');
    const msgModalConfirmBtn = document.getElementById('msgModalConfirmBtn');
    function showMsgModal(msg, callback) {
        msgModalText.textContent = msg;
        msgModal.style.display = 'flex';
        msgModalConfirmBtn.focus();
        function close() {
            msgModal.style.display = 'none';
            msgModalConfirmBtn.removeEventListener('click', onClick);
            msgModalConfirmBtn.removeEventListener('keydown', onKey);
            if (callback) callback();
        }
        function onClick() { close(); }
        function onKey(e) { if (e.key === 'Enter' || e.key === ' ') close(); }
        msgModalConfirmBtn.addEventListener('click', onClick);
        msgModalConfirmBtn.addEventListener('keydown', onKey);
    }
    // 保存为预设（用自定义弹窗）
    savePresetBtn.addEventListener('click', function() {
        const content = fullListTextarea.value.trim();
        if (!content) {
            showMsgModal('完整名单为空，无法保存为预设！');
            return;
        }
        showPresetModal(function(name) {
            const presets = getPresets();
            presets[name] = content;
            setPresets(presets);
            refreshPresetSelect();
            presetListSelect.value = name;
            showMsgModal('预设名单已保存！');
        });
    });
    // 删除预设
    deletePresetBtn.addEventListener('click', function() {
        const selected = presetListSelect.value;
        if (!selected) {
            alert('请先选择要删除的预设名单');
            return;
        }
        if (!confirm('确定要删除预设名单"' + selected + '"吗？')) return;
        const presets = getPresets();
        delete presets[selected];
        setPresets(presets);
        refreshPresetSelect();
        presetListSelect.value = '';
        alert('已删除');
    });
    // 页面加载时刷新下拉框
    refreshPresetSelect();
});

// 新增复制按钮点击事件
document.getElementById('copyBtn').addEventListener('click', () => {
    const resultItems = document.querySelectorAll('#resultList .result-item');
    if (resultItems.length === 0) {
        alert('当前没有需要复制的未接龙人员');
        return;
    }
    
    // 提取所有未接龙人员姓名（去除序号和班级信息）
    const names = Array.from(resultItems).map(item => {
        return item.textContent.replace(/^\d+\.\s*/, ''); // 正则去除序号前缀
    });
    
    // 复制到剪贴板
    navigator.clipboard.writeText(names.join('\n'))
        .then(() => alert('未接龙人员名单已成功复制到剪贴板'))
        .catch(() => alert('复制失败，请重试'));
});