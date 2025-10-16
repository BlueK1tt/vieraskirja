const http = require('http');
const fs = require('fs');
const { match } = require('assert');
const { json } = require('stream/consumers');
var id = 0;
var saveid = 0;
var oldtime = null;
const time = new Date();
var oldreqtime = null; //just as start when there is not last request
var myip = null;

function timenow(){
    
    //console.log("timenow")
    var timenow = new Date();
    if(oldtime == null){
        oldtime = time
        return time
    } else {
        //console.log(time) //"oldtime"
        //console.log(timenow) //current time
    }
    difference = (timenow - oldtime) / 1000
    var translatedtime = translatetime(difference)
    console.log("Server has been online for:"+translatedtime);

    var hournow = timenow.getHours();
    var minutenow = timenow.getMinutes();
    var secondsnow = timenow.getSeconds();
    var cleantime = hournow+":"+minutenow+":"+secondsnow;
    //console.log(cleantime)
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
    returning = finaltime.days+finaltime.hours+finaltime.minutes+finaltime.seconds
    //console.log(returning);
    return returning;
}

function getip(){
    //console.log("getip")
    http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
        resp.on('data', function(ip) {
            var b = Buffer.from(ip);
            var s = b.toString('base64');
            var decodedString = atob(s);
            //console.log("decodedstring"+decodedString)
            myip = decodedString;
            return;
        });
    });
    //return "ip"+ip;
    return myip;
}

function elapsedtime(){
    var newreqtime = new Date();
    var timediff = (newreqtime - oldreqtime) / 1000;
    reqtimediff = JSON.stringify(timediff) //turn object into string so can cut it
    timestr = reqtimediff.slice(0,-2) //cut extra milliseconds off the end
    //need to do seconds into minutes and hours function
    //currently only returns time in seconds, so will go to hundreds
    let totaltime = new Object();
    totaltime['days'] = timestr / 86400;
    totaltime['hours'] = (timestr / 3600);
    totaltime['minutes'] = timestr / 60;
    totaltime['seconds'] = timestr;
    //console.log(totaltime);
    oldreqtime = newreqtime
    return timestr;
}

function entries(req){
    id++;
    let vieras = new Object();
    var currenttime = timenow();

    vieras['id'] = id
    vieras['timestamp'] = currenttime; //get the current time, at the end of function
    vieras['elapsedtime'] = elapsedtime();
    vieras['ip'] = getip();;
    vieras['source'] = req.headers['user-agent'];
    return vieras;
}
function vieraskirja(newentry){
    //timenow(); dont need this since already in object.vieras
    entrystr = JSON.stringify(newentry)
    cleanentry = entrystr.replaceAll('"', '')
    var rawdata1 = fs.readFileSync('./vieraskirja.JSON');
    
    if(!rawdata1.length){
        //check if file exists
        //console.log("JSON is empty")
        fs.writeFile('vieraskirja.JSON', entrystr, function(err){
            if(err) throw err;
        }); 
        fs.close;
        return;
    } else {
        //console.log("JSON has data")
        //need to check if JSON1 is empty
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

function entrycompare(newentry){ //writetosite is the full object
    //console.log("entrycompare")
    let oldvierasentry = null;
    //ignore id and elapsedtime
    let newvierasentry = new Object;
    newvierasentry['ip'] = newentry.ip;
    newvierasentry['timestamp'] = newentry.timestamp;
    newvierasentry['source'] = newentry.source;
    //console.log(newvierasentry)
    var vieraslista1 = new Array;
    
    vieraslista1 = fs.readFileSync('./vieraslista.JSON')
    if(!vieraslista1.length){ //JSON file is empty
        console.log("File is empty")
        var success1 = savevieras(newvierasentry);
        console.log("success1"+success1)
        if(success1 === false){
            console.log("something is null")
            return
        }else{
            return
        }
    } else { //if the file is not empty, new data need to be "appended"
        //console.log("entrycompare 2") 
        if(oldvierasentry !== newvierasentry){ //if doesnt match at all
            var success2 = savevieras(newvierasentry); //completely new entry
            //console.log("success2"+success2)
            if(success2 === false){
                console.log("savevieras new entry")
                return
            }else{
                return
            }
            
            //need seperate if, when its old ip, but new source
            //and need to call function to just update the source of the object logged
        }
        else{
            //the entry is already logged, so ignore
            console.log("entry already logged")
            oldvierasentry = newvierasentry;
            return;
        }
        //in case doesnt match, need to call savevieras
    }
}
function savevieras(newvierasentry){ //completely new entry
    //console.log("savevieras")
    saveid ++; //starts with 0, gets +1 every time function is called

    var vieraslista = new Array;
    vieraslista = fs.readFileSync('./vieraslista.JSON');
    stringvieraslista = vieraslista.toString('utf8')
    if(!vieraslista.length){
        console.log("vieralista is empty")
    } else {
        //console.log("vieraslista:"+vieraslista.toString('utf8'))
    }
    fs.close;
    
    //function to log all "vieras" entries into JSON file
    if(!newvierasentry.timestamp || !newvierasentry.ip || !newvierasentry.source){
        console.log("something is null")
        return false
    } else {
        //console.log("nothing is null")
        existingip = vieraslista.includes(newvierasentry.ip)

        if(!vieraslista.length){ //JSON file is empty
            console.log("jsonfile is empty")
            var vierasarr1 = [];
            vierasarr1 = JSON.stringify({"ip":newvierasentry.ip,"timestamp":newvierasentry.timestamp,"source":newvierasentry.source});
            var firstentry = "["+vierasarr1+"]";
            fs.writeFile('./vieraslista.JSON', firstentry,'utf-8', function(error){
                if(error){
                    console.log(error);
                };
                return true;
            });
            fs.close;
            return true;
        }
        if(vieraslista.length != 0 && existingip === false){
            console.log("not empty, new entry")
            var existinglist = JSON.parse(vieraslista)
            //console.log(existinglist)
            existinglist.push(newvierasentry)
            fs.writeFile('./vieraslista.JSON',JSON.stringify(existinglist, null, 2),'utf-8', function(error){
                if(error){
                    console.log(error);
                };
                return;
            });
            fs.close;
            console.log("wrote new entry")
        } else {
            console.log("update entry")
            var existingfile = []
            //need to get the existing JSON into string, then add the new data into it
            existingfile = fs.readFileSync('./vieraslista.JSON')
            fs.close;

            if(stringvieraslista.includes(newvierasentry.ip)){ //match all data from JSON to newentry ip
                //console.log("ip match")
                var cutvieraslista = stringvieraslista.split("},{")                
                var idofentry = 0;
                var addnewtimestamp = newvierasentry.timestamp;
                
                //find matching ip and get the whole object
                
                cutvieraslista.forEach(element =>{
                    //console.log("foreach cutvieraslista")
                    idofentry ++;
                    var position = element.includes(newvierasentry.ip)
                    //console.log(position)

                    if(position === true){
                        console.log(idofentry);
                        return idofentry;
                    } else {
                        return;
                    }
                    
                });
                var jsonarray = [];
                jsonarray = JSON.parse(stringvieraslista)
                //console.log(jsonarray)
                var foundmatch = jsonarray.indexOf(newvierasentry.ip)+1;
                //console.log(foundmatch)
      
                var fetchposition = idofentry-1
                matchedentry = cutvieraslista[fetchposition]
                //console.log(fetchposition)
                //console.log(matchedentry)
                //writefile to JSON, psuh new timestamp, check if same source is found
                //console.log(jsonarray)
                delete jsonarray[fetchposition]
                //console.log(jsonarray)
                jsonarray.push({ip:newvierasentry.ip,timestamp:addnewtimestamp,source:newvierasentry.source});
                var cleanarray = jsonarray.filter(elm => elm)
                //console.log(jsonarray)

                fs.writeFile('./vieraslista.JSON', JSON.stringify(cleanarray, null,2),'utf-8', function(error){
                    if(error){
                        console.log(errror)
                    };
                    console.log("updated entry")
                    return;
                })
                return true
            } else {
                console.log("no match")
                var vierasarr2 = JSON.stringify("\\n",{"ip":newvierasentry.ip,"timestamp":newvierasentry.timestamp,"source":newvierasentry.source}, null, "\n");
                fs.writeFile('./vieraslista.JSON',vierasarr2,'utf-8', function(error){
                    if(error){
                        console.log(error);
                    };
                    return;
                });
                fs.close;
                return true; 
            }
            
            return
        }
        return true
    }
} 
function beautyfyJSON(){
    //function to rearrange JSON file to look more appeasing to eye

};

server = http.createServer(function(req, res){ //request and response handling    
    usragent = req.headers['user-agent'] //request user source
    host = req.headers.host
    
    var newentry = entries(req);    
    console.log(newentry);
    
    writetosite = vieraskirja(newentry);
    //console.log(newentry)
    entrycompare(newentry);
    beautyfyJSON();
    if(writetosite == null){ //if the JSON file is empty
        res.write(toString(newentry))
        console.log(getip())
        res.end();
    }else {
        res.write(JSON.stringify(writetosite)); //if JSON file already has data
        res.end();
    }
    console.log("----------")
});

server.listen(3000, () => {
    console.log("server starting"+ " 3000 " + timenow())    
});

//make ip based log in system
//can save "settings" only for the spesific ip, and can get the ip from the API