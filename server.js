const http = require('http');
const fs = require('fs');
const { getBuiltinModule } = require('process');
const { transferableAbortSignal } = require('util');

var id = 0;
var oldtime = null;
const time = new Date();

function timenow(){
    
    //console.log("timenow")
    var timenow = new Date();

    if(oldtime == null){
        oldtime = time
        return time
    } else {
        console.log(time)
        console.log(timenow)
    }
    difference = (timenow - oldtime) / 1000
    console.log(difference)
    translatetime(difference)
    return
}

function translatetime(difference){
    //function translates whole time into sections
    //days, hours, minutes, seconds
    //make it into object

    let totaltime = new Object();
    totaltime['days'] = difference / 86400;
    totaltime['hours'] = difference / 3600;
    totaltime['minutes'] = difference / 60;
    totaltime['seconds'] = difference;
    console.log(totaltime)
    return totaltime;
}

function getip(){
    //console.log("getip")
    console.log("new entry");
    http.get({'host': 'api.ipify.org', 'port': 80, 'path': '/'}, function(resp) {
        resp.on('data', function(ip) {
            giveip(ip);
            return
        });
    });
    //return "ip"+ip;
}
function giveip(ip){
    //console.log("myip:" + ip)
    var res = "myip" +ip
    return res
}
function entries(req){
    id++;
    let vieras = new Object();
    vieras['id'] = id;
    vieras['ip'] = req.headers.host;
    vieras['source'] = req.headers['user-agent'];
    return vieras;
}
function elapsedtime(){
    //time between last and current request
    //get current time in one variable, at end of function, make old variable new variable

    
}
function vieraskirja(newentry){
    timenow();
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
    elapsedtime();

    newentry = entries(req);
    //console.log(req.headers)
    //console.log(host); //ip

    console.log(newentry);

    writetosite = vieraskirja(newentry);
    if(writetosite == null){ //if the JSON file is empty
        res.write(toString(newentry))
        getip()
        res.end();
    }else {
        res.write(JSON.stringify(writetosite)); //if JSON file already has data
        res.end();
    }
});

server.listen(3000, () => {
    console.log("server starting "+ " 3000 " + timenow())    
});