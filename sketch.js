//Creating variables here
var dog, happyDog, foodS, database, foodStock;
var dogImg, happyDogImg;
var count = 20;
var fedTime, lastFed, foodObj, feedPet, AddFood;
var changeState, readState;
var bedroomImg, gardenImg, washroomImg;
var gameState;

function preload()
{

  //loading images here
  dogImg = loadImage("dogImg.png");
  happyDogImg = loadImage("dogImg1.png");
  bedroomImg = loadImage("Bed Room.png");
  gardenImg = loadImage("Garden.png");
  washroomImg = loadImage("Wash Room.png");

}

function setup() {
  createCanvas(1000, 500);
  
  //adding dog 
  dog = createSprite(800, 200);
  dog.addImage(dogImg);
  dog.scale = 0.2;

  database = firebase.database();

  //reading food stock from database
  foodStock = database.ref('Food')
  foodStock.on("value", (data)=>{
    foodS = data.val();
    foodObj.updateFoodStock(foodS);
  });

  foodObj = new Food();

  //creating button to feed pet
  feedPet = createButton("Feed the dog");
  feedPet.position(700, 20);
  feedPet.mousePressed(feedDog);

  //creating button to add food
  AddFood = createButton("Add food");
  AddFood.position(800, 20);
  AddFood.mousePressed(addFoods);

  //reading game state from database
  readState = database.ref('gameState');
  readState.on("value", function(data){
    gameState = data.val();
  });

}


function draw() {  
  background(46, 139, 87);

  foodObj.display();

  //reading value from database
  fedTime = database.ref('FeedTime');
  fedTime.on("value", function(data){
    lastFed = data.val();
  });

  fill(255, 255, 254);
  textSize(15);
  if (lastFed >= 12){
    text("Last fed: "+lastFed%12+"PM", 500, 30);
    }else if (lastFed == 0){
    text("Last fed : 12 AM", 500, 30);
    }else {
    text("Last fed : " + lastFed + "AM", 500, 30);
  }

  //if gameState is not equal to hungry hide button and remove dog
  if (gameState != "Hungry"){
    feedPet.hide();
    AddFood.hide();
    dog.remove();
  }else {
    feedPet.show();
    AddFood.show();
    dog.addImage(dogImg);
  }

  //updating background according to time
  currentTime = hour();
  if (gameState != "Hungry"){
    if (currentTime === (lastFed+1)){
      update("Playing");
      foodObj.garden();
    }else if (currentTime === (lastFed+2)){
      update("Sleeping");
      foodObj.bedroom();
    }else if (currentTime > (lastFed+2) && currentTime <= (lastFed+4)){
      update("Bathing");
      foodObj.washroom();
    }else {
      update("Hungry");
      foodObj.display();
    }
  }

  drawSprites();

  foodObj.display();

  //add styles here
  textSize(20);
  fill("white");
  text("Food Remaining: " + foodS, 200, 100);
}

function addFoods(){
  foodS++;
  database.ref('/').update({
    Food : foodS
  });
}

function feedDog(){
  dog.addImage(happyDogImg);

  foodObj.updateFoodStock(foodObj.foodStock-1);
  database.ref('/').update({
    Food : foodObj.foodStock,
    FeedTime : hour()
  });
}

function update(state){
  database.ref('/').update({
    gameState : state
  });
}
