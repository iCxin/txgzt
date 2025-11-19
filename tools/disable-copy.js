/**
 * 禁用复制功能
 * 用于在所有工具页面中禁用复制、右键菜单等功能
 */

(function() {
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
})();