import AI from "../../Wolfie2D/DataTypes/Interfaces/AI";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Color from "../../Wolfie2D/Utils/Color";
import { GRADE, TRAP_TYPE, XENO_ACTOR_TYPE, XENO_EVENTS } from "../constants";
import AOEAttack from "../GameSystems/Attack/AOEAttack";
import { EffectData } from "../GameSystems/Attack/internal";
import { SplashAnimation } from "../GameSystems/AttackAnimation/SplashAnimation";
import BattleManager from "../GameSystems/BattleManager";
import xeno_level from "../Scenes/xeno_level";
import Upgradeable from "./Upgradable";

export default class TrapAI implements AI, Upgradeable {
    owner: AnimatedSprite
    atk: AOEAttack;
    grade: GRADE;
    level: xeno_level;
    range: number; 
    emitter: Emitter = new Emitter();
    type: TRAP_TYPE; 
    battleManager: BattleManager

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        const { color, damage, range, cooldown, atkEffect, level, battleManager, type, grade } = options;
        this.level = level;
        this.range = range;
        this.type = type; 
        this.grade = grade;
        this.battleManager = battleManager;
        this.atk = new AOEAttack(damage, range, cooldown, new SplashAnimation(Color.fromStringHex(color)), atkEffect, battleManager);
    }

    attack(): void {
        const targets = this.level.findEnemiesInRange(this.owner.position, this.range); 
        if (targets)
            this.atk.attack(this.owner.position, targets, this.owner.getScene());
    }

    destroy(): void {
    }

    activate(options: Record<string, any>): void {
    }

    handleEvent(event: GameEvent): void {
        throw new Error("Method not implemented.");
    }

    update(deltaT: number): void {
    }

    upgrade(): void {
        let newGrade: GRADE;
        switch(this.grade) {
            case 'BRONZE':
                newGrade = GRADE.SILVER;
                break;
            case 'SILVER':
                newGrade = GRADE.GOLD;
                break;
            case 'GOLD':
                this.emitter.fireEvent(XENO_EVENTS.ERROR, {message: 'This cannot be upgraded'});
                return; 
        }
        const { color, damage, range, cooldown, atkEffect } = this.level.getTrapData(this.type, newGrade);
        this.atk = new AOEAttack(damage, range, cooldown, new SplashAnimation(Color.fromStringHex(color)), atkEffect, this.battleManager);
        this.owner.animation.play(`${this.grade}_${this.type}`, true);
        this.grade = newGrade;
    }

}