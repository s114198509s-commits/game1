const $ = id => document.getElementById(id);
const shops = [
  {name:"晴天飲料店", item:"果汁", art:"🍊 🧋 🥤", cost:10},
  {name:"星星文具店", item:"鉛筆組", art:"📚 ✏️ 🖍️", cost:8},
  {name:"綠芽小農場", item:"蔬菜包", art:"🥕 🥬 🌽", cost:6}
];
const initial = {cash:300,bank:0,day:1,shop:0,done:false,profit:0};
let state = {...initial};
try { Object.assign(state, JSON.parse(localStorage.getItem("townShopV1"))); } catch {}
const shop = () => shops[state.shop];
function save(){try{localStorage.setItem("townShopV1",JSON.stringify(state));}catch{}}
function render(){
  $("day").textContent="☀　第 "+state.day+" 天";
  $("cash").textContent="$"+state.cash;
  $("bank").textContent="$"+state.bank;
  $("shop").selectedIndex=state.shop;
  $("sign").textContent=shop().name;
  $("goods").textContent=shop().art;
  $("info").textContent="今天要賣"+shop().item+"，每件進貨成本 "+shop().cost+" 元。當天賣不完的商品將捐出。";
  $("qty").textContent=$("q").value+" 件";
  $("price").textContent=$("p").value+" 元";
  $("cost").textContent="進貨總成本　$"+($("q").value*shop().cost);
  $("quest").textContent=state.done?"✓ 已破案・再次挑戰":"挑戰任務　→";
}
function show(html){$("body").innerHTML=html;if(!$("modal").open)$("modal").showModal();}
$("close").onclick=()=>$("modal").close();
$("q").oninput=$("p").oninput=render;
$("shop").onchange=()=>{state.shop=$("shop").selectedIndex;save();render();};
$("help").onclick=()=>show("<h2>小老闆，開店囉！</h2><p>你有 300 元開店基金。選好商店，調整進貨量和售價，再按「開始營業」。售價越高，願意購買的客人通常越少。</p><p>收入扣掉整批進貨成本，就是今天的利潤。賺錢時，可以把一半利潤存起來。每一天都能再試一次！</p><p>超市偵探有獨立的 100 元任務預算。</p>");
$("sell").onclick=()=>{
  const quantity=Number($("q").value), price=Number($("p").value), cost=quantity*shop().cost;
  if(cost>state.cash){
    show("<h2>再算算進貨預算</h2><p>進貨需要 "+cost+" 元，手上有 "+state.cash+" 元。試著減少進貨量，或選成本較低的商品。</p>"+(state.cash<6?"<button id='restart'>重新領取開店基金</button>":""));
    if($("restart"))$("restart").onclick=()=>{state={...initial,done:state.done};save();render();$("modal").close();};return;
  }
  const customers=Math.max(0,Math.round(27-price/shop().cost*7+Math.random()*5));
  const sold=Math.min(quantity,customers),revenue=sold*price,profit=revenue-cost;
  const day=state.day++;state.cash+=profit;save();render();
  const deposit=Math.floor(Math.max(0,profit)/2);
  show("<h2>第 "+day+" 天・營業結算</h2><p>售出 "+sold+" 件，剩下 "+(quantity-sold)+" 件捐給社區。</p><p>收入 "+revenue+" 元 − 成本 "+cost+" 元</p><h3>"+(profit<0?"今天虧了 "+(-profit):profit>0?"今天賺了 "+profit:"今天收支平衡，利潤 0")+" 元</h3><p>"+(profit<0?"下次試著少進一些貨，並讓售價高於每件成本。":"想一想，明天要進多少貨呢？")+"</p>"+(deposit?"<button id='deposit'>存下一半利潤（"+deposit+" 元）</button>":""));
  if(deposit)$("deposit").onclick=()=>{state.cash-=deposit;state.bank+=deposit;save();render();$("deposit").replaceWith("✓ 已存入 "+deposit+" 元");};
};
const products=[["🍚 白米",35,true],["🧼 肥皂",18,true],["🪥 牙刷",25,true],["💧 飲用水",12,true],["🍫 巧克力",20,false],["🧸 玩偶",48,false]];
$("quest").onclick=()=>{
  show("<h2>🔎 超市偵探</h2><p>家裡需要補充食物、飲水和清潔用品。挑三種必需品，再挑一種想要的小禮物，總共只能花 100 元。</p>"+products.map(([name,price],i)=>"<label><input type='checkbox' value='"+i+"'> "+name+"　"+price+" 元</label>").join("")+"<p id='total'></p><button id='check'>檢查購物籃</button><p id='feedback' role='status'></p>");
  const selected=()=>Array.from($("body").querySelectorAll(":checked"),el=>products[el.value]);
  const sum=()=>selected().reduce((n,p)=>n+p[1],0);
  const update=()=>{$("total").textContent="已選 "+sum()+" 元 ／ 預算 100 元";$("feedback").textContent="";};update();
  $("body").querySelectorAll("input").forEach(el=>el.onchange=update);
  $("check").onclick=()=>{const basket=selected(), needs=basket.filter(p=>p[2]).length;
    if(sum()>100)$("feedback").textContent="超出預算 "+(sum()-100)+" 元，試著換一件便宜的商品。";
    else if(needs!==3||basket.length!==4)$("feedback").textContent="目前有 "+needs+" 項必需品、"+(basket.length-needs)+" 項想要的物品，再調整一下！";
    else{state.done=true;save();render();$("feedback").textContent="🎉 成功破案！先照顧需要，再滿足想要，還剩 "+(100-sum())+" 元。";}
  };
};
render();
