/**
 * @class Marines.Player
 */
atom.declare('Marines.Player', {
    /**
     * @param game
     */
    initialize: function(game) {
        this.game = game;
        //
        this.ownField = new Marines.Field(this.game.size);
        this.shootingField = new Marines.ShootingField(this.game.size);
        this.bindMethods(['onShoot', 'markShot', 'setShip', 'allShipsDead', 'highlightShip'])
    },
    onShoot: function(x, y) {
        return this.ownField.shoot(x, y);
    },
    markShot: function(x, y, state) {
        this.shootingField.setSquareState(x, y, state);
    },
    setShip: function(x, y, size, orientation) {
        this.ownField.setShip(x, y, size, orientation)
    },
    allShipsDead: function() {
        return this.ownField.allShipsDead();
    },
    highlightShip: function(ship) {
        this.ownField.highlightShip(ship);
    }
});