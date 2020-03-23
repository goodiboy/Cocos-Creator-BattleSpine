// 英雄共同属性
interface HeroCommon {
    "speed": number,
    "atk": number,
    "def": number,
}

// 英雄数据
export interface HeroData extends HeroCommon {
    "spine": string,
    "x": number,
    "y": number,
    "long": boolean,

}

// 英雄战斗属性
export interface HeroBattleData extends HeroCommon {
    "id": number,
    // 阵营
    "camp": number,
    // 状态
    "state": HeroStatus,
    "blood": number
}

// 英雄状态
export enum HeroStatus {
    // 等待
    HERO_STATE_WAIT = 1,
    // 移动
    HERO_STATE_MOVE = 2,
    // 返回
    HERO_STATE_BACK = 3,
    // 攻击
    HERO_STATE_ATK = 4,
    // 防御
    HERO_STATE_DEF = 5,
    // 死亡
    HERO_STATE_DIE = 6
}