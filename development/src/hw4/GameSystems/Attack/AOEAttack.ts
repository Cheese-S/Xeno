import Vec2 from "../../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../../Wolfie2D/Events/Emitter";
import Scene from "../../../Wolfie2D/Scene/Scene";
import Timer from "../../../Wolfie2D/Timing/Timer";
import BattlerAI from "../../AI/BattlerAI";
import TrapAI from "../../AI/TrapAI";
import { XENO_ACTOR_TYPE } from "../../constants";
import AtkAnimation from "../AttackAnimation/AtkAnimation";
import { ExplosionAnimation } from "../AttackAnimation/ExplosionAnimation";
import { SplashAnimation } from "../AttackAnimation/SplashAnimation";
import { SplitAnimation } from "../AttackAnimation/SplitAnimation";
import BattleManager from "../BattleManager";
import { EffectData } from "./internal";

export default class AOEAttack {

    battleManager: BattleManager
    
    assets: Array<any>;

    damage: number;

    r: number;

    effects: EffectData; 

    private cooldownTimer: Timer;

    private atkAnimation: AtkAnimation;

    constructor(damage: number, r: number, cooldown: number, atkAnimation: AtkAnimation, effects: EffectData, bm: BattleManager) {
        this.damage = damage;
        this.r = r;
        this.cooldownTimer = new Timer(cooldown);
        this.atkAnimation = atkAnimation; 
        this.effects = effects;
        this.battleManager = bm; 
    }

    attack(from: Vec2, targets: BattlerAI[], scene: Scene): boolean {
        if (!this.cooldownTimer.isStopped()) {
            return false;
        }

        this.assets = this.atkAnimation.createRequiredAssets(scene, targets.length); 

        if (this.atkAnimation instanceof SplashAnimation) {
            this.atkAnimation.doAnimation(from, this.r, this.assets); 
        } else if (this.atkAnimation instanceof SplitAnimation) {
            this.atkAnimation.doAnimation(from, targets, this.assets); 
        } else if (this.atkAnimation instanceof ExplosionAnimation) {
            this.atkAnimation.doAnimation(from, this.assets); 
        }

        this.battleManager.handleAOEAtk(targets, this.damage, this.effects); 

        this.cooldownTimer.start(); 


    }

}