/**
 * @class Marines.ShootingField
 */
atom.declare('Marines.ShootingField', {
    initialize: function(fieldSize) {
        if(fieldSize === undefined) {
            throw new Error('fieldSize must be defined');
        }
        this.fieldSize = fieldSize;
        this.field = atom.array.fillMatrix(fieldSize, fieldSize, 0);
        this.bindMethods(['onSquareStateChange', 'setSquareState', 'setState']);
    },

    setState:function (x, y, state) {
        this.field[x][y] = state;
        if (this.onSquareStateChangeCallback) {
            this.onSquareStateChangeCallback(x, y, state);
        }
    }, /**
     * Отмечает результат выстрела.
     * @param x
     * @param y
     * @param state
     */
    setSquareState: function(x, y, state) {
        if(x < 0 || y < 0 || x >= this.fieldSize || y >= this.fieldSize) {
            throw new Error('x or y out of bounds');
        }
        //
        this.setState(x, y, state);
        if(state == Marines.Field.STATE_DEAD) {
            this.markDead(x, y);
        }

    },

    markDead: function(x, y) {
        var canMoveTop = y > 0;
        var canMoveBottom = y < this.fieldSize - 1;
        var canMoveLeft = x > 0;
        var canMoveRight = x < this.fieldSize - 1;
        //          v
        var field = this.field;
        var setState = this.setState;
        //
        var leftX = x;
        var rightX = x;
        var topY = y;
        var bottomY = y;
        //
        if(canMoveTop) {
            for(var _y = y - 1; _y >=0; _y --) {
                if(field[x][_y] == Marines.Field.STATE_WOUND) {
                    topY = Math.min(_y, topY);
                    setState(x, _y, Marines.Field.STATE_DEAD);
                } else {
                    break;
                }
            }
        }
        if(canMoveBottom) {
            for(var _y = y + 1; _y < this.fieldSize; _y ++) {
                if(field[x][_y] == Marines.Field.STATE_WOUND) {
                    bottomY = Math.max(_y, bottomY);
                    setState(x, _y, Marines.Field.STATE_DEAD);
                } else {
                    break;
                }
            }
        }
        if(canMoveLeft) {
            for(var _x = x - 1; _x >= 0; _x --) {
                if(field[_x][y] == Marines.Field.STATE_WOUND) {
                    leftX = Math.min(_x, leftX);
                    setState(_x, y, Marines.Field.STATE_DEAD);
                } else {
                    break;
                }
            }
        }
        if(canMoveRight) {
            for(_x = x + 1; _x < this.fieldSize; _x ++) {
                if(field[_x][y] == Marines.Field.STATE_WOUND) {
                    rightX = Math.max(_x, rightX);
                    setState(_x, y, Marines.Field.STATE_DEAD);
                } else {
                    break;
                }
            }
        }
        var orientation = leftX == rightX ? Marines.Field.ORIENTATION_VERTICAL : Marines.Field.ORIENTATION_HORIZONTAL;
        var size = orientation == Marines.Field.ORIENTATION_HORIZONTAL ? rightX - leftX + 1 : bottomY - topY + 1;
        var ship = {
            x: leftX,
            y: topY,
            size: size,
            orientation: orientation
        };
        this.surroundDead(ship);
    },

    /**
     * @private
     * @param ship
     */
    surroundDead: function(ship) {
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

    onSquareStateChange: function(callback) {
        this.onSquareStateChangeCallback = callback;
    }
});