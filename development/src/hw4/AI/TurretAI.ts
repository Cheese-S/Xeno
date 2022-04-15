import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import Emitter from "../../Wolfie2D/Events/Emitter";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Receiver from "../../Wolfie2D/Events/Receiver";
import GameNode from "../../Wolfie2D/Nodes/GameNode";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import Timer from "../../Wolfie2D/Timing/Timer";
import Color from "../../Wolfie2D/Utils/Color";
import { GRADE, TURRET_TYPE, XENO_ACTOR_TYPE, XENO_EVENTS } from "../constants";
import AOEAttack from "../GameSystems/Attack/AOEAttack";
import { EffectData } from "../GameSystems/Attack/internal";
import PointAttack from "../GameSystems/Attack/PointAttack";
import { BulletAnimation } from "../GameSystems/AttackAnimation/BulletAnimation";
import { ExplosionAnimation } from "../GameSystems/AttackAnimation/ExplosionAnimation";
import { SplitAnimation } from "../GameSystems/AttackAnimation/SplitAnimation";
import BattleManager from "../GameSystems/BattleManager";
import { Effect } from "../GameSystems/Effect/Effect";
import xeno_level from "../Scenes/xeno_level";
import BattlerAI from "./BattlerAI";
import Resettable from "./Resettable";
import Upgradeable from "./Upgradable";

export default class TurretAI implements BattlerAI, Upgradeable{
    level: xeno_level;

    armor: number;

    range: number = 300;

    speed: number;

    owner: AnimatedSprite;

    health: number;

    target: BattlerAI;

    effects: Effect<any>[] = [];

    atkEffect: EffectData;

    emitter: Emitter = new Emitter();

    type: TURRET_TYPE;

    atk: PointAttack | AOEAttack;

    bankTimer?: Timer;

    explosionRange?: number;

    grade: GRADE

    battleManager: BattleManager; 

    damage(damage: number) {
        if (this.health <= 0) {
            return;
        }
        this.health -= damage;
        if (this.health <= 0) {
            this.owner.setAIActive(false, {});
            this.owner.isCollidable = false;
            this.owner.visible = false;
            this.emitter.fireEvent(XENO_EVENTS.TURRET_DIED, { owner: this.owner });
            if (this.bankTimer) {
                this.bankTimer.pause();
                delete this.bankTimer;
            }
        }
    }

    initializeAI(owner: AnimatedSprite, options: Record<string, any>): void {
        this.owner = owner;
        const { battleManager, level, type } = options;
        this.type = type;
        this.grade = GRADE.BRONZE;
        this.battleManager = battleManager; 
        this.level = level;
        this.setNewStats(options); 
    }


    destroy(): void {
        throw new Error("Method not implemented.");
    }

    activate(options: Record<string, any>): void {
        
    }

    handleEvent(event: GameEvent): void {

    }

    update(deltaT: number): void {
        switch (this.type) {
            case TURRET_TYPE.BEAM: {
                const target = this.level.findEnemyInRange(this.owner.position, this.range);
                if (target)
                    //@ts-ignore
                    this.atk.attack(this, target, XENO_ACTOR_TYPE.FRIEND);
            } break;

            case TURRET_TYPE.ROCKET: {
                const target = this.level.findEnemyInRange(this.owner.position, this.range);
                if (target) {
                    //@ts-ignore
                    this.atk.attack(target.owner.position, this.level.findEnemiesInRange(target.owner.position, this.explosionRange), this.owner.getScene());
                }
            } break;
            case TURRET_TYPE.ELECTRIC: {
                const pos = this.owner.position;
                //@ts-ignore
                this.atk.attack(pos, this.level.findEnemiesInRange(pos, this.range), this.owner.getScene());
            } break;
            case TURRET_TYPE.BANK: {
                
            } break;
        }
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
        if (this.type === TURRET_TYPE.BANK) {
            this.bankTimer.pause();
            delete this.bankTimer;
        }
        this.setNewStats(this.level.getTurretData(this.type, newGrade));
        this.grade = newGrade;
    }

    setNewStats(data: Record<string, any>): void {
        const { armor, health, color, range, damage, cooldown, atkEffect } = data;
        let colorObj: Color;
        if (color)
            colorObj = Color.fromStringHex(color); 
        switch (this.type) {
            case TURRET_TYPE.BEAM:
                this.atk = new PointAttack(damage, cooldown, new BulletAnimation(colorObj), atkEffect, this.battleManager);
                break;
            case TURRET_TYPE.ROCKET:
                const { explosionRange } = data;
                this.explosionRange = explosionRange;
                this.atk = new AOEAttack(damage, explosionRange, cooldown, new ExplosionAnimation(colorObj, this.owner.position, this.explosionRange), atkEffect, this.battleManager);
                break;
            case TURRET_TYPE.ELECTRIC:
                this.atk = new AOEAttack(damage, range, cooldown, new SplitAnimation(colorObj), atkEffect, this.battleManager);
                break;
            case TURRET_TYPE.BANK:
                const { gold } = data;
                this.bankTimer = new Timer(cooldown, () => { this.level.addLevelGold(gold) }, true);
                this.bankTimer.start();
                break;
        }
        this.armor = armor;
        this.health = health;
        this.range = range;
    }

    addEffect(effect: Effect<any>): void {
        for (let i = 0; i < this.effects.length; i++) {
            const curr = this.effects[i];
            if (curr.type === effect.type && curr.isActive() && curr.equal(effect)) {
                curr.refreshEffect();
                return;
            }
        }
        this.effects.push(effect);
        effect.applyEffect();
    }

    removeEffect(id: number): void {
        this.effects = this.effects.filter((e) => e.id !== id);
    }

}