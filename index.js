const os = require('os');
const osutils = require('os-utils');
var cpuStat = require('cpu-stat');
const { delStamp } = require('oicq/lib/internal');
const cmd = '服务器状态';
let chat = true;
var RamFree,RamUsed,RamPercent,cpuPercent;
const Ram = os.totalmem();
const RamTotal = dealMem(Ram);

var interval = setInterval(() => {
    cpuStat.usagePercent(function(err, percent, seconds) {
        if (err) {
             return;
       }
       RamFree = dealMem(os.freemem());
       cpuPercent = parseFloat(percent).toFixed(2);
       RamUsed = dealMem(os.totalmem()-os.freemem());
       RamPercent = (100*(osutils.totalmem()-osutils.freemem())/osutils.totalmem()).toFixed(2);
   });
}, 3000);



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

function dealMem(mem){
    var G = 0,
        M = 0,
        KB = 0;
    (mem>(1<<30))&&(G=(mem/(1<<30)).toFixed(2));
    (mem>(1<<20))&&(mem<(1<<30))&&(M=(mem/(1<<20)).toFixed(2));
    (mem>(1<<10))&&(mem>(1<<20))&&(KB=(mem/(1<<10)).toFixed(2));
    return G>0?G+'G':M>0?M+'M':KB>0?KB+'KB':mem+'B';
};

function onStart(api){
    let main = function(aaa){
		api.listen(aaa,(e)=>{
			let t = getText(e);
			if(t==cmd){
				let arr = [
				`----服务器状态----\n`,
				`#CPU占用：${cpuPercent}%\n`,
				`#内存：${RamUsed}/${RamTotal}(${RamPercent}%)`];
				e.reply(arr);
			}
		});
	}
	main('onMainMessageReceived');
	if(chat){
		main('onChatMessageReceived');
	}
}



module.exports = {
    onStart,
    onStop(){}
}
