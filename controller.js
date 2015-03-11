pc.script.create('controller', function (context) {
    // Creates a new Controller instance
    var Controller = function (entity) {
        this.entity = entity;
        this.rayStart = new pc.Vec3();
        this.rayEnd = new pc.Vec3();
        
        context.mouse.disableContextMenu();
    };

    Controller.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            this.hammer = Hammer(context.graphicsDevice.canvas);
            
            this.hammer.on("tap press", function(event) {
                if(event.pointerType === 'mouse'){
                    this.cast({
                        x: event.pointers[0].layerX,
                        y: event.pointers[0].layerY
                    });
                }
                else {
                    this.cast({
                        x: event.pointers[0].clientX,
                        y: event.pointers[0].clientY// - 50
                    });
                }
            }.bind(this));
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        },
        
        onTouchStart: function(event){
            this.cast({
                x: event.touches[0].touch.pageX,
                y: event.touches[0].touch.pageY
            });
        },
        
        cast: function(event){
            var camera = context.root.findByName("Cam");
            
            this.rayStart.copy(camera.getPosition());
            camera.camera.screenToWorld(event.x, event.y, 1, this.rayEnd);
            this.rayEnd.sub(this.rayStart).normalize().scale(500).add(this.rayStart);
            
            context.systems.rigidbody.raycastFirst(this.rayStart, this.rayEnd, this.rayCastHit.bind(this));
        },
        
        rayCastHit: function(result){
            var name = result.entity.getName();
            var playSwoop = false;
            
            if(name == 'card'){
                var id = result.entity.getGuid();
                var cardNum = this.entity.script.send("cards", "numById", id);
                this.entity.script.send("cards", "clickCard", cardNum);
            }
            
            if(name == 'levelselect'){
                this.entity.script.send("states", "switchState", 1);
                playSwoop = true;
            }
            
            if(name == 'deckselect'){
                this.entity.script.send("states", "switchState", 3);
                playSwoop = true;
            }
            
            if(name == 'menu'){
                this.entity.script.send("states", "switchState", 0);
                playSwoop = true;
            }
            
            if(name.indexOf("level") > -1 && name.indexOf("levels") == -1){
                this.entity.script.send("states", "setLevel", parseInt(name.substring(5, 6))-1);
                this.entity.script.send("states", "switchState", 2);
                playSwoop = true;
            }
            
            //Decks
            if(name == 'colours'){
                this.entity.script.send("decks", "changeDeck", 0);
                this.entity.script.send("states", "switchState", 0);
                playSwoop = true;
            }
            
            if(name == 'halloween'){
                this.entity.script.send("decks", "changeDeck", 1);
                this.entity.script.send("states", "switchState", 0);
                playSwoop = true;
            }
            
            if(name == 'numbers'){
                this.entity.script.send("decks", "changeDeck", 2);
                this.entity.script.send("states", "switchState", 0);
                playSwoop = true;
            }
            
            if(playSwoop){
                this.entity.audiosource.play("menuswoop");
            }
        },
    };

    return Controller;
});