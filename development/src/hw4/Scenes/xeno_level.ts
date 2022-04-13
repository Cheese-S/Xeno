import AABB from "../../Wolfie2D/DataTypes/Shapes/AABB";
import Vec2 from "../../Wolfie2D/DataTypes/Vec2";
import GameEvent from "../../Wolfie2D/Events/GameEvent";
import Input from "../../Wolfie2D/Input/Input";
import AnimatedSprite from "../../Wolfie2D/Nodes/Sprites/AnimatedSprite";
import OrthogonalTilemap from "../../Wolfie2D/Nodes/Tilemaps/OrthogonalTilemap";
import Label from "../../Wolfie2D/Nodes/UIElements/Label";
import { UIElementType } from "../../Wolfie2D/Nodes/UIElements/UIElementTypes";
import Layer from "../../Wolfie2D/Scene/Layer";
import Scene from "../../Wolfie2D/Scene/Scene";
import TimerManager from "../../Wolfie2D/Timing/TimerManager";
import Color from "../../Wolfie2D/Utils/Color";
import MathUtils from "../../Wolfie2D/Utils/MathUtils";
import BaseAI from "../AI/BaseAI";
import BattlerAI from "../AI/BattlerAI";
import EnemyAI from "../AI/EnemyAI";
import TrapAI from "../AI/TrapAI";
import TurretAI from "../AI/TurretAI";
import WallAI, { NEIGHBOR } from "../AI/WallAI";
import { TRAP_TYPE, XENO_ACTOR_TYPE, XENO_EVENTS } from "../constants";
import { EffectData } from "../GameSystems/Attack/internal";
import BattleManager from "../GameSystems/BattleManager";

let idCounter = 0;


export default class xeno_level extends Scene {

    private placingMode: "WALL" | "TURRET" | "TRAP" | "ENEMY" = "WALL";

    private floor: OrthogonalTilemap;

    private base: AnimatedSprite;

    private deadWalls: Array<AnimatedSprite> = new Array();

    private deadTraps: Array<AnimatedSprite> = new Array();

    private deadTurrets: Array<AnimatedSprite> = new Array();

    private deadEnemies: Array<AnimatedSprite> = new Array();

    private aliveWalls: Array<AnimatedSprite> = new Array();

    private aliveTraps: Array<AnimatedSprite> = new Array();

    private aliveTurrets: Array<AnimatedSprite> = new Array();

    private aliveEnemies: Array<AnimatedSprite> = new Array();

    private battleManager: BattleManager;

    private UI: Layer;

    private errorLabel: Label

    loadScene(): void {

        this.load.tilemap("level", "xeno_assets/map/test_map.json");
        this.load.spritesheet("base", "xeno_assets/spritesheets/generator.json");
        this.load.spritesheet("walls", "xeno_assets/spritesheets/walls.json");
        this.load.spritesheet("traps", "xeno_assets/spritesheets/traps.json");
        this.load.spritesheet("turret", "xeno_assets/spritesheets/turret_simple.json");
        this.load.spritesheet("UMA", "xeno_assets/spritesheets/uma.json")
        this.load.spritesheet("slice", "hw4_assets/spritesheets/slice.json")
        this.load.image("Drawing", "xeno_assets/images/drawing.png")
    }

    startScene(): void {
        const Slot1 = new Vec2(1455, 210);
        const Slot2 = new Vec2(1555, 210);
        const Slot3 = new Vec2(1455, 340);
        const Slot4 = new Vec2(1555, 340);
        const Slot5 = new Vec2(1455, 460);
        const Slot6 = new Vec2(1555, 460);
        const Slot7 = new Vec2(1455, 590);
        const Slot8 = new Vec2(1555, 590);
        const Slot9 = new Vec2(1455, 710);
        const Slot10 = new Vec2(1555, 710);
        const SlotMoney = new Vec2(1500, 40);
        const SlotStatus = new Vec2(1460, 120);
        const center = this.viewport.getCenter();

        let tilemapLayers = this.add.tilemap("level", new Vec2(1, 1));




        this.UI = this.addUILayer("UI");
        const Drawing = this.add.sprite("Drawing", "UI");
        Drawing.position.copy(center);
        const MoneyLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", { position: SlotMoney, text: "00000" });
        const StatusLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", { position: SlotStatus, text: "Status" });
        this.errorLabel = <Label>this.add.uiElement(UIElementType.LABEL, "UI", { position: new Vec2(700, 200), text: '' });
        this.errorLabel.textColor = Color.RED;


        this.floor = (tilemapLayers[1].getItems()[0] as OrthogonalTilemap);
        let tilemapSize = this.floor.size.scaled(1);
        this.viewport.setBounds(0, 0, tilemapSize.x, tilemapSize.y);

        this.addLayer("primary", 10);

        this.placeBase(new Vec2(672, 352));

        this.battleManager = new BattleManager(this.aliveTurrets, this.aliveWalls, this.base, this.aliveEnemies);

        this.viewport.setZoomLevel(1);

        this.receiver.subscribe([
            XENO_EVENTS.WALL_DIED,
            XENO_EVENTS.TURRET_DIED,
            XENO_EVENTS.ENEMY_DIED,
            XENO_EVENTS.UNLOAD_ASSET,
            XENO_EVENTS.TRIGGER_TRAP,
            XENO_EVENTS.ERROR,
        ])

    }

    handleEvent(event: GameEvent) {
        switch (event.type) {
            case XENO_EVENTS.UNLOAD_ASSET:
                const asset = this.sceneGraph.getNode(event.data.get("node"));
                asset.destroy();
                break;
            case XENO_EVENTS.ERROR:
                this.errorLabel.text = event.data.get('message');
                break;
            case XENO_EVENTS.TURRET_DIED:
                const deadTurret = event.data.get('owner');
                this.aliveTurrets = this.aliveTurrets.filter((e) => e.id != deadTurret.id);
                this.deadTurrets.push(deadTurret);
                break;
            case XENO_EVENTS.WALL_DIED:
                const deadWall = event.data.get('owner');
                this.updateNeighbors(deadWall);
                this.aliveWalls = this.aliveWalls.filter((e) => e.id != deadWall.id);
                this.deadWalls.push(deadWall);
                break;
            case XENO_EVENTS.ENEMY_DIED:
                const deadEnemy = event.data.get('owner');
                this.aliveEnemies = this.aliveEnemies.filter((e) => e.id != deadEnemy.id);
                this.deadEnemies.push(deadEnemy);
                break;
            case XENO_EVENTS.GAME_OVER:
                break;
            case XENO_EVENTS.TRIGGER_TRAP:
               
                const node = this.sceneGraph.getNode(event.data.get("node"));
                const other = this.sceneGraph.getNode(event.data.get("other"));
                
                const trapAI = (node.ai instanceof TrapAI ? node.ai : other.ai as TrapAI);
                
                trapAI.attack();
        }
    }

    updateScene(deltaT: number): void {
        while (this.receiver.hasNextEvent()) {
            let event = this.receiver.getNextEvent();
            this.handleEvent(event);
        }

        if (Input.isKeyJustPressed('1')) {
            this.placingMode = 'WALL';
        }

        if (Input.isKeyJustPressed('2')) {
            this.placingMode = 'TURRET';
        }


        if (Input.isKeyJustPressed('3')) {
            this.placingMode = 'ENEMY';
        }

        if (Input.isKeyJustPressed('4')) {
            this.placingMode = 'TRAP';
        }

        if (Input.isMouseJustPressed(0) && Input.getGlobalMousePressPosition().x < 1388) {
            const clickColRow = this.floor.getColRowAt(Input.getGlobalMousePosition().clone().add(new Vec2(16, 16)));
            if (this.isAnyOverlap(clickColRow.clone())) {
                this.emitter.fireEvent(XENO_EVENTS.ERROR, { message: 'SPACE OCCUPIED' });
                return;
            }
            switch (this.placingMode) {
                case "WALL":
                    this.placeWall(clickColRow);
                    break;
                case "TRAP":
                    this.placeTrap(clickColRow, TRAP_TYPE.FROST);
                    break;
                case "TURRET":
                    this.placeTurret(clickColRow);
                    break;
                case "ENEMY":
                    this.placeEnemey(clickColRow);
            }
        }
        else if (Input.isMouseJustPressed(0)) {
            const clickPos = Input.getGlobalMousePressPosition().clone()
            if (clickPos.x < 1500 && clickPos.x > 1410) {
                if (clickPos.y < 270 && clickPos.y > 170) {
                    console.log("1,1 SLOT1");
                }
                else if (clickPos.y < 400 && clickPos.y > 300) {
                    console.log("1,2 SLOT3");
                }
                else if (clickPos.y < 520 && clickPos.y > 420) {
                    console.log("1,3 SLOT5");
                }
                else if (clickPos.y < 650 && clickPos.y > 540) {
                    console.log("1,4 SLOT7");
                }
                else if (clickPos.y < 780 && clickPos.y > 680) {
                    console.log("1,5 SLOT9");
                }
                else if (clickPos.y < 880 && clickPos.y > 820) {
                    console.log("1,6 Pause");
                }
            }
            else if (clickPos.x < 1600 && clickPos.x > 1510) {
                if (clickPos.y < 270 && clickPos.y > 170) {
                    console.log("2,1 SLOT2");
                }
                else if (clickPos.y < 400 && clickPos.y > 300) {
                    console.log("2,2 SLOT4");
                }
                else if (clickPos.y < 520 && clickPos.y > 420) {
                    console.log("2,3 SLOT6");
                }
                else if (clickPos.y < 650 && clickPos.y > 540) {
                    console.log("2,4 SLOT8");
                }
                else if (clickPos.y < 780 && clickPos.y > 680) {
                    console.log("2,5 SLOT10");
                }
                else if (clickPos.y < 880 && clickPos.y > 820) {
                    console.log("2,6 Speed Up");
                }
            }
        }

        if (Input.isMouseJustPressed(2)) {
            const clickColRow = this.floor.getColRowAt(Input.getGlobalMousePressPosition().clone().add(new Vec2(16, 16)));
            const wall = this.aliveWalls.filter((e) => {
                return this.floor.getColRowAt(e.position).equals(clickColRow);
            })
            if (!wall) return;
            this.updateNeighbors(wall[0]);
        }
    }

    isAnyOverlap(tilePosition: Vec2): boolean {
        return this.aliveTurrets.some((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.aliveWalls.some((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.aliveTraps.some((e) => this.floor.getColRowAt(e.position).equals(tilePosition)) ||
            this.aliveEnemies.some((e) => this.floor.getColRowAt(e.position).equals(tilePosition))
    }


    placeTrap(tilePosition: Vec2, type: TRAP_TYPE) {
        let trap: AnimatedSprite = this.deadTraps.pop();
        if (!trap) {
            trap = this.add.animatedSprite('traps', 'primary');
            let effectData: EffectData = {
                slow: {
                    duration: 2000,
                    percent: 0.4,
                }
            }
            trap.addAI(TrapAI, {
                effectData: effectData,
                battleManager: this.battleManager
            })
        }
        trap.animation.playIfNotAlready('BRONZE_FROST', true);
        trap.position = tilePosition.mult(new Vec2(32, 32));
        trap.visible = true;
        trap.addPhysics(undefined, undefined, false, true);
        trap.setGroup(XENO_ACTOR_TYPE.TRAP);
        trap.setTrigger(XENO_ACTOR_TYPE.ENEMY, XENO_EVENTS.TRIGGER_TRAP, null);
        this.aliveTraps.push(trap);

    }

    placeBase(position: Vec2) {
        let base: AnimatedSprite;
        base = this.add.animatedSprite('base', 'primary');
        base.addAI(BaseAI, {
            health: 1 << 30,
            armor: 0
        });
        base.setCollisionShape(new AABB(Vec2.ZERO, base.sizeWithZoom));
        const currColRow = this.floor.getColRowAt(position);

        base.position = currColRow.clone().mult(new Vec2(32, 32));
        base.visible = true;
        base.addPhysics();
        this.base = base;
        base.animation.play("IDLE", true);
    }

    placeWall(tilePosition: Vec2) {
        let wall: AnimatedSprite = this.deadWalls.pop();


        if (!wall) {
            wall = this.add.animatedSprite('walls', 'primary');
            wall.addAI(WallAI, {});
            wall.setCollisionShape(new AABB(Vec2.ZERO, wall.sizeWithZoom));
        }

        let leftTile: AnimatedSprite = null, rightTile: AnimatedSprite = null, topTile: AnimatedSprite = null, botTile: AnimatedSprite = null;
        const leftTileColRow = tilePosition.clone().add(new Vec2(-1, 0));
        const rightTileColRow = tilePosition.clone().add(new Vec2(1, 0));
        const botTileColRow = tilePosition.clone().add(new Vec2(0, 1));
        const topTileColRow = tilePosition.clone().add(new Vec2(0, -1));

        this.aliveWalls.forEach((w) => {
            if (this.floor.getColRowAt(w.position).equals(leftTileColRow)) {
                leftTile = w;
                (leftTile.ai as WallAI).addNeighbor(wall, NEIGHBOR.RIGHT);
                console.log(`LEFT TILE FOUND: ${leftTile}`);
            }
            if (this.floor.getColRowAt(w.position).equals(rightTileColRow)) {
                rightTile = w;
                (rightTile.ai as WallAI).addNeighbor(wall, NEIGHBOR.LEFT);
                console.log(`RIGHT TILE FOUND: ${rightTile}`);
            }
            if (this.floor.getColRowAt(w.position).equals(botTileColRow)) {
                botTile = w;
                (botTile.ai as WallAI).addNeighbor(wall, NEIGHBOR.TOP);
                console.log(`BOT TILE FOUND: ${botTile}`);
            }
            if (this.floor.getColRowAt(w.position).equals(topTileColRow)) {
                topTile = w;
                (topTile.ai as WallAI).addNeighbor(wall, NEIGHBOR.BOT);
                console.log(`TOP TILE FOUND: ${topTile}`);
            }
        })

        wall.ai.initializeAI(wall, {
            leftTile: leftTile,
            rightTile: rightTile,
            botTile: botTile,
            topTile: topTile
        })

        wall.position = tilePosition.mult(new Vec2(32, 32));
        wall.visible = true;
        wall.addPhysics();
        this.aliveWalls.push(wall);
    }

    placeTurret(tilePosition: Vec2) {
        let turret = this.deadTurrets.pop();

        if (!turret) {
            turret = this.add.animatedSprite("turret", "primary");
            turret.addAI(TurretAI, { battleManager: this.battleManager });
        }
        turret.position = tilePosition.mult(new Vec2(32, 32));
        turret.visible = true;
        turret.addPhysics();
        this.aliveTurrets.push(turret);
    }

    placeEnemey(tilePosition: Vec2) {
        let enemy = this.deadEnemies.pop();
        if (!enemy) {
            enemy = this.add.animatedSprite("UMA", "primary");
            enemy.addAI(EnemyAI, {
                health: 30,
                BasePos: new Vec2(672, 352),
                SpawnPos: tilePosition.clone().mult(new Vec2(32, 32)),
                level: this,
                battleManager: this.battleManager
            });
        }
        enemy.animation.playIfNotAlready("IDLE", true);
        enemy.position = tilePosition.clone().mult(new Vec2(32, 32));
        enemy.visible = true;
        enemy.addPhysics();
        enemy.setGroup(XENO_ACTOR_TYPE.ENEMY);
        enemy.setAIActive(true, {});
        this.aliveEnemies.push(enemy);
    }

    updateNeighbors(wall: AnimatedSprite) {
        const wallAI = wall.ai as WallAI;
        console.log(wallAI.neighboringWall);
        wallAI.neighboringWall.forEach((w, i) => {
            if (w) {
                let dir = 0;
                switch (i) {
                    case NEIGHBOR.LEFT:
                    case NEIGHBOR.TOP:
                        dir = i + 1;
                        break;
                    case NEIGHBOR.BOT:
                    case NEIGHBOR.RIGHT:
                        dir = i - 1;
                        break;
                }
                (w.ai as WallAI).delNeighbor(dir);
            }
        })

    }

    findEnemyInRange(from: Vec2, range: number): BattlerAI | undefined {
        if (!this.aliveEnemies.length) return undefined;

        for (let i = 0; i < this.aliveEnemies.length; i++) {
            if (from.distanceTo(this.aliveEnemies[i].position) < range) {
                return (this.aliveEnemies[i].ai as BattlerAI);
            }
        }
    }

    findFriendAtColRow(colRow: Vec2): BattlerAI | undefined {
        if (this.floor.getColRowAt(this.base.position).equals(colRow))
            return this.base.ai as BattlerAI;
        for (let i = 0; i < this.aliveTurrets.length; i++) {
            const curr = this.aliveTurrets[i];
            if (this.floor.getColRowAt(curr.position).equals(colRow))
                return curr.ai as BattlerAI;
        }
        for (let i = 0; i < this.aliveWalls.length; i++) {
            const curr = this.aliveWalls[i];
            if (this.floor.getColRowAt(curr.position).equals(colRow))
                return curr.ai as BattlerAI;
        }
    }

    getFloor() {
        return this.floor;
    }

}