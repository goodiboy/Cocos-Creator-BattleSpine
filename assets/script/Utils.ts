import {HeroData} from "./interface";

// 工具类
export default class Utils {
    // 构造函数私有化，防止new
    private constructor() {
    }

    public static HeroListLeft: HeroData[] = [
        {"spine": "zhongqibing", "x": -145, "y": -160, "speed": 6, "atk": 50, "def": 30, "long": false},
        {"spine": "huwei", "x": -350, "y": -165, "speed": 8, "atk": 55, "def": 25, "long": false},
        {"spine": "qingqibing", "x": -220, "y": -220, "speed": 10, "atk": 60, "def": 20, "long": false},
        {"spine": "nuqiangbing", "x": -410, "y": -245, "speed": 7, "atk": 50, "def": 30, "long": true},
        {"spine": "skeleton", "x": -265, "y": -285, "speed": 12, "atk": 40, "def": 30, "long": false},
    ];
    public static HeroListRight: HeroData[] = [
        {"spine": "nongming", "x": -145, "y": -160, "speed": 11, "atk": 50, "def": 30, "long": false},
        {"spine": "bingxuenv", "x": -350, "y": -165, "speed": 9, "atk": 55, "def": 25, "long": true},
        {"spine": "tuyuansu", "x": -220, "y": -220, "speed": 5, "atk": 65, "def": 30, "long": false},
        {"spine": "huoqiangshou", "x": -410, "y": -245, "speed": 6, "atk": 40, "def": 20, "long": true},
        {"spine": "zhongbubing", "x": -265, "y": -285, "speed": 7, "atk": 45, "def": 30, "long": false},
    ];

    public static HERO_COUNT = Utils.HeroListRight.length;

}