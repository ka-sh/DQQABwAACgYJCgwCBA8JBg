var BS_BROKER_HOST="127.0.0.1";
var BS_BROKER_PORT="11300";
var TUBE="test_tube";

var fivebeans = require('fivebeans');
var client = new fivebeans.client(BS_BROKER_HOST,BS_BROKER_PORT);

client.on('connect',function(){
  console.log("Connected");
}).on('error',function(err){
  console.log("Error: ",err);
}).on('close',function(){
  console.log("Closed");
}).connect();

client.use(TUBE,function(err,TUBE){
  console.log(TUBE," is currently being used");
})

client.put(3,1,5,"{msg:hellow from producer :)}",function(err,jobID){
  if(err){
    console.log(err);
  }else{
    console.log("Job created with ID: ",jobID);
  }
});

//
// function submitJob(payload,priority){
// client.put()
// }
