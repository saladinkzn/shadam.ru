/** @class Marines.Generator */
 atom.declare('Marines.Generator', {
     field : null,
     ships: null,
     initialize: function() {
         this.bindMethods(['generate']);
     },

     isReady: function() {
         return this.field && this.ships;
     },

     /**
      * Генерирует поле с расставленными кораблями
      * @return {Object} field - поле, ships - массив кораблей.
      */
     generate: function() {
         var field = atom.array.fillMatrix(10, 10, 0);
         var ships = [];
         for(var size = 4; size > 0; size--) {
             for(var i = 0; i < 5 - size; i++) {
                 do {
                     var x = Math.floor((Math.random()*10));
                     var y = Math.floor((Math.random()*10));
                     var orientation = Math.random() < 0.5 ? Marines.Field.ORIENTATION_VERTICAL : Marines.Field.ORIENTATION_HORIZONTAL;
                 } while(!this.tryPlaceShip(field, x, y, size, orientation));
                 ships.push({
                     x: x,
                     y: y,
                     size: size,
                     orientation: orientation
                 });
                 this.placeShip(field, x, y, size, orientation);
             }
         }
         return {
             field: field,
             ships: ships
         };
     },

     /**
      * @private
      * Пытается поставить корабль начиная с заданного поля в заданную сторону.
      *
      * @param field - поле, матрица 10х10
      * @param x - координата X левого верхнего угла
      * @param y - координата Y левого верхнего угла
      * @param size - размер корабля
      * @param orientation 0 - горизонтально, 1 - вертикально
      */
     tryPlaceShip : function(field, x, y, size, orientation) {
         var endX, endY;
         if(orientation == Marines.Field.ORIENTATION_HORIZONTAL) {
             if(x + size > 10) {
                 // Вылетит за край
                 return false;
             }
             endX = (x + size) - 1;
             endY = y;
         } else if(orientation == Marines.Field.ORIENTATION_VERTICAL) {
             if(y + size > 10) {
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
         var rightX = endX < (10 - 1) ? endX + 1 : (10 - 1);
         // Верхняя сторона
         var topY = y > 1 ? y - 1 : 0;
         // Нижняя сторона
         var bottomY = endY < (10 - 1) ? endY + 1 : (10 - 1);
         //
         for(var _x = leftX; _x <= rightX; _x++) {
             for(var _y = topY; _y <= bottomY; _y++) {
                 if(field[_x][_y] == 1) {
                     return false;
                 }
             }
         }
         return true;
     },
     /**
      * @private
      * Ставит корабль, начиная с заданного поля в заданную сторону
      *
      * @param field - матрица, 10х10
      * @param x - координата Х верхнего левого угла
      * @param y - координата У верхнего левого угла
      * @param size - размер корабля
      * @param orientation 0 - горизонтально, 1 - вертикально
      */
     placeShip: function(field, x, y, size, orientation) {
         if(orientation == Marines.Field.ORIENTATION_HORIZONTAL) {
             for(var _x = x; _x < x + size; _x++) {
                 field[_x][y] = 1;
             }
         } else if (orientation == Marines.Field.ORIENTATION_VERTICAL) {
             for(var _y = y; _y < y + size; _y++) {
                 field[x][_y] = 1;
             }
         }
     }
 });