import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import { TweenableProperties } from "../../../Wolfie2D/Nodes/GameNode";
import { GraphicType } from "../../../Wolfie2D/Nodes/Graphics/GraphicTypes";
import Line from "../../../Wolfie2D/Nodes/Graphics/Line";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Color from "../../../Wolfie2D/Utils/Color";
import { EaseFunctionType } from "../../../Wolfie2D/Utils/EaseFunctions";
import BattlerAI from "../../AI/BattlerAI";
import { XENO_EVENTS } from "../../constants";
import AtkAnimation from "./AtkAnimation";

export class SplitAnimation extends AtkAnimation {


    private color: Color;

    constructor(color: Color) {
        super();
        this.color = color;
    }

    doAnimation(from: Vec2, targets: BattlerAI[], assets: Line[]): void {
        for (let i = 0; i < targets.length; i++) {
            assets[i].start = from.clone();
            assets[i].end = targets[i].owner.position.clone();
            assets[i].tweens.play("fade"); 
        }
    }

    createRequiredAssets(scene: Scene, count: number): Line[] {
        let res: Line[] = []; 
        for (let i = 0; i < count; i++) {
            let line = <Line>scene.add.graphic(GraphicType.LINE, "primary", { start: new Vec2(-1, 1), end: new Vec2(-1, -1) });
            line.color = this.color;

            line.tweens.add("fade", {
                startDelay: 0,
                duration: 300,
                effects: [
                    {
                        property: TweenableProperties.alpha,
                        start: 1,
                        end: 0,
                        ease: EaseFunctionType.OUT_SINE
                    }
                ],
                onEnd: XENO_EVENTS.UNLOAD_ASSET
            });
            res.push(line); 
        }


        return res;
    }



    clone(): AtkAnimation {
        return new SplitAnimation(this.color);
    }

}