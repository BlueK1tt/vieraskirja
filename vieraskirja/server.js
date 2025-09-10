const http = require('http');
const fs = require('fs');

var id = 0;

function timenow(){
    const time = new Date()
    return time
}

function getip(){
    console.log("getip")
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
        return finarray
    }
    return;
}
server = http.createServer(function(req, res){ //request and response handling    
    usragent = req.headers['user-agent']
    host = req.headers.host

    newentry = entries(req);
    console.log(req)
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