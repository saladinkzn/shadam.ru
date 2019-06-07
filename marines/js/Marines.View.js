/** @class Marines.View */
atom.declare( 'Marines.View', {
	initialize: function (controller, fieldSize, container) {
		this.images = controller.images;

		this.engine = new TileEngine({
			size: fieldSize,
			cellSize: new Size(24, 24),
			cellMargin: new Size(0, 0),
			defaultValue: 'closed'
		}).setMethod( this.createMethods() );

		this.app = new App({
            appendTo: container,
			size  : this.engine.countSize(),
			simple: true
		});

		this.element = TileEngine.Element.app( this.app, this.engine );
	},

	createMethods: function () {
		return {
            0: this.closed.bind(this),
			1: this.miss.bind(this),//this.number.bind(this, 1),
            2: this.alive.bind(this),
            3: this.wound.bind(this),
            4: this.dead.bind(this),
            10: this.highlight.bind(this),
            11: this.highlight_error.bind(this),
			closed : this.closed.bind(this),
            empty  : this.closed.bind(this)
		};
	},

    color: function (ctx, cell, fillStyle, strokeStyle) {
        var strokeRect = cell.rectangle;

        return ctx
            .fill( cell.rectangle, fillStyle)
            .stroke( strokeRect, strokeStyle );
    },

    highlight: function(ctx, cell) {
        return ctx.fill( cell.rectangle, '#0f0');
    },
    highlight_error: function(ctx, cell) {
        return ctx.fill( cell.rectangle, '#f00');
    },


    miss: function (ctx, cell) {
        var fillStyle = '#999';
        var strokeStyle = '#000';
        var width = cell.rectangle.width;
        var strokeRect = new Circle(new Point(cell.rectangle.x + width / 2, cell.rectangle.y + width / 2), width / 8);

        return this
            .closed(ctx, cell)
            .fill( strokeRect, strokeStyle );
    },

    wound: function(ctx, cell) {
        var r = cell.rectangle;

        return this.closed(ctx, cell)
            .save()
            .clip( r )
            .set({ lineWidth: Math.round(cell.rectangle.width / 8) })
            .stroke( new Line( r.from      , r.to       ), '#900' )
            .stroke( new Line( r.bottomLeft, r.topRight ), '#900' )
            .restore();

    },

    dead: function(ctx, cell) {
        var r = cell.rectangle;

        return this.empty(ctx, cell)
            .save()
            .clip( r )
            .set({ lineWidth: Math.round(cell.rectangle.width / 8) })
            .stroke( new Line( r.from      , r.to       ), '#900' )
            .stroke( new Line( r.bottomLeft, r.topRight ), '#900' )
            .restore();

    },

    alive: function(ctx, cell) {
        return this.empty(ctx, cell)
    },



	closed: function (ctx, cell) {
		return ctx.fill( cell.rectangle,
			ctx.createGradient(cell.rectangle, {
				0: '#999', 1: '#aaa'
			})
		);
	},

    empty: function (ctx, cell) {
        return this.color(ctx, cell, '#999', '#000');
    },

	numberColors: [null, '#000'],

	number: function (number, ctx, cell) {
		var size =  Math.round(cell.rectangle.height * 0.8);

		return this.empty(ctx, cell)
			.text({
				text  : number,
				color : this.numberColors[number],
				size  : size,
				lineHeight: size,
				weight: 'bold',
				align : 'center',
				to    : cell.rectangle
			});
	}
});