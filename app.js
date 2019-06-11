var builder = require('botbuilder');
var restify = require('restify');
server = restify.createServer();
server.listen(process.env.port ||process.env.PORT || 3978,function(){
    console.log('%s listing to %s',server.name,server.url)
})
// var connector = new builder.ConsoleConnector().listen();
var appId = "322fa2dc-b00f-49b1-aac5-6e80b7e170a1"
var appPassword = "hYEjTf(?32gMnEl0-vFS8J;KB"
var connector = new builder.ChatConnector({
    appId:appId,
    appPassword:appPassword
});
server.post('/api/messages',connector.listen());

var bot = new builder.UniversalBot(connector);

var luisAppId = "b9daf6d2-255c-4ab2-8b42-a13e2315f323";
var luisApiKey ="d6c809f4372c4f3f83e3401a8305cc23";
var luisApiHostName= "westus.api.cognitive.microsoft.com"

const luisModelUrl = 'https://'+luisApiHostName + '/luis/v2.0/apps/'+luisAppId+'?subscription-key='+luisApiKey;

var recognizer = new builder.LuisRecognizer(luisModelUrl);
var intents = new builder.IntentDialog({
    recognizers:[recognizer]
})

bot.dialog('/',intents);

intents.matches('Greet',(session,args,next)=>{
    session.send("hello there! i am eva movie booking ticket")
})
var  movies =[
        "Avengers",
       " Jurasic Park",
       "Rampage"

]


intents.matches('ShowNowPlaying',(session,args,next)=>{
    session.send("Sure,here is the list of movies currently playing:\n\n"+movies)
})

intents.matches('Book ticket',[(session,args,next)=>{
    // console.log(JSON.stringify(args));
    var movieEntity = args.entities.filter(e=>e.type=='Movies');
    var noOfticketsEntity = args.entities.filter(e=>e.type=='builtin.number');
    if(movieEntity.length > 0){
       
        session.userData.movie = movieEntity[0].resolution.values[0]
       
    }else{
        delete session.userData.movie;
    }

    if(noOfticketsEntity.length > 0){

        session.userData.noOftickets = noOfticketsEntity[0].resolution.value;
      
    }else{
        delete session.userData.noOftickets;
    }

    if(!session.userData.movie){
      session.beginDialog('askMovie')
    }else{
        next();
    }
},(session,args,next)=>{
    if(!session.userData.noOftickets){
        session.beginDialog('askNooftickets')
      }else{
          next();
      }
},(session,args,next)=>{
   
    session.send("Sure I have booked you "+session.userData.noOftickets+" tickets for "+session.userData.movie+". Have Fun ")
} ]);
bot.dialog('askMovie',[(session,args,next)=>{
    builder.Prompts.choice(session,"what movies would you like to watch",movies)
},(session,results)=>{
    session.userData.movie = results.response.entity
    session.endDialogWithResult(results)
}])

bot.dialog('askNooftickets',[(session,args,next)=>{
    builder.Prompts.number(session,"Great how many tickets would you like to book ? ",movies)
},(session,results)=>{
    session.userData.noOftickets = results.response
    session.endDialogWithResult(results)
}])

