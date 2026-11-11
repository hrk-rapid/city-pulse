const fs = require("node:fs");
const readline = require("node:readline/promises");

const getStations = async() => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const apikey = await rl.question("APIキーを入力");
    rl.close();

    const url = new URL("https://api.odpt.org/api/v4/odpt:Station");
    url.searchParams.set("acl:consumerKey", apikey);
    url.searchParams.set("odpt:operator", "odpt.Operator:MIR");

    try{
        const response = await fetch(url);

        console.log("HTTPステータス:", response.status);

        if(!response.ok){
            console.log("レスポンス:", await response.text());
            throw new Error("HTTPエラー:" + response.status);
        }
        const data = await response.json();

        fs.writeFileSync(
            "stations.json",
            JSON.stringify(data, null, 2)
        );

        console.log("駅データ保存した");

        console.log("取得した駅データ数:", data.length);
        console.log(data.slice(0,3));

        data.forEach(station =>{
            console.log(station["dc:title"],
                station["geo:lat"],
                station["geo:long"]
            );
        });
    }
    catch(error){
        console.log("取得失敗:", error.message);
    }
}

getStations();