/** @class Marines.Action */
atom.declare( 'Marines.Action', {
	actions: [ 'open', 'all', 'close' ],

	initialize: function (controller) {
        this.controller = controller;
        this.playerId = this.controller.playerId;

        this.bindMouse();
        this.orientation = Marines.Field.ORIENTATION_VERTICAL;
        var keyboard = new atom.Keyboard();
        keyboard.events.add('space', function() {
            this.orientation = 1 - this.orientation;
            var cell = this.controller.selfView.engine.getCellByPoint(this.mouse.point);
            var newShipSize = this.getCurrentShipSize();
            this.controller.game.highlightShip({
                x: cell.point.x,
                y: cell.point.y,
                size: newShipSize,
                orientation: this.orientation
            }, this.playerId);
        }.bind(this))
	},

    bindMouse: function() {
        var view;
        view = this.controller.selfView;
        this.mouse = new Mouse(view.app.container.bounds);

        new App.MouseHandler({
            mouse: this.mouse,
            app: view.app
        }).subscribe(view.element);

        this.mouse.events.add('contextmenu', Mouse.prevent);

        var tileEngineMouse = new TileEngine.Mouse(view.element, this.mouse);
        tileEngineMouse.events.add('click', function(cell, e) {
            this.activate(cell, e.button);
        }.bind(this));
        tileEngineMouse.events.add('over', function(cell, e) {
            var newShipSize = this.getCurrentShipSize();
            this.controller.game.highlightShip({x: cell.point.x, y: cell.point.y, size: newShipSize, orientation: this.orientation }, this.playerId);
        }.bind(this));
    },

    activate: function(cell, action) {
        var x = cell.point.x;
        var y = cell.point.y;
        var newShipSize = this.getCurrentShipSize();
        if(newShipSize != -1) {
            this.controller.game.placeShip(x, y, newShipSize, this.playerId, this.orientation);
        }
    },

    /**
     * @private
     * @returns {number}
     */
    getCurrentShipSize: function() {
        var newShipSize = -1;
        for(var size = 4; size >= 1; size --) {
            var shipsBySize = this.controller.game.players[this.playerId].ownField.shipsBySize[size].length;
            if(shipsBySize + size < 5) {
                newShipSize = size;
                break;
            }
        }
        return newShipSize;
    }
});
