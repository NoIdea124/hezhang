export interface Category {
  name: string;
  icon: string;
  keywords: string[];
}

export const CATEGORIES: Category[] = [
  {
    name: '餐饮',
    icon: '🍜',
    keywords: ['午饭', '晚饭', '早餐', '外卖', '奶茶', '咖啡', '火锅', '烧烤', '食堂', '餐厅', '饭', '菜', '吃', '喝', '奶', '茶', '面', '粥', '饺子', '包子', '炒', '煮'],
  },
  {
    name: '交通',
    icon: '🚗',
    keywords: ['打车', '滴滴', '地铁', '公交', '加油', '油费', '停车', '高铁', '机票', '火车', '出租车', '骑车', '共享单车'],
  },
  {
    name: '日用品',
    icon: '🛒',
    keywords: ['超市', '买菜', '纸巾', '洗衣液', '牙膏', '日用', '洗发水', '沐浴露', '清洁', '垃圾袋'],
  },
  {
    name: '住房',
    icon: '🏠',
    keywords: ['房租', '水费', '电费', '燃气', '暖气'],
  },
  {
    name: '水电物业',
    icon: '💡',
    keywords: ['水费', '电费', '燃气费', '物业费', '物业', '水电', '暖气费', '垃圾费'],
  },
  {
    name: '房贷',
    icon: '🏦',
    keywords: ['房贷', '按揭', '还房贷', '月供', '公积金贷款'],
  },
  {
    name: '车贷',
    icon: '🚙',
    keywords: ['车贷', '还车贷', '车辆贷款', '汽车分期'],
  },
  {
    name: '通讯订阅',
    icon: '📱',
    keywords: ['话费', '流量', '宽带', '网费', 'WiFi', '手机费', '会员', '订阅', '视频会员', '音乐会员', 'VPN'],
  },
  {
    name: '约会娱乐',
    icon: '🎬',
    keywords: ['电影', '游戏', 'KTV', '视频', '音乐', '演出', '门票', '旅游', '约会', '纪念日', '浪漫'],
  },
  {
    name: '医疗',
    icon: '💊',
    keywords: ['医院', '药', '体检', '挂号', '牙科', '看病', '门诊', '药店'],
  },
  {
    name: '服饰',
    icon: '👔',
    keywords: ['衣服', '裤子', '鞋', '包', '帽子', '袜子', '内衣', '外套', '裙子'],
  },
  {
    name: '宠物',
    icon: '🐱',
    keywords: ['猫粮', '狗粮', '宠物', '猫砂', '疫苗', '驱虫', '宠物医院'],
  },
  {
    name: '人情',
    icon: '🎁',
    keywords: ['礼物', '红包', '份子钱', '请客', '随礼', '生日'],
  },
  {
    name: '教育',
    icon: '📚',
    keywords: ['课程', '书籍', '培训', '学费', '考试', '教材', '网课'],
  },
  {
    name: '其他',
    icon: '📦',
    keywords: [],
  },
];

export const CATEGORY_MAP = new Map(CATEGORIES.map((c) => [c.name, c]));

export function getCategoryIcon(name: string): string {
  return CATEGORY_MAP.get(name)?.icon ?? '📦';
}
