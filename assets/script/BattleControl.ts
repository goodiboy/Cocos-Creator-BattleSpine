import Utils from "./Utils";
import {HeroBattleData, HeroData, HeroStatus} from "./interface";
import HeroControl from './HeroControl';

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    // 英雄预制体
    @property(cc.Prefab)
    AnimPrefab: cc.Prefab = null;

    // 加载英雄的层
    @property(cc.Node)
    Board: cc.Node = null;


    // 加载的下标
    public loadIndex: number = 0;

    // 当前出手的下标
    public orderIndex: number = 0;

    public spineArray: sp.SkeletonData[] = [];

    // 左边英雄的状态
    public leftHeroState: HeroStatus[] = [];

    // 右边英雄的状态
    public RightHeroState: HeroStatus[] = [];

    // 英雄的战斗数据
    public orderArray: HeroBattleData[] = [];

    // 左边的英雄节点
    public leftHeroNode: cc.Node[] = [];

    // 右边的英雄节点
    public rightHeroNode: cc.Node[] = [];

    // 攻击的目标
    public targetEnemy: HeroBattleData = null;

    protected onLoad(): void {
        this.initGameData();
        this.initGameShow();
        this.startGame()
    }


    // 初始化场景和战斗数据
    public initGameData(): void {
        for (let i = 0; i < Utils.HERO_COUNT; i++) {
            this.orderArray[i] = {
                "speed": Utils.HeroListLeft[i].speed,
                "atk": Utils.HeroListLeft[i].atk,
                "def": Utils.HeroListLeft[i].def,
                "id": i,
                "camp": 0,
                "state": HeroStatus.HERO_STATE_WAIT,
                "blood": 100
            };
            // 右边的数据从第六个开始
            this.orderArray[i + Utils.HERO_COUNT] = {
                "speed": Utils.HeroListRight[i].speed,
                "atk": Utils.HeroListRight[i].atk,
                "def": Utils.HeroListRight[i].def,
                "id": i,
                "camp": 1,
                "state": HeroStatus.HERO_STATE_WAIT,
                "blood": 100
            }
        }

        // 根据出手速度排序
        this.orderArray.sort((a: HeroBattleData, b: HeroBattleData): number => {
            return a.speed - b.speed;
        });
    }

    // 初始化动画
    public initGameShow(): void {
        for (let i = 0; i < Utils.HERO_COUNT; i++) {
            // 初始化左边的英雄
            let data: HeroData = Utils.HeroListLeft[i];
            this.leftHeroNode[i] = cc.instantiate(this.AnimPrefab);
            this.leftHeroNode[i].setPosition(cc.v2(data.x, data.y));
            this.Board.addChild(this.leftHeroNode[i]);

            // 初始化右边的英雄
            data = Utils.HeroListRight[i];
            this.rightHeroNode[i] = cc.instantiate(this.AnimPrefab);
            this.rightHeroNode[i].setPosition(cc.v2(-data.x, data.y));
            this.rightHeroNode[i].scaleX = -1;
            // 设置血量方向
            this.rightHeroNode[i].getComponent(HeroControl).Blood.node.scaleX = 1;
            this.Board.addChild(this.rightHeroNode[i]);
        }
        this.loadAnim();
    }

    private loadAnim(): void {
        let data: HeroData = null;
        // 判断是左边还是右边的英雄数据
        if (this.loadIndex >= Utils.HERO_COUNT && this.loadIndex <= Utils.HERO_COUNT * 2 - 1)
            data = Utils.HeroListRight[this.loadIndex - Utils.HERO_COUNT];
        else if (this.loadIndex < Utils.HERO_COUNT)
            data = Utils.HeroListLeft[this.loadIndex];
        else
            return;

        const loadAnimCallback = (err: Error, res: sp.SkeletonData): void => {
            if (err) {
                throw err;
            }
            this.spineArray[this.loadIndex] = res;
            let skeleton: sp.Skeleton;
            // 初始化默认动作
            if (this.loadIndex < Utils.HERO_COUNT)
                skeleton = this.leftHeroNode[this.loadIndex].getComponent(sp.Skeleton);
            else
                skeleton = this.rightHeroNode[this.loadIndex - Utils.HERO_COUNT].getComponent(sp.Skeleton);

            // 设置骨骼的数据
            skeleton.skeletonData = res;
            // 设置骨骼的动画
            skeleton.animation = 'Idle';

            // 当前加载的下标加一
            this.loadIndex++;

            this.loadAnim()
        };
        cc.loader.loadRes(`spine/${data.spine}`, sp.SkeletonData, loadAnimCallback);
    }

    // 开始游戏
    public startGame(): void {
        this.orderIndex = 0;
        this.nextAttack();
    }

    // 战斗
    public nextAttack(): void {
        this.orderIndex = this.orderIndex > Utils.HERO_COUNT * 2 - 1 ? 0 : this.orderIndex;
        const attacker = this.orderArray[this.orderIndex];
        if (attacker.state === HeroStatus.HERO_STATE_WAIT) {
            this.setAnimState(attacker, HeroStatus.HERO_STATE_MOVE)
        } else {
            this.orderIndex++;
            this.nextAttack();
        }
    }

    // 设置动画状态
    public setAnimState(attacker: HeroBattleData, state: HeroStatus): void {
        // 设置英雄的状态
        attacker.state = state;

        switch (state) {
            case HeroStatus.HERO_STATE_MOVE:
                this.heroMoveAnim(attacker);
                break;
            case HeroStatus.HERO_STATE_ATK:
                this.heroAtkAnim(attacker);
                break;
            case HeroStatus.HERO_STATE_WAIT:
                this.heroWaitAnim(attacker);
                break;
            default:
                this.heroDieAnim(attacker);
        }
    }

    /**
     * 英雄移动
     * @param attacker 英雄属性
     */
    private heroMoveAnim(attacker: HeroBattleData): void {
        // 定义敌方阵营为1
        let targetCamp: number = 1;
        // 如果自己的阵营是1，则敌方阵营为0
        if (attacker.camp === 1) {
            targetCamp = 0;
        }

        for (let i = 0; i < Utils.HERO_COUNT * 2; i++) {
            if (this.orderArray[i].camp === targetCamp && this.orderArray[i].state !== HeroStatus.HERO_STATE_DIE) {
                this.targetEnemy = this.orderArray[i];
                break;
            }
        }

        // 一方阵营全部死亡
        if (this.targetEnemy === null) return;

        // 是否远程
        let isLong: boolean;
        if (attacker.camp === 1)
            isLong = Utils.HeroListRight[attacker.id].long;
        else
            isLong = Utils.HeroListLeft[attacker.id].long;

        // 如果是远程攻击，直接攻击，结束
        if (isLong) {
            this.setAnimState(attacker, HeroStatus.HERO_STATE_ATK);
            return;
        }


        // 敌人的位置
        let targetPos: cc.Vec2 = cc.v2(0, 0);
        // 获取敌人的位置
        if (targetCamp === 1) {
            targetPos.x = -(Utils.HeroListLeft[this.targetEnemy.id].x + 40);
            targetPos.y = Utils.HeroListLeft[this.targetEnemy.id].y;
        } else {
            targetPos.x = Utils.HeroListRight[this.targetEnemy.id].x + 40;
            targetPos.y = Utils.HeroListRight[this.targetEnemy.id].y;
        }

        // 攻击者的节点，执行移动的动画
        let atkHeroNode: cc.Node = this.leftHeroNode[attacker.id];
        if (attacker.camp === 1) {
            atkHeroNode = this.rightHeroNode[attacker.id];
        }
        cc.tween(atkHeroNode)
            .to(0.5, {position: targetPos})
            .call(e => {
                // 进入攻击状态
                this.setAnimState(attacker, HeroStatus.HERO_STATE_ATK);
            })
            .start()

    }

    /**
     * 英雄攻击
     * @param attacker 英雄属性
     */
    private heroAtkAnim(attacker: HeroBattleData): void {

        // 当前英雄的节点
        let atkHeroNode: cc.Node = this.leftHeroNode[attacker.id];
        if (attacker.camp === 1) {
            atkHeroNode = this.rightHeroNode[attacker.id];
        }

        // 进行攻击动画
        const skeleton: sp.Skeleton = atkHeroNode.getComponent(sp.Skeleton);
        const dieTrackEntry: sp.spine.TrackEntry = skeleton.setAnimation(0, 'Attack', false);
        skeleton.setTrackCompleteListener(dieTrackEntry, trackEntry => {
            console.log(222);
            // 敌人的防御力
            let targetDef: number;
            // 攻击者的攻击力
            let selfAtk: number;
            // 敌人节点
            let targetHandle: cc.Node = null;
            // 攻击者返回的位置
            let backPos: cc.Vec2 = cc.v2(0, 0);

            if (attacker.camp === 1) {
                targetDef = Utils.HeroListLeft[this.targetEnemy.id].def;
                selfAtk = Utils.HeroListRight[attacker.id].atk;
                targetHandle = this.leftHeroNode[this.targetEnemy.id];
                backPos = cc.v2(-Utils.HeroListRight[attacker.id].x, Utils.HeroListRight[attacker.id].y);
            } else {
                targetDef = Utils.HeroListRight[this.targetEnemy.id].def;
                selfAtk = Utils.HeroListLeft[attacker.id].atk;
                targetHandle = this.rightHeroNode[this.targetEnemy.id];
                backPos = cc.v2(Utils.HeroListLeft[attacker.id].x, Utils.HeroListLeft[attacker.id].y);

            }
            // 敌人的减少的血量
            this.targetEnemy.blood += targetDef - selfAtk;

            // 因为每个英雄的血量是100，所以不需要进行其他的处理，直接除以100得出百分比
            targetHandle.getComponent(HeroControl).setBlood(this.targetEnemy.blood / 100);
            // 如果敌人被攻击后血量大于0就掉血，否则死亡
            if (this.targetEnemy.blood <= 0) {
                console.log('死亡');
                this.targetEnemy.state = HeroStatus.HERO_STATE_DIE;
                this.setAnimState(this.targetEnemy, HeroStatus.HERO_STATE_DIE);
            }

            // 回到原来的位置动画
            skeleton.setAnimation(0, 'Run', false);
            cc.tween(atkHeroNode)
                .to(0.2, {position: backPos})
                .call(e => {
                    this.setAnimState(attacker, HeroStatus.HERO_STATE_WAIT);
                })
                .start();
        });
    }

    /**
     * 英雄等待
     * @param attacker 英雄数据
     */
    private heroWaitAnim(attacker: HeroBattleData): void {
        let heroNode: cc.Node = this.leftHeroNode[attacker.id];
        if (attacker.camp === 1) {
            heroNode = this.rightHeroNode[attacker.id];
        }
        heroNode.getComponent(sp.Skeleton).animation = 'Idle';
        this.orderIndex++;
        this.nextAttack();
    }

    /**
     * 英雄死亡
     * @param attacker 英雄数据
     */
    private heroDieAnim(attacker: HeroBattleData): void {
        let heroNode: cc.Node = this.leftHeroNode[attacker.id];
        if (attacker.camp === 1) {
            heroNode = this.rightHeroNode[attacker.id];
        }
        this.targetEnemy = null;
        const skeleton: sp.Skeleton = heroNode.getComponent(sp.Skeleton);
        const dieTrackEntry: sp.spine.TrackEntry = skeleton.setAnimation(0, 'Die', false);
        skeleton.setTrackCompleteListener(dieTrackEntry, trackEntry => {
            console.log(99999);
            cc.tween(heroNode)
                .to(0.5, {opacity: 0})
                .removeSelf()
                .start();
        });
    }
}
