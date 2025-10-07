const http = require('http');
const fs = require('fs');
var id = 0;
var oldtime = null;
const time = new Date();
var oldreqtime = null; //just as start when there is not last request

function timenow(){
    
    //console.log("timenow")
    var timenow = new Date();

    if(oldtime == null){
        oldtime = time
        return time
    } else {
        //console.log(time)
        //console.log(timenow)
    }
    difference = (timenow - oldtime) / 1000
    translatetime(difference)

    //get current time and make it pretty for vieraskirja object
    var strtime = JSON.stringify(timenow)
    var timestr = strtime.slice(1,-1);
    var onlytime = timestr.slice(10)
    var cleantime = onlytime.slice(1,-5)
    return cleantime
}

function translatetime(difference){
    let totaltime = new Object();
    totaltime['days'] = difference / 86400;
    totaltime['hours'] = difference / 3600;
    totaltime['minutes'] = difference / 60;
    totaltime['seconds'] = difference;

    var addday = 0;
    var addhours = 0;
    var addminute = 0;
    var addseconds = 0;

    if(totaltime.hours >= 59){
        addday = Math.floor(totaltime.days)
        addhours = addday * 60
        
    }
    if(totaltime.minutes >= 59){
        var addhour = Math.floor(totaltime.hours)
        var addminutes = addhour * 60
        
    }
    if(totaltime.seconds >= 59){
        addminute = Math.floor(totaltime.minutes)
        addseconds = addminute * 60
    } else{
        //console.log("under minute")
        
    }
    var setdays;
    if(Math.floor(totaltime.days) == 0){
        setdays = "";
    } else {
        setdays = Math.floor(totaltime.days)+":";
    }
    var sethours;
    if(Math.floor(addhours) == 0){
        sethours = "";
    }if(Math.floor(addhours) < 10 && Math.floor(addhours) != 0){
        sethours = "0"+Math.floor(addhours)+":";
    } 
    else {
        sethours = Math.floor(addhours)+":";
    }
    var setminutes;
    if(Math.floor(addminute) == 0){
        setminutes = "";

    } if(Math.floor(addminute) < 10 && Math.floor(addminute) != 0){
        setminutes = "0"+Math.floor(addminute)+":"

    }else {
        setminutes = Math.floor(addminute)+":"
    }
    if(Math.floor(totaltime.seconds - addseconds) < 10 && Math.floor(totaltime.seconds - addseconds) != 0){
        setseconds = "0"+Math.floor(totaltime.seconds - addseconds)
    } else {
        setseconds = Math.floor(totaltime.seconds - addseconds)
    }
    let finaltime = new Object()
    finaltime['days'] = setdays;
    finaltime['hours'] = sethours;
    finaltime['minutes'] = setminutes;
    finaltime['seconds'] = setseconds;
    //console.log(finaltime)
    returning = "Server has been online for:"+finaltime.days+finaltime.hours+finaltime.minutes+finaltime.seconds
    console.log(returning);
    return returning;
}

function getip(){
    //console.log("getip")
    console.log("new entry");
    http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
        resp.on('data', function(ip) {
            var b = Buffer.from(ip);
            var s = b.toString('base64');
            var decodedString = atob(s);
            console.log(decodedString)
            giveip(decodedString);
            return;
        });
    });
    //return "ip"+ip;
}

function giveip(decodedString){
    console.log("giveip");
    console.log(decodedString)
    var myip = decodedString
    return myip
}


function elapsedtime(){
    var newreqtime = new Date();
    var timediff = (newreqtime - oldreqtime) / 1000;
    reqtimediff = JSON.stringify(timediff) //turn object into string so can cut it
    timestr = reqtimediff.slice(0,-2) //cut extra milliseconds off the end

    oldreqtime = newreqtime
    return timestr;
}

function entries(req){
    id++;
    let vieras = new Object();
    getip();
    var myip = giveip();
    console.log(myip)

    vieras['id'] = id
    vieras['timestamp'] = timenow(); //get the current time, at the end of function
    vieras['elapsedtime'] = elapsedtime();
    vieras['ip'] = myip;
    vieras['source'] = req.headers['user-agent'];
    return vieras;
}
function vieraskirja(newentry){
    //timenow(); dont need this since already in object.vieras
    entrystr = JSON.stringify(newentry)
    cleanentry = entrystr.replaceAll('"', '')
    var rawdata1 = fs.readFileSync('./vieraskirja.JSON');
    fs.close;

    if(rawdata1 == ""){
        //check if file exists
        fs.writeFile('vieraskirja.JSON', entrystr, function(err){
            if(err) throw err;
        }); 
        fs.close;
    } else {
        let json1 = JSON.parse(rawdata1)

        let datastr = JSON.stringify(json1);
        let cleanstr = datastr.replaceAll('"', '')

        const finarray = cleanentry.concat(cleanstr)
        fs.writeFile('./vieraskirja.JSON', JSON.stringify(finarray), 'utf-8', function(error){
            if(error){
                console.log(error);
            }
            return finarray;
        })
        fs.close;
        return finarray
    }
    return;
}
server = http.createServer(function(req, res){ //request and response handling    
    usragent = req.headers['user-agent'] //request user source
    host = req.headers.host
    
    var newentry = entries(req);    
    console.log(newentry);
    
    writetosite = vieraskirja(newentry);
    if(writetosite == null){ //if the JSON file is empty
        res.write(toString(newentry))
        console.log(getip())
        res.end();
    }else {
        res.write(JSON.stringify(writetosite)); //if JSON file already has data
        res.end();
    }
});

server.listen(3000, () => {
    console.log("server starting "+ " 3000 " + timenow())    
});