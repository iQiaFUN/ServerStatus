const path = require('path');
const cfg = JSON.parse(NIL.IO.readFrom(path.join(__dirname, 'config.json')));
const vcfg = NIL._vanilla.cfg;

function getText(e) {
    var rt = '';
    for (i in e.message) {
        switch (e.message[i].type) {
            case "text":
                rt += e.message[i].text;
                break;
        }
    }
    return rt;
}

function GUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function Occupancy(ser) {
    let pack = getOccupancyPack();
    NIL.SERVERS.get(ser).sendCustomPack(pack);
}

function getOccupancyPack(){
    let guid = GUID();
    return JSON.stringify({
        action: 'occupancy',
        type: 'pack',
        params: {
            id:guid
        }
    });
}

class ServerStatus extends NIL.ModuleBase{
    onStart(api){
        api.listen('onMainMessageReceived',e=>{
            let text = getText(e);
            let pt = text.split(' ');
            if(pt[0]==cfg.cmd){
                Occupancy(pt[1])
            }
            e.reply('已发送到服务器',true)
        })
        api.listen('onWebsocketReceived',dt=>{
            let data = JSON.parse(dt.message);
            if(data.cause == 'occupancy'){
                let status = data.parmas;
                let CPU = status.CPU;
                let Memory = status.Memory;
                let arr = [
                    `----服务器状态----\n`,
                    `#CPU占用：${CPU*100}%\n`,
                    `#内存：${Memory.used}/${Memory.total} (${Memory.percent}%)`
                ];
                NIL.bots.getBot(vcfg.self_id).sendGroupMsg(vcfg.group.main, arr);
            }
        })
    }
    onStop(){}
}

module.exports = new ServerStatus;
