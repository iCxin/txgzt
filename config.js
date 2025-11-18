/**
 * 水利团学工作台配置文件
 * 在此文件中配置所有导航链接和分类
 */

const dashboardConfig = {
    // 站点基本信息
    siteInfo: {
        title: "水利团学工作台",
        subtitle: "团学工作便捷导航与工具箱",
        logo: "", // Logo图片路径
        footer: {
            text: "©️2024-2025 SCAU水利与土木工程学院团委学生会. All Rights Reserved.",
            beian: "蜀ICP备2024051667号",
            beianLink: "https://beian.miit.gov.cn/"
        }
    },
    
    // 导航分类和链接
    categories: [
        
        {
            id: "dept",
            name: "工作台",
            icon: "link",
            items: [
                {
                    name: "工作安排",
                    description: "上报各部门及工作人员近期工作安排情况，便于安排集体工作。",
                    url: "https://example.com/tw",
                    status: 0,
    
                },
                {
                    name: "请假备案",
                    description: "全体会议、集体活动、办公室值班请假需要填写纸质版请假条后上传到系统备案，同时纸质版提交到部门负责人。",
                    url: "https://example.com/xsgz",
                    status: 0,
                
                },
                {
                    name: "活动备案",
                    description: "各部门、社团举办会议/活动后，在此上报正式新闻稿、推文链接、会议纪要以及盖章版活动证明进行备案。",
                    url: "https://example.com/qq",
                    status: 0,
                   
                },
                {
                    name: "通讯录",
                    description: "各部门、社团和班级团支书通讯录，便于联系，需要密码授权访问。",
                    url: "https://example.com/qq",
                    status: 0,
                   
                }
            ]
        },
        {
            id: "tools",
            name: "便捷工具",
            icon: "tools", // 图标名称，对应CSS中的图标
            items: [
                {
                    name: "活动证明生成",
                    description: "快速生成规范的活动证明，一键导出",
                    url: "tools/hdzm",
                    status: 1 // 1表示已完成，0表示开发中
                },
                {
                    name: "签到表生成",
                    description: "一键生成活动签到表，支持PDF导出",
                    url: "tools/qdb",
                    status: 1
                },
                {
                    name: "团费整理",
                    description: "自动整理团费数据，快速生成团费通报",
                    url: "tools/tf",
                    status: 1
                },
                {
                    name: "团籍注册整理",
                    description: "自动整理年度评议、团籍注册数据，快速生成通报",
                    url: "tools/tj",
                    status: 1
                },
                {
                    name: "微信接龙对比",
                    description: "对比微信接龙数据，快速查看谁没接龙",
                    url: "tools/long",
                    status: 1
                },
                {
                    name: "毕业生转接整理",
                    description: "自动整理毕业生转接数据，快速生成转接通报",
                    url: "tools/bys",
                    status: 0
                },
                {
                    name: "公示生成",
                    description: "一键生成院网公示，支持Word、PDF导出",
                    url: "tools/gs",
                    status: 0
                },
                {
                    name: "扫描全能王",
                    description: "比较好用的扫描软件，大学生认证免费领会员。",
                    url: "https://www.camscanner.com/app/eduAuth?from=share&from_part=undefined",
                    status: 1
                },
                {
                    name: "WPS华农版",
                    description: "学校信网中心购买的WPS，学号认证之后可以免费用会员功能。",
                    url: "https://mp.weixin.qq.com/s/2-6t1rxVUyT1UDVDSMvwPQ",
                    status: 1
                },
            ]
        },
        {
            id: "resources",
            name: "资源下载",
            icon: "download",
            items: [
                {
                    name: "团学文件模板",
                    description: "常用团学工作文件模板下载",
                    url: "resources/templates.html",
                    status: 1
                },
                {
                    name: "团学工作手册",
                    description: "团学工作指导手册及规程下载",
                    url: "resources/manual.html",
                    status: 0
                },
                {
                    name: "历届资料",
                    description: "往届团学工作相关资料归档",
                    url: "resources/archive.html",
                    status: 0
                }
            ]
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
        },
    ]
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = dashboardConfig;
} 