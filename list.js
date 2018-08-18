var config = {
    apiKey: "AIzaSyAefAQ35tZ6bEsqkQMZpSoZi3QIhZ7wEnI",
    authDomain: "not-quite-trello.firebaseapp.com",
    databaseURL: "https://not-quite-trello.firebaseio.com",
    projectId: "not-quite-trello",
    storageBucket: "not-quite-trello.appspot.com",
    messagingSenderId: "797588409048"
  };

var db = firebase.initializeApp(config).database(); 
Vue.use(VueFire);

var app = new Vue({
    created: function(){ //reads data from firebase each time the app is loaded
        var curr = this;
        function readData(snapshot) {
            var data = snapshot.val();
            if ("users" in data) { //check if users exists
                for (var i=0; i<data.users.length; i++){
                    curr.users.push(data.users[i]); //updates local users with firebase users
                }
            }
            if ("counter" in data) { //check if counter exists to have accurate list ids
                curr.counter = data.counter;
            }
            if ("currUser" in data) { //check if the current user exists in db
                curr.currUser = data.currUser;
            }
            if ("loginStyle" in data) { //check if loginStyle exists in db
                curr.loginStyle = data.loginStyle;
            }
            if ("lists" in data) { //check if lists exists in db
                for (var j=0; j<data.lists.length; j++) {
                    curr.lists.push(data.lists[j]);
                    if (!("activityLog" in data.lists[j])) { //make sure activity log exists
                        data.lists[j].activityLog = []; //if not, add one
                    }
                    if (!("cards" in data.lists[j])) { //make sure a cards array exists
                        data.lists[j].cards = []; //if not, add one 
                    }
                }
            } 
            db.ref("/").off("value", readData);
        }
        db.ref("/").on("value", readData);
    },

    data: {
        users: [],
        lists: [],
        newName: '',
        newEmail: '',
        newImg: '',
        editName: '', //allows user to change name
        editEmail: '', //allows user to change email
        editImg: '', //allows user to change image
        attempt: '', //user attempting to sign in
        currUser: {
            name: '',
            email: '',
            image: ''
        }, //current user logged in
        loginStyle: { //styling created for login to hide once user has signed in
            display: 'block'
        },
        counter: 0
    }, 
    
    methods: {
        addFb(key, data) { //this method allows writing data to firebase in each function
            db.ref("/" + key).set(data); //adapted from https://firebase.google.com/docs/database/web/read-and-write
        },
        
        addUser() { //this method adds a user to the users array in data, saving the name and email address
            for (var i=0;i<this.users.length;i++){
                if (this.users[i].email.toLowerCase()===this.newEmail.toLowerCase()){
                    alert("A user with this email address already exists. Please log in.");
                    this.newName = '';
                    this.newEmail = '';
                    this.newImg = '';
                    return;
                }
            }
            this.users.push({
                name: this.newName.toLowerCase(),
                email: this.newEmail.toLowerCase(), 
                image: this.newImg.toLowerCase()
            });
            this.currUser = {
                name: this.newName,
                email: this.newEmail,
                image: this.newImg
            };
            if (this.currUser.name!==''){
                this.loginStyle.display="none";
            }
            
            //after adding user, reset the new name, email address, and image to blank so inputs clear
            this.newName = '';
            this.newEmail = '';
            this.newImg = '';
            this.addFb("users", this.users);
            this.addFb("currUser", this.currUser);
            this.addFb("loginStyle", this.loginStyle);
        },
        
        checkExists() { //when a user attempts to sign in, check if they've registered yet
            var ex = 0; //variable to track if user exists in users array yet
            for (var i=0; i<this.users.length; i++){
                if(this.users[i].name==this.attempt || this.users[i].email==this.attempt){
                    this.currUser = this.users[i];
                    ex = 1;
                    this.attempt = '';
                }
            } 
            if(ex === 0){
                this.currUser = {
                    name: '',
                    email: '',
                    image: ''
                };
                this.attempt = '';
                alert("You do not have an account yet. Please sign up.");
            }
            if(this.currUser.name !== ''){
                this.loginStyle.display="none";
            }
            this.addFb("currUser", this.currUser);
            this.addFb("loginStyle", this.loginStyle);
        },
        
        signOut() { //sets current user to null
            this.currUser = {
                name: '',
                email: '',
                image: ''
            };
            this.loginStyle.display="block";
            this.addFb("currUser", this.currUser);
            this.addFb("loginStyle", this.loginStyle);
        },
        
        
        /* Following 3 functions allow user to change email address, name, and image */
        changeEmail() {
            for (var i=0; i<this.users.length; i++){
                if(this.users[i].name==this.currUser.name||this.users[i].email==this.currUser.email){
                    this.users[i].email = this.editEmail;
                    this.currUser.email = this.editEmail;
                }
            }
            this.addFb("currUser", this.currUser);
            this.addFb("users", this.users);
            this.editEmail = '';   
        },
        
        changeName() {
            for (var i=0; i<this.users.length; i++){
                if(this.users[i].name==this.currUser.name||this.users[i].email==this.currUser.email){
                    this.users[i].name = this.editName;
                    this.currUser.name = this.editName;
                }
            }
            this.addFb("currUser", this.currUser);
            this.addFb("users", this.users);
            this.editName = '';
        },
        
        changeImg() {
            for (var i=0; i<this.users.length; i++){
                if(this.users[i].name==this.currUser.name||this.users[i].email==this.currUser.email){
                    this.users[i].image = this.editImg;
                    this.currUser.image = this.editImg;
                }
            }
            this.addFb("currUser", this.currUser);
            this.addFb("users", this.users);
            this.editImg = '';
        },
        
        addList() {
            this.lists.push({
                id: this.counter,
                title: '',
                newTitle: '',
                bgcolor: '', 
                cards: [],
                holder: [],
                activityLog: [],
                listStyle: {
                    backgroundColor: "",
                    border: "2px solid #e6e6e6",
                    padding: "10px",
                    marginLeft: "5px",
                    marginRight: "5px",
                    marginTop: "5px",
                    marginBottom: "5px",
                    paddingBottom: "40px",
                    maxWidth: "350px"
                },
                newCard: {
                    title: '',
                    newTitle: '',
                    description: '',
                    dateCreated: '',
                    deadline: '',
                    image: '',
                    todos: [{
                        title: "Add todo-list items to your card!"
                    }],
                    newTodo: '',
                    comments: [{
                        text: "Add any comments to your card!"
                    }],
                    cardUsers: [{
                        user: "Add any users to your card."  
                    }],
                    newComment: '',
                    buttonStyle: {
                        backgroundColor: "#e6e6e6",
                        display: 'block',
                        padding: "10px",
                        marginLeft: "35px",
                        marginRight: "5px",
                        marginTop: "40px",
                        marginBottom: "10px",
                        borderRadius: "10px"
                    },
                    cardStyle: {
                        backgroundColor: "#e6e6e6",
                        display: "none",
                        padding: "10px",
                        marginLeft: "35px",
                        marginRight: "5px",
                        marginTop: "10px",
                        marginBottom: "10px",
                        borderRadius: "10px"
                    }
                }
            });
            this.counter++;
            this.addFb("counter", this.counter);
            this.addFb("lists", this.lists);        
        },
        
        setTitle(id){ //makes sure title is updated in firebase when it's set in the app
            this.lists[id].title = this.lists[id].newTitle.trim();
            this.lists[id].newTitle = '';
            this.addFb("lists", this.lists);
        },
        
        setBgColor(id) { //allows a user to set the background color of each list
            this.lists[id].listStyle.backgroundColor = this.lists[id].bgcolor;
            this.lists[id].bgcolor = '';
            this.addFb("lists", this.lists);
        },
        
        addCard(list, id) { // this method adds a card as an item in the list object it's part of
            if(this.lists[id].newCard){
                this.lists[id].cards.push({
                    title: this.lists[id].newCard.title,
                    description: '',
                    newTitle: '',
                    dateCreated: new Date(),
                    deadline: '',
                    image: '',
                    category: '',
                    todos: [{
                        title: "Add todo-list items to your card!"
                    }],
                    newTodo: '',
                    comments: [{
                        text: "Add any comments to your card!"
                    }],
                    cardUsers: [{
                        user: "Add any users to your card."  
                    }],
                    newComment: '',
                    buttonStyle: {
                        backgroundColor: "#e6e6e6",
                        display: 'block',
                        padding: "10px",
                        marginLeft: "35px",
                        marginRight: "5px",
                        marginTop: "40px",
                        marginBottom: "10px",
                        borderRadius: "10px"
                    },
                    cardStyle: {
                        backgroundColor: "#e6e6e6",
                        display: "none",
                        padding: "10px",
                        marginLeft: "35px",
                        marginRight: "5px",
                        marginTop: "10px",
                        marginBottom: "10px",
                        borderRadius: "10px"
                    }
                });
            }
            this.lists[id].newCard = {
                title: '',
                newTitle: '',
                description: '',
                dateCreated: '',
                deadline: '',
                image: '',
                category: '',
                todos: [{
                    title: "Add todo-list items to your card!"
                }],
                newTodo: '',
                comments: [{
                    text: "Add any comments to your card!"
                }],
                cardUsers: [{
                    user: "Add any users to your card."  
                }],
                newComment: '',
                buttonStyle: {
                    backgroundColor: "#e6e6e6",
                    display: 'block',
                    padding: "10px",
                    marginLeft: "35px",
                    marginRight: "5px",
                    marginTop: "40px",
                    marginBottom: "10px",
                    borderRadius: "10px"
                },
                cardStyle: {
                    backgroundColor: "#e6e6e6",
                    display: "none",
                    padding: "10px",
                    marginLeft: "35px",
                    marginRight: "5px",
                    marginTop: "10px",
                    marginBottom: "10px",
                    borderRadius: "10px"
                }
            };
            this.addFb("lists", this.lists);
        },
        
        changeTitle(card, id) { //allows a user to change a card's title
            var d = new Date();
            var strD = d.toString();
            var cardIdx = this.lists[id].cards.indexOf(card);
            this.lists[id].activityLog.push("Title changed from " + this.lists[id].cards[cardIdx].title+ " to " + card.newTitle + " on " + strD);
            this.lists[id].cards[cardIdx].title = card.newTitle;
            card.newTitle='';
            this.addFb("lists", this.lists);
        },
        
        removeCard(card, id) { //removes a card from the list
            var d = new Date();
            var strD = d.toString();
            var cardIdx = this.lists[id].cards.indexOf(card);
            this.lists[id].activityLog.push("The following card was removed: " + this.lists[id].cards[cardIdx].title + " on " + strD);
            this.lists[id].cards.splice(this.lists[id].cards.indexOf(card), 1);
            this.addFb("lists", this.lists);
        },
        
        removeList(list, id) { //removes a list
            if (this.counter>=this.lists.length){
                this.counter--;
            }
            this.lists.splice(id, 1);
            for (var i=0; i<this.lists.length; i++){
                if (this.lists[i].id > id) {
                    this.lists[i].id--;
                }
            }
            this.addFb("counter", this.counter);
            this.addFb("lists", this.lists);
        },
        
        addCardUser(card, id) { //allows a user to select a user from a dynamically populated dropdown menu and add to the card
            /* Challenge feature */
            var d = new Date();
            var strD = d.toString();
            if (strD.length === 0){
                return;
            }
            var el = document.getElementById("usr");
            var strUser = el.options[el.selectedIndex].text;
            var cardIdx = this.lists[id].cards.indexOf(card);
            this.lists[id].cards[cardIdx].cardUsers.push({
                user: strUser
            });
            this.lists[id].activityLog.push("The following user was added: " + strUser + " on " + strD);
            this.addFb("lists", this.lists);
        },
        
        removeUser(card, id, user) { //allows user to remove someone from users that were added to the card
            var cardIdx = this.lists[id].cards.indexOf(card);
            var usrIdx = this.lists[id].cards[cardIdx].cardUsers.indexOf(user);
            this.lists[id].cards[cardIdx].cardUsers.splice(usrIdx, 1);
            this.addFb("lists", this.lists);
        },
 
        collapse(id) { //hides list contents in a holder array
            if (this.lists[id].cards.length > 0){ //makes sure there is something to collapse
                this.lists[id].holder = this.lists[id].cards;
                this.lists[id].cards = [];
            }
            this.addFb("lists", this.lists);
        },
        
        expand(id) { //shows list contents by filling cards array with the contents of holder
            if (this.lists[id].holder.length > 0){ //make sure there is something to expand
                this.lists[id].cards = this.lists[id].holder;
                this.lists[id].holder = [];
            }
            this.addFb("lists", this.lists);
        },
        
        moveRight(id) { //moves a list right by replacing it with the contents of the list to the right of it
            if (this.lists[id+1]){
                var tempList = this.lists[id+1];
                var arr = this.lists;
                this.lists[id].id += 1;
                this.lists[id+1].id -= 1;
                arr.splice(id+1, 1, this.lists[id]);
                arr.splice(id, 1, tempList);
            }
            this.addFb("lists", this.lists);
        },
        
        moveLeft(id) { //moves a list left by replacing it with the contents of the list to the left of it
            if (this.lists[id-1]){
                var tempList = this.lists[id-1];
                var arr = this.lists;
                this.lists[id].id -= 1;
                this.lists[id-1].id += 1;
                arr.splice(id-1, 1, this.lists[id]);
                arr.splice(id, 1, tempList);
            }
            this.addFb("lists", this.lists);
        },
        
        showActLog(id) { //displays activity log array that is added to each time a change is made to a card
            /* Challenge feature */
            var log = this.lists[id].activityLog;
            alert(log.join("\n"));
        },
        
        moveCardRight(card, list, id) { //moves a card to the list on its right by adding it to that list's cards array
            if (this.lists[id+1]){
                this.lists[id+1].cards.push(card);
                this.lists[id].cards.splice(this.lists[id].cards.indexOf(card), 1);
            }
            this.addFb("lists", this.lists);
        },
        
        moveCardLeft(card, list, id) { //moves a card to the list on its left by adding it to that list's cards array
            if (this.lists[id-1]){
                this.lists[id-1].cards.push(card);
                this.lists[id].cards.splice(this.lists[id].cards.indexOf(card), 1);
            }
            this.addFb("lists", this.lists);
        },
        
        showCardInfo(card, id) { //allows user to show the details of a card by pressing a button that will display it
            var cardIdx = this.lists[id].cards[this.lists[id].cards.indexOf(card)];
            if (cardIdx.cardStyle.display === "none") {
                cardIdx.cardStyle.display = "block";
            } else {
                cardIdx.cardStyle.display = "none";
            }
            this.addFb("lists", this.lists);
        },
        
        addTodo(card, id) { //adds a todo to the mini todo list within the card
            var d = new Date();
            var strD = d.toString();
            var cardIdx = this.lists[id].cards.indexOf(card);
            this.lists[id].cards[cardIdx].todos.push({
                title: this.lists[id].cards[cardIdx].newTodo
            });
            this.lists[id].activityLog.push("The following todo list item: " + this.lists[id].cards[cardIdx].newTodo+ ", was added to " + this.lists[id].cards[cardIdx].title + " on " + strD);
            this.lists[id].cards[cardIdx].newTodo = '';
            this.addFb("lists", this.lists);
        },

        removeTodo(todo, card, id) { // remove given todo from the list within the card
            var d = new Date();
            var strD = d.toString();
            var cardLoc = this.lists[id].cards[this.lists[id].cards.indexOf(card)];
            var todoList = cardLoc.todos;
            this.lists[id].activityLog.push("The following todo list item: "+todoList[todoList.indexOf(todo)]+ ", was removed from " + cardLoc.title + " on " + strD);
            todoList.splice(todoList.indexOf(todo), 1);
            this.addFb("lists", this.lists);
        },
        
        addComment(card, id) { //allows a user to add a comment to the card
            var d = new Date();
            var strD = d.toString();
            var cardLoc = this.lists[id].cards[this.lists[id].cards.indexOf(card)];
            cardLoc.comments.push({
                text: this.currUser.name+" commented: "+cardLoc.newComment
            });
            this.lists[id].activityLog.push("The following comment: "+cardLoc.newComment+", was added to "+cardLoc.title+" on " +strD);
            cardLoc.newComment = '';
            this.addFb("lists", this.lists);
        },

        removeComment(comment, card, id) { //remove given comment from the list
            var d = new Date();
            var strD = d.toString();
            var cardLoc = this.lists[id].cards[this.lists[id].cards.indexOf(card)];
            var commentList = cardLoc.comments;
            this.lists[id].activityLog.push("The following comment: " + commentList[commentList.indexOf(comment)]+ ", was removed from " + cardLoc.title + " on " + strD);
            commentList.splice(commentList.indexOf(comment), 1);
            this.addFb("lists", this.lists);
        },
        
        setCardColor(card, id) { //changes the card color based on category "normal" or "urgent"
            var cardsSC = this.lists[id].cards;
            if(cardsSC[cardsSC.indexOf(card)].category=="normal"){         
                cardsSC[cardsSC.indexOf(card)].cardStyle.backgroundColor="#64ff59";
                cardsSC[cardsSC.indexOf(card)].buttonStyle.backgroundColor="#64ff59";
            } 
            else if (cardsSC[cardsSC.indexOf(card)].category=="urgent"){
                cardsSC[cardsSC.indexOf(card)].cardStyle.backgroundColor="#ff7272";
                cardsSC[cardsSC.indexOf(card)].buttonStyle.backgroundColor="#ff7272";
            }
            else if (cardsSC[cardsSC.indexOf(card)].category=="none"){
                cardsSC[cardsSC.indexOf(card)].cardStyle.backgroundColor="#e6e6e6";
                cardsSC[cardsSC.indexOf(card)].buttonStyle.backgroundColor="#e6e6e6";
            }
            this.addFb("lists", this.lists);
        },
        
        filterCards(){ //filters cards user can see based on the category matching a selection from dropdown list
            var el = document.getElementById("filt");
            var catg = el.options[el.selectedIndex].value;
            for(var i=0; i<this.lists.length; i++){
                for(var j=0; j<this.lists[i].cards.length;j++){
                    console.log(this.lists[i].cards[j].cardStyle.display);
                    if (catg=="all") {
                        this.lists[i].cards[j].cardStyle.display="block";
                        this.lists[i].cards[j].buttonStyle.display="block";
                    }
                    if (this.lists[i].cards[j].category==catg){
                        this.lists[i].cards[j].cardStyle.display="block";
                        this.lists[i].cards[j].buttonStyle.display="block";
                    } 
                    if (this.lists[i].cards[j].category!=catg && catg!="all") {
                        this.lists[i].cards[j].cardStyle.display="none";
                        this.lists[i].cards[j].buttonStyle.display="none";
                    }
                }
            }
        }
    }
});

app.$mount('#listapp');
