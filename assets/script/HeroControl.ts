const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Sprite)
    Blood: cc.Sprite = null;

    public setBlood(blood: number): void {
        console.log(blood);
        this.Blood.fillRange = blood;
    }
}
