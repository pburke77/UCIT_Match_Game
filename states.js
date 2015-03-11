pc.script.attribute("menuTextures", "asset", []);

pc.script.create('states', function (context) {
    
    var gamestates = {
        MENU: 0,
        LEVELSELECT: 1,
        LEVEL: 2,
        DECKSELECT: 3,
    };
    
    var states = ["menu", "levelselect", "level", "deckselect"];
    
    var menuItems = [
        ["levelselect", "deckselect"],
        ["level6", "level3", "menu", "level7", "level4", "level1", "level8", "level5", "level2"],
        ["card", "menu"],
        ["menu", "colours", "halloween", "numbers"]
    ];
    
    var levels = [
        4, 8, 12, 14, 16, 20, 24, 28
    ];
    
    var completedLevels = [];
    
    
    // Creates a new States instance
    var States = function (entity) {
        this.entity = entity;
        this.state = null;
        this.cardTemplate;
        this.level = 3;
        this.screen = {
            width: 1280,
            height: 1024
        };
    };

    States.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            
            //Unlock bibeogaem deck
            if(document.URL.toLowerCase().indexOf("bibeogaem") > -1){
                console.log("bibeogaem deck unlocked");   
                
                menuItems[gamestates.DECKSELECT].push("bibeogaem");
            }
            
            this.cardTemplate = context.root.findByName("CardTemplate");
            
           // this.switchState(gamestates.MENU);
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        },
        
        createCard: function(name, pos, scale){
            var c = this.cardTemplate.clone();
            
            if(context.assets.getAssetByName(name + "Mat")){
                c.findByName("Back").model.materialAsset = context.assets.getAssetByName(name + "Mat");
            }
                
            c.setName(name);
            c.setPosition(pos.x-150, pos.y, pos.z);
            if(scale) c.setScale(scale);
            c.rigidbody.syncEntityToBody();
            
            this.entity.addChild(c);
            c.script.send("swoosh", "setTargetPos", pos);
        },
        
        setLevel: function(level){
            this.level = level;  
        },
        
        getLevel: function(){
            return this.level;  
        },
        
        completeLevel: function(level){
            if(level){
                completedLevels.push(level);
            }
            else {
                completedLevels.push(this.level);
            }
        },
        
        switchState: function(state){
            if(this.state !== null) this.exitState(this.state);
            
            if(state !== null){
                this.state = state;
                this.enterState(this.state);
            }
        },
        
        createCards: function(){
            var positions = this.cardPositions(levels[this.level]);
            
            for(var i = 0; i < positions.length; i++){
                this.createCard("card", positions[i]);
            }
            
            //Add return to main menu card
            this.createCard("menu", new pc.Vec3(-80, 0, -45));
            
            this.entity.script.send("cards", "startLevel");
        },
        
        createMenu: function(state){
            var positions = this.cardPositions(menuItems[state].length);
            
            for(var i = 0; i < positions.length; i++){
                this.createCard(menuItems[state][i], positions[i]);
            }
        },
        
        cardPositions: function(numCards){
            var positions = [];
            var rows, width, left, step;
            
            //1-6 = hard coded layouts
            //8+  = generated layouts
            switch(numCards){
                case 1: 
                    positions.push(new pc.Vec3(0,0,0));
                    break;
                case 2:
                    positions.push(new pc.Vec3(0, 0, -12.5));
                    positions.push(new pc.Vec3(0, 0, 12.5));
                    break;
                case 3:
                    positions.push(new pc.Vec3(-30, 0, 0));
                    positions.push(new pc.Vec3(0,0,0));
                    positions.push(new pc.Vec3(30, 0, 0));
                    break;
                case 4:
                    positions.push(new pc.Vec3(-12.5, 0, -12.5));
                    positions.push(new pc.Vec3(-12.5, 0, 12.5));
                    positions.push(new pc.Vec3(12.5, 0, -12.5));
                    positions.push(new pc.Vec3(12.5, 0, 12.5));
                    break;
                case 5:
                    positions.push(new pc.Vec3(-30, 0, 12.5));
                    positions.push(new pc.Vec3(0,0,12.5));
                    positions.push(new pc.Vec3(30, 0, 12.5));
                    positions.push(new pc.Vec3(12.5, 0, -12.5));
                    positions.push(new pc.Vec3(-12.5, 0, -12.5));
                    break;
                case 6:
                    positions.push(new pc.Vec3(-30, 0, 12.5));
                    positions.push(new pc.Vec3(0,0,12.5));
                    positions.push(new pc.Vec3(30, 0, 12.5));
                    positions.push(new pc.Vec3(-30, 0, -12.5));
                    positions.push(new pc.Vec3(0,0,-12.5));
                    positions.push(new pc.Vec3(30, 0, -12.5));
                    break;
                case 8:   
                case 12:
                    //Levels on two rows
                    width = levels[this.level] / 2;
                    step = 20;
                    left = -((step * width/2) - step/2);
                    
                    for(var b = 0; b < width; b++){
                        
                        positions.push(new pc.Vec3(left, 0, 12.5));
                        positions.push(new pc.Vec3(left, 0, -12.5));
                        left += step;
                    }
                    break;
                case 9:
                    //Menu on three rows
                    width = menuItems[this.state].length / 3;
                    step = 20;
                    left = -((step * width/2) - step/2);
                    
                    for(var e = 0; e < width; e++){
                        positions.push(new pc.Vec3(left, 0, 25));
                        positions.push(new pc.Vec3(left, 0, 0));
                        positions.push(new pc.Vec3(left, 0, -25));
                        left += step;
                    }
                    break;
                    
                case 14:
                case 13:
                case 15:
                case 16:
                case 20:
                case 24:
                case 28:
                    //Levels on 4 rows
                    var vStep = 25, top = -45;
                    step = 20, rows = 4;
                    
                    //If it fits four rows evenly, do so
                    if(levels[this.level] % 4 === 0){
                        width = levels[this.level] / rows;
                        left = -((step * width/2) - step/2);
                        
                        for(var a = 0; a < width; a++){
                            for(var s = 0; s < rows; s++){
                                
                                positions.push(new pc.Vec3(left, 0, top));
                           //     left += step;
                                top += vStep;
                            }
                    //        top += vStep;
                    //        left = -((step * width/2) - step/2);
                                left += step;
                                top = -45;
                        }
                    }
                    else {
                        //Else put on three rows and put remainder on last row
                        var leftOvers = levels[this.level] % rows;
                        width = (levels[this.level] - leftOvers) / rows; 
                        left = -((step * width/2) - step/2);
                        
                        //3 rows
                        for(var i = 0; i < width; i++){
                            for(var j = 0; j < rows; j++){
                                
                                positions.push(new pc.Vec3(left, 0, top));
                                left += step;
                            }
                            top += vStep;
                            left = -((step * width/2) - step/2);
                        }
                        
                        //center leftovers
                        switch(leftOvers){
                            case 1: 
                                positions.push(new pc.Vec3(step/2, 0, top));
                                break;
                            case 2:
                                positions.push(new pc.Vec3(step, 0, top));
                                positions.push(new pc.Vec3(0, 0, top));
                                break;
                            case 3:
                                positions.push(new pc.Vec3(step/2, 0, top));
                                positions.push(new pc.Vec3(step/2 + step, 0, top));
                                positions.push(new pc.Vec3(step/2 - step, 0, top));
                                break;
                        }
                    }
                    
                    break;
            }
            
            return positions;
        },
        
        enterState: function(state){
            switch(state){
                case gamestates.LEVELSELECT:
                    this.entity.script.send("user", "showScoreText");
                    this.createMenu(state);
                    
                    //Set sidepanel
                    context.root.findByName("SidePanel").model.materialAsset = context.assets.getAssetByName(states[state] + "SP");
                    
                    break;
                case gamestates.MENU:
                case gamestates.DECKSELECT:
                    this.entity.script.send("user", "hideScoreText");
                    this.createMenu(state);
                    
                    //Set sidepanel
                    context.root.findByName("SidePanel").model.materialAsset = context.assets.getAssetByName(states[state] + "SP");
                    break;
                case gamestates.LEVEL:
                    this.entity.script.send("user", "hideScoreText");
                    this.createCards();
                    
                    //Set sidepanel
                    context.root.findByName("SidePanel").model.materialAsset = context.assets.getAssetByName(states[state] + (this.level+1) + "SP");
                    break;
            }
            
            
        },
        
        exitState: function(state){
            var expired;
            
            for(var i = 0; i < menuItems[state].length; i++){
                expired = context.root.find('name', menuItems[state][i]);
                
                for(var j = 0; j < expired.length; j++){
                    expired[j].script.send("swoosh", "setTargetPos", new pc.Vec3(
                        expired[j].getPosition().x+185,
                        expired[j].getPosition().y,
                        expired[j].getPosition().z
                    ), true);
                }
            }
        }
    };

    return States;
});