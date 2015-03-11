pc.script.attribute("colours", "asset", []);
pc.script.attribute("halloween", "asset", []);
pc.script.attribute("numbers", "asset", []);
pc.script.attribute("bibeogaem", "asset", []);

pc.script.create('decks', function (context) {
    
    var deckTypes = ["colours", "halloween", "numbers", "bibeogaem"];
    
    // Creates a new Decks instance
    var Decks = function (entity) {
        this.entity = entity;
        this.currentDeck = 0;
    };

    Decks.prototype = {
        // Called once after all resources are loaded and before the first update
        initialize: function () {
        },

        // Called every frame, dt is time in seconds since last update
        update: function (dt) {
        },
        
        changeDeck: function(deck){
            this.currentDeck = deck;
        },
        
        getDeck: function(){
            return {
                name: deckTypes[this.currentDeck],
                id: this.currentDeck,
                assets: this[deckTypes[this.currentDeck]]
            };
        }
    };

    return Decks;
});