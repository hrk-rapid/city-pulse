//画面の準備(キャンバスの取得とサイズ調整)
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

function resize(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

//駅の定義　C4はドの音です
const stations = [
    {name: "Station A", x: window.innerWidth * 0.2, y: window.innerHeight * 0.5, note: "C4"},
    {name: "Station B", x: window.innerWidth * 0.5, y: window.innerHeight * 0.5, note: "E4"},
    {name: "Station C", x: window.innerWidth * 0.8, y: window.innerHeight * 0.5, note: "G4"},
];

//列車データ
const train = {
    x: stations[0].x,
    y: stations[0].y,
    targetIndex: 1,
    speed: 0.05
};

//音データ　Tone.jsを使ったシンセサイザー音
const synth = new Tone.Synth({
    oscillator: { type: "sine"},
    envelope: { attack: 0.1, decay: 0.5, sustain: 0.1, release: 1}
}).toDestination();
synth.volume.value = -10;

//画面がクリックされたら、音を鳴らし始める
let audioReady = false;

canvas.addEventListener('click', async() => {
    if(!audioReady){
        await Tone.start();
        audioReady = true;
        document.querySelector('#ui-container p').innerText = "音響システム稼働中";
    }
});

//アニメーション
function animate(){
    //残像を光の粒で表す
    ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

//駅間の路線を描く
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(stations[0].x, stations[0].y);
    for(let i=1; i < stations.length; i++){
        ctx.lineTo(stations[i].x, stations[i].y);
    }
    ctx.stroke();

    //駅の描画
    stations.forEach(st => {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(st.x, st.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    //駅間距離の計算
    const target = stations[train.targetIndex];
    const dx = target.x - train.x;
    const dy = target.y - train.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    //駅に近づくとゆっくりになるように
    if(distance > 2){
        train.x += dx * train.speed;
        train.y += dy * train.speed;
    }
    else{
        //到着処理、音を鳴らそう
        if(audioReady){
            synth.triggerAttackRelease(target.note, "8n");
        }
        train.x = target.x;
        train.y = target.y;

        train.targetIndex = (train.targetIndex + 1) % stations.length;
    }

    ctx.fillStyle = '#f43f5e';
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#f43f5e';
    ctx.beginPath();
    ctx.arc(train.x, train.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    //このアニメーションをループさせる
    requestAnimationFrame(animate);
}

animate();