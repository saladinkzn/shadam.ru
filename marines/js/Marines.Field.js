/**
 * Created with IntelliJ IDEA.
 * User: Timur
 * Date: 01.05.13
 * Time: 1:48
 * To change this template use File | Settings | File Templates.
 */
/**
 * @class Marines.Field
 */
var Field = atom.declare('Marines.Field', {


   initialize: function(fieldSize) {
       this.fieldSize = fieldSize;
       this.field = atom.array.fillMatrix(10, 10, 0);
       this.ships = [];
       this.shipsBySize = {
           1: [],
           2: [],
           3: [],
           4: []
        };
       this.shipsByField = atom.array.fillMatrix(10, 10, undefined);
       //
       this.placingFinished = false;
       this.highlighted = undefined;
       this.bindMethods(['setShip', 'shoot', 'onSquareStateChange', 'allShipsDead']);
   },

    setState: function (x, y, newState) {
        this.field[x][y] = newState;
        if (this.onSquareStateChangeCallback) {
            this.onSquareStateChangeCallback(x, y, newState);
        }
    },
    shoot: function(x, y) {
        var newState;
        switch(this.field[x][y]) {
            case Marines.Field.STATE_ALIVE:
                if(this.checkSurvive(x, y)) {
                    newState = Marines.Field.STATE_WOUND;
                } else {
                    this.surroundDead(x, y);
                    newState = Marines.Field.STATE_DEAD;
                }
                break;
            case Marines.Field.STATE_EMPTY:
                newState = Marines.Field.STATE_MISS;
                break;
            default:
                throw new Error('Already shot');
        }
        this.setState(x, y, newState);
        return newState;
    },

    /**
     * @private
     */
    checkSurvive: function(x, y) {
        if(this.field[x][y] == Marines.Field.STATE_ALIVE) {
            var ship = this.shipsByField[x][y];
            if(ship.orientation == Marines.Field.ORIENTATION_HORIZONTAL) {
                for(var _x = ship.x; _x < ship.x + ship.size; _x++) {
                    if(_x != x && this.field[_x][y] == Marines.Field.STATE_ALIVE) {
                        return true;
                    }
                }
                return false;
            } else if(ship.orientation == Marines.Field.ORIENTATION_VERTICAL) {
                for(var _y = ship.y; _y < ship.y + ship.size; _y++) {
                    if(_y != y && this.field[x][_y] == Marines.Field.STATE_ALIVE) {
                        return true;
                    }
                }
                return false;
            } else {
                throw new Error('This ship has unknown orientation')
            }
        } else {
            throw new Error('It\'s not an alive ship');
        }
    },

    /**
     * @private
     * @param x
     * @param y
     */
    surroundDead: function(x, y) {
        var ship = this.shipsByField[x][y];
        var endX = ship.orientation == Marines.Field.ORIENTATION_HORIZONTAL ? ship.x + ship.size - 1 : ship.x;
        var endY = ship.orientation == Marines.Field.ORIENTATION_VERTICAL ? ship.y + ship.size - 1 : ship.y;
        var leftX = ship.x > 0 ? ship.x - 1 : 0;
        var rightX = endX < this.fieldSize - 1 ? endX + 1 : this.fieldSize - 1;
        var topY = ship.y > 0 ? ship.y - 1 : 0;
        var bottomY = endY < this.fieldSize - 1 ? endY + 1 : this.fieldSize - 1;
        for(var _x = leftX; _x <= rightX; _x++) {
            for(var _y = topY; _y <= bottomY; _y++) {
                if(ship.orientation == Marines.Field.ORIENTATION_HORIZONTAL) {
                    if(_x >= ship.x && _x <= endX && _y == ship.y) {
//                        this.field[_x][_y] = this.STATE_DEAD;
                        this.setState(_x, _y, Marines.Field.STATE_DEAD);
                    } else {
                        this.setState(_x, _y, Marines.Field.STATE_MISS);
                    }
                } else {
                    if(_y >= ship.y && _y <= endY && _x == ship.x) {
                        this.setState(_x, _y, Marines.Field.STATE_DEAD);
                    } else {
                        this.setState(_x, _y, Marines.Field.STATE_MISS);
                    }
                }
            }
        }
    },

    /**
     * Добавляет корабль
     * @param x
     * @param y
     * @param size
     * @param orientation
     */
    setShip: function(x, y, size, orientation) {
        if(x < 0 || y < 0 || x > this.fieldSize - 1 || y > this.fieldSize - 1) {
            throw new Error('Illegal x or y');
        }
        if(size < 1 || size > 4) {
            throw new Error('Invalid size');
        }
        if(this.shipsBySize[size].length >= 5 - size) {
            throw new Error('Too many ships of this size were set');
        }
        if(this.checkCanPlaceShip(x, y, size, orientation)) {
            //
            var ship = {
                x: x,
                y: y,
                size: size,
                orientation: orientation
            };
            //
            if(orientation == Marines.Field.ORIENTATION_HORIZONTAL) {
                for(var _x = x; _x < x + size; _x++) {
                    this.field[_x][y] = Marines.Field.STATE_ALIVE;
                    if(this.onSquareStateChangeCallback) {
                        this.onSquareStateChangeCallback(_x, y, Marines.Field.STATE_ALIVE);
                    }
                    this.shipsByField[_x][y] = ship;
                }
            } else if (orientation == Marines.Field.ORIENTATION_VERTICAL) {
                for(var _y = y; _y < y + size; _y++) {
                    this.field[x][_y] = Marines.Field.STATE_ALIVE;
                    if(this.onSquareStateChangeCallback) {
                        this.onSquareStateChangeCallback(x, _y, Marines.Field.STATE_ALIVE);
                    }
                    this.shipsByField[x][_y] = ship;
                }
            }
            //
            this.ships.push(ship);
            this.shipsBySize[size].push(ship);
            //
            for(var shipSize = 1; shipSize <= 4; shipSize++) {
                if(this.shipsBySize[shipSize].length != 5 - shipSize) {
                    this.placingFinished = false;
                    return
                }
            }
            this.placingFinished = true;
            if(this.onPlacingFinishedCallback) {
                this.onPlacingFinishedCallback();
            }
        } else {
            throw new Error('cannot place ship');
        }
    },
    onPlacingFinished: function(callback) {
        this.onPlacingFinishedCallback = callback;
    },

    onSquareStateChange: function(callback) {
        this.onSquareStateChangeCallback = callback;
    },

    highlightShip: function(ship) {
        if(this.highlighted) {
            this.clearHighlighted(this.highlighted)
        }
        var state;
        if(this.checkCanPlaceShip(ship.x, ship.y, ship.size, ship.orientation)){
            state = Marines.Field.STATE_HIGHLIGHT
        } else {
            state = Marines.Field.STATE_HIGHLIGHT_ERROR
        }
        switch(ship.orientation) {
            case Marines.Field.ORIENTATION_HORIZONTAL:
                for(var x = ship.x; x < ship.x+ship.size; x++) {
                    if(x >= 0 && x < this.fieldSize && ship.y >= 0 && ship.y < this.fieldSize) {
                        this.onSquareStateChangeCallback(x, ship.y, state);
                    }
                }
                break;
            case Marines.Field.ORIENTATION_VERTICAL:
                for(var y = ship.y; y < ship.y+ship.size; y++) {
                    if(ship.x >= 0 && ship.x < this.fieldSize && y >= 0 && y < this.fieldSize) {
                        this.onSquareStateChangeCallback(ship.x, y, state);
                    }
                }
                break;
        }
        this.highlighted = ship;
    },

    clearHighlighted: function(ship) {
        switch(ship.orientation) {
            case Marines.Field.ORIENTATION_HORIZONTAL:
                for(var x = ship.x; x < ship.x+ship.size; x++) {
                    if(x >= 0 && x < this.fieldSize && ship.y >= 0 && ship.y < this.fieldSize) {
                        this.onSquareStateChangeCallback(x, ship.y, this.field[x][ship.y]);
                    }
                }
                break;
            case Marines.Field.ORIENTATION_VERTICAL:
                for(var y = ship.y; y < ship.y+ship.size; y++) {
                    if(ship.x >= 0 && ship.x < this.fieldSize && y >= 0 && y < this.fieldSize) {
                        this.onSquareStateChangeCallback(ship.x, y, this.field[ship.x][y]);
                    }
                }
                break;
        }
    },

    /**
     * @private
     */
    checkCanPlaceShip: function(x, y, size, orientation) {
        if(this.placingFinished) {
            return false;
        }
        var endX, endY;
        if(orientation == Marines.Field.ORIENTATION_HORIZONTAL) {
            if(x + size > this.fieldSize) {
                // Вылетит за край
                return false;
            }
            endX = (x + size) - 1;
            endY = y;
        } else if(orientation == Marines.Field.ORIENTATION_VERTICAL) {
            if(y + size > this.fieldSize) {
                // Вылетит за край
                return false;
            }
            endX = x;
            endY = (y + size) - 1;
        } else {
            throw new Error('invalid orientation: ' + orientation);
        }
        // Левая сторона
        var leftX = x > 1 ? x - 1 : 0;
        // Правая сторона
        var rightX = endX < (this.fieldSize - 1) ? endX + 1 : (this.fieldSize - 1);
        // Верхняя сторона
        var topY = y > 1 ? y - 1 : 0;
        // Нижняя сторона
        var bottomY = endY < (this.fieldSize - 1) ? endY + 1 : (this.fieldSize - 1);
        //
        for(var _x = leftX; _x <= rightX; _x++) {
            for(var _y = topY; _y <= bottomY; _y++) {
                if(this.field[_x][_y] == Marines.Field.STATE_ALIVE) {
                    return false;
                }
            }
        }
        return true;
    },
    allShipsDead: function() {
        var ships = this.ships;
        var field = this.field;
        return ships.every(function(ship) {
            switch(ship.orientation) {
                case Marines.Field.ORIENTATION_HORIZONTAL:
                    for(var x = ship.x; x < ship.x+ship.size; x++) {
                        if(field[x][ship.y] != Marines.Field.STATE_DEAD && field[x][ship.y] != Marines.Field.STATE_WOUND) {
                            return false;
                        }
                    }
                    break;
                case Marines.Field.ORIENTATION_VERTICAL:
                    for(var y = ship.y; y < ship.y+ship.size; y++) {
                        if(field[ship.x][y] != Marines.Field.STATE_DEAD && field[ship.x][y] != Marines.Field.STATE_WOUND) {
                            return false;
                        }
                    }
                    break;
            }
            return true;
        });
    }
});
Field.own({
    ORIENTATION_VERTICAL : 0,
    ORIENTATION_HORIZONTAL : 1,

    STATE_EMPTY:    0,
    STATE_MISS:     1,
    STATE_ALIVE:    2,
    STATE_WOUND:    3,
    STATE_DEAD:     4,
    STATE_HIGHLIGHT: 10,
    STATE_HIGHLIGHT_ERROR: 11
});