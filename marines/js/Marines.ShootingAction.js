/**
 * @class Marines.ShootingAction
 */
atom.declare('Marines.ShootingAction', {
   initialize: function(controller) {
       this.controller = controller;
       this.bindMouse();
   },

    bindMouse: function() {
        var view, mouse;
        view = this.controller.shootingView;
        mouse = new Mouse(view.app.container.bounds);

        new App.MouseHandler({
            mouse: mouse,
            app: view.app
        }).subscribe(view.element);

        mouse.events.add('contextmenu', Mouse.prevent);

        new TileEngine.Mouse(view.element, mouse).events.add('click', function(cell, e) {
            this.activate(cell, e.button)
        }.bind(this));
    },

    activate: function(cell, actionCode) {
        var x = cell.point.x;
        var y = cell.point.y;
        this.controller.game.shoot(x, y, this.controller.playerId);
    }
});