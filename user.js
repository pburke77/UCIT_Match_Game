Parse.initialize("ZCWVCi3dGEFYvbMrjsfXUfM1gSAaqLwDfoFxkNGR", "erLLHo34dQdEnbMkx90w8IYWhN2EeOT29NoIPwJI");
pc.script.create('user', function (context) {
    // Creates a new User instance
    var User = function (entity) {
        this.entity = entity;
        this.username = "test";
        this.scores = [null, null, null, null, null, null, null, null];
        this.times = [null, null, null, null, null, null, null, null];
        this.leaderboards = [[],[],[],[],[],[],[],[]];
        this.scoresText = [];
        this.leaderText = [];
        this.maxLevels = 8;
    };

    User.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
            for(var i = 1; i <= this.maxLevels; i++){
                this.scoresText.push(context.root.findByName("Level"+i+"HighScore"));
                this.leaderText.push(context.root.findByName("Level"+i+"Leaderboard"));
            }
            
            this.hideScoreText(this.scoresText);
            
            this.askUsername();
        },
        
        hideScoreText: function(){
            var levels = this.scoresText, 
            leaders = this.leaderText;
            
            for(var i = 0; i < levels.length; i++){
                if(levels[i].script.font_renderer.x < 1500){
                    levels[i].script.font_renderer.x += 9000;
                }
                
                if(leaders[i].script.font_renderer.x < 1500){
                    leaders[i].script.font_renderer.x += 9000;
                }
            }
            
            if(context.root.findByName("HighScores").script.font_renderer.x < 1500){
                context.root.findByName("HighScores").script.font_renderer.x += 9000;
            }
            
            if(context.root.findByName("Leaderboard").script.font_renderer.x < 1500){
                context.root.findByName("Leaderboard").script.font_renderer.x += 9000;
            }
        },
        
        showScoreText: function(){
            var levels = this.scoresText, 
            leaders = this.leaderText;
            
            for(var i = 0; i < levels.length; i++){
                if(levels[i].script.font_renderer.x > 1500){
                    levels[i].script.font_renderer.x -= 9000;
                }
                
                if(leaders[i].script.font_renderer.x > 1500){
                    leaders[i].script.font_renderer.x -= 9000;
                }
            }
            
            if(context.root.findByName("HighScores").script.font_renderer.x > 1500){
                context.root.findByName("HighScores").script.font_renderer.x -= 9000;
            }
            
            if(context.root.findByName("Leaderboard").script.font_renderer.x > 1500){
                context.root.findByName("Leaderboard").script.font_renderer.x -= 9000;
            }
        },

        update: function (dt) {
            
        },
        
        askUsername: function(){
            
             $(document.body).append('<canvas id="textEntry" width="'+ 200 +'" height="'+ 50 +
                '" style="z-index: 1; top: 50%; margin-left: -100px; left: 50%; position: absolute;"></canvas>');
                
                var placeholderText = 'Enter Username';
                
                var input = new CanvasInput({
                    canvas: document.getElementById('textEntry'),
                    width: 180,
                    height: 20,
                    backgroundColor: "rgba(41, 99, 79, 0.6)",
                    fontColor: "rgba(255, 255, 255, 1)",
                    placeHolderColor: "rgba(0, 0, 0, 0.5)",
                    selectionColor: "rgba(19, 19, 19, 0.8)", 
                    placeHolder: placeholderText,
                    padding: 0,
                    onsubmit: function(){
                        context.systems.script.broadcast('user', 'getUsername', input._value);
                        input._value = "";
                        input._hiddenInput.value = '';
                    }
                });
        },
        
        getUsername: function(name){
            var n = name.replace(/([^a-z0-9áéíóúñü_-\s\.,]|[\t\n\f\r\v\0])/gim,"");
            n = n.trim();
            n = n.toLowerCase();
            this.username = n;
            
            var TE = document.getElementById('textEntry');
            TE.parentNode.removeChild(TE);
            
            TE = document.body.getElementsByTagName('input');
            TE[0].parentNode.removeChild(TE[0]);
            
            context.root.findByName("IntroPanel").setPosition(-900,0,0);
            
            this.entity.script.send("states", "switchState", 0);
            this.login();
        },
        
        login: function(){
            var that = this;
            var query = new Parse.Query("Player");
            query.equalTo("name", this.username);
            query.find({
                success: function(user) {
                    if(user.length > 0){
                        that.getScores();
                    }
                    else {
                        that.createNewUser();
                    }
                },
                error: function(error){
                    console.log("Could not get user info: ", error.message);
                }
            });
            
            this.getHighScores();
        },
        
        getScore: function(level){
            return this.scores[level];  
        },
        
        getTime: function(level){
            return this.times[level];  
        },
        
        updateScore: function(level, score, time){
            this.scores[level] = score;  
            this.times[level] = parseFloat(time);
            this.saveScores();
        },
        
        updateScoresText: function(){
            for(var i = 0; i < this.scoresText.length; i++){
                var text = "";
                
                if(this.scores[i]){
                    if(this.times[i]){
                        text = "" + (i+1).toString() + ": " + this.scores[i].toString() + " flips in " + this.times[i].toString() + "s";
                    }
                    else text = "" + (i+1).toString() + ": " + this.scores[i].toString() + " flips";
                }
                else text = "" + (i+1).toString() + ": None Set";
                
                this.scoresText[i].script.font_renderer.text = text;
            }  
        },
        
        createNewUser: function(){
            var playerObj = Parse.Object.extend("Player");
            var player = new playerObj();
            
            player.set("name", this.username);
            player.set("scores", this.scores);
            player.set("times", this.times);
            
            var that = this;
            player.save(null, {
                success: function(obj) {
                },
                error: function(obj, error) {
                    console.log("could not save new player: ", obj.id, " Error: ", error.message);
                }
            });
        },
        
        getScores: function(){
            var that = this;
            var query = new Parse.Query("Player");
            query.equalTo("name", this.username);
            query.first({
                success: function(userInfo){
                    that.scores = userInfo.get("scores");
                    that.times = userInfo.get("times");
                    that.updateScoresText();
                },
                error: function(error){
                    console.log("Could not get user info: ", error.message);
                }
            });
        },
        
        clearHighScores: function(){
            for(var i = 0; i < this.leaderboards.length; i++){
                this.leaderboards[i] = [];
            }  
        },
        
        getHighScores: function(){
            this.clearHighScores();
            
            var that = this;
            var users = new Parse.Query("Player");
            
            users.find({
				success: function(user){	
				    for(var i = 0; i < user.length; i++){
				        var scores = user[i].get("scores");
				        var times = user[i].get("times");
				        var username = user[i].get("name");
				        
				        for(var j = 0; j < scores.length; j++){
				            if(scores[j] !== null && times[j] !== null){
				                that.leaderboards[j].push([username, scores[j], times[j]]);
				            }
				        }
				    }
				    
				    that.sortHighScores();
				},
				error: function(error){
				    console.log("Problem getting all users: ", error.message);
				}
            });
        },
        
        sortHighScores: function(){
            for(var i = 0; i < this.leaderboards.length; i++){
                this.leaderboards[i].sort(function(a,b){
                    
                    if(parseInt(a[1], 10) === parseInt(b[1],10)){
                        return parseFloat(a[2]) - parseFloat(b[2]);
                    }
                    else return parseInt(a[1], 10) - parseInt(b[1],10);
                    
                });
            }
            
            this.updateHighScoresText();
        },
        
        updateHighScoresText: function(){
            for(var i = 0; i < this.leaderText.length; i++){
                var text = "None Set";
                
                if(this.leaderboards[i].length > 0){
                    text = this.leaderboards[i][0][0] + " - " + 
                        this.leaderboards[i][0][1] + " in " + this.leaderboards[i][0][2].toString() + "s";
                }
                
                this.leaderText[i].script.font_renderer.text = (i+1).toString() + ": " + text;
            }
        },
        
        saveScores: function(){
            var that = this;
            var query = new Parse.Query("Player");
            query.equalTo("name", this.username);
            query.first({
                success: function(userInfo){
                    userInfo.set("scores", that.scores);
                    userInfo.set("times", that.times);
                    
                    userInfo.save({
                        success: function(object) {
                            that.updateScoresText();
                            that.getHighScores();
                        },
                        error: function(object, error) {
                            console.log("Save failed: ", error.message);
                        }
                    });
                },
                error: function(error){
                    console.log("Could not save score info: ", error);
                }
            });
        }
    };

    return User;
});