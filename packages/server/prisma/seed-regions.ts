import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 精简版省市区数据：31个省份 + 5个重点省份完整市区数据
const regionsData = [
    // ========== 北京市（完整）==========
    { id: 110000, name: '北京市', parentId: null, level: 1, pinyin: 'beijing' },
    { id: 110100, name: '北京市', parentId: 110000, level: 2, pinyin: 'beijing' },
    { id: 110101, name: '东城区', parentId: 110100, level: 3, pinyin: 'dongcheng' },
    { id: 110102, name: '西城区', parentId: 110100, level: 3, pinyin: 'xicheng' },
    { id: 110105, name: '朝阳区', parentId: 110100, level: 3, pinyin: 'chaoyang' },
    { id: 110106, name: '丰台区', parentId: 110100, level: 3, pinyin: 'fengtai' },
    { id: 110107, name: '石景山区', parentId: 110100, level: 3, pinyin: 'shijingshan' },
    { id: 110108, name: '海淀区', parentId: 110100, level: 3, pinyin: 'haidian' },
    { id: 110112, name: '通州区', parentId: 110100, level: 3, pinyin: 'tongzhou' },
    { id: 110113, name: '顺义区', parentId: 110100, level: 3, pinyin: 'shunyi' },
    { id: 110114, name: '昌平区', parentId: 110100, level: 3, pinyin: 'changping' },
    { id: 110115, name: '大兴区', parentId: 110100, level: 3, pinyin: 'daxing' },

    // ========== 上海市（完整）==========
    { id: 310000, name: '上海市', parentId: null, level: 1, pinyin: 'shanghai' },
    { id: 310100, name: '上海市', parentId: 310000, level: 2, pinyin: 'shanghai' },
    { id: 310101, name: '黄浦区', parentId: 310100, level: 3, pinyin: 'huangpu' },
    { id: 310104, name: '徐汇区', parentId: 310100, level: 3, pinyin: 'xuhui' },
    { id: 310105, name: '长宁区', parentId: 310100, level: 3, pinyin: 'changning' },
    { id: 310106, name: '静安区', parentId: 310100, level: 3, pinyin: 'jingan' },
    { id: 310107, name: '普陀区', parentId: 310100, level: 3, pinyin: 'putuo' },
    { id: 310109, name: '虹口区', parentId: 310100, level: 3, pinyin: 'hongkou' },
    { id: 310110, name: '杨浦区', parentId: 310100, level: 3, pinyin: 'yangpu' },
    { id: 310112, name: '闵行区', parentId: 310100, level: 3, pinyin: 'minhang' },
    { id: 310113, name: '宝山区', parentId: 310100, level: 3, pinyin: 'baoshan' },
    { id: 310115, name: '浦东新区', parentId: 310100, level: 3, pinyin: 'pudong' },
    { id: 310117, name: '松江区', parentId: 310100, level: 3, pinyin: 'songjiang' },
    { id: 310118, name: '青浦区', parentId: 310100, level: 3, pinyin: 'qingpu' },

    // ========== 天津市 ==========
    { id: 120000, name: '天津市', parentId: null, level: 1, pinyin: 'tianjin' },
    { id: 120100, name: '天津市', parentId: 120000, level: 2, pinyin: 'tianjin' },
    { id: 120101, name: '和平区', parentId: 120100, level: 3, pinyin: 'heping' },
    { id: 120102, name: '河东区', parentId: 120100, level: 3, pinyin: 'hedong' },
    { id: 120104, name: '南开区', parentId: 120100, level: 3, pinyin: 'nankai' },
    { id: 120116, name: '滨海新区', parentId: 120100, level: 3, pinyin: 'binhai' },

    // ========== 重庆市 ==========
    { id: 500000, name: '重庆市', parentId: null, level: 1, pinyin: 'chongqing' },
    { id: 500100, name: '重庆市', parentId: 500000, level: 2, pinyin: 'chongqing' },
    { id: 500103, name: '渝中区', parentId: 500100, level: 3, pinyin: 'yuzhong' },
    { id: 500105, name: '江北区', parentId: 500100, level: 3, pinyin: 'jiangbei' },
    { id: 500106, name: '沙坪坝区', parentId: 500100, level: 3, pinyin: 'shapingba' },
    { id: 500108, name: '南岸区', parentId: 500100, level: 3, pinyin: 'nanan' },

    // ========== 广东省（完整）==========
    { id: 440000, name: '广东省', parentId: null, level: 1, pinyin: 'guangdong' },
    { id: 440100, name: '广州市', parentId: 440000, level: 2, pinyin: 'guangzhou' },
    { id: 440103, name: '荔湾区', parentId: 440100, level: 3, pinyin: 'liwan' },
    { id: 440104, name: '越秀区', parentId: 440100, level: 3, pinyin: 'yuexiu' },
    { id: 440105, name: '海珠区', parentId: 440100, level: 3, pinyin: 'haizhu' },
    { id: 440106, name: '天河区', parentId: 440100, level: 3, pinyin: 'tianhe' },
    { id: 440111, name: '白云区', parentId: 440100, level: 3, pinyin: 'baiyun' },
    { id: 440112, name: '黄埔区', parentId: 440100, level: 3, pinyin: 'huangpu' },
    { id: 440113, name: '番禺区', parentId: 440100, level: 3, pinyin: 'panyu' },
    { id: 440115, name: '南沙区', parentId: 440100, level: 3, pinyin: 'nansha' },
    { id: 440300, name: '深圳市', parentId: 440000, level: 2, pinyin: 'shenzhen' },
    { id: 440303, name: '罗湖区', parentId: 440300, level: 3, pinyin: 'luohu' },
    { id: 440304, name: '福田区', parentId: 440300, level: 3, pinyin: 'futian' },
    { id: 440305, name: '南山区', parentId: 440300, level: 3, pinyin: 'nanshan' },
    { id: 440306, name: '宝安区', parentId: 440300, level: 3, pinyin: 'baoan' },
    { id: 440307, name: '龙岗区', parentId: 440300, level: 3, pinyin: 'longgang' },
    { id: 440309, name: '龙华区', parentId: 440300, level: 3, pinyin: 'longhua' },
    { id: 440311, name: '光明区', parentId: 440300, level: 3, pinyin: 'guangming' },
    { id: 440400, name: '珠海市', parentId: 440000, level: 2, pinyin: 'zhuhai' },
    { id: 440402, name: '香洲区', parentId: 440400, level: 3, pinyin: 'xiangzhou' },
    { id: 440403, name: '斗门区', parentId: 440400, level: 3, pinyin: 'doumen' },
    { id: 440600, name: '佛山市', parentId: 440000, level: 2, pinyin: 'foshan' },
    { id: 440604, name: '禅城区', parentId: 440600, level: 3, pinyin: 'chancheng' },
    { id: 440605, name: '南海区', parentId: 440600, level: 3, pinyin: 'nanhai' },
    { id: 440606, name: '顺德区', parentId: 440600, level: 3, pinyin: 'shunde' },
    { id: 441900, name: '东莞市', parentId: 440000, level: 2, pinyin: 'dongguan' },
    { id: 441901, name: '莞城街道', parentId: 441900, level: 3, pinyin: 'guancheng' },
    { id: 441902, name: '南城街道', parentId: 441900, level: 3, pinyin: 'nancheng' },
    { id: 441300, name: '惠州市', parentId: 440000, level: 2, pinyin: 'huizhou' },
    { id: 441302, name: '惠城区', parentId: 441300, level: 3, pinyin: 'huicheng' },
    { id: 441303, name: '惠阳区', parentId: 441300, level: 3, pinyin: 'huiyang' },

    // ========== 浙江省（完整）==========
    { id: 330000, name: '浙江省', parentId: null, level: 1, pinyin: 'zhejiang' },
    { id: 330100, name: '杭州市', parentId: 330000, level: 2, pinyin: 'hangzhou' },
    { id: 330102, name: '上城区', parentId: 330100, level: 3, pinyin: 'shangcheng' },
    { id: 330105, name: '拱墅区', parentId: 330100, level: 3, pinyin: 'gongshu' },
    { id: 330106, name: '西湖区', parentId: 330100, level: 3, pinyin: 'xihu' },
    { id: 330108, name: '滨江区', parentId: 330100, level: 3, pinyin: 'binjiang' },
    { id: 330109, name: '萧山区', parentId: 330100, level: 3, pinyin: 'xiaoshan' },
    { id: 330110, name: '余杭区', parentId: 330100, level: 3, pinyin: 'yuhang' },
    { id: 330200, name: '宁波市', parentId: 330000, level: 2, pinyin: 'ningbo' },
    { id: 330203, name: '海曙区', parentId: 330200, level: 3, pinyin: 'haishu' },
    { id: 330205, name: '江北区', parentId: 330200, level: 3, pinyin: 'jiangbei' },
    { id: 330212, name: '鄞州区', parentId: 330200, level: 3, pinyin: 'yinzhou' },
    { id: 330300, name: '温州市', parentId: 330000, level: 2, pinyin: 'wenzhou' },
    { id: 330302, name: '鹿城区', parentId: 330300, level: 3, pinyin: 'lucheng' },
    { id: 330303, name: '龙湾区', parentId: 330300, level: 3, pinyin: 'longwan' },

    // ========== 江苏省（完整）==========
    { id: 320000, name: '江苏省', parentId: null, level: 1, pinyin: 'jiangsu' },
    { id: 320100, name: '南京市', parentId: 320000, level: 2, pinyin: 'nanjing' },
    { id: 320102, name: '玄武区', parentId: 320100, level: 3, pinyin: 'xuanwu' },
    { id: 320104, name: '秦淮区', parentId: 320100, level: 3, pinyin: 'qinhuai' },
    { id: 320105, name: '建邺区', parentId: 320100, level: 3, pinyin: 'jianye' },
    { id: 320106, name: '鼓楼区', parentId: 320100, level: 3, pinyin: 'gulou' },
    { id: 320115, name: '江宁区', parentId: 320100, level: 3, pinyin: 'jiangning' },
    { id: 320500, name: '苏州市', parentId: 320000, level: 2, pinyin: 'suzhou' },
    { id: 320505, name: '虎丘区', parentId: 320500, level: 3, pinyin: 'huqiu' },
    { id: 320506, name: '吴中区', parentId: 320500, level: 3, pinyin: 'wuzhong' },
    { id: 320508, name: '姑苏区', parentId: 320500, level: 3, pinyin: 'gusu' },
    { id: 320509, name: '吴江区', parentId: 320500, level: 3, pinyin: 'wujiang' },
    { id: 320583, name: '昆山市', parentId: 320500, level: 3, pinyin: 'kunshan' },
    { id: 320200, name: '无锡市', parentId: 320000, level: 2, pinyin: 'wuxi' },
    { id: 320211, name: '滨湖区', parentId: 320200, level: 3, pinyin: 'binhu' },
    { id: 320213, name: '梁溪区', parentId: 320200, level: 3, pinyin: 'liangxi' },
    { id: 320214, name: '新吴区', parentId: 320200, level: 3, pinyin: 'xinwu' },

    // ========== 其他省份（只有省和主要城市）==========
    // 河北省
    { id: 130000, name: '河北省', parentId: null, level: 1, pinyin: 'hebei' },
    { id: 130100, name: '石家庄市', parentId: 130000, level: 2, pinyin: 'shijiazhuang' },
    { id: 130102, name: '长安区', parentId: 130100, level: 3, pinyin: 'changan' },

    // 山西省
    { id: 140000, name: '山西省', parentId: null, level: 1, pinyin: 'shanxi' },
    { id: 140100, name: '太原市', parentId: 140000, level: 2, pinyin: 'taiyuan' },
    { id: 140105, name: '小店区', parentId: 140100, level: 3, pinyin: 'xiaodian' },

    // 内蒙古
    { id: 150000, name: '内蒙古自治区', parentId: null, level: 1, pinyin: 'neimenggu' },
    { id: 150100, name: '呼和浩特市', parentId: 150000, level: 2, pinyin: 'huhehaote' },
    { id: 150102, name: '新城区', parentId: 150100, level: 3, pinyin: 'xincheng' },

    // 辽宁省
    { id: 210000, name: '辽宁省', parentId: null, level: 1, pinyin: 'liaoning' },
    { id: 210100, name: '沈阳市', parentId: 210000, level: 2, pinyin: 'shenyang' },
    { id: 210102, name: '和平区', parentId: 210100, level: 3, pinyin: 'heping' },
    { id: 210200, name: '大连市', parentId: 210000, level: 2, pinyin: 'dalian' },
    { id: 210202, name: '中山区', parentId: 210200, level: 3, pinyin: 'zhongshan' },

    // 吉林省
    { id: 220000, name: '吉林省', parentId: null, level: 1, pinyin: 'jilin' },
    { id: 220100, name: '长春市', parentId: 220000, level: 2, pinyin: 'changchun' },
    { id: 220102, name: '南关区', parentId: 220100, level: 3, pinyin: 'nanguan' },

    // 黑龙江省
    { id: 230000, name: '黑龙江省', parentId: null, level: 1, pinyin: 'heilongjiang' },
    { id: 230100, name: '哈尔滨市', parentId: 230000, level: 2, pinyin: 'haerbin' },
    { id: 230102, name: '道里区', parentId: 230100, level: 3, pinyin: 'daoli' },

    // 安徽省
    { id: 340000, name: '安徽省', parentId: null, level: 1, pinyin: 'anhui' },
    { id: 340100, name: '合肥市', parentId: 340000, level: 2, pinyin: 'hefei' },
    { id: 340102, name: '瑶海区', parentId: 340100, level: 3, pinyin: 'yaohai' },

    // 福建省
    { id: 350000, name: '福建省', parentId: null, level: 1, pinyin: 'fujian' },
    { id: 350100, name: '福州市', parentId: 350000, level: 2, pinyin: 'fuzhou' },
    { id: 350102, name: '鼓楼区', parentId: 350100, level: 3, pinyin: 'gulou' },
    { id: 350200, name: '厦门市', parentId: 350000, level: 2, pinyin: 'xiamen' },
    { id: 350203, name: '思明区', parentId: 350200, level: 3, pinyin: 'siming' },

    // 江西省
    { id: 360000, name: '江西省', parentId: null, level: 1, pinyin: 'jiangxi' },
    { id: 360100, name: '南昌市', parentId: 360000, level: 2, pinyin: 'nanchang' },
    { id: 360102, name: '东湖区', parentId: 360100, level: 3, pinyin: 'donghu' },

    // 山东省
    { id: 370000, name: '山东省', parentId: null, level: 1, pinyin: 'shandong' },
    { id: 370100, name: '济南市', parentId: 370000, level: 2, pinyin: 'jinan' },
    { id: 370102, name: '历下区', parentId: 370100, level: 3, pinyin: 'lixia' },
    { id: 370200, name: '青岛市', parentId: 370000, level: 2, pinyin: 'qingdao' },
    { id: 370202, name: '市南区', parentId: 370200, level: 3, pinyin: 'shinan' },

    // 河南省
    { id: 410000, name: '河南省', parentId: null, level: 1, pinyin: 'henan' },
    { id: 410100, name: '郑州市', parentId: 410000, level: 2, pinyin: 'zhengzhou' },
    { id: 410102, name: '中原区', parentId: 410100, level: 3, pinyin: 'zhongyuan' },

    // 湖北省
    { id: 420000, name: '湖北省', parentId: null, level: 1, pinyin: 'hubei' },
    { id: 420100, name: '武汉市', parentId: 420000, level: 2, pinyin: 'wuhan' },
    { id: 420102, name: '江岸区', parentId: 420100, level: 3, pinyin: 'jiangan' },
    { id: 420106, name: '武昌区', parentId: 420100, level: 3, pinyin: 'wuchang' },

    // 湖南省
    { id: 430000, name: '湖南省', parentId: null, level: 1, pinyin: 'hunan' },
    { id: 430100, name: '长沙市', parentId: 430000, level: 2, pinyin: 'changsha' },
    { id: 430102, name: '芙蓉区', parentId: 430100, level: 3, pinyin: 'furong' },

    // 广西
    { id: 450000, name: '广西壮族自治区', parentId: null, level: 1, pinyin: 'guangxi' },
    { id: 450100, name: '南宁市', parentId: 450000, level: 2, pinyin: 'nanning' },
    { id: 450102, name: '兴宁区', parentId: 450100, level: 3, pinyin: 'xingning' },

    // 海南省
    { id: 460000, name: '海南省', parentId: null, level: 1, pinyin: 'hainan' },
    { id: 460100, name: '海口市', parentId: 460000, level: 2, pinyin: 'haikou' },
    { id: 460105, name: '秀英区', parentId: 460100, level: 3, pinyin: 'xiuying' },
    { id: 460200, name: '三亚市', parentId: 460000, level: 2, pinyin: 'sanya' },
    { id: 460202, name: '海棠区', parentId: 460200, level: 3, pinyin: 'haitang' },

    // 四川省
    { id: 510000, name: '四川省', parentId: null, level: 1, pinyin: 'sichuan' },
    { id: 510100, name: '成都市', parentId: 510000, level: 2, pinyin: 'chengdu' },
    { id: 510104, name: '锦江区', parentId: 510100, level: 3, pinyin: 'jinjiang' },
    { id: 510107, name: '武侯区', parentId: 510100, level: 3, pinyin: 'wuhou' },

    // 贵州省
    { id: 520000, name: '贵州省', parentId: null, level: 1, pinyin: 'guizhou' },
    { id: 520100, name: '贵阳市', parentId: 520000, level: 2, pinyin: 'guiyang' },
    { id: 520102, name: '南明区', parentId: 520100, level: 3, pinyin: 'nanming' },

    // 云南省
    { id: 530000, name: '云南省', parentId: null, level: 1, pinyin: 'yunnan' },
    { id: 530100, name: '昆明市', parentId: 530000, level: 2, pinyin: 'kunming' },
    { id: 530102, name: '五华区', parentId: 530100, level: 3, pinyin: 'wuhua' },

    // 西藏
    { id: 540000, name: '西藏自治区', parentId: null, level: 1, pinyin: 'xizang' },
    { id: 540100, name: '拉萨市', parentId: 540000, level: 2, pinyin: 'lasa' },
    { id: 540102, name: '城关区', parentId: 540100, level: 3, pinyin: 'chengguan' },

    // 陕西省
    { id: 610000, name: '陕西省', parentId: null, level: 1, pinyin: 'shaanxi' },
    { id: 610100, name: '西安市', parentId: 610000, level: 2, pinyin: 'xian' },
    { id: 610102, name: '新城区', parentId: 610100, level: 3, pinyin: 'xincheng' },
    { id: 610103, name: '碑林区', parentId: 610100, level: 3, pinyin: 'beilin' },

    // 甘肃省
    { id: 620000, name: '甘肃省', parentId: null, level: 1, pinyin: 'gansu' },
    { id: 620100, name: '兰州市', parentId: 620000, level: 2, pinyin: 'lanzhou' },
    { id: 620102, name: '城关区', parentId: 620100, level: 3, pinyin: 'chengguan' },

    // 青海省
    { id: 630000, name: '青海省', parentId: null, level: 1, pinyin: 'qinghai' },
    { id: 630100, name: '西宁市', parentId: 630000, level: 2, pinyin: 'xining' },
    { id: 630102, name: '城东区', parentId: 630100, level: 3, pinyin: 'chengdong' },

    // 宁夏
    { id: 640000, name: '宁夏回族自治区', parentId: null, level: 1, pinyin: 'ningxia' },
    { id: 640100, name: '银川市', parentId: 640000, level: 2, pinyin: 'yinchuan' },
    { id: 640104, name: '兴庆区', parentId: 640100, level: 3, pinyin: 'xingqing' },

    // 新疆
    { id: 650000, name: '新疆维吾尔自治区', parentId: null, level: 1, pinyin: 'xinjiang' },
    { id: 650100, name: '乌鲁木齐市', parentId: 650000, level: 2, pinyin: 'wulumuqi' },
    { id: 650102, name: '天山区', parentId: 650100, level: 3, pinyin: 'tianshan' },

    // 香港
    { id: 810000, name: '香港特别行政区', parentId: null, level: 1, pinyin: 'xianggang' },
    { id: 810100, name: '香港岛', parentId: 810000, level: 2, pinyin: 'xianggangdao' },
    { id: 810101, name: '中西区', parentId: 810100, level: 3, pinyin: 'zhongxi' },

    // 澳门
    { id: 820000, name: '澳门特别行政区', parentId: null, level: 1, pinyin: 'aomen' },
    { id: 820100, name: '澳门半岛', parentId: 820000, level: 2, pinyin: 'aomenbandao' },
    { id: 820101, name: '花地玛堂区', parentId: 820100, level: 3, pinyin: 'huadimatang' },

    // 台湾
    { id: 710000, name: '台湾省', parentId: null, level: 1, pinyin: 'taiwan' },
    { id: 710100, name: '台北市', parentId: 710000, level: 2, pinyin: 'taibei' },
    { id: 710101, name: '中正区', parentId: 710100, level: 3, pinyin: 'zhongzheng' },
]

async function seedRegions() {
    console.log('🌍 开始导入行政区划数据...')

    // 清空现有数据
    await prisma.region.deleteMany()

    // 批量插入
    for (const region of regionsData) {
        await prisma.region.create({
            data: {
                id: region.id,
                name: region.name,
                parentId: region.parentId,
                level: region.level,
                pinyin: region.pinyin,
                status: 1,
            },
        })
    }

    console.log(`✅ 成功导入 ${regionsData.length} 条行政区划数据`)
}

// 导出供 seed.ts 调用
export { seedRegions }

// 如果直接运行此文件
if (require.main === module) {
    seedRegions()
        .catch((e) => {
            console.error('❌ 导入失败:', e)
            process.exit(1)
        })
        .finally(async () => {
            await prisma.$disconnect()
        })
}
