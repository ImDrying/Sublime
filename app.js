import { db, defaultFirebaseConfig, getFirebaseConnectionText, resetFirebaseConnectionConfig, setFirebaseConnectionConfig, testFirebaseConnection } from "./firebase.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

    const $=id=>document.getElementById(id);
    const OWNER_USER="Sublime2601";
    let ownerSession=false;
    const OWNER_HASH="bff6e8192aa565d7d4a1ba532511eb5cd9f2f9daa24703f0feb09a907e37039f";
    const LS="sublime_config_v3_utf8",LS_PRODUCTS="sublime_productos",LS_CART="sublime_cart_v3",LS_FAV="sublime_favs_v3",LS_OWNER="sublime_owner_v3",LS_SELLER="sublime_seller_v3",LS_WHOLESALE_MODE="sublime_wholesale_mode_v1",LS_THEME="sublime_theme_v1",LS_DELETED="sublime_deleted_products_v3",LS_AI_BACKEND="sublime_ai_backend_v2",LS_REVIEWS="sublime_reviews_v1",LS_SALES="sublime_sales_v1",LS_SALES_AUDIT="sublime_sales_audit_v1";
    const SHARED_CATALOG_PATH="catalog-data.json";
    const BRAND_LOGO_URL="assets/sublime-logo-2026.png";
    const LS_LOGO_VERSION="sublime_logo_version_2026_09_03_png";
    const LS_DATABASE_API="sublime_database_api_v1";
    const FIRESTORE_COLLECTION="productos";
    const DEFAULT_DATABASE_API_ENDPOINT=`https://firestore.googleapis.com/v1/projects/${defaultFirebaseConfig.projectId}/databases/(default)/documents/${FIRESTORE_COLLECTION}`;
    const FIRESTORE_AMBASSADORS_COLLECTION="cupones_embajadores";
    const FIRESTORE_COUPON_HISTORY_COLLECTION="historial_usos_cupones";
    const DEFAULT_DATABASE_API_REFRESH_SECONDS=15;
    const MIN_DATABASE_API_REFRESH_SECONDS=5;
    const MAX_DATABASE_API_REFRESH_SECONDS=3600;
    let firestoreApi=null,firestoreUnsubscribe=null,firestoreAmbassadorsUnsubscribe=null,firestoreCouponHistoryUnsubscribe=null,firestoreOnline=false,firestoreBooted=false,firestoreWriteTimers=new Map();
    let databaseApiRefreshTimer=null,databaseApiRefreshPromise=null,databaseApiRefreshEventsBound=false,databaseApiSnapshotSignature="";
    const DEFAULT_IMAGE="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1100&q=84";
    const FALLBACK_IMAGE="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=900&q=84";
    const JEWEL_COLORS=["Dorado","Plateado","Oro rosa","Negro","Blanco","Perla","Beige","Marrón","Rojo","Azul","Verde","Rosa","Morado","Amarillo","Naranja","Transparente"];
    const DEFAULT={
      brandName:"Sublime", whatsapp:"+580000000000", email:"ventas@sublime.com", logo:BRAND_LOGO_URL, heroImage:DEFAULT_IMAGE,
      heroEyebrow:"Joyería seleccionada para cada día", heroTitle:"Sublime",
      heroText:"Compra joyería online con catálogo interactivo, carrito, precios en dólares y bolívares, pagos por Zelle, PayPal, Pago Móvil o efectivo, y confirmación directa por WhatsApp.",
      announcementEnabled:true,
      announcementText:"Envíos nacionales por MRW y Zoom | Tasa BCV al día | Garantía de 6 meses por defectos de pieza",
      ambassadorButtonText:"Quiero postularme", ambassadorButtonUrl:"",
      heroCardImage:"https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1000&q=84",
      heroCardTitle:"Piezas listas para regalar", heroCardText:"Colecciones elegantes en tonos beige, marrón y negro. Agrega al carrito y confirma tu pedido en minutos.",
      rate:36.5, rateApi:"https://ve.dolarapi.com/v1/dolares/oficial", rateField:"promedio", rateAuto:true,
      rateApis:["https://ve.dolarapi.com/v1/dolares/oficial","https://bcv-api.rafnixg.dev/rates/"],
      aiEnabled:true, aiProvider:"gemini", aiEndpoint:"/api/networks/v1/pailas/sublime/concierge/chat", aiModel:"gemini-2.5-flash", aiApiKey:"",
      aiSystemPrompt:"Eres el Concierge de Sublime, un asistente experto en joyería, ventas y atención al cliente. Hablas en español, eres amable, claro y orientado a ventas. Responde como un asistente de la tienda, recomienda piezas según estilo, presupuesto y ocasión, ayuda con envíos, pagos, garantía y carrito. Mantén respuestas breves, útiles y persuasivas.",
      shipCaracas:3, shipNational:5, freeShipping:80, couponCode:"SUBLIME10", couponPercent:10, coupons:[{code:"SUBLIME10",percent:10,active:true}], wholesaleDiscount:18,
      showBs:true, hideOutStock:false, animations:true, driveCatalogUrl:"", driveTarget:"append", driveAutoSync:false, googleSheetsWebhook:"",
      bankData:"Banco: Banco Nacional\nTeléfono: 04XX-0000000\nCédula/RIF: V-00000000\nTitular: Sublime",
      zelleData:"Zelle: pagos@sublime.com\nTitular: Sublime",
      paypalData:"PayPal: paypal.me/sublime\nCorreo: pagos@sublime.com",
      theme:{black:"#14110e",brown:"#5b3b2a",beige:"#eadfce",gold:"#c99b5b",cream:"#fffaf2",sand:"#f4ece0"},
      privatePieces:[],
      products:[
        {id:"p1",sku:"SUB-001",name:"Collar Aurora Ñacar",category:"Collares",material:"Acero inoxidable",price:18,stock:14,tag:"Nuevo",rating:5,colors:["Dorado","Perla","Beige"],desc:"Collar delicado con brillo nacarado, ideal para regalar y usar a diario.",images:["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=84"]},
        {id:"p2",sku:"SUB-002",name:"Anillo Alba",category:"Anillos",material:"Baño de oro",price:14,stock:9,tag:"Favorito",rating:5,colors:["Dorado","Marrón"],desc:"Anillo elegante de acabado cálido para combinar con piezas minimalistas.",images:["https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=84"]},
        {id:"p3",sku:"SUB-003",name:"Pulsera Serena",category:"Pulseras",material:"Acero",price:12,stock:0,tag:"Agotado",rating:4.8,colors:["Plateado","Negro"],desc:"Pulsera fina con ajuste cómodo. Se muestra como agotada cuando el stock llega a cero.",images:["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=84"]},
        {id:"p4",sku:"SUB-004",name:"Zarcillos Brisa",category:"Zarcillos",material:"Acero inoxidable",price:10,stock:22,tag:"Top",rating:4.9,colors:["Dorado","Plateado"],desc:"Zarcillos livianos para looks limpios, frescos y femeninos.",images:["https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=84"]}
      ]
    };
    let deletedProductIds=new Set(loadJson(LS_DELETED,[]).map(String));
    let config=loadConfig(),products=config.products,cart=loadJson(LS_CART,[]),favorites=new Set(loadJson(LS_FAV,[])),reviews=loadJson(LS_REVIEWS,[]),sales=loadJson(LS_SALES,[]),pendingCatalog=[],selectedBank=new Set(),coupon="",appliedCoupon=null,ambassadors=[],couponHistory=[],selectedCategory="Todos",selectedMaterial="Todos",showFavs=false,wholesaleMode=loadJson(LS_WHOLESALE_MODE,false)===true,chatHistory=[],orderSubmitting=false;
    const brokenImportImages=new Set();

    function loadJson(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
    function clone(v){return JSON.parse(JSON.stringify(v))}
    function loadConfig(){const saved=loadJson(LS,null);const merged=mergeConfig(clone(DEFAULT),saved||{});let changed=false;if(localStorage.getItem(LS_AI_BACKEND)!=="2"){merged.aiEnabled=true;merged.aiProvider=DEFAULT.aiProvider;merged.aiEndpoint=DEFAULT.aiEndpoint;merged.aiModel=DEFAULT.aiModel;merged.aiApiKey="";localStorage.setItem(LS_AI_BACKEND,"2");changed=true}const aiEndpoint=text(merged.aiEndpoint);if(aiEndpoint.includes("pollinations.ai")||aiEndpoint.includes("api.openai.com")||aiEndpoint.includes("generativelanguage.googleapis.com")){merged.aiEndpoint=DEFAULT.aiEndpoint;merged.aiApiKey="";changed=true}if(/vendedora|cr[eé]dito|mora/i.test(text(merged.heroText))){merged.heroText=DEFAULT.heroText;changed=true}if(!merged.zelleData){merged.zelleData=DEFAULT.zelleData;changed=true}if(!merged.paypalData){merged.paypalData=DEFAULT.paypalData;changed=true}if(changed)localStorage.setItem(LS,JSON.stringify(merged));return merged}
    function mergeConfig(base,saved){const source=saved&&typeof saved==="object"?saved:{};const merged={...base,...source,theme:{...base.theme,...(source.theme&&typeof source.theme==="object"?source.theme:{})}};const savedProducts=Array.isArray(source.products)?source.products:base.products;const savedPrivatePieces=Array.isArray(source.privatePieces)?source.privatePieces:[];merged.products=filterDeletedProducts(savedProducts.map(normalizeProduct));merged.privatePieces=savedPrivatePieces.map(normalizeProduct);return merged}
    function deletedKey(v){return text(v).toLowerCase().normalize("NFC")}
    function isDeletedProductId(id){return deletedProductIds.has(String(id))||deletedProductIds.has(deletedKey(id))}
    function isGenericProductName(name){return ["nueva pieza","producto sin nombre",""].includes(deletedKey(name))}
    function isDeletedProduct(p){return !!p&&(isDeletedProductId(p.id)||isDeletedProductId(p.sku)||(!isGenericProductName(p.name)&&deletedProductIds.has(`name:${deletedKey(p.name)}`)))}
    function filterDeletedProducts(list){return (list||[]).filter(p=>!isDeletedProduct(p))}
    function rememberDeletedProduct(p,id){[id,p?.id,p?.sku].map(text).filter(Boolean).forEach(v=>{deletedProductIds.add(String(v));deletedProductIds.add(deletedKey(v))});if(text(p?.name)&&!isGenericProductName(p.name))deletedProductIds.add(`name:${deletedKey(p.name)}`);localStorage.setItem(LS_DELETED,JSON.stringify([...deletedProductIds]))}
    function forgetDeletedProduct(p){
      [p?.id,p?.sku,p?.externalId].map(text).filter(Boolean).forEach(v=>{
        deletedProductIds.delete(String(v));
        deletedProductIds.delete(deletedKey(v));
      });
      const name=text(p?.name||p?.nombre);
      if(name&&!isGenericProductName(name))deletedProductIds.delete(`name:${deletedKey(name)}`);
      localStorage.setItem(LS_DELETED,JSON.stringify([...deletedProductIds]));
    }
    function persist(){config.products=filterDeletedProducts(products.map(normalizeProduct));products=config.products;config.deletedProductIds=[...deletedProductIds];localStorage.setItem(LS_PRODUCTS,JSON.stringify(products));localStorage.setItem(LS,JSON.stringify(config));localStorage.setItem(LS_DELETED,JSON.stringify([...deletedProductIds]));saveCart()}
    function sharedCatalogUrl(){return `${location.pathname.replace(/\/[^/]*$/,"/")}${SHARED_CATALOG_PATH}?v=${Date.now()}`}
    function reviveVisibleProducts(list){
      const normalized=(list||[]).map(normalizeProduct).filter(p=>p.published!==false);
      if(normalized.length){
        normalized.forEach(forgetDeletedProduct);
        products=normalized;
        config.products=products;
        localStorage.setItem(LS_PRODUCTS,JSON.stringify(products));
        localStorage.setItem(LS,JSON.stringify(config));
        return true;
      }
      return false;
    }
    async function loadSharedCatalog(){
      if(firestoreOnline)return false;
      try{
        const res=await fetch(sharedCatalogUrl(),{cache:"no-store",credentials:"include"});
        if(!res.ok)throw new Error(`HTTP ${res.status}`);
        const data=await res.json();
        const remote=Array.isArray(data)?data:(data.products||[]);
        const remoteUpdated=Number(data.updatedAt||data.revision||0);
        const localUpdated=Number(localStorage.getItem("sublime_catalog_updated_at")||0);
        if(remote.length){
          reviveVisibleProducts(remote);
          if(remoteUpdated)localStorage.setItem("sublime_catalog_updated_at",String(remoteUpdated));
          renderCategories();renderizarTiendaPublica();renderizarPanelOwner();renderAdminProducts();updateOwnerStats();
          return true;
        }
      }catch(error){console.warn("No se pudo cargar catálogo compartido",error)}
      if(!products.length){
        products=(DEFAULT.products||[]).map(productoConAliases);
        config.products=products;
        localStorage.setItem(LS_PRODUCTS,JSON.stringify(products));
        localStorage.setItem(LS,JSON.stringify(config));
        renderizarTiendaPublica();
        renderizarPanelOwner();
      }
      return false;
    }
    async function saveSharedCatalog(){
      const payload={updatedAt:Date.now(),products:products.map(normalizeProduct)};
      localStorage.setItem("sublime_catalog_updated_at",String(payload.updatedAt));
      localStorage.setItem("sublime_shared_catalog_backup",JSON.stringify(payload));
      try{
        const network=location.pathname.split("/")[2]||"pailas";
        await fetch(`/api/networks/v1/${encodeURIComponent(network)}/buckets/upload`,{
          method:"POST",
          credentials:"include",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({bucket:"public",path:SHARED_CATALOG_PATH,content:JSON.stringify(payload,null,2),encoding:"utf8"})
        });
      }catch(error){console.warn("Catálogo guardado solo en este navegador",error)}
    }
    async function initFirestore(){
      if(firestoreApi)return firestoreApi;
      firestoreApi={db,collection,doc,addDoc,setDoc,getDoc,updateDoc,deleteDoc,onSnapshot,getDocs,query,where,increment,serverTimestamp};
      return firestoreApi;
    }
    function normalizeDatabaseApiRefreshSeconds(value){
      const parsed=Math.round(Number(value));
      if(!Number.isFinite(parsed))return DEFAULT_DATABASE_API_REFRESH_SECONDS;
      return Math.min(MAX_DATABASE_API_REFRESH_SECONDS,Math.max(MIN_DATABASE_API_REFRESH_SECONDS,parsed));
    }
    function loadDatabaseApiConfig(){
      const saved=loadJson(LS_DATABASE_API,null);
      const savedEndpoint=text(saved?.endpoint||"").replaceAll("TU_PROJECT_ID",defaultFirebaseConfig.projectId);
      const legacyMode=saved?.mode==="firebase"?"sdk":saved?.mode;
      return {
        mode:["sdk","api"].includes(legacyMode)?legacyMode:"api",
        endpoint:savedEndpoint||DEFAULT_DATABASE_API_ENDPOINT,
        apiKey:text(saved?.apiKey||defaultFirebaseConfig.apiKey),
        collection:text(saved?.collection||FIRESTORE_COLLECTION)||FIRESTORE_COLLECTION,
        refreshSeconds:normalizeDatabaseApiRefreshSeconds(saved?.refreshSeconds)
      };
    }
    function saveDatabaseApiConfig(data){
      const requestedMode=data?.mode==="firebase"?"sdk":data?.mode;
      localStorage.setItem(LS_DATABASE_API,JSON.stringify({
        ...data,
        mode:requestedMode==="sdk"?"sdk":"api",
        refreshSeconds:normalizeDatabaseApiRefreshSeconds(data?.refreshSeconds)
      }));
    }
    function databaseApiConfig(){return loadDatabaseApiConfig()}
    function databaseApiEnabled(){
      const cfg=databaseApiConfig();
      return cfg.mode==="api"&&!!cfg.endpoint;
    }
    function databaseApiRefreshSeconds(){return normalizeDatabaseApiRefreshSeconds(databaseApiConfig().refreshSeconds)}
    function normalizeApiEndpoint(url){
      let raw=text(url);
      if(!raw)return "";
      try{
        const parsed=new URL(raw,location.origin);
        parsed.searchParams.delete("key");
        raw=parsed.toString();
      }catch{}
      return raw.replace(/\/+$/,"");
    }
    function firestoreRestCollectionUrl(cfg=databaseApiConfig()){
      const endpoint=normalizeApiEndpoint(cfg.endpoint);
      if(!endpoint)return "";
      let url=endpoint;
      if(/firestore\.googleapis\.com\/v1\/projects\/.+\/documents\/?$/i.test(url)){
        url=`${url.replace(/\/+$/,"")}/${encodeURIComponent(cfg.collection||FIRESTORE_COLLECTION)}`;
      }
      if(!/\/documents\//i.test(url)&&/firestore\.googleapis\.com/i.test(url)){
        url=`${url}/${encodeURIComponent(cfg.collection||FIRESTORE_COLLECTION)}`;
      }
      if(cfg.apiKey){
        const parsed=new URL(url,location.origin);
        parsed.searchParams.set("key",cfg.apiKey);
        url=parsed.toString();
      }
      return url;
    }
    function decodeFirestoreValue(value){
      if(!value||typeof value!=="object")return value;
      if("stringValue" in value)return value.stringValue;
      if("integerValue" in value)return Number(value.integerValue);
      if("doubleValue" in value)return Number(value.doubleValue);
      if("booleanValue" in value)return !!value.booleanValue;
      if("timestampValue" in value)return value.timestampValue;
      if("arrayValue" in value)return (value.arrayValue.values||[]).map(decodeFirestoreValue);
      if("mapValue" in value){
        const out={};
        Object.entries(value.mapValue.fields||{}).forEach(([k,v])=>out[k]=decodeFirestoreValue(v));
        return out;
      }
      return value;
    }
    function encodeFirestoreValue(value){
      if(Array.isArray(value))return {arrayValue:{values:value.map(encodeFirestoreValue)}};
      if(value===null||value===undefined)return {nullValue:null};
      if(typeof value==="boolean")return {booleanValue:value};
      if(typeof value==="number")return Number.isInteger(value)?{integerValue:String(value)}:{doubleValue:value};
      if(value&&typeof value==="object"){
        const fields={};
        Object.entries(value).forEach(([k,v])=>fields[k]=encodeFirestoreValue(v));
        return {mapValue:{fields}};
      }
      return {stringValue:String(value)};
    }
    function toFirestoreRestDocument(data){
      const fields={};
      Object.entries(data||{}).forEach(([key,value])=>fields[key]=encodeFirestoreValue(value));
      return {fields};
    }
    function fromFirestoreRestDocument(docData){
      const data={};
      Object.entries(docData?.fields||{}).forEach(([key,value])=>data[key]=decodeFirestoreValue(value));
      const id=text(docData?.name).split("/").pop();
      return productoConAliases({...data,firestoreId:id,id:data.id||id});
    }
    async function databaseApiRequest(url,options={}){
      const response=await fetch(url,{...options,headers:{"Content-Type":"application/json",Accept:"application/json",...(options.headers||{})}});
      const body=await response.text();
      const data=body?JSON.parse(body):{};
      if(!response.ok)throw new Error(data.error?.message||`API HTTP ${response.status}`);
      return data;
    }
    async function readProductsFromDatabaseApi(){
      const url=firestoreRestCollectionUrl();
      const data=await databaseApiRequest(url,{method:"GET",cache:"no-store"});
      const docs=Array.isArray(data.documents)?data.documents:[];
      return docs.map(fromFirestoreRestDocument).sort((a,b)=>String(a.nombre).localeCompare(String(b.nombre),"es"));
    }
    async function createProductInDatabaseApi(product){
      const url=firestoreRestCollectionUrl();
      const payload=firestoreProductPayload(product);
      const data=await databaseApiRequest(url,{method:"POST",body:JSON.stringify(toFirestoreRestDocument(payload))});
      return text(data.name).split("/").pop();
    }
    async function updateProductInDatabaseApi(product){
      const cfg=databaseApiConfig(),base=firestoreRestCollectionUrl(cfg),p=productoConAliases(product);
      if(!p.firestoreId)return createProductInDatabaseApi(p);
      const url=`${base}/${encodeURIComponent(p.firestoreId)}`;
      await databaseApiRequest(url,{method:"PATCH",body:JSON.stringify(toFirestoreRestDocument(firestoreProductPayload(p)))});
      return p.firestoreId;
    }
    async function deleteProductFromDatabaseApi(product){
      if(!product?.firestoreId)return;
      const url=`${firestoreRestCollectionUrl()}/${encodeURIComponent(product.firestoreId)}`;
      await databaseApiRequest(url,{method:"DELETE"});
    }
    async function replaceDatabaseApiCatalog(incoming){
      const current=await readProductsFromDatabaseApi();
      for(const item of current)await deleteProductFromDatabaseApi(item);
      for(const item of incoming)await createProductInDatabaseApi(item);
    }
    async function upsertDatabaseApiCatalog(incoming){
      const current=await readProductsFromDatabaseApi();
      const byKey=new Map(current.map(item=>[importKey(item),item]).filter(([key])=>key));
      for(const item of incoming.map(productoConAliases)){
        const existing=byKey.get(importKey(item));
        if(existing)await updateProductInDatabaseApi({...existing,...item,firestoreId:existing.firestoreId,id:existing.id});
        else await createProductInDatabaseApi(item);
      }
    }
    function updateDatabaseConnectionStatus(message,state=""){
      const el=$("databaseConnectionStatus");
      if(!el)return;
      el.textContent=message;
      el.className=`small ${state||"muted"}`;
    }
    async function saveDatabaseConnection(){
      try{
        const mode=$("adminDatabaseMode")?.value||"sdk";
        const refreshSeconds=normalizeDatabaseApiRefreshSeconds($("adminDatabaseRefreshSeconds")?.value);
        const nextConfig={
          mode,
          endpoint:$("adminDatabaseApiUrl")?.value||"",
          apiKey:$("adminDatabaseApiKey")?.value||"",
          collection:$("adminDatabaseCollection")?.value||FIRESTORE_COLLECTION,
          refreshSeconds
        };
        if(mode==="api"&&!text(nextConfig.endpoint))throw new Error("Agrega la URL/API de Firestore.");
        saveDatabaseApiConfig(nextConfig);
        stopDatabaseApiAutoRefresh();
        if(firestoreUnsubscribe){firestoreUnsubscribe();firestoreUnsubscribe=null}
        firestoreBooted=false;
        databaseApiSnapshotSignature="";
        if(mode==="sdk"){
          setFirebaseConnectionConfig($("adminFirebaseConfig")?.value||"");
          await startFirestoreCatalog({force:true});
          updateDatabaseConnectionStatus("Modo SDK activo: onSnapshot recibe cambios de Firestore en tiempo real. Si cambiaste de proyecto, recarga una vez para cargar esa nueva configuración.","ok");
          toast("SDK Firebase conectado en tiempo real");
          return;
        }
        const items=await refreshProductsFromDatabaseApi({silent:true,forceRender:true});
        startDatabaseApiAutoRefresh();
        if(items===null){
          updateDatabaseConnectionStatus(`API guardada. No respondió ahora; reintento automático cada ${refreshSeconds} segundos.`,"danger");
          toast("API guardada con refresco automático");
          return;
        }
        updateDatabaseConnectionStatus(`Modo API activo: ${items.length} producto(s). Refresco con fetch cada ${refreshSeconds} segundos.`,"ok");
        toast("API conectada y refresco automático activo");
      }catch(error){
        updateDatabaseConnectionStatus(error.message||String(error),"danger");
        toast("No pude guardar la conexión");
      }
    }
    async function checkDatabaseConnection(){
      updateDatabaseConnectionStatus("Probando conexión con la base de datos...","muted");
      try{
        if(($("adminDatabaseMode")?.value||"sdk")==="api"){
          saveDatabaseApiConfig({
            mode:"api",
            endpoint:$("adminDatabaseApiUrl")?.value||"",
            apiKey:$("adminDatabaseApiKey")?.value||"",
            collection:$("adminDatabaseCollection")?.value||FIRESTORE_COLLECTION,
            refreshSeconds:normalizeDatabaseApiRefreshSeconds($("adminDatabaseRefreshSeconds")?.value)
          });
          const items=await readProductsFromDatabaseApi();
          updateDatabaseConnectionStatus(`API conectada. ${items.length} producto(s) encontrados en ${$("adminDatabaseCollection")?.value||FIRESTORE_COLLECTION}.`,"ok");
          toast("API conectada");
          return;
        }
        const result=await testFirebaseConnection();
        updateDatabaseConnectionStatus(`Firebase conectado a ${result.projectId}. Colección productos accesible.`,"ok");
        toast("Firebase conectado");
      }catch(error){
        console.warn("Prueba de base de datos falló",error);
        updateDatabaseConnectionStatus(`No pude conectar: ${error.message||error}`,"danger");
        toast("No pude conectar la base de datos");
      }
    }
    function resetDatabaseConnection(){
      resetFirebaseConnectionConfig();
      localStorage.removeItem(LS_DATABASE_API);
      const defaults=loadDatabaseApiConfig();
      if($("adminDatabaseMode"))$("adminDatabaseMode").value=defaults.mode;
      if($("adminDatabaseApiUrl"))$("adminDatabaseApiUrl").value=defaults.endpoint;
      if($("adminDatabaseApiKey"))$("adminDatabaseApiKey").value=defaults.apiKey;
      if($("adminDatabaseCollection"))$("adminDatabaseCollection").value=defaults.collection;
      if($("adminDatabaseRefreshSeconds"))$("adminDatabaseRefreshSeconds").value=defaults.refreshSeconds;
      if($("adminFirebaseConfig"))$("adminFirebaseConfig").value=getFirebaseConnectionText();
      updateDatabaseConnectionStatus("Se restauró la conexión API de Sublime. Pulsa Probar conexión para verificarla.","ok");
      toast("Conexión de Sublime restaurada");
    }
    function firestoreProductPayload(product){
      const p=productoConAliases(product);
      return {
        id:String(p.id||p.externalId||p.sku||cryptoRandom()),
        externalId:text(p.externalId||p.id),
        nombre:p.nombre,
        name:p.name,
        categoria:p.categoria,
        category:p.category,
        material:p.material,
        precioUSD:number(p.precioUSD,0),
        price:number(p.price,0),
        descripcion:p.descripcion,
        desc:p.desc,
        imagenes:p.imagenes,
        images:p.images,
        sku:p.sku,
          stock:number(p.stock,0),
          sold:number(p.sold,0),
        published:p.published!==false,
        rating:number(p.rating,5),
        color:p.color,
        colors:p.colors,
        tag:p.tag,
        wholesale12:number(p.wholesale12,0),
        wholesale50:number(p.wholesale50,0),
        wholesale100:number(p.wholesale100,0),
        updatedAt:new Date().toISOString()
      };
    }
    function firestoreProductFromDoc(snapshot){
      const data=snapshot.data()||{};
      return productoConAliases({...data,firestoreId:snapshot.id,id:data.id||snapshot.id});
    }
    function applyFirestoreProducts(list){
      products=filterDeletedProducts(list.map(productoConAliases));
      config.products=products;
      localStorage.setItem(LS_PRODUCTS,JSON.stringify(products));
      localStorage.setItem(LS,JSON.stringify(config));
      renderCategories();renderizarTiendaPublica();renderizarPanelOwner();renderCart();updateOwnerStats();
    }
    function databaseApiProductsSignature(list){
      return JSON.stringify((list||[]).map(item=>{
        const p=productoConAliases(item);
        return {
          firestoreId:p.firestoreId||"",id:p.id||"",externalId:p.externalId||"",sku:p.sku||"",
          name:p.name,category:p.category,material:p.material,price:number(p.price),stock:number(p.stock),sold:number(p.sold),
          published:p.published!==false,rating:number(p.rating),color:p.color||"",colors:p.colors||[],tag:p.tag||"",
          desc:p.desc||"",images:p.images||[],wholesale12:number(p.wholesale12),wholesale50:number(p.wholesale50),wholesale100:number(p.wholesale100)
        };
      }));
    }
    async function refreshProductsFromDatabaseApi({silent=false,forceRender=false,throwOnError=false}={}){
      if(!databaseApiEnabled())return null;
      if(databaseApiRefreshPromise)return databaseApiRefreshPromise;
      databaseApiRefreshPromise=(async()=>{
        try{
          const latest=await readProductsFromDatabaseApi();
          const signature=databaseApiProductsSignature(latest);
          firestoreOnline=true;
          if(forceRender||signature!==databaseApiSnapshotSignature){
            databaseApiSnapshotSignature=signature;
            applyFirestoreProducts(latest);
          }
          const updatedAt=new Date().toLocaleTimeString("es-VE",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
          updateDatabaseConnectionStatus(`API sincronizada · ${latest.length} producto(s) · cada ${databaseApiRefreshSeconds()} s · ${updatedAt}`,"ok");
          return latest;
        }catch(error){
          firestoreOnline=false;
          console.warn("No pude refrescar productos desde API",error);
          updateDatabaseConnectionStatus("La API no respondió. Reintento automático activo.","danger");
          if(!silent)toast("La API no respondió; volveré a intentar automáticamente");
          if(throwOnError)throw error;
          return null;
        }
      })();
      try{return await databaseApiRefreshPromise}
      finally{databaseApiRefreshPromise=null}
    }
    function stopDatabaseApiAutoRefresh(){
      if(databaseApiRefreshTimer){clearInterval(databaseApiRefreshTimer);databaseApiRefreshTimer=null}
    }
    function bindDatabaseApiRefreshEvents(){
      if(databaseApiRefreshEventsBound)return;
      databaseApiRefreshEventsBound=true;
      const resume=async()=>{
        if(!databaseApiEnabled()||document.hidden)return;
        stopDatabaseApiAutoRefresh();
        await refreshProductsFromDatabaseApi({silent:true});
        startDatabaseApiAutoRefresh();
      };
      document.addEventListener("visibilitychange",()=>document.hidden?stopDatabaseApiAutoRefresh():resume());
      window.addEventListener("focus",resume);
      window.addEventListener("online",resume);
      window.addEventListener("offline",stopDatabaseApiAutoRefresh);
    }
    function startDatabaseApiAutoRefresh(){
      stopDatabaseApiAutoRefresh();
      if(!databaseApiEnabled()||document.hidden)return;
      bindDatabaseApiRefreshEvents();
      const refreshMs=databaseApiRefreshSeconds()*1000;
      databaseApiRefreshTimer=setInterval(()=>{
        if(document.hidden||!navigator.onLine||!databaseApiEnabled())return;
        refreshProductsFromDatabaseApi({silent:true});
      },refreshMs);
    }
    async function startFirestoreCatalog({force=false}={}){
      if(firestoreBooted&&!force)return;
      if(force&&firestoreUnsubscribe){firestoreUnsubscribe();firestoreUnsubscribe=null}
      firestoreBooted=true;
      if(location.protocol==="file:"){
        firestoreOnline=false;
        await loadSharedCatalog();
        return;
      }
      const mode=databaseApiConfig().mode;
      if(mode==="api"){
        if(!databaseApiEnabled()){
          firestoreOnline=false;
          await loadSharedCatalog();
          updateDatabaseConnectionStatus("Falta la URL de la API. Se muestra el respaldo local.","danger");
          return;
        }
        const remote=await refreshProductsFromDatabaseApi({silent:true,forceRender:true});
        startDatabaseApiAutoRefresh();
        if(remote===null){
          await loadSharedCatalog();
          toast("No pude conectar la API. Se muestra respaldo local y seguiré reintentando.");
        }
        return;
      }
      stopDatabaseApiAutoRefresh();
      try{
        const api=await initFirestore();
        const col=api.collection(api.db,FIRESTORE_COLLECTION);
        firestoreUnsubscribe=api.onSnapshot(col,snapshot=>{
          firestoreOnline=true;
          updateDatabaseConnectionStatus(`SDK en tiempo real · ${snapshot.size} producto(s) · onSnapshot activo`,"ok");
          const remote=snapshot.docs.map(firestoreProductFromDoc).sort((a,b)=>String(a.nombre).localeCompare(String(b.nombre),"es"));
          if(remote.length)applyFirestoreProducts(remote);
          else{
            firestoreOnline=false;
            loadSharedCatalog();
            renderCategories();renderizarTiendaPublica();renderizarPanelOwner();renderCart();updateOwnerStats();
          }
        },error=>{
          firestoreOnline=false;
          console.warn("Firestore no disponible, usando respaldo local/JSON",error);
          loadSharedCatalog();
          toast("No pude conectar Firestore. Se muestra respaldo local.");
        });
      }catch(error){
        firestoreOnline=false;
        console.warn("Firebase no cargó, usando respaldo local/JSON",error);
        loadSharedCatalog();
      }
    }
    function monthKey(date=new Date()){return date.toISOString().slice(0,7)}
    function normalizeAmbassador(data,id=""){
      const raw=data||{};
      const code=text(raw.codigo||raw.code).toUpperCase();
      return {
        firestoreId:id||raw.firestoreId||"",
        codigo:code,
        nombreEmbajador:text(raw.nombreEmbajador||raw.name||raw.nombre),
        contacto:text(raw.contacto||raw.email||raw.contact),
        descuentoPorcentaje:number(raw.descuentoPorcentaje??raw.percent,10),
        activo:raw.activo!==false,
        usosMesActual:number(raw.usosMesActual,0),
        usosTotales:number(raw.usosTotales,0),
        lastUsoMes:text(raw.lastUsoMes||"")
      };
    }
    function normalizeCouponUse(data,id=""){
      const raw=data||{};
      return {
        firestoreId:id||raw.firestoreId||"",
        codigoCupon:text(raw.codigoCupon||raw.codigoCupón||raw.codigo||raw.coupon).toUpperCase(),
        nombreEmbajador:text(raw.nombreEmbajador),
        fecha:raw.fecha?.toDate?.()?.toISOString?.()||raw.fecha||raw.date||"",
        mes:text(raw.mes||monthKey()),
        montoCompra:number(raw.montoCompra??raw.total,0),
        cliente:text(raw.cliente||raw.customer||""),
        pedidoId:text(raw.pedidoId||raw.orderId||"")
      };
    }
    function renderAmbassadorAdmin(){
      const root=$("ambassadorAdminRoot");
      if(!root)return;
      const month=monthKey();
      const historyByCode=new Map();
      couponHistory.filter(item=>item.mes===month).forEach(item=>{
        const key=item.codigoCupon;
        if(!historyByCode.has(key))historyByCode.set(key,[]);
        historyByCode.get(key).push(item);
      });
      root.innerHTML=`
        <div class="admin-grid">
          <div class="admin-card">
            <h3>Registrar embajador</h3>
            <div class="grid2">
              <div class="field"><label>Nombre completo</label><input class="input" id="ambName" placeholder="María Fernanda"></div>
              <div class="field"><label>Contacto / email</label><input class="input" id="ambContact" placeholder="correo o WhatsApp"></div>
              <div class="field"><label>Código de cupón</label><input class="input" id="ambCode" placeholder="MARIA10"></div>
              <div class="field"><label>Descuento %</label><input class="input" id="ambPercent" type="number" min="1" max="100" value="10"></div>
            </div>
            <button class="btn btn-primary" type="button" id="createAmbassadorBtn"><i data-lucide="badge-percent"></i>Crear cupón</button>
            <p class="small muted">Los cupones se guardan en Firestore y se validan en el carrito en tiempo real.</p>
          </div>
          <div class="admin-card">
            <h3>Métricas del mes</h3>
            <p class="small muted">Mes actual: ${esc(month)}. El conteo se agrupa por el campo mes en el historial.</p>
            <div class="coupon-list">${ambassadors.length?ambassadors.map(a=>{
              const monthly=historyByCode.get(a.codigo)?.length||number(a.usosMesActual,0);
              return `<div class="coupon-row"><strong>${esc(a.codigo)}</strong><span>${monthly} uso(s) este mes</span><span>${number(a.usosTotales,0)} total</span></div>`;
            }).join(""):`<div class="empty">Aún no hay embajadores registrados.</div>`}</div>
          </div>
        </div>
        <div class="admin-card">
          <h3>Embajadores activos</h3>
          <div class="ambassador-table">${ambassadors.length?ambassadors.map(a=>`
            <article class="coupon-row ambassador-row" data-ambassador-id="${esc(a.firestoreId)}">
              <div class="field"><label>Nombre</label><input class="input" data-amb-field="nombreEmbajador" value="${esc(a.nombreEmbajador)}"></div>
              <div class="field"><label>Contacto</label><input class="input" data-amb-field="contacto" value="${esc(a.contacto)}"></div>
              <div class="field"><label>Código</label><input class="input" data-amb-field="codigo" value="${esc(a.codigo)}"></div>
              <div class="field"><label>Descuento %</label><input class="input" type="number" data-amb-field="descuentoPorcentaje" value="${esc(a.descuentoPorcentaje)}"></div>
              <div class="row"><button class="btn btn-light" type="button" data-amb-save="${esc(a.firestoreId)}">Guardar</button><button class="btn ${a.activo?"btn-danger":"btn-gold"}" type="button" data-amb-toggle="${esc(a.firestoreId)}">${a.activo?"Desactivar":"Activar"}</button></div>
            </article>`).join(""):`<div class="empty">Crea el primer embajador para generar su cupón exclusivo.</div>`}</div>
        </div>
        <div class="admin-card">
          <h3>Historial de usos</h3>
          <div class="sales-list">${couponHistory.length?couponHistory.slice(0,80).map(h=>`<article class="sale-card"><strong>${esc(h.codigoCupon)} · ${esc(h.nombreEmbajador||"Embajador")}</strong><span>${esc(h.fecha?new Date(h.fecha).toLocaleString("es-VE"):"Fecha pendiente")} · ${esc(h.mes)}</span><p>${esc(h.cliente||"Cliente no indicado")} ${h.pedidoId?`· Pedido ${esc(h.pedidoId)}`:""}</p><div class="small muted">Monto: ${money(h.montoCompra)}</div></article>`).join(""):`<div class="empty">Aún no hay cupones canjeados.</div>`}</div>
        </div>`;
      $("createAmbassadorBtn")?.addEventListener("click",createAmbassadorCoupon);
      root.querySelectorAll("[data-amb-save]").forEach(btn=>btn.addEventListener("click",()=>saveAmbassadorCoupon(btn.dataset.ambSave)));
      root.querySelectorAll("[data-amb-toggle]").forEach(btn=>btn.addEventListener("click",()=>toggleAmbassadorCoupon(btn.dataset.ambToggle)));
      lucide.createIcons();
    }
    async function startAmbassadorProgram(){
      if(location.protocol==="file:")return;
      try{
        const api=await initFirestore();
        firestoreAmbassadorsUnsubscribe?.();
        firestoreAmbassadorsUnsubscribe=api.onSnapshot(api.collection(api.db,FIRESTORE_AMBASSADORS_COLLECTION),snapshot=>{
          ambassadors=snapshot.docs.map(docSnap=>normalizeAmbassador(docSnap.data(),docSnap.id)).sort((a,b)=>a.nombreEmbajador.localeCompare(b.nombreEmbajador,"es"));
          renderAmbassadorAdmin();
        },error=>console.warn("No pude escuchar cupones de embajadores",error));
        firestoreCouponHistoryUnsubscribe?.();
        firestoreCouponHistoryUnsubscribe=api.onSnapshot(api.collection(api.db,FIRESTORE_COUPON_HISTORY_COLLECTION),snapshot=>{
          couponHistory=snapshot.docs.map(docSnap=>normalizeCouponUse(docSnap.data(),docSnap.id)).sort((a,b)=>String(b.fecha).localeCompare(String(a.fecha)));
          renderAmbassadorAdmin();
        },error=>console.warn("No pude escuchar historial de cupones",error));
      }catch(error){console.warn("Programa Embajador sin Firestore",error)}
    }
    async function createAmbassadorCoupon(){
      const nombreEmbajador=text($("ambName")?.value),contacto=text($("ambContact")?.value),codigo=text($("ambCode")?.value).toUpperCase(),descuentoPorcentaje=Math.min(100,Math.max(1,number($("ambPercent")?.value,10)));
      if(!nombreEmbajador||!codigo)return toast("Completa nombre y código");
      if(ambassadors.some(a=>a.codigo===codigo&&a.activo!==false))return toast("Ese código ya existe");
      try{
        const api=await initFirestore();
        await api.addDoc(api.collection(api.db,FIRESTORE_AMBASSADORS_COLLECTION),{codigo,nombreEmbajador,contacto,descuentoPorcentaje,activo:true,usosMesActual:0,usosTotales:0,lastUsoMes:monthKey()});
        ["ambName","ambContact","ambCode"].forEach(id=>{if($(id))$(id).value=""});
        toast("Embajador creado");
      }catch(error){console.warn(error);toast("No pude crear el cupón en Firestore")}
    }
    function ambassadorFromCard(id){
      const card=document.querySelector(`[data-ambassador-id="${CSS.escape(id)}"]`);
      if(!card)return null;
      const get=f=>card.querySelector(`[data-amb-field="${f}"]`)?.value;
      return normalizeAmbassador({nombreEmbajador:get("nombreEmbajador"),contacto:get("contacto"),codigo:get("codigo"),descuentoPorcentaje:get("descuentoPorcentaje"),activo:ambassadors.find(a=>a.firestoreId===id)?.activo!==false},id);
    }
    async function saveAmbassadorCoupon(id){
      const item=ambassadorFromCard(id);
      if(!item||!item.nombreEmbajador||!item.codigo)return toast("Completa nombre y código");
      try{
        const api=await initFirestore();
        await api.updateDoc(api.doc(api.db,FIRESTORE_AMBASSADORS_COLLECTION,id),{codigo:item.codigo,nombreEmbajador:item.nombreEmbajador,contacto:item.contacto,descuentoPorcentaje:item.descuentoPorcentaje});
        toast("Embajador actualizado");
      }catch(error){console.warn(error);toast("No pude actualizar el embajador")}
    }
    async function toggleAmbassadorCoupon(id){
      const item=ambassadors.find(a=>a.firestoreId===id);
      if(!item)return;
      try{
        const api=await initFirestore();
        await api.updateDoc(api.doc(api.db,FIRESTORE_AMBASSADORS_COLLECTION,id),{activo:item.activo===false});
        toast(item.activo===false?"Cupón activado":"Cupón desactivado");
      }catch(error){console.warn(error);toast("No pude cambiar el estado del cupón")}
    }
    async function validateAmbassadorCoupon(code){
      const clean=text(code).toUpperCase();
      if(!clean)return null;
      const cached=ambassadors.find(a=>a.codigo===clean&&a.activo!==false);
      if(cached)return {...cached,code:cached.codigo,percent:cached.descuentoPorcentaje,source:"embajador"};
      try{
        const api=await initFirestore();
        const q=api.query(api.collection(api.db,FIRESTORE_AMBASSADORS_COLLECTION),api.where("codigo","==",clean),api.where("activo","==",true));
        const snap=await api.getDocs(q);
        if(snap.empty)return null;
        const docSnap=snap.docs[0],item=normalizeAmbassador(docSnap.data(),docSnap.id);
        return {...item,code:item.codigo,percent:item.descuentoPorcentaje,source:"embajador"};
      }catch(error){console.warn("No pude validar cupón de embajador",error);return null}
    }
    async function registerCouponUse(sale){
      const selected=appliedCoupon;
      if(!selected||selected.source!=="embajador"||!selected.firestoreId)return;
      try{
        const api=await initFirestore(),mes=monthKey();
        const monthlyUpdate=selected.lastUsoMes===mes?api.increment(1):1;
        await api.updateDoc(api.doc(api.db,FIRESTORE_AMBASSADORS_COLLECTION,selected.firestoreId),{usosMesActual:monthlyUpdate,usosTotales:api.increment(1),lastUsoMes:mes});
        await api.addDoc(api.collection(api.db,FIRESTORE_COUPON_HISTORY_COLLECTION),{
          codigoCupon:selected.codigo||selected.code,
          codigoCupón:selected.codigo||selected.code,
          nombreEmbajador:selected.nombreEmbajador||"",
          fecha:api.serverTimestamp(),
          mes,
          montoCompra:number(sale.total,0),
          cliente:sale.customer?.name||"",
          pedidoId:sale.id
        });
      }catch(error){console.warn("No pude registrar uso de cupón",error);toast("Pedido confirmado, pero no pude registrar el cupón")}
    }
    async function createProductInFirestore(product){
      if(databaseApiEnabled())return createProductInDatabaseApi(product);
      const api=await initFirestore();
      const ref=await api.addDoc(api.collection(api.db,FIRESTORE_COLLECTION),firestoreProductPayload(product));
      return ref.id;
    }
    async function updateProductInFirestore(product){
      if(databaseApiEnabled())return updateProductInDatabaseApi(product);
      const api=await initFirestore();
      const p=productoConAliases(product);
      if(!p.firestoreId){
        const newId=await createProductInFirestore(p);
        p.firestoreId=newId;
        const idx=products.findIndex(item=>sameId(item.id,p.id));
        if(idx>=0)products[idx]=productoConAliases({...products[idx],firestoreId:newId});
        return newId;
      }
      await api.updateDoc(api.doc(api.db,FIRESTORE_COLLECTION,p.firestoreId),firestoreProductPayload(p));
      return p.firestoreId;
    }
    function scheduleFirestoreProductUpdate(product){
      if(!firestoreBooted)return;
      const p=productoConAliases(product),key=String(p.firestoreId||p.id);
      clearTimeout(firestoreWriteTimers.get(key));
      firestoreWriteTimers.set(key,setTimeout(async()=>{
        try{await updateProductInFirestore(p)}
        catch(error){console.warn("No pude actualizar producto en Firestore",error);toast("No pude guardar ese cambio en Firestore")}
      },650));
    }
    async function deleteProductFromFirestore(product){
      if(databaseApiEnabled())return deleteProductFromDatabaseApi(product);
      if(!product?.firestoreId)return;
      const api=await initFirestore();
      await api.deleteDoc(api.doc(api.db,FIRESTORE_COLLECTION,product.firestoreId));
    }
    async function replaceFirestoreCatalog(incoming){
      if(databaseApiEnabled())return replaceDatabaseApiCatalog(incoming);
      const api=await initFirestore();
      const col=api.collection(api.db,FIRESTORE_COLLECTION);
      const current=await api.getDocs(col);
      for(const item of current.docs)await api.deleteDoc(api.doc(api.db,FIRESTORE_COLLECTION,item.id));
      for(const item of incoming)await api.addDoc(col,firestoreProductPayload(item));
    }
    async function upsertFirestoreCatalog(incoming){
      if(databaseApiEnabled())return upsertDatabaseApiCatalog(incoming);
      const api=await initFirestore();
      const col=api.collection(api.db,FIRESTORE_COLLECTION);
      const current=await api.getDocs(col);
      const byKey=new Map(current.docs.map(docSnap=>{
        const data=docSnap.data()||{},key=text(data.sku||data.externalId||data.id).toLowerCase();
        return [key,{id:docSnap.id,data}];
      }).filter(([key])=>key));
      for(const item of incoming.map(productoConAliases)){
        const key=importKey(item);
        const existing=byKey.get(key);
        if(existing)await api.updateDoc(api.doc(api.db,FIRESTORE_COLLECTION,existing.id),firestoreProductPayload({...existing.data,...item,id:existing.data.id||item.id}));
        else await api.addDoc(col,firestoreProductPayload(item));
      }
    }
    function migrateBrandLogo(){if(localStorage.getItem(LS_LOGO_VERSION)!==BRAND_LOGO_URL){config.logo=BRAND_LOGO_URL;localStorage.setItem(LS_LOGO_VERSION,BRAND_LOGO_URL);persist()}}
    function saveCart(){localStorage.setItem(LS_CART,JSON.stringify(cart));localStorage.setItem(LS_FAV,JSON.stringify([...favorites]))}
    function saveReviews(){localStorage.setItem(LS_REVIEWS,JSON.stringify(reviews))}
    function saveSales(){
      const snapshot=(sales||[]).map(sale=>({
        ...sale,
        customer: sale?.customer ? { ...sale.customer } : null,
        items: Array.isArray(sale?.items) ? sale.items.map(item=>({ ...item })) : [],
        proof: sale?.proof ? { ...sale.proof } : null,
        errors: Array.isArray(sale?.errors) ? sale.errors.map(error=>({ ...error })) : []
      }));
      localStorage.setItem(LS_SALES,JSON.stringify(snapshot));
      localStorage.setItem(LS_SALES_AUDIT,JSON.stringify(snapshot.slice(0,200)));
    }
    function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
    function text(v){return String(v??"").trim()}
    function number(v,f=0){const raw=String(v??"").trim();if(!raw)return f;const n=Number(raw.replace(",",".").replace(/[^\d.-]/g,""));return Number.isFinite(n)?n:f}
    function money(n){return `$${number(n).toFixed(2)}`}
    function bs(n){return `${(number(n)*number(config.rate,1)).toLocaleString("es-VE",{minimumFractionDigits:2,maximumFractionDigits:2})} Bs.`}
    function sameId(a,b){return String(a??"").trim()===String(b??"").trim()}
    function colorValue(c){const map={dorado:"#c99b5b",oro:"#d7ad66",plateado:"#c8c8c8",plata:"#d7d7d7",beige:"#eadfce",marrón:"#5b3b2a",marron:"#5b3b2a",negro:"#14110e",perla:"#f7eedc",rosa:"#d9b7aa","oro rosa":"#d9a0a0",blanco:"#ffffff",rojo:"#b94a42",azul:"#4c76a8",verde:"#6b9270",morado:"#8d6b9d",amarillo:"#e4c75c",naranja:"#d88748",transparente:"#f5f1e8",acero:"#b8bcc2"};return /^#/.test(c)?c:(map[String(c).toLowerCase()]||"#c99b5b")}
    function splitList(v){if(Array.isArray(v))return v.map(text).filter(Boolean);return String(v||"").split(/\s*[|;,]\s*/).map(text).filter(Boolean)}
    function splitImageList(v){
      if(Array.isArray(v))return v.flatMap(splitImageList).filter(Boolean);
      const raw=String(v||"").trim();
      if(!raw)return[];
      return raw.split(/\s*(?:\||\n)\s*/).map(text).filter(Boolean);
    }
    function legacyNormalizeProduct(p={}){const images=splitImageList(p.images||p.image||p.fotos||p.foto||p.imagen||p.urlImagen).map(normalizeImageUrl).filter(Boolean);return {id:String(p.id||p.sku||cryptoRandom()),sku:text(p.sku||p.codigo||p.código||""),name:text(p.name||p.nombre||p.producto||"Producto sin nombre"),category:text(p.category||p.categoria||p.categoría||"General"),material:text(p.material||p.materiales||"Acero inoxidable"),price:number(p.price||p.precio||p.precioUSD||p["precio usd"],0),stock:number(p.stock||p.cantidad||p.inventario,0),tag:text(p.tag||p.etiqueta||"Nuevo"),rating:number(p.rating||p.calificacion,5),colors:splitList(p.colors||p.colores||p.variantes||"Dorado"),desc:text(p.desc||p.descripcion||p.descripción||p.detalles||"Pieza Sublime disponible para compra."),images:images.length?images:[FALLBACK_IMAGE],private:!!p.private,published:p.published!==false,importQuality:p.importQuality||"good"}}
    function cryptoRandom(){return "id-"+Math.random().toString(36).slice(2)+Date.now().toString(36)}
    function productImage(p,i=0){const imgs=splitImageList(p.images||p.imagenes||p.image).map(normalizeImageUrl).filter(Boolean);return imgs[i]||imgs[0]||FALLBACK_IMAGE}
    function normalizeImageUrl(raw){let url=text(raw);if(!url)return"";if(url.startsWith("data:image/"))return /^data:image\/(png|jpe?g|webp);base64,/i.test(url)?url:"";if(/^base64$/i.test(url)||/^[A-Za-z0-9+/=]{80,}$/.test(url))return"";if(/^[\w-]{25,}$/.test(url))return`https://drive.google.com/thumbnail?id=${url}&sz=w1600`;if(url.includes("drive.google.com")){const id=(url.match(/\/file\/d\/([^/]+)/)||url.match(/[?&]id=([^&]+)/)||[])[1];if(id)return`https://drive.google.com/thumbnail?id=${id}&sz=w1600`}if(url.includes("uc?id=")){const id=(url.match(/[?&]id=([^&]+)/)||[])[1];if(id)return`https://drive.google.com/thumbnail?id=${id}&sz=w1600`}if(url.startsWith("http://")||url.startsWith("https://"))return url;return""}
    async function sha256(s){const data=new TextEncoder().encode(s);const hash=await crypto.subtle.digest("SHA-256",data);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,"0")).join("")}
    function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("active");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("active"),2600)}
    function openLayer(id){$(id).classList.add("active");document.body.classList.add("locked");if(id==="cartDrawer"){const items=$("cartItems");if(items)requestAnimationFrame(()=>{items.scrollTop=items.scrollHeight})}}
    function closeLayer(id){$(id).classList.remove("active");document.body.classList.remove("locked")}
    function clearWholesaleAccess(){["sublime_wholesale_users_v1","sublime_wholesale_session_v1",LS_SELLER].forEach(key=>localStorage.removeItem(key))}
    function wholesaleThreshold(){return 12}
    function wholesaleQualified(){return qtyTotal()>=wholesaleThreshold()}
    function normalizeWholesaleMode(){if(!wholesaleQualified()){wholesaleMode=false;localStorage.removeItem(LS_WHOLESALE_MODE)}}
    function setWholesaleMode(v){wholesaleMode=!!v&&wholesaleQualified();wholesaleMode?localStorage.setItem(LS_WHOLESALE_MODE,"true"):localStorage.removeItem(LS_WHOLESALE_MODE)}
    function wholesaleActive(){normalizeWholesaleMode();return wholesaleMode&&wholesaleQualified()}
    function renderWholesaleStatus(){const status=$("wholesaleStatus");if(!status)return;status.textContent=`El modo mayorista se desbloquea desde ${wholesaleThreshold()} piezas en el carrito. Al llegar a esa cantidad, actívalo desde el carrito.`}
    function isSeller(){return wholesaleActive()}
    function updateSellerButton(){localStorage.removeItem(LS_SELLER)}
    function toggleSellerMode(){clearWholesaleAccess();setWholesaleMode(wholesaleQualified());renderProducts();toast(wholesaleActive()?"Modo mayorista activado":"Agrega 12 piezas para desbloquear el modo mayorista")}
    updateSellerButton();
    function isOwner(){return ownerSession===true}
    function setOwner(v){
      ownerSession=!!v;
      localStorage.removeItem(LS_OWNER);
      document.body.classList.toggle("owner",ownerSession);
      $("adminBody").classList.toggle("is-owner",ownerSession);
      $("adminBadge").classList.toggle("active",ownerSession);
        if(ownerSession){loadAdmin();updateOwnerStats()}else{switchAdminTab("general")}
    }
    function setDirty(v){$("dirtyState").textContent=v?"Cambios sin guardar":"Guardado";$("dirtyState").className=v?"dirty":"ok"}
    function applyClientTheme(){const dark=localStorage.getItem(LS_THEME)==="dark";document.body.classList.toggle("dark-theme",dark);const button=$("themeToggle");if(button){button.setAttribute("aria-label",dark?"Activar modo claro":"Activar modo oscuro");button.title=dark?"Cambiar a modo claro":"Cambiar a modo oscuro";button.innerHTML=`<i data-lucide="${dark?"sun":"moon"}"></i><span>${dark?"Claro":"Oscuro"}</span>`;button.onclick=toggleClientTheme;lucide.createIcons()}}
    function toggleClientTheme(){const dark=document.body.classList.toggle("dark-theme");localStorage.setItem(LS_THEME,dark?"dark":"light");applyClientTheme()}
    function applyTheme(){const r=document.documentElement,c=config.theme||DEFAULT.theme;Object.entries({black:"--black",brown:"--brown",beige:"--beige",gold:"--gold",cream:"--cream",sand:"--sand"}).forEach(([k,css])=>r.style.setProperty(css,c[k]||DEFAULT.theme[k]));document.body.classList.toggle("no-anim",config.animations===false);document.querySelector(".hero").style.setProperty("--hero-image",`url("${config.heroImage||DEFAULT_IMAGE}")`);applyClientTheme()}
    function paymentDetails(method=$("paymentMethod")?.value){const blocks={Zelle:config.zelleData,PayPal:config.paypalData,"Pago Móvil":config.bankData,Efectivo:"El pago en efectivo se coordina directamente por WhatsApp."};return text(blocks[method]||"Selecciona un método de pago para ver los datos.")}
    function updatePaymentBox(){const box=$("bankData");if(!box)return;box.textContent=paymentDetails();box.classList.add("active")}
    function renderAnnouncement(){const bar=$("topAnnouncement");if(!bar)return;bar.classList.toggle("hide",config.announcementEnabled===false);const parts=splitList(config.announcementText||DEFAULT.announcementText);bar.innerHTML=(parts.length?parts:splitList(DEFAULT.announcementText)).map((part,i)=>`<span>${i===1?`<strong>${esc(part)}</strong>`:esc(part)}</span>`).join("")}
    function updateChatVisibility(){const enabled=config.aiEnabled!==false;["chatLaunch","chatWidget"].forEach(id=>$(id)?.classList.toggle("hide",!enabled));if(!enabled)$("chatWidget")?.classList.remove("active")}
    function updateAmbassadorButton(){const button=$("ambassadorApplyButton");if(!button)return;const label=button.querySelector("span")||button;label.textContent=text(config.ambassadorButtonText)||DEFAULT.ambassadorButtonText;const url=text(config.ambassadorButtonUrl);button.href=url||"#contacto";button.target=/^https?:\/\//i.test(url)?"_blank":"";button.rel=/^https?:\/\//i.test(url)?"noopener":""}
    function hydrate(){document.querySelectorAll("[data-brand]").forEach(el=>el.textContent=config.brandName);document.querySelectorAll("[data-logo]").forEach(img=>{img.src=config.logo||logoSvg();img.alt=`Logo ${config.brandName}`});$("heroEyebrow").textContent=config.heroEyebrow;$("heroTitle").textContent=config.heroTitle;$("heroText").textContent=config.heroText;if($("heroCardImage"))$("heroCardImage").src=config.heroCardImage;if($("heroCardTitle"))$("heroCardTitle").textContent=config.heroCardTitle;if($("heroCardText"))$("heroCardText").textContent=config.heroCardText;renderAnnouncement();updateChatVisibility();updateAmbassadorButton();$("contactPhoneText").textContent=config.whatsapp;$("contactEmailText").textContent=config.email;$("waFloat").href=whatsappUrl(`Hola ${config.brandName}, quiero información sobre la tienda.`);updatePaymentBox();applyTheme()}
    function logoSvg(){return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' rx='38' fill='#eadfce'/><path d='M48 116 100 38l52 78-52 52Z' fill='#5b3b2a'/><path d='M70 116h60L100 64Z' fill='#c99b5b'/><text x='100' y='184' text-anchor='middle' font-family='Georgia' font-size='26' fill='#14110e'>Sublime</text></svg>`)}

    function categories(){return ["Todos",...new Set(products.map(p=>p.category).filter(Boolean))]}
    function materials(){return ["Todos",...new Set(products.map(p=>p.material).filter(Boolean))]}
    function filteredProducts(){const availableCategories=categories(),availableMaterials=materials();if(!availableCategories.includes(selectedCategory))selectedCategory="Todos";if(!availableMaterials.includes(selectedMaterial))selectedMaterial="Todos";const q=text($("searchInput").value).toLowerCase(),min=number($("minPrice").value,null),max=number($("maxPrice").value,null);let arr=products.filter(p=>p.published!==false);if(config.hideOutStock)arr=arr.filter(p=>p.stock>0);if(selectedCategory!=="Todos")arr=arr.filter(p=>p.category===selectedCategory);if(selectedMaterial!=="Todos")arr=arr.filter(p=>p.material===selectedMaterial);if(showFavs)arr=arr.filter(p=>favorites.has(String(p.id)));if(q)arr=arr.filter(p=>`${p.name} ${p.category} ${p.material} ${p.desc} ${p.colors.join(" ")}`.toLowerCase().includes(q));if(min!==null)arr=arr.filter(p=>p.price>=min);if(max!==null)arr=arr.filter(p=>p.price<=max);const sort=$("sortSelect").value;if(sort==="priceAsc")arr.sort((a,b)=>a.price-b.price);if(sort==="priceDesc")arr.sort((a,b)=>b.price-a.price);if(sort==="name")arr.sort((a,b)=>a.name.localeCompare(b.name,"es"));if(sort==="stock")arr.sort((a,b)=>b.stock-a.stock);return arr}
    function productRetailPrice(p){return number(p.price||p.precioUSD,0)}
    function productWholesalePrice(p){const imported=number(p.wholesale12,0);return imported>0?imported:productRetailPrice(p)*(1-number(config.wholesaleDiscount,0)/100)}
    function productPrice(p){return wholesaleActive()?productWholesalePrice(p):productRetailPrice(p)}
    function renderCategories(){const imgs=[DEFAULT_IMAGE,"https://images.unsplash.com/photo-1531995811006-35cb42e1a022?auto=format&fit=crop&w=900&q=84","https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=84","https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=84","https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=900&q=84"];const cats=categories().filter(c=>c!=="Todos");$("categoryCards").innerHTML=cats.map((c,i)=>`<button class="cat" data-category="${esc(c)}"><img src="${imgs[i%imgs.length]}" alt="${esc(c)}"><span><strong>${esc(c)}</strong><span>${products.filter(p=>p.category===c).length} piezas</span></span></button>`).join("")}
    function renderFilters(){const cat=$("categorySelect"),mat=$("materialSelect");if(cat){cat.innerHTML=categories().map(c=>`<option value="${esc(c)}" ${c===selectedCategory?"selected":""}>${esc(c)}</option>`).join("")}if(mat){mat.innerHTML=materials().map(m=>`<option value="${esc(m)}" ${m===selectedMaterial?"selected":""}>${esc(m)}</option>`).join("")}$("categoryFilters").innerHTML=categories().map(c=>`<button class="chip ${c===selectedCategory?"active":""}" data-category="${esc(c)}">${esc(c)}</button>`).join("");$("materialFilters").innerHTML=materials().map(m=>`<button class="chip ${m===selectedMaterial?"active":""}" data-material="${esc(m)}">${esc(m)}</button>`).join("");lucide.createIcons()}
    function legacyRenderProducts(){products=filterDeletedProducts(config.products.map(normalizeProduct));config.products=products;normalizeWholesaleMode();const arr=filteredProducts();$("modeNotice").textContent=isSeller()?`Modo mayorista activo: ${config.wholesaleDiscount}% de descuento aplicado.`:(wholesaleQualified()?`Ya tienes ${qtyTotal()} piezas. Activa el modo mayorista desde el carrito.`:`Modo detal activo. Agrega ${wholesaleThreshold()-qtyTotal()} pieza(s) más para desbloquear mayorista.`);renderFilters();$("productGrid").innerHTML=arr.length?arr.map(p=>{const out=p.stock<=0,price=productPrice(p);return `<article class="product"><div class="photo"><img src="${esc(productImage(p))}" alt="${esc(p.name)}" onerror="this.onerror=null;this.src='${esc(FALLBACK_IMAGE)}'"><span class="badge ${out?"sold":""}">${out?"Agotado":esc(p.tag||"Nuevo")}</span><button class="fav ${favorites.has(String(p.id))?"is-active":""}" data-favorite="${esc(p.id)}">♥</button><button class="quick" data-detail="${esc(p.id)}">Vista rápida</button></div><div class="info"><div class="meta"><span>ID ${esc(p.externalId||p.id)}</span><span>${esc(p.material)}</span></div><h3 class="title">${esc(p.name)}</h3><div class="swatches">${p.colors.map(c=>`<button class="swatch" title="${esc(c)}" style="background:${esc(colorValue(c))}"></button>`).join("")}</div><p class="small muted">${esc(p.desc)}</p><div class="price-line"><div><div class="price">${money(price)}</div>${config.showBs?`<div class="bs">${bs(price)}</div>`:""}</div><span class="stock ${out?"out":""}">${out?"Agotado":`Stock ${p.stock}`}</span></div><button class="add" data-add="${esc(p.id)}" ${out?"disabled":""}>Agregar al carrito</button><button class="btn btn-light download-photo" data-download="${esc(p.id)}"><i data-lucide="download"></i>Foto sin precio</button></div></article>`}).join(""):`<div class="empty">No hay productos para estos filtros.</div>`;renderCart();lucide.createIcons()}
    function qtyTotal(){return cart.reduce((a,r)=>a+r.qty,0)}
    function add(id){const p=products.find(x=>sameId(x.id,id));if(!p||number(p.stock,0)<=0)return toast("Producto agotado");const row=cart.find(x=>sameId(x.id,id));if(row&&row.qty>=number(p.stock,0))return toast(`Solo hay ${number(p.stock,0)} pieza(s) disponibles`);row?row.qty++:cart.push({id:String(id),qty:1});saveCart();renderProducts();document.body.classList.remove("cart-bump");void document.body.offsetWidth;document.body.classList.add("cart-bump");setTimeout(()=>document.body.classList.remove("cart-bump"),520);toast(`${p.name} agregado al carrito`)}
    function changeQty(id,d){const row=cart.find(x=>sameId(x.id,id));if(!row)return;const p=products.find(item=>sameId(item.id,id));if(d>0&&p&&row.qty>=p.stock)return toast(`Solo hay ${p.stock} pieza(s) disponibles`);row.qty+=d;if(row.qty<=0)cart=cart.filter(x=>!sameId(x.id,id));saveCart();renderProducts()}
    function cartLines(){return cart.map(r=>({row:r,p:products.find(p=>sameId(p.id,r.id))})).filter(x=>x.p)}
    function subtotal(){return cartLines().reduce((a,{row,p})=>a+productPrice(p)*row.qty,0)}
    function shipping(){if(!cart.length||subtotal()>=config.freeShipping)return 0;return number(config.shipNational)}
    function availableCoupons(){const list=Array.isArray(config.coupons)?config.coupons:[];if(!list.length&&config.couponCode)list.push({code:config.couponCode,percent:config.couponPercent,active:true});return list}
    function activeCoupon(){if(appliedCoupon&&String(appliedCoupon.code||appliedCoupon.codigo||"").trim().toUpperCase()===coupon.toUpperCase())return appliedCoupon;return availableCoupons().find(item=>item.active!==false&&String(item.code||"").trim().toUpperCase()===coupon.toUpperCase())}
    function discount(){const selected=activeCoupon();return selected?subtotal()*Math.min(100,Math.max(0,number(selected.percent)))/100:0}
    function renderCouponAdmin(){const host=$("couponAdminHost");if(!host)return;const list=availableCoupons();host.innerHTML=`<div class="admin-card coupon-admin-card"><h3>Cupones múltiples</h3><div class="grid2"><div class="field"><label>Código</label><input class="input" id="newCouponCode" placeholder="MAYO15"></div><div class="field"><label>Descuento %</label><input class="input" id="newCouponPercent" type="number" min="1" max="100" value="10"></div></div><button class="btn btn-primary" type="button" id="addCouponButton">Agregar cupón</button><div class="coupon-list">${list.map((item,index)=>`<div class="coupon-row"><strong>${esc(item.code)}</strong><span>${number(item.percent)}%</span><button class="btn btn-light" type="button" data-coupon-toggle="${index}">${item.active===false?"Activar":"Desactivar"}</button><button class="btn btn-danger" type="button" data-coupon-delete="${index}">Eliminar</button></div>`).join("")}</div></div>`;$("addCouponButton").onclick=()=>{const code=text($("newCouponCode").value).toUpperCase(),percent=Math.min(100,Math.max(1,number($("newCouponPercent").value)));if(!code)return toast("Escribe un código");config.coupons=availableCoupons();if(config.coupons.some(item=>String(item.code).toUpperCase()===code))return toast("Ese cupón ya existe");config.coupons.push({code,percent,active:true});persist();renderCouponAdmin();toast("Cupón agregado")};host.querySelectorAll("[data-coupon-toggle]").forEach(button=>button.onclick=()=>{config.coupons=availableCoupons();const item=config.coupons[Number(button.dataset.couponToggle)];if(item){item.active=item.active===false;persist();renderCouponAdmin()}});host.querySelectorAll("[data-coupon-delete]").forEach(button=>button.onclick=()=>{config.coupons=availableCoupons();config.coupons.splice(Number(button.dataset.couponDelete),1);persist();renderCouponAdmin();toast("Cupón eliminado")})}
    function renderWholesaleAdmin(){const host=$("wholesaleAdminHost");if(!host)return;host.innerHTML=`<div class="admin-card wholesale-admin-card"><h3>Mayorista por botón</h3><p class="small muted">El login para mayoristas queda deshabilitado. El botón se desbloquea cuando el carrito llega a 12 piezas o más.</p></div>`}
    function total(){return Math.max(0,subtotal()+shipping()-discount())}
    function renderWholesaleCartAction(){const el=$("wholesaleCartAction");if(!el)return;normalizeWholesaleMode();const qty=qtyTotal(),threshold=wholesaleThreshold(),missing=Math.max(0,threshold-qty);if(!cart.length){el.innerHTML="";return}if(wholesaleActive()){el.innerHTML=`<div class="wholesale-cart-action active"><div><strong>Modo Mayorista activo</strong><span>${qty} piezas en el carrito. Precio especial aplicado.</span></div><button class="btn btn-light" type="button" id="deactivateWholesaleBtn">Volver a detal</button></div>`;return}el.innerHTML=`<div class="wholesale-cart-action ${qty>=threshold?"unlocked":"locked"}"><div><strong>${qty>=threshold?"Mayorista desbloqueado":"Mayorista bloqueado"}</strong><span>${qty>=threshold?"Ya puedes activar precio mayorista para este pedido.":`Agrega ${missing} pieza(s) más para desbloquearlo.`}</span></div><button class="btn btn-gold" type="button" id="activateWholesaleBtn" ${qty>=threshold?"":"disabled"}>Activar modo Mayorista</button></div>`}
    function renderCart(){const lines=cartLines();normalizeWholesaleMode();$("cartCount").textContent=qtyTotal();$("favCount").textContent=favorites.size;$("cartItems").innerHTML=lines.length?lines.map(({row,p})=>`<div class="cart-item"><img src="${esc(productImage(p))}" alt="${esc(p.name)}"><div><h3>${esc(p.name)}</h3><div class="small muted">ID ${esc(p.externalId||p.id)} · ${money(productPrice(p))} · ${esc(p.category)}</div><div class="qty"><button data-qty-minus="${esc(row.id)}">-</button><strong>${row.qty}</strong><button data-qty-plus="${esc(row.id)}">+</button></div></div><button class="remove" data-remove="${esc(row.id)}">Quitar</button></div>`).join(""):`<div class="empty">Tu carrito está vacío.</div>`;$("freebar").style.width=Math.min(100,subtotal()/config.freeShipping*100)+"%";$("freeText").textContent=subtotal()>=config.freeShipping?"Envío gratis aplicado.":`Faltan ${money(config.freeShipping-subtotal())} para envío gratis.`;renderWholesaleCartAction();const selected=activeCoupon(),couponNote=selected?`<div class="cart-row coupon-applied"><span>Cupón ${esc(selected.code||selected.codigo)}</span><strong>${number(selected.percent||selected.descuentoPorcentaje)}%</strong></div>`:"";const html=`<div class="cart-row"><span>Subtotal</span><strong>${money(subtotal())}</strong></div>${couponNote}<div class="cart-row"><span>Descuento</span><strong>-${money(discount())}</strong></div><div class="cart-row"><span>Envío</span><strong>${money(shipping())}</strong></div><div class="cart-row total"><span>Total</span><strong>${money(total())}</strong></div>${config.showBs?`<div class="cart-row receipt-bs"><span>Monto en Bs:</span><strong>${bs(total())}</strong></div>`:""}`;$("cartSummary").innerHTML=html;$("checkoutSummary").innerHTML=html+lines.map(({row,p})=>`<div class="summary-row"><span>ID ${esc(p.externalId||p.id)} / ${esc(p.name)} x${row.qty}</span><strong>${money(productPrice(p)*row.qty)}</strong></div>`).join("")}
    function updateDeliveryFields(){const isMrw=$("deliveryType")?.value==="MRW";$("mrwAddressWrap")?.classList.toggle("active",isMrw)}
    function openCheckout(){if(!cart.length)return toast("Agrega productos al carrito");renderCart();if($("checkoutCouponInput"))$("checkoutCouponInput").value=coupon;updatePaymentBox();updateDeliveryFields();openLayer("checkoutModal")}
    function couponLine(){const selected=activeCoupon();if(selected){const code=selected.code||selected.codigo;return selected.source==="embajador"?`${code} / Embajadora: ${selected.nombreEmbajador||"Sin nombre"}`:code}return coupon?coupon:"Sin cupón"}
    function couponOrderBlock(){const selected=activeCoupon();if(!selected)return `Cupon: ${coupon||"Sin cupón"}`;const code=selected.code||selected.codigo||coupon;return selected.source==="embajador"?`Cupon: ${code}\nEmbajadora: ${selected.nombreEmbajador||"Sin nombre"}`:`Cupon: ${code}`}
    function buildOrderText(){const location=text($("customerMap")?.value),address=text($("customerCity")?.value),mrw=text($("mrwAddress")?.value),delivery=$("deliveryType").value,deliveryText=delivery==="MRW"&&mrw?`${delivery} (${mrw})`:delivery;return `Hola ${config.brandName}, quiero confirmar este pedido:\n\n${cartLines().map(({row,p})=>`- ID ${p.externalId||p.id}/ ${p.name} x${row.qty}: ${money(productPrice(p)*row.qty)}`).join("\n")}\n\n${couponOrderBlock()}\nDescuento: ${money(discount())}\n\nTotal: ${money(total())}${config.showBs?` / ${bs(total())}`:""}\n\nCliente: ${$("customerName").value}\nWhatsApp: ${$("customerPhone").value}\nDireccion : ${address}${location?` (${location})`:""}\nEntrega: ${deliveryText}\nPago: ${$("paymentMethod").value}\nReferencia de pago: ${$("paymentReference")?.value||""}\nO foto del comprobante${$("paymentProof")?.files?.[0]?`: cargada en la página`:""}\nNota: ${$("orderNote").value||"Sin nota"}`;}
    async function proofMeta(){const file=$("paymentProof")?.files?.[0];if(!file)return null;return {name:file.name,type:file.type,size:file.size,attached:true}}
    async function syncSaleToSheets(sale){
      const endpoint=text(config.googleSheetsWebhook);
      if(!endpoint){sale.webhookStatus="not-configured";saveSales();return false}
      try{
        const controller=new AbortController();
        const timeout=setTimeout(()=>controller.abort(),12000);
        const res=await fetch(endpoint,{method:"POST",mode:"cors",cache:"no-store",signal:controller.signal,headers:{"Content-Type":"application/json"},body:JSON.stringify({...sale,store:config.brandName})});
        clearTimeout(timeout);
        if(!res.ok){throw new Error(`HTTP ${res.status}`)}
        sale.webhookStatus="sent";
        sale.syncedAt=new Date().toISOString();
        console.info("Venta sincronizada con Google Sheets",sale.id);
        saveSales();
        return true;
      }catch(error){
        sale.webhookStatus="failed";
        sale.lastError=String(error?.message||error||"Error desconocido");
        sale.errors=(Array.isArray(sale.errors)?sale.errors:[]).concat([{at:new Date().toISOString(),message:sale.lastError}]);
        console.warn("No se pudo sincronizar la venta con Google Sheets",error);
        saveSales();
        return false;
      }
    }
    function syncInventoryProductStock(product, qtySold){
      const nextStock=Math.max(0,number(product.stock,0)-qtySold);
      const nextSold=Math.max(0,number(product.sold,0)+qtySold);
      return productoConAliases({
        ...product,
        stock:nextStock,
        sold:nextSold,
        tag:nextStock<=0?"Agotado":(product.tag&&product.tag!="Agotado"?product.tag:"Nuevo")
      });
    }
    async function confirmInventorySale(){
      const lines=cartLines();
      lines.forEach(({row,p})=>{
        const idx=products.findIndex(item=>sameId(item.id,p.id));
        if(idx>=0){
          const updated=syncInventoryProductStock(products[idx],row.qty);
          products[idx]=updated;
        }
      });
      config.products=products;
      persist();
      await Promise.allSettled(lines.map(({p})=>{
        const updated=products.find(item=>sameId(item.id,p.id));
        return updated?updateProductInFirestore(updated):Promise.resolve();
      }));
      renderProducts();
    }
    async function confirmOrder(){
      if(orderSubmitting)return toast("Tu pedido ya se está procesando");
      if(!cart.length)return toast("Carrito vacío");
      if(cartLines().some(({row,p})=>row.qty>number(p.stock)))return toast("Revisa el stock: una pieza cambió de disponibilidad");
      orderSubmitting=true;
      const submitButton=$("checkoutForm")?.querySelector('button[type="submit"]');
      if(submitButton)submitButton.disabled=true;
      try{
        const sale={id:"SALE-"+Date.now(),date:new Date().toISOString(),webhookStatus:"pending",items:cartLines().map(({row,p})=>({id:p.externalId||p.id,sku:p.sku,name:p.name,qty:row.qty,unit:productPrice(p),line:productPrice(p)*row.qty})),coupon:couponLine(),discount:discount(),total:total(),bs:bs(total()),customer:{name:$("customerName").value,whatsapp:$("customerPhone").value,address:$("customerCity").value,map:$("customerMap")?.value||""},delivery:$("deliveryType").value,mrwAddress:$("mrwAddress")?.value||"",payment:$("paymentMethod").value,paymentReference:$("paymentReference")?.value||"",proof:await proofMeta(),note:$("orderNote").value||""};
        sales.unshift(sale);
        saveSales();
        const sheetSent=await syncSaleToSheets(sale);
        await registerCouponUse(sale);
        const message=buildOrderText();
        await confirmInventorySale();
        cart=[];
        saveCart();
        renderCart();
        renderSales();
        $("successBox").classList.add("active");
        window.open(whatsappUrl(message),"_blank","noopener");
        toast(sheetSent?"Pedido confirmado y stock actualizado":"Pedido guardado localmente. Revisa el webhook de Google Sheets.");
      }catch(error){
        console.error("No se pudo confirmar el pedido",error);
        toast("No pude confirmar el pedido. Revisa tus datos e inténtalo de nuevo.");
      }finally{
        orderSubmitting=false;
        if(submitButton)submitButton.disabled=false;
      }
    }
    function whatsappUrl(msg){const phone=String(config.whatsapp||"").replace(/[^\d]/g,"");return`https://wa.me/${phone||"580000000000"}?text=${encodeURIComponent(msg)}`}
    async function invoice(){
      if(!cart.length)return toast("Carrito vacío");
      try{
        const {jsPDF}=window.jspdf||{};
        if(!jsPDF)return toast("No cargó jsPDF");
        const doc=new jsPDF({unit:"mm",format:"a4"});
        const pageW=210,pageH=297,margin=15;
        const brand=config.brandName||"Sublime";
        const invoiceNo="SUB-"+new Date().getFullYear()+"-"+String(Date.now()).slice(-6);
        const orderNo="PED-"+String(Date.now()).slice(-7);
        const fecha=new Date().toLocaleDateString("es-VE",{day:"2-digit",month:"2-digit",year:"numeric"});
        const cliente=text($("customerName")?.value)||"Cliente Sublime";
        const telefono=text($("customerPhone")?.value)||"No indicado";
        const ciudad=text($("customerCity")?.value)||"No indicada";
        const location=text($("customerMap")?.value);
        const entrega=text($("deliveryType")?.value)||"Por coordinar";
        const pago=text($("paymentMethod")?.value)||"Por coordinar";
        const nota=text($("orderNote")?.value)||"Sin nota";
        const brown=[78,48,31],gold=[201,155,91],cream=[255,250,242],muted=[118,106,96],red=[169,64,45],black=[22,17,14];
        const usdSubtotal=subtotal(),usdDiscount=discount(),usdShipping=shipping(),usdTotal=total();
        const vesTotal=usdTotal*number(config.rate);
        const fmtUsd=n=>"$"+number(n).toFixed(2);
        const fmtVes=n=>number(n).toLocaleString("es-VE",{minimumFractionDigits:2,maximumFractionDigits:2})+" Bs.";
        const safe=t=>String(t||"").replace(/\s+/g," ").trim();
        async function imageToData(src){
          if(!src)return null;
          try{
            if(/^data:image\//.test(src))return src;
            const img=new Image();
            img.crossOrigin="anonymous";
            const loaded=new Promise((resolve,reject)=>{img.onload=()=>resolve();img.onerror=reject;setTimeout(()=>reject(new Error("timeout")),3500)});
            img.src=src;
            await loaded;
            const canvas=document.createElement("canvas");
            canvas.width=img.naturalWidth||480;canvas.height=img.naturalHeight||480;
            canvas.getContext("2d").drawImage(img,0,0);
            return canvas.toDataURL("image/png",.92);
          }catch{return null}
        }
        function setFont(style="normal",size=10,color=black){doc.setFont("helvetica",style);doc.setFontSize(size);doc.setTextColor(...color)}
        function moneyLine(label,value,y,strong=false){setFont(strong?"bold":"normal",strong?12:10,strong?brown:black);doc.text(label,128,y);doc.text(value,190,y,{align:"right"})}
        doc.setFillColor(...cream);doc.rect(0,0,pageW,pageH,"F");
        doc.setFillColor(255,255,255);doc.roundedRect(9,8,192,270,4,4,"F");
        doc.setDrawColor(...gold);doc.setLineWidth(.55);doc.line(margin,93,pageW-margin,93);
        setFont("bold",28,brown);doc.text("RECIBO DE COMPRA",margin,28);
        setFont("normal",10,black);doc.text(brand,margin,39);doc.text("Tienda online de joyería",margin,45);doc.text("WhatsApp: "+(safe(config.whatsapp)||"Por configurar"),margin,51);doc.text("Correo: "+(safe(config.email)||"ventas@sublime.com"),margin,57);
        const logo=await imageToData(config.logo||$("brandLogo")?.src||$("footerLogo")?.src);
        if(logo){doc.addImage(logo,"PNG",164,14,26,26)}else{doc.setFillColor(...gold);doc.circle(177,27,14,"F");setFont("bold",12,[255,255,255]);doc.text("SUB",177,29,{align:"center"})}
        setFont("bold",11,brown);doc.text("CLIENTE",margin,77);doc.text("ENTREGA",73,77);doc.text("N° DE RECIBO",128,77);
        setFont("normal",9,black);doc.text(cliente,margin,84);doc.text("WhatsApp: "+telefono,margin,89);doc.text(ciudad,margin,94);
        doc.text(entrega,73,84);doc.text(location?"Pin: "+location:"Pin: no indicado",73,89);
        setFont("normal",9,black);doc.text(invoiceNo,190,77,{align:"right"});setFont("bold",11,brown);doc.text("FECHA",128,84);setFont("normal",9,black);doc.text(fecha,190,84,{align:"right"});setFont("bold",11,brown);doc.text("N° DE PEDIDO",128,91);setFont("normal",9,black);doc.text(orderNo,190,91,{align:"right"});
        setFont("bold",9,brown);doc.text("ID",19,103);doc.text("CANT.",34,103);doc.text("DESCRIPCIÓN",56,103);doc.text("PRECIO UNITARIO",139,103,{align:"right"});doc.text("IMPORTE",190,103,{align:"right"});
        doc.setDrawColor(...red);doc.line(margin,106,pageW-margin,106);
        let y=115;
        setFont("normal",9,black);
        cartLines().forEach(({row,p})=>{
          const name=safe(p.name||"Producto Sublime");
          const details=[safe(p.category),safe(p.material),safe((p.colors||[]).join(", "))].filter(Boolean).join(" · ");
          const desc=details?name+" — "+details:name;
          const lines=doc.splitTextToSize(desc,82);
          if(y+lines.length*5>205){doc.addPage();doc.setFillColor(...cream);doc.rect(0,0,pageW,pageH,"F");y=24}
          doc.text(safe(p.externalId||p.id).slice(0,10),19,y);
          doc.text(String(row.qty),38,y,{align:"center"});
          doc.text(lines,56,y);
          doc.text(fmtUsd(productPrice(p)),139,y,{align:"right"});
          doc.text(fmtUsd(productPrice(p)*row.qty),190,y,{align:"right"});
          y+=Math.max(9,lines.length*5+4);
        });
        y=Math.max(y+5,148);
        doc.setDrawColor(232,218,199);doc.line(116,y-6,190,y-6);
        moneyLine("Subtotal",fmtUsd(usdSubtotal),y);y+=8;
        moneyLine("Descuento","-"+fmtUsd(usdDiscount),y);y+=8;
        moneyLine("Envío",fmtUsd(usdShipping),y);y+=9;
        setFont("bold",14,brown);doc.text("TOTAL",128,y);doc.text(fmtUsd(usdTotal),190,y,{align:"right"});
        setFont("bold",14,brown);doc.text(fmtVes(vesTotal),190,y+8,{align:"right"});
        setFont("normal",8,muted);doc.text("Tasa: "+number(config.rate).toFixed(2)+" Bs/USD",190,y+15,{align:"right"});
        const summaryY=Math.min(Math.max(y+12,190),220);
        doc.setFillColor(...cream);doc.roundedRect(22,summaryY,166,32,4,4,"F");
        setFont("bold",10,brown);doc.text("RESUMEN DEL PEDIDO",30,summaryY+10);
        setFont("normal",9,black);doc.text("Artículos",30,summaryY+18);doc.text(String(qtyTotal()),178,summaryY+18,{align:"right"});
        doc.setDrawColor(...gold);doc.setLineWidth(.4);doc.line(30,summaryY+22,178,summaryY+22);
        setFont("normal",8,muted);doc.text("Método seleccionado: "+pago,30,summaryY+29);
        doc.setDrawColor(...brown);doc.line(106,234,106,269);
        setFont("italic",26,brown);doc.text("Gracias",64,251,{align:"center"});
        setFont("normal",9,muted);doc.text("por elegir",64,258,{align:"center"});
        setFont("bold",16,red);doc.text(brand,64,266,{align:"center"});
        setFont("bold",10,brown);doc.text("NOTA DEL CLIENTE",116,243);
        setFont("normal",8.5,black);doc.text(doc.splitTextToSize(nota,72),116,251);
        doc.setFillColor(...cream);doc.setDrawColor(...gold);doc.setLineWidth(.5);doc.roundedRect(22,270,166,10,3,3,"FD");
        setFont("bold",8.5,brown);doc.text("Mujer virtuosa, tu valor sobrepasa por mucho al valor de las joyas.",pageW/2,276,{align:"center"});
        doc.setFillColor(...brown);doc.rect(0,285,pageW,12,"F");
        setFont("normal",8,[255,255,255]);doc.text(brand+" · Documento generado desde la tienda online",pageW/2,292,{align:"center"});
        doc.save("recibo-"+brand.toLowerCase().replace(/\s+/g,"-")+"-"+invoiceNo+".pdf");
      }catch(error){console.error("Recibo PDF",error);toast("No pude generar el recibo PDF")}
    }
    function detail(id){const p=products.find(x=>sameId(x.id,id));if(!p)return;const imgs=p.images||[productImage(p)];$("detailBody").innerHTML=`<div><img class="detail-img" id="detailMainImg" src="${esc(productImage(p))}" alt="${esc(p.name)}"><div class="photo-list" style="margin-top:10px">${imgs.map((im,i)=>`<button class="btn btn-light" data-detail-img="${esc(normalizeImageUrl(im))}">${i+1}</button>`).join("")}</div></div><div class="detail-panel"><p class="eyebrow">${esc(p.category)}</p><h3>${esc(p.name)}</h3><p class="muted">${esc(p.desc)}</p><p><strong>ID:</strong> ${esc(p.externalId||p.id)}</p><p><strong>SKU:</strong> ${esc(p.sku||"Sin SKU")}</p><p><strong>Material:</strong> ${esc(p.material)}</p><p><strong>Colores:</strong> ${esc(p.colors.join(", "))}</p><p><strong>Stock:</strong> ${number(p.stock)}</p><p><strong>Precio:</strong> ${money(productPrice(p))} ${config.showBs?`/ ${bs(productPrice(p))}`:""}</p><button class="btn btn-primary" data-add="${esc(p.id)}">Agregar al carrito</button><button class="btn btn-light" data-download="${esc(p.id)}">Descargar foto sin precio</button></div>`;openLayer("detailModal");lucide.createIcons()}
    function downloadPhoto(id){const p=products.find(x=>sameId(x.id,id));if(!p)return;const a=document.createElement("a");a.href=productImage(p);a.download=`${p.name.replace(/[^\p{L}\p{N}]+/gu,"-")}.jpg`;a.target="_blank";a.click()}

    function loadAdmin(){const set=(id,v)=>{if($(id))$(id).value=v??""};const dbApi=databaseApiConfig();set("adminBrand",config.brandName);set("adminWhatsapp",config.whatsapp);set("adminEmail",config.email);set("adminLogo",config.logo);set("adminHeroEyebrow",config.heroEyebrow);set("adminHeroTitle",config.heroTitle);set("adminHeroText",config.heroText);set("adminHeroImage",config.heroImage);set("adminAnnouncementText",config.announcementText||DEFAULT.announcementText);set("adminAmbassadorButtonText",config.ambassadorButtonText||DEFAULT.ambassadorButtonText);set("adminAmbassadorButtonUrl",config.ambassadorButtonUrl||"");set("adminRate",config.rate);set("adminRateApi",config.rateApi);set("adminRateField",config.rateField);set("adminAiEndpoint",config.aiEndpoint);set("adminAiModel",config.aiModel);set("adminAiSystemPrompt",config.aiSystemPrompt);set("adminShipCaracas",config.shipCaracas);set("adminShipNational",config.shipNational);set("adminFreeShipping",config.freeShipping);set("adminCouponCode",config.couponCode);set("adminCouponPercent",config.couponPercent);set("adminWholesaleDiscount",config.wholesaleDiscount);set("adminBankData",config.bankData);set("adminZelleData",config.zelleData);set("adminPaypalData",config.paypalData);set("adminGoogleSheetsWebhook",config.googleSheetsWebhook||"");set("adminDriveUrl",config.driveCatalogUrl);set("adminDriveTarget",config.driveTarget==="bank"?"append":config.driveTarget);set("adminFirebaseConfig",getFirebaseConnectionText());set("adminDatabaseApiUrl",dbApi.endpoint);set("adminDatabaseApiKey",dbApi.apiKey);set("adminDatabaseCollection",dbApi.collection||FIRESTORE_COLLECTION);set("adminDatabaseRefreshSeconds",dbApi.refreshSeconds||DEFAULT_DATABASE_API_REFRESH_SECONDS);if($("adminDatabaseMode"))$("adminDatabaseMode").value=dbApi.mode||"sdk";$("adminRateAuto").checked=config.rateAuto!==false;$("adminShowBs").checked=config.showBs!==false;$("adminHideOutStock").checked=!!config.hideOutStock;$("adminAnimations").checked=config.animations!==false;$("adminDriveAuto").checked=!!config.driveAutoSync;$("adminAiEnabled").checked=!!config.aiEnabled;if($("adminAnnouncementEnabled"))$("adminAnnouncementEnabled").checked=config.announcementEnabled!==false;$("adminAiProvider").value=config.aiProvider||"openai-compatible";["Black","Brown","Beige","Gold","Cream","Sand"].forEach(k=>set("theme"+k,config.theme[k.toLowerCase()]));renderAdminProducts();renderPrivateBank();renderAdminReviews();renderSales();updateOwnerStats();setDirty(false)}
    function collectAdmin(){const val=id=>$(id)?.value??"";config.brandName=val("adminBrand");config.whatsapp=val("adminWhatsapp");config.email=val("adminEmail");config.logo=val("adminLogo");config.heroEyebrow=val("adminHeroEyebrow");config.heroTitle=val("adminHeroTitle");config.heroText=val("adminHeroText");config.heroImage=val("adminHeroImage");config.announcementEnabled=$("adminAnnouncementEnabled")?$("adminAnnouncementEnabled").checked:true;config.announcementText=val("adminAnnouncementText")||DEFAULT.announcementText;config.ambassadorButtonText=val("adminAmbassadorButtonText")||DEFAULT.ambassadorButtonText;config.ambassadorButtonUrl=val("adminAmbassadorButtonUrl");config.rate=number(val("adminRate"),config.rate);config.rateApi=val("adminRateApi");config.rateField=val("adminRateField")||"promedio";config.aiEnabled=$("adminAiEnabled").checked;config.aiProvider=$("adminAiProvider").value;config.aiEndpoint=val("adminAiEndpoint");config.aiModel=val("adminAiModel")||"gpt-4o-mini";config.aiApiKey="";config.aiSystemPrompt=val("adminAiSystemPrompt")||config.aiSystemPrompt;config.shipCaracas=number(val("adminShipCaracas"));config.shipNational=number(val("adminShipNational"));config.freeShipping=number(val("adminFreeShipping"));config.couponCode=val("adminCouponCode");config.couponPercent=number(val("adminCouponPercent"));config.wholesaleDiscount=number(val("adminWholesaleDiscount"));config.bankData=val("adminBankData");config.zelleData=val("adminZelleData");config.paypalData=val("adminPaypalData");config.googleSheetsWebhook=val("adminGoogleSheetsWebhook");config.driveCatalogUrl=val("adminDriveUrl");config.driveTarget=val("adminDriveTarget")||"append";if(config.driveTarget==="bank")config.driveTarget="append";config.rateAuto=$("adminRateAuto").checked;config.showBs=$("adminShowBs").checked;config.hideOutStock=$("adminHideOutStock").checked;config.animations=$("adminAnimations").checked;config.driveAutoSync=$("adminDriveAuto").checked;["black","brown","beige","gold","cream","sand"].forEach(k=>config.theme[k]=$("theme"+k[0].toUpperCase()+k.slice(1)).value);syncAdminProducts()}
    function legacyRenderAdminProducts(){const el=$("adminProducts");products=filterDeletedProducts(products.map(normalizeProduct));config.products=products;el.innerHTML=products.map(p=>{p=normalizeProduct(p);return `<article class="admin-product" data-admin-product data-admin-product-id="${esc(p.id)}"><div class="product-editor-title"><strong>${esc(p.name)}</strong><button type="button" class="btn btn-danger admin-delete-btn" data-admin-delete="${esc(p.id)}" aria-label="Eliminar ${esc(p.name)}"><i data-lucide="trash-2"></i>Eliminar</button></div><div class="grid2"><div class="field"><label>Nombre *</label><input class="input" data-p-field="name" value="${esc(p.name)}" required></div><div class="field"><label>SKU</label><input class="input" data-p-field="sku" value="${esc(p.sku)}"></div><div class="field"><label>Precio USD *</label><input class="input" type="number" step="0.01" data-p-field="price" value="${p.price}"></div><div class="field"><label>Precio Bs automático</label><input class="input" value="${bs(p.price)}" disabled></div><div class="field"><label>Stock *</label><input class="input" type="number" data-p-field="stock" value="${p.stock}"></div><div class="field"><label>Categoría *</label><input class="input" data-p-field="category" value="${esc(p.category)}"></div><div class="field"><label>Colores/Variantes *</label><input class="input" data-p-field="colors" value="${esc(p.colors.join(" | "))}"></div><div class="field"><label>Materiales *</label><input class="input" data-p-field="material" value="${esc(p.material)}"></div><div class="field full"><label>Descripción detallada *</label><textarea data-p-field="desc">${esc(p.desc)}</textarea></div><div class="field full"><label>Múltiples fotos URLs/Base64 *</label><textarea data-p-field="images">${esc((p.images||[]).join(" | "))}</textarea><label class="file-btn"><i data-lucide="image-up"></i>Subir fotos<input type="file" multiple accept="image/png,image/jpeg,image/webp" data-product-images></label><div class="photo-list">${(p.images||[]).slice(0,8).map(src=>`<img src="${esc(src)}" onerror="this.src='${FALLBACK_IMAGE}'">`).join("")}</div></div></div></article>`}).join("");bindAdminDeleteButtons();lucide.createIcons()}
    function legacySyncAdminProducts(){const byId=new Map(products.map(p=>[String(p.id),p]));products=filterDeletedProducts([...document.querySelectorAll("[data-admin-product-id]")].map(card=>{const id=String(card.dataset.adminProductId||cryptoRandom());const current=byId.get(id)||{id};const get=f=>card.querySelector(`[data-p-field="${f}"]`)?.value;return normalizeProduct({...current,id,name:get("name"),sku:get("sku"),price:get("price"),stock:get("stock"),category:get("category"),colors:get("colors"),material:get("material"),desc:get("desc"),images:get("images"),published:true})}));config.products=products}
    function legacyAutosaveProducts(){if(legacyAutosaveProducts.lock)return;clearTimeout(legacyAutosaveProducts.t);legacyAutosaveProducts.t=setTimeout(()=>{if(legacyAutosaveProducts.lock)return;syncAdminProducts();persist();renderCategories();renderProducts();renderAdminProducts();updateOwnerStats();setDirty(false)},550)}
    function legacyAddAdminProduct(){products.unshift(normalizeProduct({id:cryptoRandom(),name:"Nueva pieza",category:"Collares",material:"Acero inoxidable",price:10,stock:1,colors:"Dorado",desc:"Descripción detallada de la pieza.",images:FALLBACK_IMAGE,published:true}));config.products=products;persist();renderCategories();renderAdminProducts();renderProducts();setDirty(false);toast("Producto creado")}
    function readImageFile(file){return new Promise((resolve,reject)=>{if(!/image\/(png|jpe?g|webp)/.test(file.type))return reject("Usa PNG, JPG o WEBP");if(file.size>2200000)return reject("Imagen muy pesada. Máximo 2.2 MB");const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
    function extractRateValue(data,field){
      const paths=[field,"promedio","rate","usd","USD","value","price","precio","data.usd","data.USD","rates.USD","rates.usd","dollar.usd","dolar.promedio"].filter(Boolean);
      for(const path of paths){let value=data;for(const part of String(path).split("."))value=value?.[part];value=number(value);if(value>0)return value}
      const seen=new Set();
      function scan(obj){
        if(!obj||typeof obj!=="object"||seen.has(obj))return 0;seen.add(obj);
        for(const [k,v] of Object.entries(obj)){
          const key=k.toLowerCase();
          if((key.includes("promedio")||key==="rate"||key==="usd"||key.includes("precio")||key.includes("value"))&&number(v)>0)return number(v);
          const nested=scan(v);if(nested>0)return nested;
        }
        return 0;
      }
      return scan(data);
    }
    async function updateRate(silent=false){
      if(isOwner())collectAdmin();
      const urls=[config.rateApi,...(config.rateApis||DEFAULT.rateApis)].map(text).filter(Boolean);
      const unique=[...new Set(urls)];
      $("rateStatus").textContent="Consultando tasa BCV...";
      for(const url of unique){
        try{
          const res=await fetch(url,{cache:"no-store",headers:{accept:"application/json"}});
          if(!res.ok)throw new Error(`HTTP ${res.status}`);
          const data=await res.json();
          const value=extractRateValue(data,config.rateField||"promedio");
          if(!value)throw new Error("Sin tasa válida");
          config.rate=value;
          config.rateApi=url;
          config.rateLastSync=new Date().toLocaleString("es-VE");
          config.rateLastSyncTs=Date.now();
          $("adminRate").value=value;
          $("adminRateApi").value=url;
          persist();hydrate();renderProducts();updateOwnerStats();
          $("rateStatus").textContent=`Tasa BCV al día: ${number(config.rate).toFixed(2)} Bs/USD · ${config.rateLastSync}`;
          if(!silent)toast("Tasa BCV actualizada");
          return value;
        }catch(e){console.warn("BCV API falló",url,e)}
      }
      $("rateStatus").textContent=`No pude actualizar BCV. Se mantiene la última tasa: ${number(config.rate).toFixed(2)} Bs/USD.`;
      if(!silent)toast("No pude actualizar BCV");
      return number(config.rate);
    }
    function scheduleRateSync(){
      const day=86400000;
      const syncIfDue=()=>{
        if(config.rateAuto===false)return;
        const last=Number(config.rateLastSyncTs||0);
        if(!last||Date.now()-last>=day)updateRate(true).catch(error=>console.warn("No se pudo sincronizar BCV",error));
      };
      setTimeout(syncIfDue,1200);
      setInterval(syncIfDue,3600000);
    }
    function updateOwnerStats(){if(!$("statPublic"))return;$("statPublic").textContent=products.length;if($("statPrivate"))$("statPrivate").textContent=config.privatePieces.length;$("statStock").textContent=products.reduce((a,p)=>a+number(p.stock),0);$("statRate").textContent=number(config.rate).toFixed(2);$("rateStatus").textContent=config.rateLastSync?`BCV actualizado: ${config.rateLastSync}`:`Tasa actual: ${bs(1)} por USD.`;if($("bankStatus"))$("bankStatus").textContent=`${selectedBank.size} seleccionada(s) · ${config.privatePieces.length} pieza(s) privadas.`}
    function switchAdminTab(name){document.querySelectorAll(".admin-tab").forEach(t=>t.classList.toggle("active",t.dataset.adminTab===name));document.querySelectorAll(".admin-section").forEach(s=>s.classList.toggle("active",s.id==="admin-"+name))}

    function parseCsv(textData){const rows=[];let row=[],cell="",q=false;for(let i=0;i<textData.length;i++){const c=textData[i],n=textData[i+1];if(c==='"'&&q&&n==='"'){cell+='"';i++;continue}if(c==='"'){q=!q;continue}if(c===","&&!q){row.push(cell);cell="";continue}if((c==="\n"||c==="\r")&&!q){if(c==="\r"&&n==="\n")i++;row.push(cell);if(row.some(x=>text(x)))rows.push(row);row=[];cell="";continue}cell+=c}row.push(cell);if(row.some(x=>text(x)))rows.push(row);return rows}
    function mapHeader(h){const k=text(h).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[\s_-]+/g," ");if(k==="lote")return"lote";if(["estatus","status","estado"].includes(k))return"status";if(["id","id producto","idproduct","producto id"].includes(k))return"externalId";if(["nombre","producto","pieza","titulo","name","nombre del producto"].includes(k))return"name";if(["sku","codigo","referencia","codigo producto"].includes(k))return"sku";if(["categoria","category","tipo","tipo de producto"].includes(k))return"category";if(["material","materiales"].includes(k))return"material";if(["publico","audiencia","target"].includes(k))return"audience";if(["estilo","style"].includes(k))return"style";if(["precio","detal","precio usd","usd","price","precio dolares","precio $","precio al detal"].includes(k))return"price";if(["al mayor","mayorista","precio al mayor","precio mayorista"].includes(k))return"wholesale12";if(["precio al costo","costo","cost price"].includes(k))return"costPrice";if(["12 a 49 piezas","de 12 a 49 piezas","precio 12 a 49","12 49"].includes(k))return"wholesale12";if(["50 a 100 piezas","de 50 a 100 piezas","precio 50 a 100","50 100"].includes(k))return"wholesale50";if(["100 piezas en adelante","de 100 piezas en adelante","precio 100 piezas","100 en adelante"].includes(k))return"wholesale100";if(["stock","cantidad","inventario","qty","existencia","stock total"].includes(k))return"stock";if(["descripcion","detalle","detalles","description","informacion","informacion detallada"].includes(k))return"desc";if(["imagen","foto","fotos","image","images","imagen del producto","url imagen","url foto","link foto","google drive"].includes(k))return"images";if(["colores","color","variantes","colors"].includes(k))return"colors";return k}
    function parseTextCatalog(raw){const src=String(raw||"").replace(/\ufeff/g,"").normalize("NFC");let rows=parseCsv(src);if(rows.length<2||rows[0].length<2)rows=src.split(/\n+/).map(line=>line.split(/\t| {2,}|;/));if(rows.length<2)return [];const headers=rows[0].map(mapHeader),known=new Set(["id","name","sku","price","costPrice","wholesale12","wholesale50","wholesale100","stock","category","material","audience","style","desc","images","colors","tag","rating","private","published","lote","status","externalId"]);return rows.slice(1).map((r,i)=>{const obj={id:"imp-"+Date.now()+"-"+i,extra:{}};headers.forEach((h,j)=>{const value=text(r[j]);if(!value)return;if(known.has(h))obj[h]=value;else obj.extra[h]=value});return normalizeProduct(obj)}).filter(p=>p.name&&p.name!=="Producto sin nombre")}
    async function parsePdf(file){if(!window.pdfjsLib)throw new Error("pdf.js no cargó");pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";const buf=await file.arrayBuffer();const pdf=await pdfjsLib.getDocument({data:buf}).promise;let allText="",thumb="";for(let p=1;p<=pdf.numPages;p++){const page=await pdf.getPage(p);const content=await page.getTextContent();const lines=new Map();content.items.forEach(item=>{const y=Math.round(item.transform[5]/4)*4;if(!lines.has(y))lines.set(y,[]);lines.get(y).push({x:item.transform[4],str:item.str})});[...lines.keys()].sort((a,b)=>b-a).forEach(y=>{allText+=lines.get(y).sort((a,b)=>a.x-b.x).map(i=>i.str).join("\t")+"\n"});if(!thumb){const viewport=page.getViewport({scale:.9});const canvas=document.createElement("canvas");canvas.width=viewport.width;canvas.height=viewport.height;await page.render({canvasContext:canvas.getContext("2d"),viewport}).promise;thumb=canvas.toDataURL("image/jpeg",.76)}}const parsed=parsePdfRows(allText);return parsed.map(p=>({...p,images:(p.images&&p.images[0]!==FALLBACK_IMAGE)?p.images:[thumb||FALLBACK_IMAGE],importQuality:p.price?"good":"review"}))}
    function parsePdfRows(raw){const lines=String(raw||"").split(/\r?\n/).map(text).filter(Boolean),items=[];let current=null;const price=/\$?\s*([\d.,]+)/g;for(const line of lines){const id=line.match(/^(\d{1,8})(?:\t|\s+|$)/);if(id&&/\d/.test(id[1])){if(current)items.push(current);current={externalId:id[1],name:"",extra:{}};continue}if(!current||/^(ID|IMAGEN|NOMBRE DEL PRODUCTO|DETAL|AL MAYOR)/i.test(line))continue;const values=[...line.matchAll(price)].map(m=>number(m[1]));if(values.length){current.price=values[0];if(values[1])current.wholesale12=values[1];continue}current.name+=(current.name?" ":"")+line.replace(/\t/g," ")}if(current)items.push(current);return items.map((item,i)=>normalizeProduct({...item,id:`pdf-${Date.now()}-${i}`,category:/pendient|arete|zarcillo/i.test(item.name)?"Zarcillos":/collar|cadena|colgante/i.test(item.name)?"Collares":/pulsera|brazalete|tobillera/i.test(item.name)?"Pulseras":"General",material:/acero|titanio/i.test(item.name)?"Acero inoxidable":/cobre/i.test(item.name)?"Cobre":"",stock:0}))}
    const parsePdfWithImages=async file=>{
      if(!window.pdfjsLib)throw new Error("pdf.js no cargó");
      pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise,items=[];
      for(let pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){
        const page=await pdf.getPage(pageNumber),content=await page.getTextContent(),lines=new Map();
        content.items.forEach(item=>{const y=Math.round(item.transform[5]/4)*4;if(!lines.has(y))lines.set(y,[]);lines.get(y).push({x:item.transform[4],str:item.str})});
        const ordered=[...lines.keys()].sort((a,b)=>b-a),rows=ordered.filter(y=>lines.get(y).some(item=>/^\d{1,8}$/.test(text(item.str))));
        let canvas=null,viewport=null;
        if(rows.length){viewport=page.getViewport({scale:1.5});canvas=document.createElement("canvas");canvas.width=viewport.width;canvas.height=viewport.height;await page.render({canvasContext:canvas.getContext("2d"),viewport}).promise}
        const pageText=ordered.map(y=>lines.get(y).sort((a,b)=>a.x-b.x).map(item=>item.str).join("\t")).join("\n"),parsed=parsePdfRows(pageText);
        parsed.forEach((product,index)=>{const y=rows[index],next=rows[index+1]||Math.max(0,y-170),top=Math.max(0,viewport.height-(y+12)*1.5),bottom=Math.min(viewport.height,viewport.height-(next-12)*1.5),crop=document.createElement("canvas");if(canvas&&bottom>top){crop.width=Math.max(1,Math.round(viewport.width*.22));crop.height=Math.max(1,Math.round(bottom-top));crop.getContext("2d").drawImage(canvas,Math.round(viewport.width*.17),Math.round(top),crop.width,crop.height,0,0,crop.width,crop.height);product.images=[crop.toDataURL("image/jpeg",.82)]}items.push(product)});
      }
      return items;
    };
    parsePdf=parsePdfWithImages;
    async function readCatalogFile(file){const ext=file.name.toLowerCase();if(ext.endsWith(".pdf")||file.type==="application/pdf")throw new Error("La carga PDF está deshabilitada por el momento. Usa CSV, TXT, JSON o Google Sheets.");const text=await file.text();if(ext.endsWith(".json")){const data=JSON.parse(text);return (Array.isArray(data)?data:data.products||data.catalogo||[]).map(normalizeProduct)}return parseTextCatalog(text)}
    function legacyPreviewImport(items){pendingCatalog=items.map(normalizeProduct);$("catalogImportPreview").innerHTML=pendingCatalog.length?pendingCatalog.map((p,i)=>`<article class="import-row"><img data-import-image-preview="${i}" src="${esc(productImage(p))}" onerror="this.onerror=null;this.src='${esc(FALLBACK_IMAGE)}'"><div><strong>${esc(p.name)}</strong><div class="small muted">${esc(p.category)} · ${esc(p.material)}</div><div class="small muted">${esc(p.desc)}</div><label class="file-btn import-image-button"><i data-lucide="image-up"></i>Cambiar imagen<input class="sr" type="file" accept="image/png,image/jpeg,image/webp" data-import-images="${i}"></label></div><label class="field"><span>Precio USD</span><input class="input" type="number" step="0.01" value="${p.price}" data-import-price="${i}"></label><label class="field"><span>Stock</span><input class="input" type="number" value="${p.stock}" data-import-stock="${i}"></label><span class="small ${p.importQuality==="review"?"dirty":"ok"}">${p.importQuality==="review"?"Revisar":"Listo"}</span></article>`).join(""):`<div class="empty">No se detectaron productos. Si es PDF escaneado, expórtalo desde Excel como PDF de texto o usa CSV/Google Sheets.</div>`;$("catalogImportStatus").textContent=`${pendingCatalog.length} producto(s) detectado(s).`;lucide.createIcons()}
    function legacySyncImportEdits(){document.querySelectorAll("[data-import-price]").forEach(i=>pendingCatalog[i.dataset.importPrice].price=number(i.value));document.querySelectorAll("[data-import-stock]").forEach(i=>pendingCatalog[i.dataset.importStock].stock=number(i.value));document.querySelectorAll("[data-import-extra]").forEach(i=>{try{pendingCatalog[i.dataset.importExtra].extra=JSON.parse(i.value||"{}")}catch{toast(`Revisa la información adicional del producto ${Number(i.dataset.importExtra)+1}`)}})}
    const renderImportPreview=legacyPreviewImport;
    legacyPreviewImport=function(items){
      renderImportPreview(items);
      pendingCatalog.forEach((p,i)=>{
        const row=document.querySelector(`[data-import-price="${i}"]`)?.closest(".import-row");
        if(!row)return;
        const editor=document.createElement("textarea");
        editor.className="input";
        editor.dataset.importExtra=i;
        editor.placeholder="Información adicional en JSON";
        editor.value=JSON.stringify(p.extra||{});
        row.querySelector("div")?.appendChild(editor);
      });
      document.querySelectorAll("[data-import-images]").forEach(input=>input.addEventListener("change",async event=>{const index=Number(event.target.dataset.importImages);if(!event.target.files[0])return;try{const foto=await readImageFile(event.target.files[0]);pendingCatalog[index].images=[foto];pendingCatalog[index].imagenes=[foto];const preview=document.querySelector(`[data-import-image-preview="${index}"]`);if(preview)preview.src=foto;event.target.value="";toast("Imagen del producto actualizada")}catch(error){toast(String(error))}}));
    };
    function legacyImportToBank(){if(!pendingCatalog.length)return toast("Primero carga catálogo");legacySyncImportEdits();config.privatePieces=[...pendingCatalog.map(p=>({...normalizeProduct(p),private:true,published:false,id:cryptoRandom()})),...config.privatePieces];pendingCatalog=[];$("catalogImportPreview").innerHTML="";persist();renderPrivateBank();updateOwnerStats();setDirty(false);switchAdminTab("banco");toast("Catálogo enviado al banco privado")}
    function legacyPublishImport(replace=false){if(!pendingCatalog.length)return toast("Primero carga catálogo");legacySyncImportEdits();const incoming=filterDeletedProducts(pendingCatalog.map(p=>({...normalizeProduct(p),private:false,published:true,id:cryptoRandom()})));products=replace?incoming:filterDeletedProducts([...incoming,...products]);config.products=products;persist();renderProducts();renderAdminProducts();updateOwnerStats();setDirty(false);toast(replace?"Tienda reemplazada":"Catálogo publicado")}
    function renderPrivateBank(){if(!$("pieceBank"))return;const q=text($("bankSearch")?.value).toLowerCase();const arr=config.privatePieces.filter(p=>!q||`${p.name} ${p.category} ${p.material} ${p.sku}`.toLowerCase().includes(q));$("pieceBank").innerHTML=arr.length?arr.map(p=>`<article class="piece-card ${selectedBank.has(String(p.id))?"selected":""}" data-bank-card="${esc(p.id)}"><img src="${esc(productImage(p))}" onerror="this.src='${FALLBACK_IMAGE}'"><div class="bank-editor"><strong>${esc(p.name)}</strong><div class="grid2"><label class="field">Nombre<input class="input" value="${esc(p.name)}" data-bank-field="nombre" data-bank-id="${esc(p.id)}"></label><label class="field">SKU<input class="input" value="${esc(p.sku)}" data-bank-field="sku" data-bank-id="${esc(p.id)}"></label><label class="field">Precio USD<input class="input" type="number" step="0.01" value="${p.price}" data-bank-field="precioUSD" data-bank-id="${esc(p.id)}"></label><label class="field">Stock<input class="input" type="number" min="0" value="${esc(p.stock)}" data-bank-field="stock" data-bank-id="${esc(p.id)}"></label><label class="field">Categoría<input class="input" value="${esc(p.category)}" data-bank-field="categoria" data-bank-id="${esc(p.id)}"></label><label class="field">Material<input class="input" value="${esc(p.material)}" data-bank-field="material" data-bank-id="${esc(p.id)}"></label><label class="field full">Colores / Variantes<input class="input" value="${esc(p.color)}" data-bank-field="color" data-bank-id="${esc(p.id)}"></label><label class="field full">Descripción<textarea data-bank-field="descripcion" data-bank-id="${esc(p.id)}">${esc(p.descripcion)}</textarea></label><label class="field full">Fotos URL / Base64<textarea data-bank-field="imagenes" data-bank-id="${esc(p.id)}">${esc((p.imagenes||[]).join(" | "))}</textarea><span class="file-btn"><i data-lucide="image-up"></i>Cambiar imagen<input type="file" accept="image/png,image/jpeg,image/webp" data-bank-images data-bank-id="${esc(p.id)}"></span></label><label class="field full">Información adicional JSON<textarea data-bank-field="extra" data-bank-id="${esc(p.id)}">${esc(JSON.stringify(p.extra||{},null,2))}</textarea></label></div><div class="row"><button type="button" class="btn btn-light" data-bank-select="${esc(p.id)}">${selectedBank.has(String(p.id))?"Seleccionado":"Seleccionar"}</button><span class="small muted">${p.importQuality==="review"?"Revisar datos importados":"Datos importados"}</span><button type="button" class="btn btn-primary" data-bank-publish="${esc(p.id)}">Publicar</button></div></div></article>`).join(""):`<div class="empty">No hay piezas privadas.</div>`;updateOwnerStats()}
    function syncBankInputs(){document.querySelectorAll("[data-bank-price]").forEach(i=>{const p=config.privatePieces.find(x=>sameId(x.id,i.dataset.bankPrice));if(p)p.price=number(i.value)});document.querySelectorAll("[data-bank-stock]").forEach(i=>{const p=config.privatePieces.find(x=>sameId(x.id,i.dataset.bankStock));if(p)p.stock=number(i.value)});document.querySelectorAll("[data-bank-field]").forEach(i=>{const p=config.privatePieces.find(x=>sameId(x.id,i.dataset.bankId));if(!p)return;const field=i.dataset.bankField;if(field==="extra"){try{p.extra=JSON.parse(i.value||"{}")}catch{return}}else if(field==="precioUSD"||field==="stock")p[field]=number(i.value);else if(field==="imagenes")p.imagenes=splitImageList(i.value).map(normalizeImageUrl).filter(Boolean);else p[field]=i.value;Object.assign(p,productoConAliases(p));localStorage.setItem(LS,JSON.stringify(config))})}
    const renderPrivateBankWithSafeImages=renderPrivateBank;
    renderPrivateBank=function(){
      renderPrivateBankWithSafeImages();
      document.querySelectorAll(".piece-card .file-btn").forEach(label=>{
        const input=label.querySelector("[data-bank-images]");
        if(!input)return;
        const button=document.createElement("button");
        button.type="button";
        button.className="file-btn";
        button.innerHTML='<i data-lucide="image-up"></i>Cambiar imagen';
        button.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();input.click()});
        input.className="sr";
        label.replaceWith(button,input);
      });
      lucide.createIcons();
    };
    function legacyPublishBank(ids){syncBankInputs();const set=new Set(ids.map(String));const picked=config.privatePieces.filter(p=>set.has(String(p.id)));if(!picked.length)return toast("Selecciona piezas");products=filterDeletedProducts([...picked.map(p=>({...normalizeProduct(p),private:false,published:true,id:cryptoRandom()})),...products]);config.products=products;config.privatePieces=config.privatePieces.filter(p=>!set.has(String(p.id)));selectedBank.clear();persist();renderProducts();renderAdminProducts();renderPrivateBank();setDirty(false);toast(`${picked.length} pieza(s) publicadas`)}
    function productMatchesDelete(item,target){
      if(!item||!target)return false;
      const wanted=String(target).trim();
      return sameId(item.id,wanted)||sameId(item.sku,wanted)||deletedKey(item.name)===deletedKey(wanted);
    }
    function bindAdminDeleteButtons(){
      document.querySelectorAll(".admin-delete-btn[data-admin-delete]").forEach(button=>{
        if(button.dataset.boundDelete==="1")return;
        button.dataset.boundDelete="1";
        button.addEventListener("click",event=>{
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          deleteProduct(button.dataset.adminDelete,button);
        });
      });
    }
    function legacyDeleteProduct(productId,sourceEl=null){
      if(!isOwner())return toast("Inicia sesión como owner para eliminar");
      const card=sourceEl?.closest?.("[data-admin-product-id]");
      const id=String(productId||sourceEl?.dataset?.adminDelete||card?.dataset?.adminProductId||"").trim();
      if(!id)return toast("No pude identificar el producto");
      clearTimeout(autosaveProducts.t);
      autosaveProducts.lock=true;
      const currentList=[...(config.products||[]),...(products||[])].map(normalizeProduct);
      const p=currentList.find(item=>productMatchesDelete(item,id));
      if(!p){autosaveProducts.lock=false;return toast("Producto no encontrado o ya eliminado")}
      const ok=confirm(`¿Estás seguro de que deseas eliminar "${p.name}" de la tienda pública?`);
      if(!ok){autosaveProducts.lock=false;return}
      rememberDeletedProduct(p,id);
      products=(products||[]).map(normalizeProduct).filter(item=>!productMatchesDelete(item,id)&&!isDeletedProduct(item));
      config.products=(config.products||[]).map(normalizeProduct).filter(item=>!productMatchesDelete(item,id)&&!isDeletedProduct(item));
      cart=cart.filter(row=>!productMatchesDelete({id:row.id,sku:row.id,name:row.id},id));
      favorites=new Set([...favorites].filter(favId=>!sameId(favId,id)));
      localStorage.setItem(LS_CART,JSON.stringify(cart));
      localStorage.setItem(LS_FAV,JSON.stringify([...favorites]));
      localStorage.setItem(LS_DELETED,JSON.stringify([...deletedProductIds]));
      persist();
      if(card)card.style.display="none";
      renderCategories();
      renderProducts();
      renderAdminProducts();
      renderCart();
      updateOwnerStats();
      setDirty(false);
      autosaveProducts.lock=false;
      toast(`"${p.name}" eliminado`);
    }
    function legacyDeleteProductFromButton(event,button){
      event?.preventDefault?.();
      event?.stopPropagation?.();
      event?.stopImmediatePropagation?.();
      deleteProduct(button?.dataset?.adminDelete,button);
      return false;
    }
    window.legacyDeleteProduct=legacyDeleteProduct;
    window.legacyDeleteProductFromButton=legacyDeleteProductFromButton;

    /* CRUD profesional de productos Sublime.
       Fuente de verdad: arreglo global products + localStorage('sublime_productos').
       El objeto se guarda con campos en español y se expone con alias para no romper carrito,
       catálogo, checkout, PDF, Drive ni funciones existentes de la tienda. */
    function productoBase(datos={}){
      return {
        id:String(datos.id||Date.now().toString()),
        firestoreId:text(datos.firestoreId||datos.docId||datos._firestoreId||""),
        lote:text(datos.lote||datos.LOTE||""),
        status:text(datos.status||datos.estatus||datos.Estatus||""),
        externalId:text(datos.externalId||datos.idProducto||datos.ID_Producto||datos.id_producto||""),
        nombre:text(datos.nombre||datos.name||datos.producto||"Nueva pieza"),
        sku:text(datos.sku||datos.codigo||datos.código||""),
        audience:text(datos.audience||datos.publico||datos.público||datos.Publico||""),
        style:text(datos.style||datos.estilo||datos.Estilo||""),
        precioUSD:number(datos.precioUSD??datos.price??datos.precio??datos["precio usd"],10),
        costPrice:number(datos.costPrice??datos.precioCosto??datos["precio al costo"],0),
        wholesale12:number(datos.wholesale12??datos["precio 12 a 49"]??datos["de 12 a 49 piezas"],0),
        wholesale50:number(datos.wholesale50??datos["de 50 a 100 piezas"],0),
        wholesale100:number(datos.wholesale100??datos["de 100 piezas en adelante"],0),
        stock:number(datos.stock??datos.cantidad??datos.inventario,1),
        sold:number(datos.sold??datos.vendidos??datos.salesCount??datos.vendidas,0),
        categoria:text(datos.categoria||datos.categoría||datos.category||"Collares"),
        color:Array.isArray(datos.color)?datos.color.map(text).filter(Boolean).join(" | "):text(datos.color||datos.colors||datos.colores||datos.variantes||""),
        material:text(datos.material||datos.materiales||""),
        descripcion:text(datos.descripcion||datos.descripción||datos.desc||datos.detalles||""),
        imagenes:splitImageList(datos.imagenes||datos.images||datos.image||datos.fotos||datos.foto||datos.imagen||datos.urlImagen).map(normalizeImageUrl).filter(Boolean),
        extra:typeof datos.extra==="object"&&datos.extra?{...datos.extra}:{}
      };
    }
    function productoConAliases(datos={}){
      const p=productoBase(datos);
      const colores=splitList(p.color);
      const imagenes=p.imagenes.length?p.imagenes:[FALLBACK_IMAGE];
      return {
        ...p,
        imagenes,
        name:p.nombre,
        category:p.categoria,
        price:p.precioUSD,
        colors:colores.length?colores:["Dorado"],
        desc:p.descripcion||"Pieza Sublime disponible para compra.",
        images:imagenes,
        firestoreId:p.firestoreId,
        lote:p.lote,status:p.status,externalId:p.externalId,audience:p.audience,style:p.style,costPrice:p.costPrice,wholesale12:p.wholesale12,wholesale50:p.wholesale50,wholesale100:p.wholesale100,
        extra:p.extra,
        tag:text(datos.tag||datos.etiqueta||((number(datos.stock??datos.cantidad??datos.inventario,0)<=0)?"Agotado":"Nuevo")),
        sold:number(datos.sold??datos.vendidos??datos.salesCount??datos.vendidas,0),
        rating:number(datos.rating||datos.calificacion,5),
        private:!!datos.private,
        published:datos.published!==false,
        importQuality:datos.importQuality||"good"
      };
    }
    function normalizeProduct(p={}){return productoConAliases(p)}
    function cargarProductos(){
      const guardados=loadJson(LS_PRODUCTS,null);
      const origen=Array.isArray(guardados)&&guardados.length?guardados:((config.products||[]).length?config.products:DEFAULT.products||[]);
      products=filterDeletedProducts(origen.map(productoConAliases));
      if(!products.length&&origen.length){
        deletedProductIds=new Set();
        localStorage.setItem(LS_DELETED,JSON.stringify([]));
        products=origen.map(productoConAliases);
      }
      if(!products.length){
        deletedProductIds=new Set();
        localStorage.setItem(LS_DELETED,JSON.stringify([]));
        products=(DEFAULT.products||[]).map(productoConAliases);
      }
      config.products=products;
      localStorage.setItem(LS_PRODUCTS,JSON.stringify(products));
      localStorage.setItem(LS,JSON.stringify(config));
      return products;
    }
    function guardarProductos(refrescar=true){
      products=filterDeletedProducts(products.map(productoConAliases));
      config.products=products;
      localStorage.setItem(LS_PRODUCTS,JSON.stringify(products));
      localStorage.setItem(LS,JSON.stringify(config));
      if(!firestoreOnline)saveSharedCatalog();
      if(refrescar){
        renderizarTiendaPublica();
        renderizarPanelOwner();
        renderCart();
        updateOwnerStats();
        setDirty(false);
      }
    }
    async function crearProducto(){
      const nuevo=productoConAliases({
        id:Date.now().toString(),
        nombre:"Nueva pieza",
        sku:"",
        precioUSD:10,
        stock:1,
        categoria:"Collares",
        color:"",
        material:"",
        descripcion:"",
        imagenes:[FALLBACK_IMAGE],
        published:true
      });
      forgetDeletedProduct(nuevo);
      products=[nuevo,...products.map(productoConAliases)];
      guardarProductos(true);
      try{
        nuevo.firestoreId=await createProductInFirestore(nuevo);
        products=products.map(item=>sameId(item.id,nuevo.id)?productoConAliases({...item,firestoreId:nuevo.firestoreId}):item);
        config.products=products;
        localStorage.setItem(LS_PRODUCTS,JSON.stringify(products));
        localStorage.setItem(LS,JSON.stringify(config));
        toast("Producto creado en Firestore");
      }catch(error){
        console.warn("No pude crear producto en Firestore",error);
        toast("Producto creado localmente. Firestore no respondió.");
      }
      setTimeout(()=>document.querySelector(`[data-admin-product-id="${CSS.escape(nuevo.id)}"]`)?.scrollIntoView({behavior:"smooth",block:"center"}),60);
    }
    function actualizarProducto(id,campo,valor){
      const idx=products.findIndex(p=>sameId(p.id,id));
      if(idx<0)return;
      const actual=productoBase(products[idx]);
      if(campo==="precioUSD"||campo==="stock")actual[campo]=number(valor,campo==="precioUSD"?10:0);
      else if(campo==="imagenes")actual[campo]=splitImageList(valor).map(normalizeImageUrl).filter(Boolean);
      else if(campo==="extra"){try{actual.extra=JSON.parse(valor||"{}")}catch{return toast("La información adicional debe ser JSON válido")}}
      else actual[campo]=valor;
      products[idx]=productoConAliases({...products[idx],...actual});
      localStorage.setItem(LS_PRODUCTS,JSON.stringify(products));
      config.products=products;
      localStorage.setItem(LS,JSON.stringify(config));
      scheduleFirestoreProductUpdate(products[idx]);
      renderizarTiendaPublica();
      updateOwnerStats();
      setDirty(false);
    }
    function confirmarEliminacionProducto(producto){
      return new Promise(resolve=>{
        document.getElementById("productDeleteConfirm")?.remove();
        const modal=document.createElement("section");
        modal.id="productDeleteConfirm";
        modal.className="product-delete-confirm";
        modal.setAttribute("role","dialog");
        modal.setAttribute("aria-modal","true");
        modal.innerHTML=`
          <div class="product-delete-backdrop" data-delete-cancel></div>
          <div class="product-delete-box">
            <p class="eyebrow">Confirmar eliminación</p>
            <h3>Eliminar producto</h3>
            <p>¿Estás seguro de que deseas eliminar <strong>${esc(producto?.nombre||producto?.name||"este producto")}</strong> del catálogo?</p>
            <div class="row">
              <button type="button" class="btn btn-light" data-delete-cancel>Cancelar</button>
              <button type="button" class="btn btn-danger" data-delete-ok>Eliminar definitivamente</button>
            </div>
          </div>`;
        const finish=value=>{modal.remove();resolve(value)};
        modal.querySelectorAll("[data-delete-cancel]").forEach(btn=>btn.addEventListener("click",()=>finish(false)));
        modal.querySelector("[data-delete-ok]").addEventListener("click",()=>finish(true));
        document.body.appendChild(modal);
        setTimeout(()=>modal.querySelector("[data-delete-ok]")?.focus(),40);
      });
    }
    async function eliminarProducto(id){
      if(!isOwner())return toast("Inicia sesión como owner para eliminar");
      const productId=String(id||"").trim();
      products=products.map(productoConAliases);
      config.products=products;
      const producto=products.find(p=>sameId(p.id,productId));
      if(!producto)return toast("Producto no encontrado");
      const ok=await confirmarEliminacionProducto(producto);
      if(!ok)return toast("Eliminación cancelada");
      try{await deleteProductFromFirestore(producto)}
      catch(error){console.warn("No pude eliminar producto en Firestore",error);toast("No pude eliminar en Firestore; se quitó localmente")}
      products=products.filter(p=>!sameId(p.id,productId));
      config.products=products;
      cart=cart.filter(item=>!sameId(item.id,productId));
      favorites=new Set([...favorites].filter(itemId=>!sameId(itemId,productId)));
      rememberDeletedProduct(producto,productId);
      localStorage.setItem(LS_PRODUCTS,JSON.stringify(products));
      localStorage.setItem(LS,JSON.stringify(config));
      saveCart();
      renderizarPanelOwner();
      renderizarTiendaPublica();
      renderCart();
      updateOwnerStats();
      toast(`"${producto.nombre}" eliminado`);
    }
    function renderizarPanelOwner(){
      const el=$("adminProducts");
      if(!el)return;
      products=filterDeletedProducts(products.map(productoConAliases));
      el.innerHTML=products.length?products.map(p=>`
        <article class="admin-product" data-admin-product data-admin-product-id="${esc(p.id)}">
          <div class="product-editor-title">
            <strong>${esc(p.nombre)}</strong>
            <button type="button" class="btn btn-danger admin-delete-btn" data-admin-delete="${esc(p.id)}" aria-label="Eliminar ${esc(p.nombre)}">
              <i data-lucide="trash-2"></i>Eliminar
            </button>
          </div>
          <div class="grid2">
            <div class="field"><label>ID de la pieza</label><input class="input" data-crud-field="externalId" value="${esc(p.externalId||p.id)}"></div>
            <div class="field"><label>SKU</label><input class="input" data-crud-field="sku" value="${esc(p.sku)}"></div>
            <div class="field"><label>Nombre *</label><input class="input" data-crud-field="nombre" value="${esc(p.nombre)}" required></div>
            <div class="field"><label>Precio USD *</label><input class="input" type="number" step="0.01" min="0" data-crud-field="precioUSD" value="${esc(p.precioUSD)}"></div>
            <div class="field"><label>Precio Bs automático</label><input class="input" value="${bs(p.precioUSD)}" disabled></div>
            <div class="field"><label>Stock *</label><input class="input" type="number" min="0" step="1" data-crud-field="stock" value="${esc(p.stock)}"></div>
            <div class="field"><label>Categoría *</label><input class="input" data-crud-field="categoria" value="${esc(p.categoria)}"></div>
            <div class="field"><label>Colores / Variantes</label><input class="input" data-crud-field="color" value="${esc(p.color)}" placeholder="Dorado | Plateado | Negro"><div class="admin-color-list">${JEWEL_COLORS.map(color=>`<button type="button" class="admin-color ${splitList(p.color).some(selected=>normalizeQuery(selected)===normalizeQuery(color))?"selected":""}" data-admin-color="${esc(color)}" title="${esc(color)}"><span style="background:${esc(colorValue(color))}"></span>${esc(color)}</button>`).join("")}</div></div>
            <div class="field"><label>Materiales</label><input class="input" data-crud-field="material" value="${esc(p.material)}" placeholder="Oro, plata, acero..."></div>
            <div class="field full"><label>Descripción detallada</label><textarea data-crud-field="descripcion">${esc(p.descripcion)}</textarea></div>
            <div class="field full"><label>Información adicional</label><textarea data-crud-field="extra" placeholder='{"marca":"Sublime","talla":"7"}'>${esc(JSON.stringify(p.extra||{},null,2))}</textarea></div>
            <div class="field full">
              <label>Foto del producto URL/Base64</label>
              <textarea data-crud-field="imagenes">${esc((p.imagenes||[]).join(" | "))}</textarea>
              <label class="file-btn"><i data-lucide="image-up"></i>Subir una foto PNG/JPG/WEBP<input type="file" accept="image/png,image/jpeg,image/webp" data-crud-images></label>
              <div class="photo-list">${(p.imagenes||[]).slice(0,8).map(src=>`<img src="${esc(src)}" onerror="this.src='${esc(FALLBACK_IMAGE)}'">`).join("")}</div>
            </div>
          </div>
        </article>`).join(""):`<div class="empty">No hay productos publicados. Usa "+ Nuevo producto" para crear el primero.</div>`;
      el.querySelectorAll("button").forEach(btn=>btn.type="button");
      el.querySelectorAll("[data-crud-field]").forEach(input=>{
        input.addEventListener("input",event=>{
          const card=event.target.closest("[data-admin-product-id]");
          actualizarProducto(card.dataset.adminProductId,event.target.dataset.crudField,event.target.value);
        });
        input.addEventListener("change",event=>{
          const card=event.target.closest("[data-admin-product-id]");
          actualizarProducto(card.dataset.adminProductId,event.target.dataset.crudField,event.target.value);
          renderizarPanelOwner();
        });
      });
      el.querySelectorAll("[data-admin-color]").forEach(button=>button.addEventListener("click",()=>{
        const card=button.closest("[data-admin-product-id]"),input=card?.querySelector('[data-crud-field="color"]');
        if(!input)return;
        const values=new Set(splitList(input.value).map(normalizeQuery)),color=button.dataset.adminColor,key=normalizeQuery(color);
        values.has(key)?values.delete(key):values.add(key);
        input.value=JEWEL_COLORS.filter(item=>values.has(normalizeQuery(item))).join(" | ");
        button.classList.toggle("selected",values.has(key));
        actualizarProducto(card.dataset.adminProductId,"color",input.value);
        setDirty(true);
      }));
      el.querySelectorAll("[data-crud-images]").forEach(input=>{
        input.addEventListener("change",async event=>{
          const card=event.target.closest("[data-admin-product-id]");
          const area=card.querySelector('[data-crud-field="imagenes"]');
          if(!event.target.files.length)return;
          const foto=await readImageFile(event.target.files[0]);
          area.value=foto;
          actualizarProducto(card.dataset.adminProductId,"imagenes",foto);
          event.target.value="";
          renderizarPanelOwner();
          toast("Foto del producto actualizada");
        });
      });
      el.querySelectorAll("[data-admin-delete]").forEach(btn=>{
        btn.addEventListener("click",event=>{
          event.preventDefault();
          event.stopPropagation();
          eliminarProducto(btn.dataset.adminDelete);
        });
      });
      lucide.createIcons();
    }
    function renderizarTiendaPublica(){
      products=filterDeletedProducts(products.map(productoConAliases));
      config.products=products;
      renderCategories();
      renderFilters();
      const arr=filteredProducts();
      const grid=$("productGrid");
      if(!grid)return;
      const remaining=Math.max(0,wholesaleThreshold()-qtyTotal());
      $("modeNotice").textContent=wholesaleActive()?`Modo mayorista activo: precio especial aplicado a ${qtyTotal()} pieza(s).`:(wholesaleQualified()?`Ya tienes ${qtyTotal()} piezas. Activa el modo mayorista desde el carrito.`:`Modo detal activo. Agrega ${remaining} pieza(s) más para desbloquear mayorista.`);
      grid.innerHTML=arr.length?arr.map(p=>{
        const out=p.stock<=0,price=productPrice(p);
        return `<article class="product" style="--stagger:${arr.indexOf(p)%10}"><div class="photo"><img src="${esc(productImage(p))}" alt="${esc(p.nombre)}" onerror="this.onerror=null;this.src='${esc(FALLBACK_IMAGE)}'"><span class="badge ${out?"sold":""}">${out?"Agotado":esc(p.tag||"Nuevo")}</span><button type="button" class="fav ${favorites.has(String(p.id))?"is-active":""}" data-favorite="${esc(p.id)}">♥</button><button type="button" class="quick" data-detail="${esc(p.id)}">Vista rápida</button></div><div class="info"><div class="meta"><span>ID ${esc(p.externalId||p.id)}</span><span>${esc(p.material)}</span></div><h3 class="title">${esc(p.nombre)}</h3><div class="swatches">${p.colors.map(c=>`<button type="button" class="swatch" title="${esc(c)}" style="background:${esc(colorValue(c))}"></button>`).join("")}</div><p class="small muted">${esc(p.descripcion||p.desc)}</p><div class="price-line"><div><div class="price">${money(price)}</div>${config.showBs?`<div class="bs">${bs(price)}</div>`:""}</div><span class="stock ${out?"out":""}">${out?"Agotado":`Stock ${p.stock}`}</span></div><button type="button" class="add" data-add="${esc(p.id)}" ${out?"disabled":""}>Agregar al carrito</button><button type="button" class="btn btn-light download-photo" data-download="${esc(p.id)}"><i data-lucide="download"></i>Foto sin precio</button></div></article>`;
      }).join(""):`<div class="empty">No hay productos para estos filtros.</div>`;
      renderCart();
      lucide.createIcons();
      observeMotionTargets();
    }
    function renderProducts(){renderizarTiendaPublica()}
    function renderAdminProducts(){renderizarPanelOwner()}
    function syncAdminProducts(){guardarProductos(false)}
    function autosaveProducts(){guardarProductos(true)}
    function addAdminProduct(){crearProducto()}
    function deleteProduct(productId){eliminarProducto(productId)}
    function deleteProductFromButton(event,button){event?.preventDefault?.();event?.stopPropagation?.();eliminarProducto(button?.dataset?.adminDelete);return false}
    window.eliminarProducto=eliminarProducto;
    window.deleteProduct=deleteProduct;
    window.deleteProductFromButton=deleteProductFromButton;

    function googleDriveUrl(raw){let url=text(raw);if(!url)return"";try{const u=new URL(url);if(u.hostname.includes("docs.google.com")&&u.pathname.includes("/spreadsheets/d/")){const id=(u.pathname.match(/\/spreadsheets\/d\/([^/]+)/)||[])[1],gid=u.searchParams.get("gid")||"0";return`https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`}if(u.hostname.includes("drive.google.com")){const id=(u.pathname.match(/\/file\/d\/([^/]+)/)||u.search.match(/[?&]id=([^&]+)/)||[])[1];if(id)return`https://drive.google.com/uc?export=download&id=${id}`}return url}catch{return url}}
    async function syncDriveCatalog(silent=false){if(isOwner())collectAdmin();const url=googleDriveUrl(config.driveCatalogUrl);if(!url)return toast("Configura URL de Drive");try{$("driveStatus").textContent="Leyendo Drive...";const res=await fetch(url,{cache:"no-store"});if(!res.ok)throw new Error(`HTTP ${res.status}`);const type=res.headers.get("content-type")||"";let items=[];if(type.includes("pdf")||url.toLowerCase().includes(".pdf"))throw new Error("PDF está deshabilitado por el momento. Usa Google Sheets publicado como CSV.");const raw=await res.text();items=raw.trim().startsWith("[")||raw.trim().startsWith("{")?(Array.isArray(JSON.parse(raw))?JSON.parse(raw):JSON.parse(raw).products||[]).map(normalizeProduct):parseTextCatalog(raw);previewImport(items);config.driveLastSync=new Date().toLocaleString("es-VE");persist();hydrate();$("driveStatus").textContent=`Vista previa lista: ${items.length} pieza(s). Revisa errores en rojo antes de publicar.`;if(!silent)toast(`Drive leído: ${items.length} pieza(s)`);return items}catch(e){console.error(e);$("driveStatus").textContent=`Error leyendo Drive: ${e.message}. La hoja o archivo debe ser público.`;if(!silent)toast("No pude leer Drive")}}

    function importKey(p){return text(p.sku||p.externalId||p.id).toLowerCase()}
    function isFallbackOnly(p){return productImage(p)===FALLBACK_IMAGE}
    function validateCatalogItem(p,index,list=pendingCatalog){
      const errors=[];
      const sku=text(p.sku||p.externalId);
      const duplicate=list.findIndex((item,i)=>i!==index&&importKey(item)&&importKey(item)===importKey(p));
      if(!sku)errors.push("Falta SKU / código");
      if(duplicate>=0)errors.push(`SKU repetido con fila ${duplicate+1}`);
      if(!text(p.name||p.nombre)||isGenericProductName(p.name||p.nombre))errors.push("Falta nombre");
      if(number(p.price||p.precioUSD,0)<=0)errors.push("Falta precio válido");
      if(number(p.stock,NaN)<0||!Number.isFinite(number(p.stock,NaN)))errors.push("Stock inválido");
      if(!splitImageList(p.images||p.imagenes).length||isFallbackOnly(p)||brokenImportImages.has(index))errors.push("Falta foto real");
      return errors;
    }
    function catalogValidation(){
      syncImportEdits();
      return pendingCatalog.map((p,i)=>({index:i,product:normalizeProduct(p),errors:validateCatalogItem(normalizeProduct(p),i)}));
    }
    function updateImportStatus(){
      const rows=catalogValidation(),errors=rows.reduce((sum,row)=>sum+row.errors.length,0);
      const status=$("catalogImportStatus");
      if(status)status.textContent=errors?`${pendingCatalog.length} producto(s), ${errors} error(es). Corrige lo marcado en rojo antes de publicar.`:`${pendingCatalog.length} producto(s) listos para publicar.`;
      document.querySelectorAll(".import-row").forEach((row,i)=>{
        const item=rows[i];
        row.classList.toggle("has-error",!!item?.errors.length);
        const badge=row.querySelector("[data-import-errors]");
        if(badge)badge.innerHTML=item?.errors.length?item.errors.map(esc).join("<br>"):"Listo";
      });
      return errors===0;
    }
    function previewImport(items){
      brokenImportImages.clear();
      pendingCatalog=(items||[]).map(item=>productoConAliases({...item,sku:text(item.sku||item.externalId||item.codigo||item.id)}));
      $("catalogImportPreview").innerHTML=pendingCatalog.length?pendingCatalog.map((p,i)=>`
        <article class="import-row">
          <img data-import-image-preview="${i}" src="${esc(productImage(p))}" onerror="brokenImportImages.add(${i});this.onerror=null;this.src='${esc(FALLBACK_IMAGE)}';updateImportStatus()">
          <div>
            <label class="field"><span>Nombre del producto</span><input class="input" value="${esc(p.name)}" data-import-name="${i}"></label>
            <label class="field"><span>SKU / código único</span><input class="input" value="${esc(p.sku||p.externalId)}" data-import-sku="${i}"></label>
            <div class="small muted">${esc(p.category)} · ${esc(p.material)}</div>
            <label class="field"><span>Colores / variantes</span><input class="input" value="${esc((p.colors||[]).join(" | "))}" data-import-colors="${i}"></label>
            <label class="field"><span>URL de foto</span><textarea data-import-images-text="${i}">${esc((p.images||[]).join(" | "))}</textarea></label>
            <label class="file-btn import-image-button"><i data-lucide="image-up"></i>Cambiar imagen<input class="sr" type="file" accept="image/png,image/jpeg,image/webp" data-import-images="${i}"></label>
          </div>
          <label class="field"><span>Precio USD</span><input class="input" type="number" step="0.01" min="0" value="${p.price}" data-import-price="${i}"></label>
          <label class="field"><span>Stock</span><input class="input" type="number" step="1" min="0" value="${p.stock}" data-import-stock="${i}"></label>
          <span class="small import-status" data-import-errors="${i}">Revisando</span>
        </article>`).join(""):`<div class="empty">No se detectaron productos. Usa CSV, TXT, JSON o Google Sheets.</div>`;
      document.querySelectorAll("[data-import-images]").forEach(input=>input.addEventListener("change",async event=>{const index=Number(event.target.dataset.importImages);if(!event.target.files[0])return;try{const foto=await readImageFile(event.target.files[0]);brokenImportImages.delete(index);pendingCatalog[index].images=[foto];pendingCatalog[index].imagenes=[foto];const preview=document.querySelector(`[data-import-image-preview="${index}"]`);if(preview)preview.src=foto;const area=document.querySelector(`[data-import-images-text="${index}"]`);if(area)area.value=foto;event.target.value="";updateImportStatus();toast("Imagen del producto actualizada")}catch(error){toast(String(error))}}));
      document.querySelectorAll("[data-import-name],[data-import-sku],[data-import-colors],[data-import-images-text],[data-import-price],[data-import-stock],[data-import-extra]").forEach(input=>input.addEventListener("input",updateImportStatus));
      updateImportStatus();
      lucide.createIcons();
    }
    function syncImportEdits(){
      document.querySelectorAll("[data-import-name]").forEach(i=>{pendingCatalog[i.dataset.importName].nombre=i.value;pendingCatalog[i.dataset.importName].name=i.value});
      document.querySelectorAll("[data-import-sku]").forEach(i=>pendingCatalog[i.dataset.importSku].sku=i.value);
      document.querySelectorAll("[data-import-colors]").forEach(i=>{pendingCatalog[i.dataset.importColors].color=i.value;pendingCatalog[i.dataset.importColors].colors=splitList(i.value)});
      document.querySelectorAll("[data-import-images-text]").forEach(i=>{const images=splitImageList(i.value).map(normalizeImageUrl).filter(Boolean);pendingCatalog[i.dataset.importImagesText].imagenes=images;pendingCatalog[i.dataset.importImagesText].images=images});
      document.querySelectorAll("[data-import-price]").forEach(i=>{pendingCatalog[i.dataset.importPrice].precioUSD=number(i.value);pendingCatalog[i.dataset.importPrice].price=number(i.value)});
      document.querySelectorAll("[data-import-stock]").forEach(i=>pendingCatalog[i.dataset.importStock].stock=number(i.value,0));
      document.querySelectorAll("[data-import-extra]").forEach(i=>{try{pendingCatalog[i.dataset.importExtra].extra=JSON.parse(i.value||"{}")}catch{toast(`Revisa la información adicional del producto ${Number(i.dataset.importExtra)+1}`)}});
      pendingCatalog=pendingCatalog.map(productoConAliases);
    }
    function upsertProductsBySku(incoming,base){
      const next=[...base.map(productoConAliases)];
      incoming.map(productoConAliases).forEach(item=>{
        const key=importKey(item);
        const idx=next.findIndex(existing=>importKey(existing)&&importKey(existing)===key);
        if(idx>=0)next[idx]=productoConAliases({...next[idx],...item,id:next[idx].id,private:false,published:true});
        else next.unshift(productoConAliases({...item,id:item.id||cryptoRandom(),private:false,published:true}));
      });
      return filterDeletedProducts(next);
    }
    function importToBank(){
      if(!pendingCatalog.length)return toast("Primero carga catálogo");
      if(!updateImportStatus())return toast("Corrige los errores en rojo antes de enviar al banco");
      syncImportEdits();
      config.privatePieces=[...pendingCatalog.map(p=>({...normalizeProduct(p),private:true,published:false,id:cryptoRandom()})),...config.privatePieces];
      pendingCatalog=[];
      $("catalogImportPreview").innerHTML="";
      persist();renderPrivateBank();updateOwnerStats();setDirty(false);switchAdminTab("banco");toast("Catálogo enviado al banco privado");
    }
    async function publishImport(replace=false){
      if(!pendingCatalog.length)return toast("Primero carga catálogo");
      if(!updateImportStatus())return toast("Corrige los errores en rojo antes de publicar");
      syncImportEdits();
      if(replace){
        deletedProductIds=new Set();
        localStorage.setItem(LS_DELETED,JSON.stringify([]));
      }
      const incoming=pendingCatalog.map(p=>({...normalizeProduct(p),private:false,published:true}));
      incoming.forEach(forgetDeletedProduct);
      products=replace?incoming:upsertProductsBySku(incoming,products);
      try{
        if(replace)await replaceFirestoreCatalog(incoming);
        else await upsertFirestoreCatalog(incoming);
      }catch(error){
        console.warn("No pude publicar catálogo en Firestore",error);
        toast("No pude publicar en Firestore. Se guardó respaldo local.");
      }
      config.products=products;
      selectedCategory="Todos";selectedMaterial="Todos";showFavs=false;["searchInput","searchInputTop","quickSearchMirror","minPrice","maxPrice"].forEach(id=>{if($(id))$(id).value=""});
      pendingCatalog=[];
      $("catalogImportPreview").innerHTML="";
      persist();if(!firestoreOnline)saveSharedCatalog();renderCategories();renderProducts();renderAdminProducts();updateOwnerStats();setDirty(false);toast(replace?"Tienda reemplazada en Firestore":"Catálogo publicado / actualizado en Firestore por SKU");
    }
    async function publishBank(ids){
      syncBankInputs();
      const set=new Set(ids.map(String)),picked=config.privatePieces.filter(p=>set.has(String(p.id))).map(productoConAliases);
      if(!picked.length)return toast("Selecciona piezas");
      const invalid=picked.flatMap((p,i)=>validateCatalogItem(p,i,picked));
      if(invalid.length)return toast("Corrige SKU, foto, precio y stock antes de publicar");
      picked.forEach(forgetDeletedProduct);
      products=upsertProductsBySku(picked.map(p=>({...p,private:false,published:true})),products);
      try{await upsertFirestoreCatalog(picked.map(p=>({...p,private:false,published:true})))}
      catch(error){console.warn("No pude publicar banco en Firestore",error);toast("No pude publicar en Firestore. Se guardó respaldo local.")}
      config.products=products;
      config.privatePieces=config.privatePieces.filter(p=>!set.has(String(p.id)));
      selectedBank.clear();persist();if(!firestoreOnline)saveSharedCatalog();renderProducts();renderAdminProducts();renderPrivateBank();setDirty(false);toast(`${picked.length} pieza(s) publicadas / actualizadas`);
    }

    function renderReviews(){
      const el=$("reviewList");
      if(!el)return;
      const approved=reviews.filter(r=>r.approved);
      el.innerHTML=approved.length?approved.map(r=>`<article class="review-card reveal"><div class="review-stars">★★★★★</div><p>${esc(r.text)}</p><strong>${esc(r.name)}</strong>${r.product?`<span>${esc(r.product)}</span>`:""}</article>`).join(""):`<div class="empty">Todavía no hay reseñas publicadas.</div>`;
      observeMotionTargets();
    }
    function submitReview(){
      const name=text($("reviewName")?.value),body=text($("reviewText")?.value);
      if(!name||!body)return toast("Completa nombre y opinión");
      reviews.unshift({id:"REV-"+Date.now(),name,text:body,product:text($("reviewProduct")?.value),approved:false,date:new Date().toISOString()});
      saveReviews();
      $("reviewForm")?.reset();
      renderAdminReviews();
      toast("Reseña enviada para aprobación");
    }
    function renderAdminReviews(){
      const el=$("adminReviewList");
      if(!el)return;
      el.innerHTML=reviews.length?reviews.map(r=>`<article class="admin-review ${r.approved?"approved":"pending"}"><div><strong>${esc(r.name)}</strong><p>${esc(r.text)}</p><span class="small muted">${esc(r.product||"Sin producto")} · ${r.approved?"Publicada":"Pendiente"}</span></div><div class="row"><button type="button" class="btn btn-light" data-review-approve="${esc(r.id)}">${r.approved?"Ocultar":"Aprobar"}</button><button type="button" class="btn btn-danger" data-review-delete="${esc(r.id)}">Eliminar</button></div></article>`).join(""):`<div class="empty">No hay reseñas por revisar.</div>`;
    }
    function renderSales(){
      const el=$("salesList");
      if(!el)return;
      el.innerHTML=sales.length?sales.map(s=>`<article class="sale-card"><strong>${esc(s.id)} · ${esc(s.customer?.name||"Cliente")}</strong><span>${esc(new Date(s.date).toLocaleString("es-VE"))}</span><p>${esc(s.items.map(i=>`ID ${i.id} ${i.name} x${i.qty}`).join(" · "))}</p><div class="small muted">${money(s.total)} / ${esc(s.bs)} · ${esc(s.payment)} · Cupón: ${esc(s.coupon)}</div></article>`).join(""):`<div class="empty">Aún no hay ventas registradas en este navegador.</div>`;
    }
    function exportSalesCsv(){
      const rows=[["fecha","pedido","cliente","whatsapp","direccion","ubicacion","entrega","pago","referencia","cupon","descuento","total_usd","total_bs","items"]];
      sales.forEach(s=>rows.push([s.date,s.id,s.customer?.name,s.customer?.whatsapp,s.customer?.address,s.customer?.map,s.delivery,s.payment,s.paymentReference,s.coupon,s.discount,s.total,s.bs,s.items.map(i=>`ID ${i.id} ${i.name} x${i.qty}`).join(" | ")]));
      const csv=rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n");
      const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
      const a=document.createElement("a");
      a.href=URL.createObjectURL(blob);a.download="ventas-sublime.csv";a.click();URL.revokeObjectURL(a.href);
    }

    function normalizeQuery(q){let value=text(q).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");const corrections={kuanto:"cuanto",quanto:"cuanto",bale:"vale",valee:"vale",salee:"sale",presio:"precio",aniyo:"anillo",aniño:"anillo",pulcera:"pulsera",arethes:"aretes",colar:"collar",collarr:"collar",cadenna:"cadena",dijee:"dije",compromizo:"compromiso",conpromiso:"compromiso",informacion:"informacion",envios:"envio",reparacion:"reparacion",garantia:"garantia",devolucion:"devolucion",promocion:"promocion"};return value.split(/\s+/).map(word=>corrections[word]||word).join(" ")}
    function sectionGo(id){const el=$(id);if(el){el.scrollIntoView({behavior:"smooth",block:"start"});if(id==="tienda")renderProducts()}}
    function productIntent(q){const s=normalizeQuery(q);const words=s.split(/\s+/).filter(w=>w.length>2);let arr=products.filter(p=>p.published!==false&&(!config.hideOutStock||p.stock>0));const category=categories().find(c=>c!=="Todos"&&s.includes(normalizeQuery(c)));const material=materials().find(m=>m!=="Todos"&&s.includes(normalizeQuery(m)));if(category)arr=arr.filter(p=>p.category===category);if(material)arr=arr.filter(p=>p.material===material);if(/dorado|oro|gold/.test(s))arr=arr.filter(p=>p.colors.some(c=>/dorado|oro|gold/i.test(c))||/oro/i.test(p.material));if(/plateado|plata|silver/.test(s))arr=arr.filter(p=>p.colors.some(c=>/plateado|plata|silver/i.test(c))||/plata/i.test(p.material));if(/negro|black/.test(s))arr=arr.filter(p=>p.colors.some(c=>/negro|black/i.test(c)));if(/boda|elegante|formal|novia|regalo|cumple|aniversario/.test(s))arr=arr.sort((a,b)=>b.rating-a.rating||b.price-a.price);if(words.length&&!category&&!material)arr=arr.filter(p=>words.some(w=>normalizeQuery(`${p.name} ${p.category} ${p.material} ${p.desc} ${p.colors.join(" ")}`).includes(w)))||arr;return arr.slice(0,4)}
    function productNames(arr){return arr.map(p=>`• ${p.name}: ${money(productPrice(p))}${config.showBs?` / ${bs(productPrice(p))}`:""} · ${p.category} · ${p.colors.join(", ")}`).join("\n")}
    function localIntentAnswer(q){
      const s=normalizeQuery(q), matches=productIntent(q), available=products.filter(p=>p.published!==false&&p.stock>0).sort((a,b)=>productPrice(a)-productPrice(b));
      const has=words=>words.some(word=>s.includes(normalizeQuery(word)));
      if(has(["reparan","arreglan","reparacion","reparar","se rompio","se rompió","se cayo","se cayó","soldarlo","pulirlo","restaurarlo","limpieza","limpiar","ajuste joya","cambio piedra"]))return "Las reparaciones, limpieza, pulido, ajustes y cambios de piedra se coordinan por WhatsApp. Envíanos una foto y una descripción para revisar disponibilidad.";
      if(has(["comparar","comparacion","comparación","diferencia entre","cual es mejor","cuál es mejor"]))return matches.length>1?`Para comparar, encontré:\n${productNames(matches)}\n\nPuedo ayudarte a decidir según precio, material, color u ocasión.`:"Dime los nombres de las dos piezas que quieres comparar.";
      if(has(["hola","buenas","necesito ayuda","quiero ayuda","informacion","info porfa"]))return "Hola, soy el Concierge local de Sublime. Puedo ayudarte con productos, precios, regalos, materiales, pagos, envíos, tallas y garantía. ¿Qué estás buscando?";
      if(has(["precio","cuanto cuesta","kuanto cuesta","quanto cuesta","cuanto vale","cuanto sale","pasame precio","dame precio","q precio","k precio","oferta","descuento","promocion","rebaja"]))return matches.length?`Estas son las opciones encontradas:\n${productNames(matches)}\n\nTambién puedo buscar por presupuesto, color o categoría.`:(available.length?`Las opciones más económicas son:\n${productNames(available.slice(0,3))}`:"Ahora mismo no hay productos disponibles.");
      if(has(["oro real","oro verdadero","oro autentico","oro puro","oro macizo","oro solido","quilate","kilate","sello de oro","es oro"]))return "El catálogo actual ofrece principalmente acero inoxidable, acero y baño de oro. No publicamos piezas de oro macizo ni realizamos tasaciones; sí puedo mostrarte piezas doradas disponibles.";
      if(has(["plata real","plata 925","plata esterlina","sello 925","se pone negra","se oxida"]))return "El catálogo actual no tiene plata 925 confirmada. Para conservar una pieza plateada, usa un paño suave y evita perfumes, cloro y humedad.";
      if(has(["diamante","diamantes","gia","certificado","rubi","rubí","zafiro","esmeralda","amatista","perla natural","moissanita"]))return "El catálogo actual está enfocado en acero, baño de oro y detalles de color; no ofrecemos certificados GIA ni tasaciones de diamantes o piedras preciosas.";
      if(has(["anillo","anillos","sortija","alianza","compromiso","boda","talla 7","talla 8","que talla","como saber mi talla","aniyo","aniño"]))return matches.length?`Encontré estas opciones de anillos:\n${productNames(matches)}\n\nPara tallas, cambios o grabados, consulta por WhatsApp.`:"Puedo ayudarte con anillos. Dime tu presupuesto, talla y si es para regalo, compromiso o uso diario.";
      if(has(["cadena","cadenas","collar","collares","gargantilla","dije","colgante","colar","collarr"]))return matches.length?`Estas opciones pueden interesarte:\n${productNames(matches)}`:"Puedo mostrarte collares y cadenas. Dime si prefieres algo fino, llamativo, dorado o plateado.";
      if(has(["arete","aretes","pendiente","pendientes","zarcillo","zarcillos","aros","argollas","arethes"]))return matches.length?`Encontré estas opciones:\n${productNames(matches)}`:"Puedo mostrarte aretes y zarcillos disponibles.";
      if(has(["pulsera","pulseras","brazalete","esclava","pulcera"]))return matches.length?`Estas pulseras pueden interesarte:\n${productNames(matches)}`:"Puedo mostrarte pulseras disponibles por color y material.";
      if(has(["reparan","arreglan","reparacion","reparar","se rompio","se rompió","se cayo","se cayó","soldarlo","pulirlo","restaurarlo"]))return "Las reparaciones se coordinan por WhatsApp. Envíanos una foto y una descripción del daño para revisar disponibilidad.";
      if(has(["regalo","novia","novio","esposa","esposo","mama","madre","hija","hermana","cumple","aniversario","algo bonito","san valentin","navidad"]))return matches.length?`Para regalo te recomiendo:\n${productNames(matches)}\n\nDime presupuesto, ocasión y color preferido.`:"Dime presupuesto, ocasión y color preferido para recomendarte un regalo.";
      if(has(["personalizado","personalizar","grabado","grabar","hacer a medida"]))return "Las piezas personalizadas, grabados y diseños a medida se coordinan directamente por WhatsApp.";
      if(has(["como compro","puedo comprar online","como pago","aceptan tarjeta","aceptan credito","aceptan debito","efectivo","pago movil"]))return `Agrega los productos al carrito, confirma tus datos, sube tu comprobante si ya pagaste y envía el pedido por WhatsApp. Aceptamos Zelle, PayPal, efectivo y Pago Móvil; tasa actual: ${number(config.rate).toFixed(2)} Bs/USD.`;
      if(has(["envio","envíos","hacen envios","cuanto tarda el envio","cuando llega","puedo recogerlo","reserva"]))return "Hacemos entregas en Caracas y envíos nacionales por MRW o Zoom. Caracas suele tardar 1 día y el resto del país entre 3 y 4 días hábiles.";
      if(has(["devolucion","devolverlo","reembolso","garantia","garantía","llego roto","llego dañado","cambiar la talla"]))return "La garantía es de 6 meses por defectos, óxido o partes despegadas. Para cambios o devoluciones, escribe por WhatsApp con tu número de pedido.";
      if(has(["donde estan","donde queda","direccion","tienda fisica","horario","abren","cierran"]))return "Sublime está ubicada en Caracas y opera 100% online. No hacemos entregas en tienda física. Atendemos de lunes a viernes de 9:00 a.m. a 5:00 p.m.; las entregas personales o por Yummy son solo para Caracas.";
      if(has(["adios","adiós","hasta luego","nos vemos","chao"]))return "Gracias por visitar Sublime. Cuando quieras, aquí estaremos para ayudarte.";
      if(has(["gracias","agradecimiento","te agradezco","muy amable"]))return "Con mucho gusto. Estoy aquí para ayudarte a encontrar la pieza ideal.";
      if(has(["que venden","qué venden","productos","joyeria","joyería","que tienen","qué tienen","catalogo","catálogo"]))return `Tenemos ${products.filter(p=>p.published!==false).length} piezas publicadas en ${categories().filter(c=>c!=="Todos").join(", ")||"nuestro catálogo"}. Puedo mostrarte opciones por categoría, color, material o precio.`;
      if(has(["disponibilidad","disponible","stock","hay stock","tienen stock"]))return available.length?`Hay ${available.length} productos disponibles. Estas son algunas opciones:\n${productNames(available.slice(0,4))}`:"En este momento no hay piezas disponibles.";
      if(has(["oro 24k","oro 18k","oro 14k","oro 10k","oro blanco","oro amarillo","oro rosa","oro laminado","oro bañado"]))return "No ofrecemos oro macizo de esos quilates en el catálogo actual. Sí contamos con piezas con acabado dorado o baño de oro; revisa la descripción de cada producto para confirmar el material.";
      if(has(["platino","joyeria hombre","joyería hombre","para hombre","joyeria mujer","joyería mujer","para mujer","joyeria ninos","joyería niños","para niña","para niño"]))return "Puedo ayudarte a elegir por estilo y ocasión. El catálogo actual tiene piezas versátiles; dime presupuesto, color y para quién es el regalo.";
      if(has(["presupuesto","economico","económico","barato","menos de","algo de 100","algo de 200","algo de 300","algo de 500"]))return available.length?`Estas son las piezas más económicas disponibles:\n${productNames(available.slice(0,4))}`:"Ahora mismo no hay productos disponibles para comparar.";
      if(has(["lujo","lujoso","premium","producto nuevo","pieza nueva","novedad","nuevo","producto oferta","pieza en oferta"]))return available.length?`Puedes revisar estas piezas destacadas:\n${productNames(available.slice(-4).reverse())}`:"No hay productos disponibles en este momento.";
      if(has(["talla pulsera","medida cadena","cuanto mide","cuánto mide","largo tiene","talla de pulsera"]))return "Las medidas y tallas dependen de cada pieza. Abre la vista rápida del producto o escríbenos por WhatsApp para confirmar la medida antes de comprar.";
      if(has(["estado pedido","seguimiento","donde esta mi pedido","dónde está mi pedido","pedido","orden"]))return "Para consultar el estado de un pedido, envíanos por WhatsApp tu nombre y número de pedido; allí te confirmaremos el avance.";
      if(has(["cancelar pedido","modificar pedido","cambiar mi pedido","reserva producto","reservar producto","apartarlo"]))return "Las reservas, modificaciones y cancelaciones se coordinan directamente por WhatsApp con tu número de pedido.";
      if(has(["contacto","asesoramiento","asesoria","asesoría","hablar con alguien","humano"]))return `Puedes contactar a un asesor por WhatsApp: ${config.whatsapp} o por correo: ${config.email}.`;
      if(has(["recoger tienda","recogida en tienda","retiro en tienda","retirar"]))return "Puedes solicitar retiro coordinado. Confirma disponibilidad y horario por WhatsApp antes de acercarte.";
      return null;
    }
    function buildAIContext(){
      const visible=products.filter(p=>p.published!==false);
      const preview=visible.slice(0,40).map(p=>({
        id:p.externalId||p.id,
        sku:p.sku,
        name:p.name,
        category:p.category,
        material:p.material,
        price:productPrice(p),
        regularPrice:p.price,
        wholesalePrice:productWholesalePrice(p),
        stock:p.stock,
        colors:(p.colors||[]).slice(0,5),
        desc:p.desc
      }));
      return {
        brand: config.brandName,
        whatsapp: config.whatsapp,
        email: config.email,
        rate: number(config.rate),
        shipping: {caracas: number(config.shipCaracas), national: number(config.shipNational), freeShipping: number(config.freeShipping)},
        paymentMethods: ["Zelle","PayPal","Efectivo","Pago Móvil"],
        paymentDetails: {zelle: config.zelleData, paypal: config.paypalData, pagoMovil: config.bankData},
        policies: [
          "Ubicada en Caracas.",
          "Tienda 100% online: no hacemos entregas en tienda fisica.",
          "Entregas personales o por Yummy solo en Caracas.",
          "MRW/Zoom para envios nacionales segun direccion.",
          "Horario: lunes a viernes de 9:00 a.m. a 5:00 p.m.",
          "Garantia: 6 meses por defectos de la pieza, oxido o partes despegadas; no cubre mal uso."
        ],
        wholesaleDiscount: number(config.wholesaleDiscount),
        wholesaleUnlocked: wholesaleQualified(),
        wholesaleActive: wholesaleActive(),
        coupon: activeCoupon()?.code || coupon || "",
        products: preview,
        cartCount: qtyTotal(),
        cartItems: cart.map(item=>{const p=products.find(product=>sameId(product.id,item.id));return p?{id:p.externalId||p.id,sku:p.sku,name:p.name,qty:item.qty,price:productPrice(p),stock:p.stock}:null}).filter(Boolean),
        total: total(),
        totalBs: bs(total()),
      };
    }
    function applyAIProviderPreset(){
      const provider=$("adminAiProvider")?.value;
      const presets={
        "openai-compatible": {endpoint:DEFAULT.aiEndpoint,model:DEFAULT.aiModel},
        gemini: {endpoint:DEFAULT.aiEndpoint,model:"gemini-2.5-flash"},
        anthropic: {endpoint:DEFAULT.aiEndpoint,model:DEFAULT.aiModel}
      };
      const preset=presets[provider];
      if(!preset)return;
      $("adminAiEndpoint").value=preset.endpoint;
      $("adminAiModel").value=preset.model;
      setDirty(true);
    }
    function aiEndpointsForRuntime(){
      const network = location.pathname.split("/")[2] || "pailas";
      const endpoints = [];
      if(location.pathname.startsWith("/networks/")){
        endpoints.push({ url: `/api/networks/v1/${encodeURIComponent(network)}/sublime/concierge/chat`, credentials: "include" });
      }
      if(/^https?:\/\//i.test(config.aiEndpoint||"")){
        endpoints.push({ url: config.aiEndpoint, credentials: "omit" });
      }
      if(location.protocol==="http:"||location.protocol==="https:"){
        endpoints.push({ url: "/api/chat", credentials: "omit" });
      }
      endpoints.push({ url: "http://localhost:8787/api/chat", credentials: "omit" });
      return endpoints.filter((endpoint,index,list)=>endpoint.url&&list.findIndex(item=>item.url===endpoint.url)===index);
    }
    async function callAIAssistant(question){
      if(!config.aiEnabled) return null;
      const endpoints = aiEndpointsForRuntime();
      const ctx = buildAIContext();
      const catalog = (ctx.products||[]).map(p=>[
        p.id?`ID ${p.id}`:"",
        p.sku?`SKU ${p.sku}`:"",
        p.name,
        p.category,
        p.material,
        `precio ${money(p.price)}`,
        p.wholesalePrice?`mayorista ${money(p.wholesalePrice)}`:"",
        `stock ${p.stock}`,
        p.colors?.length?`colores ${p.colors.join(", ")}`:"",
        p.desc?`detalle ${p.desc}`:""
      ].filter(Boolean).join(" | ")).join("\n");
      const cartSummary = cart.length ? cart.map(item=>{
        const p=products.find(product=>sameId(product.id,item.id));
        return p?`ID ${p.externalId||p.id}${p.sku?` / SKU ${p.sku}`:""} | ${p.name} x${item.qty} - ${money(productPrice(p)*item.qty)} | stock ${p.stock}`:"";
      }).filter(Boolean).join("\n") : "Carrito vacio";
      const history = chatHistory.slice(-8).map(item=>({role:item.role,text:item.text.slice(0,500)}));
      const payload = { message: question, catalog, cart: cartSummary, context: ctx, history };
      let lastError = "";
      for(const endpoint of endpoints){
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 26000);
        try {
          const response = await fetch(endpoint.url, {
            method: "POST",
            credentials: endpoint.credentials,
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          const contentType = response.headers.get("content-type") || "";
          const data = contentType.includes("application/json") ? await response.json().catch(()=>({})) : { text: await response.text().catch(()=>"") };
          const answer = data.reply || data.choices?.[0]?.message?.content || data.output_text || data.text || "";
          const cleaned = cleanAIReply(answer);
          if(response.ok && data.ok!==false && cleaned)return cleaned;
          if(data.code==="missing_key" && cleaned)return cleaned;
          lastError = cleaned || data.error || `IA no disponible: ${response.status}`;
        } catch(error) {
          lastError = error.name==="AbortError" ? "tiempo de espera agotado" : String(error.message||error);
        } finally {
          clearTimeout(timeout);
        }
      }
      throw new Error(lastError || "IA no disponible");
    }
    function cleanAIReply(answer){
      const cleaned=text(answer).replace(/\s+\n/g,"\n").replace(/\n{3,}/g,"\n\n").replace(/[*_`#]{2,}/g,"").trim();
      if(!cleaned)return "";
      if(/^(undefined|null|\[object Object\])$/i.test(cleaned))return "";
      if(cleaned.length<12 && !/[.!?¿¡]$/.test(cleaned))return "";
      return cleaned;
    }
    function conciergeAnswer(q){
      const s=normalizeQuery(q), matches=productIntent(q), contactWa=String(config.whatsapp||"+58 000 000 0000"), email=config.email||"ventas@sublime.com";
      const local=localIntentAnswer(q);if(local)return local;
      if(/^(hola|buenas|buen dia|buenas tardes|saludos)/.test(s))return "Hola, bienvenid@ a Sublime. Es un placer atenderte. Soy tu Concierge de compras: puedo ayudarte a elegir piezas, revisar precios, explicar envíos, pagos, garantía o acompañarte hasta el carrito.";
      if(/horario|atienden|abren|cierran|hora de atencion/.test(s))return "Nuestro horario de atención es de lunes a viernes, de 9:00 a.m. a 5:00 p.m. Si deseas atención personalizada, puedes escribir por WhatsApp y un asesor te acompaña con tu pedido.";
      if(/instagram|correo|email|contacto|whatsapp|asesor|humano/.test(s))return `Puedes contactarnos por WhatsApp: ${contactWa}, Instagram: @Sublime y correo: ${email}. Para compras o dudas personalizadas, lo más rápido es continuar por WhatsApp con tu carrito armado.`;
      if(/envio|entrega|ubicacion|caracas|mrw|zoom|nacional|delivery|yummy/.test(s))return "Sublime está ubicada en Caracas y opera 100% online. Las entregas personales o por Yummy son exclusivas para Caracas. Para el resto del país hacemos envíos por Zoom o MRW, usualmente de 3 a 4 días hábiles según destino.";
      if(/pago|zelle|paypal|pago movil|pagomovil|efectivo|bolivar|bs|bcv|tasa/.test(s))return `Aceptamos Zelle, PayPal, efectivo y Pago Móvil. La tienda muestra la tasa BCV al día: ${number(config.rate).toFixed(2)} Bs/USD. En checkout, si eliges Pago Móvil, se despliegan los datos bancarios automáticamente.`;
      if(/garantia|cambio|cambios|oxido|dano|defecto|despego|despeg/.test(s))return "La garantía es de 6 meses por defectos de la pieza, óxido o partes despegadas. No cubre daños por mal uso. Si tienes un caso, conserva la pieza y escríbenos por WhatsApp para revisarlo con atención.";
      if(/mayor|mayorista|12|docena|embajadora|embajador|cupon/.test(s))return `El modo mayorista se desbloquea al llegar a 12 piezas en el carrito. Cuando tengas esa cantidad, aparece el botón Activar modo Mayorista y se aplica el precio especial; el descuento configurado es de ${config.wholesaleDiscount}%. También puedes usar cupones de embajadoras si tienes un código activo.`;
      if(/material|oro|plata|acero|cuidado|cuidar|banado|baño/.test(s))return "Guía rápida de materiales: el acero inoxidable es resistente y práctico para uso diario; la plata tiene brillo clásico y requiere limpieza suave; el baño de oro da un acabado dorado elegante y conviene evitar perfumes, cloro y humedad excesiva. Guarda tus piezas por separado para conservar el brillo.";
      if(/regalo|novia|mama|madre|amiga|boda|cumple|aniversario|elegante|dorado|plateado|minimalista|fiesta/.test(s)){
        if(matches.length)return `Para ese estilo te recomiendo revisar estas piezas:\n${productNames(matches)}\n\nSi quieres afinar la elección, dime presupuesto aproximado, color preferido y si buscas algo discreto o llamativo. También puedes agregarlas al carrito y confirmar por WhatsApp.`;
        return "Me encantaría ayudarte a elegir. Dime tres datos: presupuesto, color preferido (dorado, plateado, negro, perla) y ocasión. Con eso te guío hacia la categoría ideal.";
      }
      if(/catalog|producto|pieza|anillo|collar|pulsera|zarcillo|charms|set|ver tienda|tienda/.test(s)){
        sectionGo("tienda");
        if(matches.length)return `Te llevé a la tienda. Algunas opciones disponibles son:\n${productNames(matches)}\n\nPuedes filtrar por categoría, material, colores o abrir la vista rápida de cada pieza.`;
        return "Te llevé a la tienda. Ahora mismo no encontré piezas con esa búsqueda exacta; prueba por categoría como Collares, Anillos, Pulseras o Zarcillos.";
      }
      if(/color|colores|variante|variantes/.test(s)){const colors=[...new Set(products.flatMap(p=>p.colors||[]))].filter(Boolean).join(", ");return `Colores disponibles según el catálogo actual: ${colors || "dorado, plateado, beige, marrón y negro"}. Si me dices el color y la ocasión, puedo sugerirte piezas que combinen mejor.`}
      if(/carrito|checkout|comprar|pedido|orden|confirmar/.test(s)){openLayer("cartDrawer");return cart.length?`Abrí tu carrito. Tienes ${qtyTotal()} pieza(s). Total: ${money(total())}${config.showBs?` / ${bs(total())}`:""}. Puedes revisar cantidades y pasar a checkout para enviar el pedido por WhatsApp.`:"Abrí el carrito, pero está vacío. Elige una pieza en la tienda y presiona Agregar al carrito; luego podrás confirmar por WhatsApp."}
      if(/favorito|favoritos|me gusta/.test(s)){showFavs=true;sectionGo("tienda");renderProducts();return favorites.size?`Te mostré tus favoritos. Tienes ${favorites.size} pieza(s) guardadas.`:"Aún no tienes favoritos. Marca el corazón en las piezas que quieras comparar después."}
      return "Puedo ayudarte con recomendaciones, catálogo, colores, materiales, pagos, tasa BCV, envíos, garantía, mayoristas y carrito. Para recomendarte mejor, dime qué buscas, para quién es, color preferido y presupuesto aproximado.";
    }
    function rememberChat(role,value){const clean=text(value);if(!clean||clean==="...")return;chatHistory.push({role,text:clean});chatHistory=chatHistory.slice(-10)}
    function addChat(text,who="bot",actions=[]){rememberChat(who==="user"?"user":"assistant",text);const b=document.createElement("div");b.className=`bubble ${who}`;b.textContent=text;if(actions.length&&who==="bot"){const box=document.createElement("div");box.className="chat-actions";actions.forEach(a=>{const btn=document.createElement("button");btn.className="chat-action";btn.type="button";btn.textContent=a.label;btn.onclick=a.run;box.appendChild(btn)});b.appendChild(box)}$("chatBody").appendChild(b);$("chatBody").scrollTop=$("chatBody").scrollHeight}
    function openChat(){if(config.aiEnabled===false){updateChatVisibility();return}if(!$("chatBody").children.length){addChat("Hola, bienvenid@ a Sublime. Soy tu Concierge IA de compras. Puedo ayudarte con recomendaciones, catálogo, pagos, envíos, garantía o carrito.","bot",[{label:"Ver tienda",run:()=>sectionGo("tienda")},{label:"Abrir carrito",run:()=>openLayer("cartDrawer")},{label:"WhatsApp",run:()=>window.open(whatsappUrl("Hola Sublime, necesito asesoría personalizada."),"_blank","noopener")}]);const qr=document.createElement("div");qr.className="quick-replies";["Busco un regalo","Catálogo","Pagos","Envíos","Mayoristas","Garantía","Carrito"].forEach(t=>{const btn=document.createElement("button");btn.type="button";btn.textContent=t;btn.onclick=()=>sendChat(t);qr.appendChild(btn)});$("chatBody").appendChild(qr)}$("chatWidget").classList.add("active");setTimeout(()=>$("chatInput")?.focus(),80)}
    async function sendChat(v){const msg=text(v||$("chatInput").value);if(!msg)return;addChat(msg,"user");$("chatInput").value="";const typing=document.createElement("div");typing.className="bubble bot typing";typing.textContent="Sublime está pensando...";$("chatBody").appendChild(typing);$("chatBody").scrollTop=$("chatBody").scrollHeight;try{let reply=await callAIAssistant(msg);if(!reply)reply=conciergeAnswer(msg);typing.remove();addChat(reply,"bot",[{label:"Ver tienda",run:()=>sectionGo("tienda")},{label:"Abrir carrito",run:()=>openLayer("cartDrawer")},{label:"WhatsApp",run:()=>window.open(whatsappUrl("Hola Sublime, quiero asesoría con mi compra."),"_blank","noopener")}])}catch(error){typing.remove();const reply=conciergeAnswer(msg);addChat(reply||"Ahora mismo no pude conectar con la IA, pero puedo seguir ayudándote con catálogo, pagos, envíos, garantía y carrito.","bot")}}

    $("adminAiProvider").onchange=applyAIProviderPreset;$("adminAiProvider").addEventListener("input",applyAIProviderPreset);
    document.querySelector("#checkoutModal .modal-head h2")?.replaceChildren(document.createTextNode("Finalizar pago"));
    document.querySelectorAll("#deliveryType option").forEach(option=>{if(option.textContent.trim().toLowerCase()==="caracas")option.remove()});
    document.addEventListener("click",e=>{
      const activateWholesale=e.target.closest("#activateWholesaleBtn");
      if(activateWholesale){
        if(!wholesaleQualified())return toast(`Agrega ${wholesaleThreshold()-qtyTotal()} pieza(s) más para activar mayorista`);
        setWholesaleMode(true);
        renderProducts();
        toast("Modo mayorista activado");
        return;
      }
      const deactivateWholesale=e.target.closest("#deactivateWholesaleBtn");
      if(deactivateWholesale){
        setWholesaleMode(false);
        renderProducts();
        toast("Modo detal activo");
        return;
      }
      const approve=e.target.closest("[data-review-approve]");
      if(approve){
        const r=reviews.find(item=>sameId(item.id,approve.dataset.reviewApprove));
        if(r){r.approved=!r.approved;saveReviews();renderReviews();renderAdminReviews();toast(r.approved?"Reseña publicada":"Reseña oculta")}
        return;
      }
      const delReview=e.target.closest("[data-review-delete]");
      if(delReview){
        reviews=reviews.filter(item=>!sameId(item.id,delReview.dataset.reviewDelete));
        saveReviews();renderReviews();renderAdminReviews();toast("Reseña eliminada");
      }
    });
    document.addEventListener("click",e=>{const swatch=e.target.closest(".swatch");if(!swatch)return;const photo=swatch.closest(".product")?.querySelector(".photo");if(!photo)return;let overlay=photo.querySelector(".color-overlay");if(!overlay){overlay=document.createElement("span");overlay.className="color-overlay";photo.appendChild(overlay)}overlay.style.backgroundColor=getComputedStyle(swatch).backgroundColor;overlay.classList.add("active");swatch.closest(".swatches")?.querySelectorAll(".swatch").forEach(item=>item.classList.toggle("selected",item===swatch));},true);
    document.addEventListener("click",e=>{const del=e.target.closest("[data-admin-delete]");if(del){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();deleteProduct(del.dataset.adminDelete,del);return;}},true);
    document.addEventListener("click",e=>{const del=e.target.closest("[data-admin-delete]");if(del){e.preventDefault();e.stopPropagation();deleteProduct(del.dataset.adminDelete,del);return;}const addBtn=e.target.closest("[data-add]");if(addBtn)add(addBtn.dataset.add);const fav=e.target.closest("[data-favorite]");if(fav){const id=fav.dataset.favorite;favorites.has(id)?favorites.delete(id):favorites.add(id);saveCart();renderProducts()}const det=e.target.closest("[data-detail]");if(det)detail(det.dataset.detail);const cat=e.target.closest("[data-category]");if(cat){selectedCategory=cat.dataset.category;$("tienda").scrollIntoView({behavior:"smooth"});renderProducts()}const mat=e.target.closest("[data-material]");if(mat){selectedMaterial=mat.dataset.material;renderProducts()}const plus=e.target.closest("[data-qty-plus]");if(plus)changeQty(plus.dataset.qtyPlus,1);const minus=e.target.closest("[data-qty-minus]");if(minus)changeQty(minus.dataset.qtyMinus,-1);const rem=e.target.closest("[data-remove]");if(rem){cart=cart.filter(x=>!sameId(x.id,rem.dataset.remove));saveCart();renderProducts()}const dl=e.target.closest("[data-download]");if(dl)downloadPhoto(dl.dataset.download);const img=e.target.closest("[data-detail-img]");if(img)$("detailMainImg").src=img.dataset.detailImg;const tab=e.target.closest("[data-admin-tab]");if(tab)switchAdminTab(tab.dataset.adminTab);const bank=e.target.closest("[data-bank-card]");if(bank&&!e.target.closest("input,button")){const id=String(bank.dataset.bankCard);selectedBank.has(id)?selectedBank.delete(id):selectedBank.add(id);renderPrivateBank()}const pub=e.target.closest("[data-bank-publish]");if(pub)publishBank([pub.dataset.bankPublish])});
    $("adminDrawer").addEventListener("input",e=>{if(e.target.matches("[data-bank-field]"))syncBankInputs()});
    $("adminDrawer").addEventListener("click",e=>{const card=e.target.closest(".piece-card");if(!card)return;if(e.target.closest("[data-bank-select]")){const id=String(e.target.closest("[data-bank-select]").dataset.bankSelect);selectedBank.has(id)?selectedBank.delete(id):selectedBank.add(id);card.classList.toggle("selected",selectedBank.has(id));const button=card.querySelector("[data-bank-select]");if(button)button.textContent=selectedBank.has(id)?"Seleccionado":"Seleccionar";updateOwnerStats();e.stopPropagation();return}const change=e.target.closest(".piece-card .file-btn");if(change){e.preventDefault();change.nextElementSibling?.click();e.stopPropagation();return}if(!e.target.closest("input,textarea,button"))e.stopPropagation()},true);
    $("adminDrawer").addEventListener("change",async e=>{const input=e.target.closest("[data-bank-images]");if(!input||!input.files[0])return;try{const p=config.privatePieces.find(item=>sameId(item.id,input.dataset.bankId));if(!p)return;const foto=await readImageFile(input.files[0]);p.imagenes=[foto];Object.assign(p,productoConAliases(p));localStorage.setItem(LS,JSON.stringify(config));const card=input.closest("[data-bank-card]");const image=card?.querySelector("img");if(image)image.src=foto;input.value="";setDirty(true);toast("Imagen del producto actualizada")}catch(error){toast(String(error))}});
    ["searchInput","searchInputTop","quickSearchMirror","minPrice","maxPrice"].forEach(id=>$(id)?.addEventListener("input",()=>{if(["searchInput","searchInputTop","quickSearchMirror"].includes(id)){const v=$(id).value;$("searchInput").value=v;$("searchInputTop").value=v;$("quickSearchMirror").value=v}renderProducts()}));
    async function applyCouponCode(event){
      const fromCheckout=event?.currentTarget?.id==="applyCheckoutCoupon";
      coupon=((fromCheckout?$("checkoutCouponInput")?.value:$("couponInput")?.value)||$("checkoutCouponInput")?.value||$("couponInput")?.value||"").trim().toUpperCase();
      if($("couponInput"))$("couponInput").value=coupon;
      if($("checkoutCouponInput"))$("checkoutCouponInput").value=coupon;
      appliedCoupon=null;
      if(!coupon){renderCart();return toast("Escribe un cupón")}
      appliedCoupon=await validateAmbassadorCoupon(coupon);
      if(!appliedCoupon){
        const local=availableCoupons().find(item=>item.active!==false&&String(item.code||"").trim().toUpperCase()===coupon);
        if(local)appliedCoupon={...local,source:"general"};
      }
      renderCart();
      toast(appliedCoupon?`Cupón ${coupon} aplicado`:"Cupón no encontrado o inactivo");
    }
    $("sortSelect").onchange=renderProducts;$("menuToggle").onclick=()=>$("mainNav").classList.toggle("mobile-active");$("searchToggle").onclick=()=>$("searchPanel").classList.toggle("active");$("goShop").onclick=()=>$("tienda").scrollIntoView({behavior:"smooth"});$("cartButton").onclick=()=>openLayer("cartDrawer");if($("heroOpenCart"))$("heroOpenCart").onclick=()=>openLayer("cartDrawer");$("footerCart").onclick=()=>openLayer("cartDrawer");$("closeCart").onclick=()=>closeLayer("cartDrawer");$("cartBackdrop").onclick=()=>closeLayer("cartDrawer");$("checkoutButton").onclick=openCheckout;$("closeCheckout").onclick=()=>closeLayer("checkoutModal");$("checkoutBackdrop").onclick=()=>closeLayer("checkoutModal");$("closeDetail").onclick=()=>closeLayer("detailModal");$("detailBackdrop").onclick=()=>closeLayer("detailModal");$("clearCartButton").onclick=()=>{cart=[];coupon="";appliedCoupon=null;saveCart();renderProducts()};$("continueShoppingButton").onclick=()=>{closeLayer("cartDrawer");$("tienda").scrollIntoView({behavior:"smooth"})};$("applyCoupon").onclick=applyCouponCode;$("applyCheckoutCoupon")&&($("applyCheckoutCoupon").onclick=applyCouponCode);$("couponInput")?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();applyCouponCode()}});$("checkoutCouponInput")?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();applyCouponCode()}});$("resetFilters").onclick=()=>{selectedCategory="Todos";selectedMaterial="Todos";showFavs=false;["searchInput","searchInputTop","quickSearchMirror","minPrice","maxPrice"].forEach(id=>$(id).value="");renderProducts()};$("onlyFavs").onclick=()=>{showFavs=!showFavs;renderProducts()};$("favoritesButton").onclick=()=>{showFavs=true;$("tienda").scrollIntoView({behavior:"smooth"});renderProducts()};$("syncInventoryBtn").onclick=async()=>{selectedCategory="Todos";selectedMaterial="Todos";showFavs=false;["searchInput","searchInputTop","quickSearchMirror","minPrice","maxPrice"].forEach(id=>{if($(id))$(id).value=""});if(databaseApiEnabled()){const latest=await refreshProductsFromDatabaseApi({silent:false,forceRender:true});startDatabaseApiAutoRefresh();if(latest===null&&!firestoreOnline)await loadSharedCatalog()}else{await startFirestoreCatalog();if(!firestoreOnline)await loadSharedCatalog()}persist();renderProducts();toast(firestoreOnline?"Inventario sincronizado con la nube":"Inventario actualizado desde respaldo local")};$("categorySelect")&&($("categorySelect").onchange=e=>{selectedCategory=e.target.value;renderProducts()});$("materialSelect")&&($("materialSelect").onchange=e=>{selectedMaterial=e.target.value;renderProducts()});$("deliveryType").onchange=updateDeliveryFields;$("paymentMethod").onchange=updatePaymentBox;$("invoiceBtn").onclick=invoice;$("checkoutForm").onsubmit=e=>{e.preventDefault();confirmOrder()};$("reviewForm")&&($("reviewForm").onsubmit=e=>{e.preventDefault();submitReview()});$("exportSalesBtn")&&($("exportSalesBtn").onclick=exportSalesCsv);$("contactForm").onsubmit=e=>{e.preventDefault();window.open(whatsappUrl(`Hola ${config.brandName}, tengo una consulta:\nNombre: ${$("contactName").value}\nWhatsApp: ${$("contactPhone").value}\nConsulta: ${$("contactMessage").value}`),"_blank","noopener")};
    $("adminOpen").onclick=()=>{openLayer("adminDrawer");setOwner(isOwner())};$("closeAdmin").onclick=()=>closeLayer("adminDrawer");$("adminBackdrop").onclick=()=>closeLayer("adminDrawer");$("ownerLoginBtn").onclick=async()=>{if($("ownerUser").value.trim().toLowerCase()!==OWNER_USER.toLowerCase())return toast("Usuario incorrecto");if(await sha256(`${OWNER_USER}:${$("ownerPass").value}`)!==OWNER_HASH)return toast("Contraseña incorrecta");$("ownerPass").value="";setOwner(true);toast("ADMIN activado")};$("logoutAdminBtn").onclick=()=>{setOwner(false);toast("Sesión cerrada")};$("ownerPreviewStore").onclick=()=>{closeLayer("adminDrawer");$("inicio").scrollIntoView({behavior:"smooth"})};$("saveAdminBtn").onclick=()=>{collectAdmin();persist();applyTheme();hydrate();renderCategories();renderProducts();loadAdmin();setDirty(false);toast("Cambios guardados")};$("adminDrawer").addEventListener("input",e=>{if(!isOwner()&&!e.target.closest("#adminLogin"))return;if(isOwner()&&!e.target.closest("#adminLogin"))setDirty(true);if(e.target.matches("[data-p-field]"))autosaveProducts();if(e.target.id==="bankSearch")renderPrivateBank();if(e.target.matches("[data-bank-price],[data-bank-stock]"))syncBankInputs()});$("adminDrawer").addEventListener("change",async e=>{if(!isOwner()&&!e.target.closest("#adminLogin"))return;const target=e.target.closest("[data-image-target]"),prod=e.target.closest("[data-product-images]");try{if(target&&target.files[0]){const src=await readImageFile(target.files[0]);$(target.dataset.imageTarget).value=src;collectAdmin();persist();hydrate();renderProducts();setDirty(false);toast("Imagen cargada")}if(prod&&prod.files.length){const card=prod.closest("[data-admin-product]"),area=card.querySelector('[data-p-field="images"]');const foto=await readImageFile(prod.files[0]);area.value=foto;prod.value="";syncAdminProducts();persist();renderProducts();updateOwnerStats();setDirty(false);toast("Foto del producto actualizada")}}catch(err){toast(String(err))}});
    $("addProductBtn").onclick=addAdminProduct;$("sortAdminProductsBtn").onclick=()=>{syncAdminProducts();products.sort((a,b)=>a.name.localeCompare(b.name,"es"));config.products=products;persist();renderAdminProducts();renderProducts();setDirty(false);toast("Productos ordenados")};$("updateRateBtn").onclick=()=>updateRate(false);if($("selectAllBankBtn"))$("selectAllBankBtn").onclick=()=>{config.privatePieces.forEach(p=>selectedBank.add(String(p.id)));renderPrivateBank()};if($("publishSelectedBankBtn"))$("publishSelectedBankBtn").onclick=()=>publishBank([...selectedBank]);if($("deleteSelectedBankBtn"))$("deleteSelectedBankBtn").onclick=()=>{syncBankInputs();if(!selectedBank.size)return toast("Selecciona piezas");if(!confirm(`Eliminar ${selectedBank.size} pieza(s) del banco privado?`))return;config.privatePieces=config.privatePieces.filter(p=>!selectedBank.has(String(p.id)));selectedBank.clear();persist();renderPrivateBank();setDirty(false);toast("Piezas privadas eliminadas")};$("saveDatabaseConnectionBtn")&&($("saveDatabaseConnectionBtn").onclick=saveDatabaseConnection);$("testDatabaseConnectionBtn")&&($("testDatabaseConnectionBtn").onclick=checkDatabaseConnection);$("resetDatabaseConnectionBtn")&&($("resetDatabaseConnectionBtn").onclick=resetDatabaseConnection);$("exportConfigBtn").onclick=()=>{$("configJson").value=JSON.stringify(config,null,2);navigator.clipboard?.writeText($("configJson").value);toast("JSON copiado")};$("importConfigBtn").onclick=()=>{try{config=mergeConfig(clone(DEFAULT),JSON.parse($("configJson").value));products=config.products;persist();hydrate();renderCategories();renderProducts();loadAdmin();toast("Configuración importada")}catch{toast("JSON inválido")}};$("resetConfigBtn").onclick=()=>{if(confirm("Restaurar demo?")){config=clone(DEFAULT);products=config.products;cart=[];favorites.clear();persist();hydrate();renderCategories();renderProducts();loadAdmin()}};
    function setupCatalogPaste(){const status=$("catalogImportStatus"),drop=$("catalogDrop");if(!status||!drop||$("catalogPaste"))return;const wrap=document.createElement("div");wrap.className="field catalog-paste-field";wrap.innerHTML='<label for="catalogPaste">Pegar texto del catálogo</label><textarea id="catalogPaste" placeholder="ID IMAGEN NOMBRE DEL PRODUCTO DETAL Al mayor"></textarea><button type="button" class="btn btn-light" id="parseCatalogPasteBtn">Procesar texto</button>';status.before(wrap);$("parseCatalogPasteBtn").onclick=()=>{const items=parseTextCatalog($("catalogPaste").value);if(!items.length)return toast("No encontré filas con ID, nombre y precio");previewImport(items);toast("Catálogo procesado")}}
    async function handleFile(file){try{$("catalogImportStatus").textContent=`Leyendo ${file.name}...`;previewImport(await readCatalogFile(file));toast("Catálogo previsualizado")}catch(e){console.error(e);$("catalogImportStatus").textContent=`No pude leer el catálogo: ${e.message||e}`;toast("No pude leer el catálogo")}}
    $("catalogDrop").onclick=()=>$("catalogFile").click();$("catalogFile").onchange=e=>e.target.files[0]&&handleFile(e.target.files[0]);["dragenter","dragover"].forEach(ev=>$("catalogDrop").addEventListener(ev,e=>{e.preventDefault();$("catalogDrop").classList.add("drag")}));["dragleave","drop"].forEach(ev=>$("catalogDrop").addEventListener(ev,e=>{e.preventDefault();$("catalogDrop").classList.remove("drag")}));$("catalogDrop").addEventListener("drop",e=>{const f=e.dataTransfer.files[0];if(f)handleFile(f)});if($("sendImportToBankBtn"))$("sendImportToBankBtn").onclick=importToBank;$("appendCatalogBtn").onclick=()=>publishImport(false);$("replaceCatalogBtn").onclick=()=>confirm("Reemplazar catálogo público?")&&publishImport(true);$("syncDriveBtn").onclick=()=>syncDriveCatalog(false);if($("sendDriveToBankBtn"))$("sendDriveToBankBtn").onclick=()=>importToBank();
    $("chatLaunch").onclick=openChat;$("chatClose").onclick=()=>$("chatWidget").classList.remove("active");$("chatForm").onsubmit=e=>{e.preventDefault();sendChat()};document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"&&isOwner()){e.preventDefault();$("saveAdminBtn").click()}if(e.key==="Escape")["cartDrawer","checkoutModal","detailModal","adminDrawer"].forEach(closeLayer)});addEventListener("scroll",()=>{$("header").classList.toggle("scrolled",scrollY>16);let current="inicio";document.querySelectorAll("main section[id]").forEach(sec=>{if(sec.getBoundingClientRect().top<innerHeight*.42)current=sec.id});document.querySelectorAll(".nav a").forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+current))},{passive:true});
    function observeMotionTargets(){document.querySelectorAll(".reveal,.product,.cat,.mode-card,.payment-box,.card").forEach(el=>{if(el.dataset.motionObserved)return;el.dataset.motionObserved="1";revealObserver.observe(el)})}
    const revealObserver=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add("in");revealObserver.unobserve(en.target)}}),{threshold:.12,rootMargin:"0px 0px -6% 0px"});
    function prioritizeCatalog(){const hero=$("inicio"),shop=$("tienda");if(hero&&shop)hero.insertAdjacentElement("afterend",shop)}
    function ensureCouponAdminHost(){if(!$("admin-pagosAdmin"))return;if(!$("couponAdminHost")){const host=document.createElement("div");host.id="couponAdminHost";$("admin-pagosAdmin").appendChild(host)}if(!$("wholesaleAdminHost")){const host=document.createElement("div");host.id="wholesaleAdminHost";$("admin-pagosAdmin").appendChild(host)}}
    $("adminOpen").onclick=()=>{openLayer("adminDrawer");setOwner(isOwner())};
    $("closeAdmin").onclick=()=>closeLayer("adminDrawer");
    $("adminBackdrop").onclick=()=>closeLayer("adminDrawer");
    const adminLoginStatus=(message,state="")=>{const el=$("adminLoginStatus");if(el){el.textContent=message;el.className=`admin-login-status ${state}`}};
    const attemptAdminLogin=async()=>{const user=$("ownerUser").value.trim(),pass=$("ownerPass").value;if(!user||!pass){adminLoginStatus("Completa usuario y contraseña.","error");return}if(user.toLowerCase()!==OWNER_USER.toLowerCase()){adminLoginStatus("El usuario no coincide.","error");toast("Usuario incorrecto");return}if(await sha256(`${OWNER_USER}:${pass}`)!==OWNER_HASH){adminLoginStatus("La contraseña no es válida.","error");toast("Contraseña incorrecta");return}$("ownerPass").value="";adminLoginStatus("Acceso concedido. Abriendo tu panel...","success");setOwner(true);toast("ADMIN activado")};
    $("ownerLoginBtn").onclick=attemptAdminLogin;
    ["ownerUser","ownerPass"].forEach(id=>$(id)?.addEventListener("keydown",e=>{if(e.key==="Enter")attemptAdminLogin()}));
    $("toggleOwnerPass")?.addEventListener("click",()=>{const input=$("ownerPass"),button=$("toggleOwnerPass"),visible=input.type==="text";input.type=visible?"password":"text";button.setAttribute("aria-label",visible?"Mostrar contraseña":"Ocultar contraseña");button.innerHTML=`<i data-lucide="${visible?"eye":"eye-off"}"></i>`;lucide.createIcons()});
    $("logoutAdminBtn")?.addEventListener("click",()=>{setOwner(false);closeLayer("adminDrawer")});
    observeMotionTargets();
    ensureCouponAdminHost();renderCouponAdmin();renderWholesaleAdmin();if($("adminGoogleSheetsWebhook")){$("adminGoogleSheetsWebhook").value=config.googleSheetsWebhook||"";$("adminGoogleSheetsWebhook").addEventListener("input",e=>{config.googleSheetsWebhook=e.target.value.trim()})}
    localStorage.removeItem(LS_OWNER);clearWholesaleAccess();prioritizeCatalog();cargarProductos();migrateBrandLogo();document.querySelectorAll("#adminDrawer button").forEach(btn=>btn.type="button");setupCatalogPaste();applyTheme();hydrate();renderCategories();renderizarTiendaPublica();startFirestoreCatalog();startAmbassadorProgram();renderReviews();renderAdminReviews();renderSales();renderAmbassadorAdmin();setOwner(false);lucide.createIcons();scheduleRateSync();if(config.driveAutoSync&&config.driveCatalogUrl)syncDriveCatalog(true);
  


