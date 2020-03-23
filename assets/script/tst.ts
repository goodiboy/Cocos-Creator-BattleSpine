const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    protected onLoad(): void {
        const sks = this.getComponent(sp.Skeleton);
        sks.setAnimation(0, 'Run', false);
        sks.setCompleteListener(e=>{
            console.log(11);
        })
    }
}
