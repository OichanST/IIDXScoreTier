// 楽曲リスト
var musicList;
// Tierリスト
var tierList;
// Tier決定済リスト
var tieredList;
// Tier未決リスト
var untieredList;
// Apps Script URL
const gsAPIUrl = "https://script.google.com/macros/s/AKfycbxcoa3GeaBtHgPHYkgOxmeDlT1JeJeQYsx4LzV-bics-1GGKzkp8KFAmIILtxNxwng/exec";
// Tier別最大件数
//const tieredMaxSize = 10;

/**
 * 初期表示処理
 */
function init(){
	fetch(gsAPIUrl + "?t=l").
　　then(response => response.json()).
	then(data => {
		// Tierリストを初期設定
		tierList = data;
		// Tier表示領域取得
		const tierArea = document.getElementById("TierArea");
		// 一旦クリア
		tierArea.innerHTML = null;
		// Tierリストループ
		for(const tier of tierList){
			// 行生成
			const div = document.createElement("div");
			// 表示用にクラス付与
			div.classList.add("tier");
			// 背景色設定
			div.style.backgroundColor = tier.color;
			// テキスト生成
//			div.innerText = tier;
			div.innerText = tier.name.substring(0, tier.name.indexOf("（"));
			// クリックイベントの追加
			div.onclick = (evt) => {
				// 選択されているTier表示領域を取得
				const header = document.getElementById("TieredTitle");
				// 選択されたTierを取得
				const sel = evt.target.innerText;

				const find = tierList.find(tier => tier.name.indexOf(sel) >= 0);
				// 選択されているTier表示領域を更新
				header.innerText = find.name;
				// 選択されたTierに応じて配色変更
				header.parentNode.style.backgroundColor = find.color;
				// Tier決定済リストの表示更新
				displayTieredList();
			};
			// 行追加
			tierArea.appendChild(div);
		}
		// 楽曲リストの取得
		getMusicList();
	});
}

/**
 * 楽曲リストの取得
 */
function getMusicList(){
	// LocalStorageから楽曲リストを取得
	musicList = localStorage.getItem("IIDXMusicList");
	// 取得できなかった場合
	if(!musicList){
		document.getElementById("spinner").style.display = "block";
		// Apps Scriptを用いてGoogle Spread Sheetの楽曲データを持ってくる
		fetch(gsAPIUrl + "?t=m").
		then(response => response.json()).
		then(data => {
			console.log("MusicList get");
			
			minimizedData = new Array();
			
			// Quota Exceeded対策
			for(rec of data){
				minimizedData.push({
					TITLE:rec.TITLE,
					NORMAL:rec.NORMAL,
					HYPER:rec.HYPER,
					ANOTHER:rec.ANOTHER,
					LEGGENDARIA:rec.LEGGENDARIA
				});
			}

			// LocalStorageに退避
			localStorage.setItem("IIDXMusicList", JSON.stringify(minimizedData));
			// グローバル変数に退避
			musicList = minimizedData;

			document.getElementById("spinner").style.display = "none";
			// 楽曲データ取得後の処理
			getTieredList();
		});
	// 取得できた場合
	}else{
		// JSON変換
		musicList = JSON.parse(musicList);
		// 楽曲データ取得後の処理
		getTieredList();
	}
}

/**
 * Tier決定済リストの取得
 */
function getTieredList(){
	// localStorageからTier決定済リストを取得
	tieredList = localStorage.getItem("tieredList");
	// 取得できなかった場合
	if(!tieredList){
		document.getElementById("spinner").style.display = "block";
		// Apps Scriptを用いてGoogle Spread SheetのTier決定済データを持ってくる
		fetch(gsAPIUrl + "?t=t").
		then(response => response.json()).
		then(data => {
			console.log("TieredList get");
			console.log(data);
			localStorage.setItem("tieredList", JSON.stringify(data));
			tieredList = data;

			document.getElementById("spinner").style.display = "none";
			// 楽曲データ取得後の処理
			displayTargetData();
		});
	// 取得できた場合
	}else{
		// JSON変換
		tieredList = JSON.parse(tieredList);
		// 楽曲データ取得後の処理
		displayTargetData();
	}
}

/**
 * 楽曲データ取得後の処理
 */
function displayTargetData(){
	// スピナー表示
	document.getElementById("spinner").style.display = "none";
	// 選択されたLVに該当する楽曲リスト
	const targetLvList = new Array();
	// 選択されたLV
	const lv = document.getElementById("lv").value;
	// 楽曲データループ
	for(const rec of musicList){
/**
		// BEGINNERが対応している　※多分ないけど一応
		if(rec.BEGINNER == lv){
			targetLvList.push(
				{
					TITLE:rec.TITLE,
					LV:rec.BEGINNER,
					SCORE:"BEGINNER"
				}
			);
		}
		// NORMAL
		if(rec.NORMAL == lv){
			targetLvList.push(
				{
					TITLE:rec.TITLE,
					LV:rec.NORMAL,
					SCORE:"NORMAL"
				}
			);
		}
		// HYPER
		if(rec.HYPER == lv){
			targetLvList.push(
				{
					TITLE:rec.TITLE,
					LV:rec.HYPER,
					SCORE:"HYPER"
				}
			);
		}
**/
		// ANOTHER
		if(rec.ANOTHER == lv){
			targetLvList.push(
				{
					TITLE:rec.TITLE,
					LV:rec.ANOTHER,
					SCORE:"ANOTHER"
				}
			);
		}
		// LEGGENDARIA
		if(rec.LEGGENDARIA == lv){
			targetLvList.push(
				{
					TITLE:rec.TITLE,
					LV:rec.LEGGENDARIA,
					SCORE:"LEGGENDARIA"
				}
			);
		}
	}
	// Tier未決リストのリセット
	untieredList = new Array();
	// 選択されたLVに該当する楽曲リストをループ
	for(const rec of targetLvList){
		// Tier決定済かをチェック
		const finder = tieredList.find(data => data.TITLE == rec.TITLE && data.SCORE == rec.SCORE);
		// 未決
		if(!finder){
			// Tier未決リストに追加
			untieredList.push(rec);
		}
	}
	// 選択されているTier表示領域を取得
	const header = document.getElementById("TieredTitle");
	// 選択されているTier表示領域を更新
	header.innerText = tierList[0].name;
	// 選択されたTierに応じて配色変更
	header.parentNode.style.backgroundColor = tierList[0].color;
	// Tier決定済リストの表示更新
	displayTieredList();
	// Tier決定済リストの表示
	displayTieredList();
	// Tier未決リストの表示
	displayUntieredList();
}

/**
 * リストデータをソートする
 */
function dataSort(a, b) {
	// タイトルを大文字にして比較
	if(a.TITLE.toUpperCase() < b.TITLE.toUpperCase()){
		return -1;
	}else if(a.TITLE.toUpperCase() > b.TITLE.toUpperCase()){
		return 1;
	}
	// 譜面によるソート順位
	const scoreSortMap = {
		BEGINNER:1,
		NORMAL:2,
		HYPER:3,
		ANOTHER:4,
		LEGGENDARIA:5
	};
	// ソート結果返却
	return scoreSortMap[a.SCORE] - scoreSortMap[b.SCORE];
}

/**
 * Tier決定済リストの表示更新
 */
function displayTieredList(){
	// 表示領域取得
	const tieredArea = document.getElementById("TieredArea");
	// 表示内容クリア
	tieredArea.innerHTML = null;
	// ソート
	tieredList.sort(dataSort);
	// 選択されているLVを取得
	const lv = document.getElementById("lv").value;
	// 現在選択されているTierを取得
	const nowTier = document.getElementById("TieredTitle").innerText;

	let count = 0;
	// 未決リストループ
	for(rec of tieredList){
		if(rec.LV == lv && rec.Tier == nowTier){
			// セル作成
			const dv = document.createElement("div");
			dv.style = "display:flex;justify-content:space-between;";
			// 属性などを設定
			dv.setAttribute("draggable", true);
			dv.setAttribute("lv", rec.LV);
			dv.setAttribute("title", rec.TITLE);
			dv.setAttribute("score", rec.SCORE);
			// CSS用クラス設定
			dv.classList.add("music");
			dv.classList.add(rec.SCORE);
			if(rec.changed){
				dv.classList.add("changed");
			}
			// 表記設定
			dv.innerHTML = "<div class='title'>" + rec.TITLE + "</div><div class='score' style='margin-right:0.5em;'>" +rec.SCORE + "</div>";
			// ドラッグ開始時イベント追加
			dv.ondragstart = (evt) =>{
				// ドラッグ開始時の挙動設定
				evt.dataTransfer.effectAllowed = "move";
				// ドラッグ元データをdataTransferに設定
				// ※JSONをserializeして文字列化する
				evt.dataTransfer.setData("text/plain", 
					JSON.stringify({
						LV:evt.target.getAttribute("lv"),
						TITLE:evt.target.getAttribute("title"),
						SCORE:evt.target.getAttribute("score"),
						Tier:document.getElementById("TieredTitle").innerText
					})
				);
			}
			// クリックイベント追加
			dv.onclick = (evt) =>{
				// クリックされた行の取得
				let target = evt.target;

				while(true){
					if(target.getAttribute("title") != null)break;
					
					target = target.parentNode;
				}
				// データ編集
				const data = {
					LV:target.getAttribute("lv"),
					TITLE:target.getAttribute("title"),
					SCORE:target.getAttribute("score"),
					Tier:""
				}
				// Tier決定済データからクリックされたデータを削除
				for(let i = 0; i < tieredList.length; i++){
					if(tieredList[i].TITLE == data.TITLE && tieredList[i].SCORE == data.SCORE){
						tieredList.splice(i, 1);
						break;
					}
				}
				// Tier未決に変更
				data.Tier = "";
				// 変更された旨をマーク
				data["changed"] = true;
				// Tier未決リストへ追加
				untieredList.push(data);
				// ストレージにデータ保存
				updateStorage();
			 	// Tier決定済リストの再表示
				displayTieredList();
				// Tier未決リストの再表示
				displayUntieredList();
			}
			// Tier表示領域へ追加
			tieredArea.appendChild(dv);

			count++;
		}
	}

	//document.getElementById("count").innerText = count + "/" + tieredMaxSize;
}

/**
 * Tier未決リストの表示更新
 */
function displayUntieredList(){
	// 中央エリアの表示領域取得
	const untieredArea = document.getElementById("UntieredArea");
	// 表示内容をクリア
	untieredArea.innerHTML = null;
	untieredList.sort(dataSort);
	// 未決リストループ
	for(rec of untieredList){
		// セル作成
		const dv = document.createElement("div");
		dv.style = "display:flex;justify-content:space-between;";
		// 属性などを設定
		dv.setAttribute("draggable", true);
		dv.setAttribute("lv", rec.LV);
		dv.setAttribute("title", rec.TITLE);
		dv.setAttribute("score", rec.SCORE);
		// CSS用クラス設定
		dv.classList.add("music");
		dv.classList.add(rec.SCORE);
		if(rec.changed){
			dv.classList.add("changed");
		}
		// 表記設定
		dv.innerHTML = "<div class='title'>" + rec.TITLE + "</div><div class='score' style='margin-right:0.5em;'>" + rec.SCORE + "</div>";
		// ドラッグ開始時イベント追加
		dv.ondragstart = (evt) =>{
			// ドラッグ開始時の挙動設定
			evt.dataTransfer.effectAllowed = "move";
			// ドラッグ元データをdataTransferに設定
			// ※JSONをserializeして文字列化する
			evt.dataTransfer.setData("text/plain", 
				JSON.stringify({
					LV:evt.target.getAttribute("lv"),
					TITLE:evt.target.getAttribute("title"),
					SCORE:evt.target.getAttribute("score"),
					Tier:""
				})
			);
		}
		// クリックイベント追加
		dv.onclick = (evt) =>{
			// ドロップ先のTier取得
			const tier = document.getElementById("TieredTitle").innerText;
			// Tier未選択だったら何もしません
			if(tier == "Tierをクリック")return;
			// クリックされた行の取得
			let target = evt.target;

			while(true){
				if(target.getAttribute("title") != null)break;
				
				target = target.parentNode;
			}
			// データ編集
			const data = {
				LV:target.getAttribute("lv"),
				TITLE:target.getAttribute("title"),
				SCORE:target.getAttribute("score"),
				Tier:""
			}
			// Tier未決データからクリックされたデータを削除
			for(let i = 0; i < untieredList.length; i++){
				if(untieredList[i].TITLE == data.TITLE && untieredList[i].SCORE == data.SCORE){
					untieredList.splice(i, 1);
					break;
				}
			}
			// Tier変更
			data.Tier = tier;
			// 変更された旨をマーク
			data["changed"] = true;
			// Tier決定済リストへ追加
			tieredList.push(data);
			// ストレージにデータ保存
			updateStorage();
		 	// Tier決定済リストの再表示
			displayTieredList();
			// Tier未決リストの再表示
			displayUntieredList();
		}
		// 中央表示領域へ追加
		untieredArea.appendChild(dv);
	}
}

/**
 * ドラッグ中イベント
 * ※evetn.preventDefault用
 */
function dragoverHandler(){
	// デフォルトのソート動作を停止
	event.preventDefault();
	// ドロップ時の効果指定
	event.dataTransfer.dropEffect = "move";
}
/**
 * ドラッグ中イベント
 * ※各難易度にドラッグした際に対象の背景色を変更する
 */
function dragoverHandlerSP(){
	// 通常のドラッグ中イベント実行
	dragoverHandler();
	// クラス適用
	event.target.classList.add("hov");
}
/**
 * ドラッグが外れた際のイベント
 * ※ドラッグした際に変更した背景色を戻す
 */
function dragleaveHandler(){
	// クラス除外
	event.target.classList.remove("hov");
}
/**
 * Tier未決領域へのドロップ時のイベント
 */
function dropUntieredHandler(){
	// デフォルト挙動を抑制
	event.preventDefault();
	// ドラッグ元データの取得
	const data = JSON.parse(event.dataTransfer.getData("text/plain"));
	// Tier未決データでない場合　※未決→未決については何もしない
	if(data.Tier != ""){
		// ドラッグ元データの難易度を取得
		const tier = data.Tier;
		// リストループ
		for(let i = 0; i < tieredList.length; i++){
			// 対応するデータの場合
			if(tieredList[i].TITLE == data.TITLE && tieredList[i].SCORE == data.SCORE){
				// 削除
				tieredList.splice(i, 1);
				// 以後処理不要
				break;
			}
		}
		// ドラッグ元データの難易度を未決にする
		data.Tier = "";
		// 変更された旨をマーク
		data["changed"] = true;
		// 未決データリストに追加
		untieredList.push(data);
		// ストレージにデータ保存
		updateStorage();
		// Tier決定済リストの再表示
		displayTieredList();
		// Tier未決リストの再表示
		displayUntieredList();
	}
}
/**
 * Tire決定済領域へのドロップ時のイベント
 */
function dropTieredHandler(){
	// ドロップ先のTier取得
	const tier = document.getElementById("TieredTitle").innerText;
	// Tier未選択だったら何もしません
	if(tier == "Tierをクリック")return;
	// ドラッグ元データ取得
	const data = JSON.parse(event.dataTransfer.getData("text/plain"));
	// Tier未決データからのドラッグ＆ドロップ
	// ※各難易度からのドロップについては何もする必要なし
	if(data.Tier == ""){
		// 未決データからドラッグされたデータを削除
		for(let i = 0; i < untieredList.length; i++){
			if(untieredList[i].TITLE == data.TITLE && untieredList[i].SCORE == data.SCORE){
				untieredList.splice(i, 1);
				break;
			}
		}
		// ドロップ先のTierに変更
		data.Tier = tier;
		// 変更された旨をマーク
		data["changed"] = true;
		// Tier決定済リストへ追加
		tieredList.push(data);
		// ストレージにデータ保存
		updateStorage();
	 	// Tier決定済リストの再表示
		displayTieredList();
		// Tier未決リストの再表示
		displayUntieredList();
	}
}
/**
 * ローカルストレージに保存
 */
function updateStorage(){
	// Tier決定済リストをローカルストレージに保存
	localStorage.setItem("tieredList", JSON.stringify(tieredList));
}
/**
 * やり直し
 */
function restore(){
	if(confirm("今までの編集内容を無かったことにして、保存前の状態に戻します。本当によいですか？")){
		localStorage.removeItem("tieredList");
		getTieredList();
	}
}
/**
 * 編集データを出力
 */
function save(){
	// スピナー表示
	document.getElementById("spinner").style.display = "block";
	// APIによりGoogleSpreadSheetを更新
	fetch(gsAPIUrl, {
		method:"POST",
		mode:"no-cors",
		headers:{"Content-Type":"application/json"},
		body:JSON.stringify(tieredList)
	}).
	then(response => {
		// 変更済の状態をリセットする
		for(const rec of tieredList){
		　delete rec.changed;
		}
		for(const rec of untieredList){
		　delete rec.changed;
		}
		// Storageの更新
		updateStorage();
	 	// Tier決定済リストの再表示
		displayTieredList();
		// Tier未決リストの再表示
		displayUntieredList();
		// スピナーを消す
		document.getElementById("spinner").style.display = "none";
		alert("保存しますた");
	});
}
/**
 * 検索処理
 */
function search(){

	const lv = document.getElementById("lv").value;
	// 検索条件を取得
	let searchCond = document.getElementById("searchCond").value;
	// 未入力なら何もしない
	if(searchCond == ""){
		return;
	}
	// 小文字→大文字変換
	searchCond = searchCond.toUpperCase();
	// 検索に該当したデータ
	const storeHitData = new Array();
	// 各難易度別データをループ
	for(const rec of tieredList){

		if(rec.LV != lv)continue;
		// 曲名に検索条件が含まれる場合
		if(rec.TITLE.toUpperCase().includes(searchCond)){
			// 検索に該当したデータへ追加
			storeHitData.push(rec);
		}
	}
	// 未決データループ
	for(const rec of untieredList){

		if(rec.LV != lv)continue;
		// 曲名に検索条件が含まれる場合
		if(rec.TITLE.toUpperCase().includes(searchCond)){
			// 検索に該当したデータへ追加
			storeHitData.push(rec);
		}
	}
	// 検索結果表示領域の取得
	const resultList = document.getElementById("resultList");
	// 出力内容リセット
	resultList.innerHTML = null;
	// 該当なし
	if(storeHitData.length <= 0){
		// なし表示
		const tr = document.createElement("tr");
		const td = document.createElement("td");
		td.style = "text-align:center;";
		td.innerText = "該当なし";
		tr.appendChild(td);
		resultList.appendChild(tr);
	// 該当多すぎ
	}else if(storeHitData.length > 50){
		// 該当多すぎ表示
		const tr = document.createElement("tr");
		const td = document.createElement("td");
		td.style = "text-align:center;";
		td.innerText = "該当件数が50件を超えているため、条件をもう少し絞って下さい";
		tr.appendChild(td);
		resultList.appendChild(tr);
	// 上記以外
	}else{
		// 該当データループ
		for(const rec of storeHitData){
			// 出力内容を成型して追加
			const tr = document.createElement("tr");
			const td1 = document.createElement("td");
			if(rec.Tier && rec.Tier != ""){
				td1.innerText = rec.Tier;
			}else{
				td1.innerText = "未決";
			}
			tr.appendChild(td1);
			const td2 = document.createElement("td");
			td2.innerText = rec.TITLE + "(" + rec.SCORE + ")";
			if(rec.Tier && rec.Tier != ""){				
				td2.onclick = (evt) => {
					const tieredArea = document.getElementById("TieredArea");
					const rec = tieredArea.children;
					for(let i = 0; i < rec.length; i++){
						rec[i].classList.remove("finded");
					}
					for(let i = 0; i < rec.length; i++){
						if(evt.target.innerText == rec[i].getAttribute("title") + "(" + rec[i].getAttribute("score") + ")"){
							rec[i].classList.add("finded");
							const rect = rec[i].getBoundingClientRect();
							tieredArea.scrollBy(0, rect.top - 100);
						}
					}
				}
			}else{
				td2.onclick = (evt) => {
					const untieredArea = document.getElementById("UntieredArea");
					const rec = untieredArea.children;
					for(let i = 0; i < rec.length; i++){
						rec[i].classList.remove("finded");
					}
					for(let i = 0; i < rec.length; i++){
						if(evt.target.innerText == rec[i].getAttribute("title") + "(" + rec[i].getAttribute("score") + ")"){
							rec[i].classList.add("finded");
							const rect = rec[i].getBoundingClientRect();
//							console.log(.scrollTop);
							untieredArea.scrollBy(0, rect.top - 100);
						}
					}
				}
			}
			tr.appendChild(td2);
			resultList.appendChild(tr);
		}
	}
	// 検索結果を表示
	document.getElementById("searchResult").style.display = "block";
}
