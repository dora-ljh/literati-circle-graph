import type { DynastyDataset, Poet, PoemEdge } from './types';

const poets: Poet[] = [
  { id: 'libai', name: '李白', zi: '太白', hao: '青莲居士', dynasty: '唐', birth: 701, death: 762, bio: '诗仙' },
  { id: 'dufu', name: '杜甫', zi: '子美', hao: '少陵野老', dynasty: '唐', birth: 712, death: 770, bio: '诗圣' },
  { id: 'wangwei', name: '王维', zi: '摩诘', dynasty: '唐', birth: 701, death: 761, bio: '诗佛' },
  { id: 'baijuyi', name: '白居易', zi: '乐天', hao: '香山居士', dynasty: '唐', birth: 772, death: 846, bio: '中唐诗坛领袖' },
  { id: 'mengjiao', name: '孟郊', zi: '东野', dynasty: '唐', birth: 751, death: 814, bio: '"郊寒岛瘦"' },
  { id: 'hanyu', name: '韩愈', zi: '退之', hao: '昌黎', dynasty: '唐', birth: 768, death: 824, bio: '古文运动领袖' },
  { id: 'liubocheng', name: '柳宗元', zi: '子厚', dynasty: '唐', birth: 773, death: 819 },
  { id: 'liuyuxi', name: '刘禹锡', zi: '梦得', dynasty: '唐', birth: 772, death: 842 },
  { id: 'yuanzhen', name: '元稹', zi: '微之', dynasty: '唐', birth: 779, death: 831 },
  { id: 'lihe', name: '李贺', zi: '长吉', dynasty: '唐', birth: 790, death: 816 },
  { id: 'dumu', name: '杜牧', zi: '牧之', dynasty: '唐', birth: 803, death: 852 },
  { id: 'lishangyin', name: '李商隐', zi: '义山', hao: '玉谿生', dynasty: '唐', birth: 813, death: 858 },
];

const edges: PoemEdge[] = [
  {
    source: 'dufu',
    target: 'libai',
    relation: '寄',
    poem: {
      title: '春日忆李白',
      body: ['白也诗无敌，飘然思不群。', '清新庾开府，俊逸鲍参军。', '渭北春天树，江东日暮云。', '何时一樽酒，重与细论文。'].join('\n'),
    },
  },
  {
    source: 'libai',
    target: 'dufu',
    relation: '赠',
    poem: { title: '戏赠杜甫', body: '饭颗山头逢杜甫，顶戴笠子日卓午。借问别来太瘦生，总为从前作诗苦。' },
  },
  {
    source: 'baijuyi',
    target: 'yuanzhen',
    relation: '寄',
    poem: { title: '舟中读元九诗', body: '把君诗卷灯前读，诗尽灯残天未明。眼痛灭灯犹暗坐，逆风吹浪打船声。' },
  },
  {
    source: 'yuanzhen',
    target: 'baijuyi',
    relation: '寄',
    poem: { title: '闻乐天授江州司马', body: '残灯无焰影幢幢，此夕闻君谪九江。垂死病中惊坐起，暗风吹雨入寒窗。' },
  },
  {
    source: 'hanyu',
    target: 'mengjiao',
    relation: '赠',
    poem: { title: '醉留东野', body: '昔年因读李白杜甫诗，长恨二人不相从。吾与东野生并世，如何复蹑二子踪。' },
  },
  {
    source: 'liuyuxi',
    target: 'baijuyi',
    relation: '寄',
    poem: { title: '酬乐天扬州初逢席上见赠', body: '巴山楚水凄凉地，二十三年弃置身。怀旧空吟闻笛赋，到乡翻似烂柯人。' },
  },
];

export const tangData: DynastyDataset = { poets, edges };
