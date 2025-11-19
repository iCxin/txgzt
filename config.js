/**
 * 水利团学工作台配置文件
 * 在此文件中配置所有导航链接和分类
 */

const dashboardConfig = {
    // 站点基本信息
    siteInfo: {
        title: "学生便捷工作站",
        subtitle: "学生工作便捷工具集合",
        logo: "", // Logo图片路径
        footer: {
            text: ""
        }
    },
    
    // 工具列表 - 直接展示所有工具
    tools: [
        {
            name: "活动证明生成",
            description: "快速生成规范的活动证明，一键导出PDF。",
            url: "tools/hdzm",
            status: 1
        },
        {
            name: "签到表生成",
            description: "一键生成活动签到表，支持PDF导出。",
            url: "tools/qdb",
            status: 1
        },
        {
            name: "团费整理",
            description: "自动整理团费数据，快速生成团费通报。",
            url: "tools/tf",
            status: 1
        },
        {
            name: "团籍注册整理",
            description: "自动整理年度评议、团籍注册数据，快速生成通报。",
            url: "tools/tj",
            status: 1
        },
        {
            name: "微信接龙对比",
            description: "对比微信接龙数据，快速查看谁没接龙。",
            url: "tools/long",
            status: 1
        },
        {
            name: "扫描全能王",
            description: "比较好用的扫描软件，大学生认证免费领会员。",
            url: "https://www.camscanner.com/app/eduAuth?from=share&from_part=undefined",
            status: 1,
            external: true
        },
        {
            name: "WPS华农版",
            description: "学号认证之后可以免费用部分会员功能。",
            url: "https://mp.weixin.qq.com/s/2-6t1rxVUyT1UDVDSMvwPQ",
            status: 1,
            external: true
        }
    ],
    
    // 快捷入口（展示在顶部的重要链接）
    quickAccess: [
        {
            name: "智慧团建",
            icon: "star",
            url: "https://tuan.12355.net/",
            external: true
        },
        {
            name: "学院官网",
            icon: "star",
            url: "https://wcce.scau.edu.cn/",
            external: true
        }
    ]
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = dashboardConfig;
}