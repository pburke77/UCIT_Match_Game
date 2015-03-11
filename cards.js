pc.script.create('cards', function (context) {
    // Creates a new Cards instance
    var Cards = function (entity) {
        this.entity = entity;
        this.cards = [];
        this.pairs = [];
        this.rotatingCards = [];
        this.rotationSpeed = 220;
        this.clickedCards = [];
        this.totalFlips = 0;
        this.time = 100000;
        this.countingTime = false;
    };

    Cards.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },
        
        startLevel: function(){
            this.cards = context.root.find('name','card');
            this.pairUp();
            this.totalFlips = 0;
        },
        
        pairUp: function(){
            //Pair up all the cards and apply materials
            this.faces = this.entity.script.send("decks", "getDeck").assets;
            this.cards = this.shuffle(this.cards);
            this.faces = this.shuffle(this.faces);
            
            for(var i = 0; i < this.cards.length/2; i++){
                this.cards[i].findByName("Front").model.materialAsset = this.faces[i];
                this.cards[i+this.cards.length/2].findByName("Front").model.materialAsset = this.faces[i];
                this.pairs.push([i,i+this.cards.length/2]);
            }
        },
        
        shuffle: function(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;
            
            // While there remain elements to shuffle...
            while (0 !== currentIndex) {
                
                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                
                // And swap it with the current element.
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            
            return array;
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
            if(this.countingTime){
                this.time += dt;
            }
        },
        
        startCountingTime: function(){
            this.countingTime = true;
            this.time = 0;
        },
        
        stopCountingTime: function(){
            this.countingTime = false;  
        },
        
        flip: function(cardNum, show, secondCard, removeClicked){
            if(show){
                this.startTween(this.cards[cardNum].getEulerAngles(), new pc.Vec3(0,0,180),this.cards[cardNum], secondCard, removeClicked);
                this.entity.audiosource.play("cardflip");
            }
            else {
                this.startTween(this.cards[cardNum].getEulerAngles(), new pc.Vec3(0,0,0),this.cards[cardNum], secondCard, removeClicked);
            }
        },
        
        startTween: function (from, to, card, doCheck, removeClicked) {
            var self = this;
            var notComplete = true;
            var show = false;
            if(from.z === 0)show = true;

            this.tween = new TWEEN.Tween({
                x: from.x,
                y: from.y,
                z: from.z
            }).to({
                x: to.x,
                y: to.y,
                z: to.z
            },750)
                .easing( TWEEN.Easing.Back.Out )
                .onUpdate(function () {
                    if(this.z < 90 && notComplete && !show){
                        notComplete = false;
                        if(doCheck) {
                            self.checkFlipped();
                        }
                        
                        if(removeClicked){
                            self.clickedCards = [];
                        }
                    }
                card.setEulerAngles(this.x, this.y, this.z);
            }).onComplete(function () {
                if(notComplete){
                    if(doCheck) {
                        self.checkFlipped();
                    }
                    
                    if(removeClicked){
                        self.clickedCards = [];
                    }
                }
            }).start();
        },
        
        numById: function(cardID){
            for(var i = 0; i < this.cards.length; i++){
                if(this.cards[i] !== 0){
                    if(this.cards[i].getGuid() === cardID){
                        return i;
                    }
                }
            }
        },
        
        clickCard: function(cardNum){
            
            if(this.clickedCards.length === 0){
                this.clickedCards.push(cardNum);
                this.flip(cardNum, true);
            }
            else if(this.clickedCards.length === 1 && this.clickedCards[0] !== cardNum){
                this.clickedCards.push(cardNum);
                this.flip(cardNum, true, true);
            }
        },
        
        checkFlipped: function(){
            if(this.totalFlips < 1) this.startCountingTime();
            
            this.totalFlips++;
            
            for(var i = 0; i < this.pairs.length; i++){
                if(this.pairs[i][0] === this.clickedCards[0] && this.pairs[i][1] === this.clickedCards[1] ||
                    this.pairs[i][0] === this.clickedCards[1] && this.pairs[i][1] === this.clickedCards[0]){
                        
                    this.matchingPair();
                    return true;
                }
            }
            this.clearClicked();
        },
        
        matchingPair: function(){
            this.cards[this.clickedCards[0]].destroy();
            this.cards[this.clickedCards[0]] = 0;
            this.cards[this.clickedCards[1]].destroy();
            this.cards[this.clickedCards[1]] = 0;
            this.clickedCards = [];
            this.checkGameOver();
        },
        
        clearClicked: function(){
            this.flip(this.clickedCards[0], false);
            this.flip(this.clickedCards[1], false, false, true);
            this.entity.audiosource.play("cardflip");
        },
        
        checkGameOver: function(){
            for(var i = 0; i < this.cards.length; i++){
                if(this.cards[i] !== 0){
                    return false;
                }
            }
            this.stopCountingTime();
            this.endLevel();
        },
        
        endLevel: function(){
            //Update saved score if improved
            var level = this.entity.script.send("states", "getLevel");
            var score = this.entity.script.send("user", "getScore", level);
            var time = this.entity.script.send("user", "getTime", level);
            
            if(this.totalFlips < score || score === null || (this.totalFlips === score && this.time < time)){
                this.entity.script.send("user", "updateScore", level, this.totalFlips, this.time.toFixed(2));
            }
            
            this.cards = [];
            this.pairs = [];
            this.rotatingCards = [];
            this.clickedCards = [];
            this.entity.script.send("states", "completeLevel");
            this.entity.script.send("states", "switchState", 0);
            this.entity.audiosource.play("menuswoop");
            this.totalFlips = 0;
        }
    };

    return Cards;
});