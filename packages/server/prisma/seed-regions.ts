import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 中国省市区数据（精简版，包含主要省份和城市）
const regionsData = [
    // 北京市
    { id: 110000, name: '北京市', parentId: null, level: 1, pinyin: 'beijing', lat: 39.9042, lng: 116.4074 },
    { id: 110100, name: '北京市', parentId: 110000, level: 2, pinyin: 'beijing', lat: 39.9042, lng: 116.4074 },
    { id: 110101, name: '东城区', parentId: 110100, level: 3, pinyin: 'dongcheng', lat: 39.9289, lng: 116.4160 },
    { id: 110102, name: '西城区', parentId: 110100, level: 3, pinyin: 'xicheng', lat: 39.9125, lng: 116.3660 },
    { id: 110105, name: '朝阳区', parentId: 110100, level: 3, pinyin: 'chaoyang', lat: 39.9215, lng: 116.4435 },
    { id: 110106, name: '丰台区', parentId: 110100, level: 3, pinyin: 'fengtai', lat: 39.8585, lng: 116.2870 },
    { id: 110108, name: '海淀区', parentId: 110100, level: 3, pinyin: 'haidian', lat: 39.9590, lng: 116.2980 },

    // 上海市
    { id: 310000, name: '上海市', parentId: null, level: 1, pinyin: 'shanghai', lat: 31.2304, lng: 121.4737 },
    { id: 310100, name: '上海市', parentId: 310000, level: 2, pinyin: 'shanghai', lat: 31.2304, lng: 121.4737 },
    { id: 310101, name: '黄浦区', parentId: 310100, level: 3, pinyin: 'huangpu', lat: 31.2319, lng: 121.4846 },
    { id: 310104, name: '徐汇区', parentId: 310100, level: 3, pinyin: 'xuhui', lat: 31.1884, lng: 121.4365 },
    { id: 310105, name: '长宁区', parentId: 310100, level: 3, pinyin: 'changning', lat: 31.2204, lng: 121.4247 },
    { id: 310106, name: '静安区', parentId: 310100, level: 3, pinyin: 'jingan', lat: 31.2286, lng: 121.4480 },
    { id: 310107, name: '普陀区', parentId: 310100, level: 3, pinyin: 'putuo', lat: 31.2495, lng: 121.3970 },
    { id: 310115, name: '浦东新区', parentId: 310100, level: 3, pinyin: 'pudong', lat: 31.2214, lng: 121.5447 },

    // 广东省
    { id: 440000, name: '广东省', parentId: null, level: 1, pinyin: 'guangdong', lat: 23.1291, lng: 113.2644 },
    { id: 440100, name: '广州市', parentId: 440000, level: 2, pinyin: 'guangzhou', lat: 23.1291, lng: 113.2644 },
    { id: 440103, name: '荔湾区', parentId: 440100, level: 3, pinyin: 'liwan', lat: 23.1259, lng: 113.2440 },
    { id: 440104, name: '越秀区', parentId: 440100, level: 3, pinyin: 'yuexiu', lat: 23.1289, lng: 113.2668 },
    { id: 440105, name: '海珠区', parentId: 440100, level: 3, pinyin: 'haizhu', lat: 23.0839, lng: 113.3170 },
    { id: 440106, name: '天河区', parentId: 440100, level: 3, pinyin: 'tianhe', lat: 23.1249, lng: 113.3612 },
    { id: 440111, name: '白云区', parentId: 440100, level: 3, pinyin: 'baiyun', lat: 23.1647, lng: 113.2730 },
    { id: 440300, name: '深圳市', parentId: 440000, level: 2, pinyin: 'shenzhen', lat: 22.5431, lng: 114.0579 },
    { id: 440303, name: '罗湖区', parentId: 440300, level: 3, pinyin: 'luohu', lat: 22.5482, lng: 114.1315 },
    { id: 440304, name: '福田区', parentId: 440300, level: 3, pinyin: 'futian', lat: 22.5219, lng: 114.0545 },
    { id: 440305, name: '南山区', parentId: 440300, level: 3, pinyin: 'nanshan', lat: 22.5329, lng: 113.9305 },
    { id: 440306, name: '宝安区', parentId: 440300, level: 3, pinyin: 'baoan', lat: 22.5553, lng: 113.8830 },
    { id: 440307, name: '龙岗区', parentId: 440300, level: 3, pinyin: 'longgang', lat: 22.7209, lng: 114.2470 },

    // 江苏省
    { id: 320000, name: '江苏省', parentId: null, level: 1, pinyin: 'jiangsu', lat: 32.0617, lng: 118.7633 },
    { id: 320100, name: '南京市', parentId: 320000, level: 2, pinyin: 'nanjing', lat: 32.0617, lng: 118.7633 },
    { id: 320102, name: '玄武区', parentId: 320100, level: 3, pinyin: 'xuanwu', lat: 32.0486, lng: 118.7978 },
    { id: 320104, name: '秦淮区', parentId: 320100, level: 3, pinyin: 'qinhuai', lat: 32.0339, lng: 118.7946 },
    { id: 320105, name: '建邺区', parentId: 320100, level: 3, pinyin: 'jianye', lat: 32.0035, lng: 118.7320 },
    { id: 320106, name: '鼓楼区', parentId: 320100, level: 3, pinyin: 'gulou', lat: 32.0660, lng: 118.7697 },
    { id: 320500, name: '苏州市', parentId: 320000, level: 2, pinyin: 'suzhou', lat: 31.2990, lng: 120.5853 },
    { id: 320505, name: '虎丘区', parentId: 320500, level: 3, pinyin: 'huqiu', lat: 31.2956, lng: 120.5716 },
    { id: 320506, name: '吴中区', parentId: 320500, level: 3, pinyin: 'wuzhong', lat: 31.2627, lng: 120.6320 },
    { id: 320507, name: '相城区', parentId: 320500, level: 3, pinyin: 'xiangcheng', lat: 31.3690, lng: 120.6423 },
    { id: 320508, name: '姑苏区', parentId: 320500, level: 3, pinyin: 'gusu', lat: 31.3116, lng: 120.6170 },
    { id: 320509, name: '吴江区', parentId: 320500, level: 3, pinyin: 'wujiang', lat: 31.1380, lng: 120.6450 },
    { id: 320585, name: '昆山市', parentId: 320500, level: 3, pinyin: 'kunshan', lat: 31.3847, lng: 120.9808 },

    // 浙江省
    { id: 330000, name: '浙江省', parentId: null, level: 1, pinyin: 'zhejiang', lat: 30.2741, lng: 120.1551 },
    { id: 330100, name: '杭州市', parentId: 330000, level: 2, pinyin: 'hangzhou', lat: 30.2741, lng: 120.1551 },
    { id: 330102, name: '上城区', parentId: 330100, level: 3, pinyin: 'shangcheng', lat: 30.2425, lng: 120.1693 },
    { id: 330105, name: '拱墅区', parentId: 330100, level: 3, pinyin: 'gongshu', lat: 30.3197, lng: 120.1415 },
    { id: 330106, name: '西湖区', parentId: 330100, level: 3, pinyin: 'xihu', lat: 30.2594, lng: 120.1300 },
    { id: 330108, name: '滨江区', parentId: 330100, level: 3, pinyin: 'binjiang', lat: 30.2084, lng: 120.2120 },
    { id: 330109, name: '萧山区', parentId: 330100, level: 3, pinyin: 'xiaoshan', lat: 30.1833, lng: 120.2643 },
    { id: 330110, name: '余杭区', parentId: 330100, level: 3, pinyin: 'yuhang', lat: 30.4189, lng: 120.2990 },

    // 四川省
    { id: 510000, name: '四川省', parentId: null, level: 1, pinyin: 'sichuan', lat: 30.6598, lng: 104.0657 },
    { id: 510100, name: '成都市', parentId: 510000, level: 2, pinyin: 'chengdu', lat: 30.6598, lng: 104.0657 },
    { id: 510104, name: '锦江区', parentId: 510100, level: 3, pinyin: 'jinjiang', lat: 30.6538, lng: 104.0833 },
    { id: 510105, name: '青羊区', parentId: 510100, level: 3, pinyin: 'qingyang', lat: 30.6739, lng: 104.0612 },
    { id: 510106, name: '金牛区', parentId: 510100, level: 3, pinyin: 'jinniu', lat: 30.6913, lng: 104.0517 },
    { id: 510107, name: '武侯区', parentId: 510100, level: 3, pinyin: 'wuhou', lat: 30.6420, lng: 104.0430 },
    { id: 510108, name: '成华区', parentId: 510100, level: 3, pinyin: 'chenghua', lat: 30.6599, lng: 104.1018 },
    { id: 510116, name: '双流区', parentId: 510100, level: 3, pinyin: 'shuangliu', lat: 30.5744, lng: 103.9237 },

    // 湖北省
    { id: 420000, name: '湖北省', parentId: null, level: 1, pinyin: 'hubei', lat: 30.5928, lng: 114.3055 },
    { id: 420100, name: '武汉市', parentId: 420000, level: 2, pinyin: 'wuhan', lat: 30.5928, lng: 114.3055 },
    { id: 420102, name: '江岸区', parentId: 420100, level: 3, pinyin: 'jiangan', lat: 30.6000, lng: 114.3093 },
    { id: 420103, name: '江汉区', parentId: 420100, level: 3, pinyin: 'jianghan', lat: 30.6015, lng: 114.2706 },
    { id: 420104, name: '硚口区', parentId: 420100, level: 3, pinyin: 'qiaokou', lat: 30.5767, lng: 114.2150 },
    { id: 420105, name: '汉阳区', parentId: 420100, level: 3, pinyin: 'hanyang', lat: 30.5495, lng: 114.2190 },
    { id: 420106, name: '武昌区', parentId: 420100, level: 3, pinyin: 'wuchang', lat: 30.5575, lng: 114.3160 },

    // 山东省
    { id: 370000, name: '山东省', parentId: null, level: 1, pinyin: 'shandong', lat: 36.6683, lng: 117.0204 },
    { id: 370100, name: '济南市', parentId: 370000, level: 2, pinyin: 'jinan', lat: 36.6683, lng: 117.0204 },
    { id: 370102, name: '历下区', parentId: 370100, level: 3, pinyin: 'lixia', lat: 36.6667, lng: 117.0768 },
    { id: 370103, name: '市中区', parentId: 370100, level: 3, pinyin: 'shizhong', lat: 36.6512, lng: 116.9972 },
    { id: 370104, name: '槐荫区', parentId: 370100, level: 3, pinyin: 'huaiyin', lat: 36.6516, lng: 116.9010 },
    { id: 370105, name: '天桥区', parentId: 370100, level: 3, pinyin: 'tianqiao', lat: 36.6780, lng: 116.9870 },
    { id: 370200, name: '青岛市', parentId: 370000, level: 2, pinyin: 'qingdao', lat: 36.0671, lng: 120.3826 },
    { id: 370202, name: '市南区', parentId: 370200, level: 3, pinyin: 'shinan', lat: 36.0755, lng: 120.3950 },
    { id: 370203, name: '市北区', parentId: 370200, level: 3, pinyin: 'shibei', lat: 36.0872, lng: 120.3748 },
    { id: 370211, name: '黄岛区', parentId: 370200, level: 3, pinyin: 'huangdao', lat: 35.9603, lng: 120.1980 },
    { id: 370212, name: '崂山区', parentId: 370200, level: 3, pinyin: 'laoshan', lat: 36.1073, lng: 120.4680 },

    // 河南省
    { id: 410000, name: '河南省', parentId: null, level: 1, pinyin: 'henan', lat: 34.7466, lng: 113.6254 },
    { id: 410100, name: '郑州市', parentId: 410000, level: 2, pinyin: 'zhengzhou', lat: 34.7466, lng: 113.6254 },
    { id: 410102, name: '中原区', parentId: 410100, level: 3, pinyin: 'zhongyuan', lat: 34.7482, lng: 113.6130 },
    { id: 410103, name: '二七区', parentId: 410100, level: 3, pinyin: 'erqi', lat: 34.7263, lng: 113.6400 },
    { id: 410104, name: '管城回族区', parentId: 410100, level: 3, pinyin: 'guancheng', lat: 34.7538, lng: 113.6770 },
    { id: 410105, name: '金水区', parentId: 410100, level: 3, pinyin: 'jinshui', lat: 34.8002, lng: 113.6605 },

    // 天津市
    { id: 120000, name: '天津市', parentId: null, level: 1, pinyin: 'tianjin', lat: 39.0842, lng: 117.2009 },
    { id: 120100, name: '天津市', parentId: 120000, level: 2, pinyin: 'tianjin', lat: 39.0842, lng: 117.2009 },
    { id: 120101, name: '和平区', parentId: 120100, level: 3, pinyin: 'heping', lat: 39.1172, lng: 117.2149 },
    { id: 120102, name: '河东区', parentId: 120100, level: 3, pinyin: 'hedong', lat: 39.1283, lng: 117.2523 },
    { id: 120103, name: '河西区', parentId: 120100, level: 3, pinyin: 'hexi', lat: 39.1094, lng: 117.2233 },
    { id: 120104, name: '南开区', parentId: 120100, level: 3, pinyin: 'nankai', lat: 39.1381, lng: 117.1506 },
    { id: 120105, name: '河北区', parentId: 120100, level: 3, pinyin: 'hebei', lat: 39.1479, lng: 117.1963 },

    // 重庆市
    { id: 500000, name: '重庆市', parentId: null, level: 1, pinyin: 'chongqing', lat: 29.5630, lng: 106.5516 },
    { id: 500100, name: '重庆市', parentId: 500000, level: 2, pinyin: 'chongqing', lat: 29.5630, lng: 106.5516 },
    { id: 500101, name: '万州区', parentId: 500100, level: 3, pinyin: 'wanzhou', lat: 30.8078, lng: 108.4089 },
    { id: 500103, name: '渝中区', parentId: 500100, level: 3, pinyin: 'yuzhong', lat: 29.5528, lng: 106.5690 },
    { id: 500104, name: '大渡口区', parentId: 500100, level: 3, pinyin: 'dadukou', lat: 29.4843, lng: 106.4826 },
    { id: 500105, name: '江北区', parentId: 500100, level: 3, pinyin: 'jiangbei', lat: 29.6066, lng: 106.5740 },
    { id: 500106, name: '沙坪坝区', parentId: 500100, level: 3, pinyin: 'shapingba', lat: 29.5411, lng: 106.4542 },
    { id: 500107, name: '九龙坡区', parentId: 500100, level: 3, pinyin: 'jiulongpo', lat: 29.5020, lng: 106.5107 },
    { id: 500108, name: '南岸区', parentId: 500100, level: 3, pinyin: 'nanan', lat: 29.5230, lng: 106.5635 },
]

async function seedRegions() {
    console.log('🌍 开始导入行政区划数据...')

    // 清空现有数据
    await prisma.region.deleteMany()

    // 批量插入
    for (const region of regionsData) {
        await prisma.region.create({
            data: region,
        })
    }

    console.log(`✅ 成功导入 ${regionsData.length} 条行政区划数据`)
}

// 如果直接运行此文件
seedRegions()
    .catch((e) => {
        console.error('❌ 导入失败:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

export { seedRegions }
