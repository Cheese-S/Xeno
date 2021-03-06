import Vec2 from "../Wolfie2D/DataTypes/Vec2"
import Color from "../Wolfie2D/Utils/Color"

export const CANVAS_SIZE = {
    x: 1600,
    y: 900
}

export enum WALL_TYPE {
    DIRT = "DIRT",
    WOOD = "WOOD",
    STONE = "STONE",
    FIBER = "FIBER"
}

export enum TRAP_TYPE {
    ACID = "ACID",
    NET = "NET",
    FROST = "FROST",
    FIRE = "FIRE"
}

export enum TURRET_TYPE {
    ELECTRIC = "ELECTRIC",
    ROCKET = "ROCKET",
    BEAM = "BEAM",
    BANK = "BANK"
}

export enum ENEMY_TYPE {
    BASIC,
    FAST,
    TANK
}


export const ENEMY_NAME = ['BASIC', 'FAST', 'TANK']

export enum GRADE {
    BRONZE = 'BRONZE',
    SILVER = 'SILVER',
    GOLD = 'GOLD'
}



export enum XENO_EVENTS {
    ERROR = "ERROR",
    UNLOAD_ASSET = "UNLOAD_ASSET",
    WALL_DIED = "WALL_DIED",
    ENEMY_DIED = "ENEMY_DIED",
    TURRET_DIED = "TURRET_DIED",
    GAME_OVER = "GAME_OVER",
    EFFECT_END = "EFFECT_END",
    TRIGGER_TRAP = "TRIGGER_TRAP",
    UPGRADE = "UPGRADE",
    SPAWN_NEXT_WAVE = "SPAWN_NEXT_WAVE",
    PLACED = "PLACED",
    RESUME = "RESUME",
    NEXT_LEVEL = "NEXT_LEVEL",
    RETRY = 'RETRY'
}

export enum XENO_EFFECT_TYPE {
    FIRE_EFFECT = "FIRE_EFFECT",
    SLOW_EFFECT = "SLOW_EFFECT",
    ACID_EFFECT = "ACID_EFFECT"
}

export enum XENO_ACTOR_TYPE {
    FRIEND = "FRINED",
    ENEMY = "ENEMY",
    TRAP = "TRAP"
}

export const XENO_COLOR = {
    ORANGE: new Color(255, 148, 51),
    GREEN: new Color(54, 178, 77),
    BLUE: new Color(66, 99, 235),
    PASSIVE_GREY: new Color(196, 196, 196),
    ACTIVE_GREY: new Color(229, 229, 229),
    PURPLE: new Color(119, 70, 241)
}

export const UI_POSITIONS = {
    BOT_UI_BORDER: 672,
    RIGHT_UI_BORDER: 1388,
    SLOT_MONEY: new Vec2(1500, 40),
    SLOT_STATUS: new Vec2(1488, 120),
    UPGRADE_BUTTON: {
        TOP_LEFT: new Vec2(52.5, 713),
        BOT_RIGHT: new Vec2(419.5, 865)
    },
    SELECTING_LABEL: new Vec2(700, 50),
    PLACING_LABEL: new Vec2(700, 100),
    ERROR_LABEL: new Vec2(700, 150),

    PLACING_COST_LABEL: new Vec2(600, 751),
    UPGRADE_COST_LABEL: new Vec2(600, 832),
    HP_LABEL: new Vec2(826, 766),
    ARMOR_LABEL: new Vec2(826, 824),
    ATK_LABEL: new Vec2(1064, 762),
    RANGE_LABEL: new Vec2(1064, 822),
    FIRE_LABEL: new Vec2(1277, 746),
    SLOW_LABEL: new Vec2(1277, 793),
    ACID_LABEL: new Vec2(1277, 840),
}

export const XENO_LEVEL_PHYSICS_OPTIONS = {
    groupNames: [XENO_ACTOR_TYPE.TRAP, XENO_ACTOR_TYPE.ENEMY],
    collisions: [
        [0, 1],
        [1, 0]
    ]
}


