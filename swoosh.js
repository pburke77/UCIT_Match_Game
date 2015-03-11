pc.script.create('swoosh', function (context) {
    
    var stage;
    
    // Creates a new Swoosh instance
    var Swoosh = function (entity) {
        this.entity = entity;
        this.destroyAtTarget = false;
    };

    Swoosh.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            TWEEN.update();
        },
        
        distance: function(p1,p2){
            xd = p2.x-p1.x;
            yd = p2.y-p1.y;
            zd = p2.z-p1.z;
            return Math.sqrt(xd*xd + yd*yd + zd*zd);
        },
        
        setTargetPos: function(pos, destroyWhenMoved){
            if(destroyWhenMoved){
                this.destroyAtTarget = true;
            }
            
            this.startTween(this.entity.getPosition(), pos);
        },
        
        startTween: function (from, to) {
            var self = this;

            this.tween = new TWEEN.Tween({
                x: from.x,
                y: from.y,
                z: from.z
            }).to({
                x: to.x,
                y: to.y,
                z: to.z
            },1000)
                .easing( TWEEN.Easing.Back.Out )
                .onUpdate(function () {
                    self.entity.setLocalPosition(this.x, this.y, this.z);
                    if(self.entity.rigidbody){
                        self.entity.rigidbody.syncEntityToBody();
                    }
            }).onComplete(function () {
                if(self.destroyAtTarget){
                    TWEEN.remove(this.tween);
                    self.entity.destroy();
                }
            }).start();
        }
    };

    return Swoosh;
});