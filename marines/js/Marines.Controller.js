/**
 * @class Marines.Controller
 */
atom.declare('Marines.Controller', {
    initialize: function() {
        this.size  = new Size(10, 10);
        this.start(undefined);
    },
    start: function(images) {
        this.images = images;
        this.selfView = new Marines.View(this, this.size, '#left');
        this.shootingView = new Marines.View(this, this.size, '#right');
        this.playerId = 0;
        this.game = new Marines.Game(10);
        this.selfActions = new Marines.Action(this);
        this.shootingActions = new Marines.ShootingAction(this);
        var selfView = this.selfView;
        var shootingView = this.shootingView;
        this.game.players[this.playerId].ownField.onSquareStateChange(function(x, y, state) {
            selfView.engine.getCellByIndex(new Point(x, y)).value = state;
        });
        this.game.players[this.playerId].shootingField.onSquareStateChange(function(x, y, state) {
            shootingView.engine.getCellByIndex(new Point(x, y)).value = state;
        });
    }
});