/**
 * @class Marines.Game
 */
atom.declare('Marines.Game', {
    PHASE_PLACING: 0,
    PHASE_SHOOTING: 1,
    PHASE_GAMEOVER: 2,
    initialize: function(fieldSize) {
        this.size = fieldSize;
        var player1 = new Marines.Player(this);
        var player2 = new Marines.Player(this);
        this.players = [player1, player2];
        this.phase = this.PHASE_PLACING;
    },

    shoot : function(x, y, shooter) {
        if(this.phase != this.PHASE_SHOOTING) {
            throw new Error('Invalid phase: ' + this.phase);
        }
        if(shooter != 1 && shooter != 0) {
            throw new Error('shooter must be 0 or 1');
        }
        var target = this.players[1 - shooter];
        var result = target.onShoot(x, y);
        shooter = this.players[shooter];
        shooter.markShot(x, y, result);
        if(result == Marines.Field.STATE_WOUND || result == Marines.Field.STATE_DEAD) {
            // Попал, может стрелять еще раз
            if(target.allShipsDead()) {
                console.log('Player ' + shooter + ' won');
                alert.delay(100, window, ['You won!']);
                this.phase = this.PHASE_GAMEOVER;
            }
        } else {
            while(true) {
                while(true) {
                    try {
                        var aiX = Math.floor(Math.random() * this.size);
                        var aiY = Math.floor(Math.random() * this.size);
                        var aiResult = shooter.onShoot(aiX, aiY);
                        break;
                    } catch(e) {

                    }
                }
                if(aiResult != Marines.Field.STATE_WOUND && aiResult != Marines.Field.STATE_DEAD) {
                    break;
                } else {
                    if(shooter.allShipsDead()) {
                        console.log('Player ' + (1 - shooter) + ' won');
                        alert.delay(100, window, ['AI has won!']);
                        this.phase = this.PHASE_GAMEOVER;
                        break;
                    }
                }
            }
        }
    },

    placeShip: function(x, y, size, placerId, orientation) {
        if(this.phase != this.PHASE_PLACING) {
            throw new Error('Invalid phase: ' + this.phase);
        }
        var placer = this.players[placerId];
        placer.setShip(x, y, size, orientation);
        if(placer.ownField.placingFinished) {
            // AI generation
            var generator = new Marines.Generator();
            var result = generator.generate();
            var ships = result.ships;
            var other = this.players[1-placerId];
            for(var shipId = 0; shipId < ships.length; shipId ++ ) {
                var ship = ships[shipId];
                other.setShip(ship.x, ship.y, ship.size, ship.orientation);
            }
            this.phase = this.PHASE_SHOOTING;
        }
    },

    highlightShip: function(ship, playerId) {
        if(this.phase != this.PHASE_PLACING) {
            throw new Error("Invalid phase. Must be placing");
        }
        var player = this.players[playerId];
        player.highlightShip(ship);
    }

});