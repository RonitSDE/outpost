type Provider = { request: (args:any)=>Promise<any>; on?: (event:string,fn:(...args:any[])=>void)=>void };
const detected = new Map<string,{name:string;provider:Provider}>();
const wired = new WeakSet<object>();
window.addEventListener('eip6963:announceProvider',((event:CustomEvent)=>{
  const {info,provider}=event.detail||{};
  if(typeof info?.uuid==='string'&&typeof info?.name==='string'&&typeof provider?.request==='function')
    detected.set(info.uuid,{name:info.name.slice(0,60),provider});
}) as EventListener);
window.dispatchEvent(new Event('eip6963:requestProvider'));

function track(provider:Provider){
  if(!wired.has(provider)){
    wired.add(provider);
    for(const event of ['accountsChanged','chainChanged','disconnect']) provider.on?.(event,()=>window.dispatchEvent(new Event('outpost:wallet-change')));
  }
  return provider;
}

export async function chooseWallet(chain:any,projectId:string,current?:Provider):Promise<Provider>{
  if(current) return current;
  window.dispatchEvent(new Event('eip6963:requestProvider'));
  return new Promise((resolve,reject)=>{
    const dialog=document.createElement('dialog');dialog.className='experience-dialog wallet-picker';dialog.setAttribute('aria-label','Connect your wallet');
    const heading=document.createElement('h2');heading.textContent='Keep your captain.';
    const detail=document.createElement('p');detail.textContent='Choose a wallet to save your identity. Linking signs a message; it does not approve a payment.';
    const status=document.createElement('p');status.className='hint';status.setAttribute('role','status');
    const list=document.createElement('div');list.className='wallet-options';
    const close=document.createElement('button');close.textContent='Continue without connecting';
    dialog.append(heading,detail,list,status,close);document.body.append(dialog);dialog.showModal();
    let done=false,wc:any=null;
    function end(provider?:Provider){if(done)return;done=true;dialog.close();dialog.remove();if(provider)resolve(track(provider));else {void wc?.disconnect().catch(()=>{});reject(Error('Wallet connection cancelled. Your game is still available.'));}}
    close.onclick=()=>end();dialog.addEventListener('cancel',e=>{e.preventDefault();end()});
    const providers=[...detected.values()];
    if(window.ethereum&&!providers.some(x=>x.provider===window.ethereum))providers.push({name:'Browser wallet',provider:window.ethereum});
    for(const entry of providers){const b=document.createElement('button');b.textContent=entry.name+' →';b.onclick=()=>end(entry.provider);list.append(b)}
    if(!providers.length){const text=document.createElement('p');text.textContent='No browser wallet detected. Open this site in your wallet’s browser, or connect with a QR code below.';list.append(text)}
    if(projectId){
      const button=document.createElement('button');button.textContent='WalletConnect · mobile or QR';list.append(button);
      button.onclick=async()=>{
        button.disabled=true;status.textContent='Preparing your secure connection…';
        try{
          const {default:EthereumProvider}=await import('@walletconnect/ethereum-provider');
          wc=await EthereumProvider.init({projectId,chains:[chain.id],showQrModal:false,rpcMap:{[chain.id]:chain.rpc},metadata:{name:'Outpost Rivals',description:'Six-round strategy. A captain with history.',url:location.origin,icons:[location.origin+'/mark.svg']}});
          if(done){void wc.disconnect().catch(()=>{});return}
          wc.on('display_uri',async(uri:string)=>{
            try {
            const {default:QRCode}=await import('qrcode');const data=await QRCode.toDataURL(uri,{width:280,margin:2});
            if(done)return;
            list.querySelector('.wallet-qr')?.remove();
            const block=document.createElement('div');block.className='wallet-qr';
            const img=document.createElement('img');img.src=data;img.alt='Scan with your WalletConnect-compatible wallet';
            const copy=document.createElement('button');copy.textContent='Copy connection URI';copy.onclick=()=>navigator.clipboard?.writeText(uri).then(()=>{status.textContent='Connection URI copied. Paste it into your wallet’s WalletConnect option.'}).catch(()=>{status.textContent='Clipboard unavailable. Scan the QR code instead.'});
            block.append(img,copy);list.append(block);status.textContent='Scan from your mobile wallet. On this device, copy the connection URI into your wallet. Confirm the displayed network.';
            } catch { if(!done) status.textContent='Could not display the connection code. Close and retry, or use a browser wallet.'; }
          });
          await wc.connect();if(done){void wc.disconnect().catch(()=>{});return}end(wc);
        }catch(e:any){if(!done){status.textContent=e.message||'Could not connect. Try again.';button.disabled=false;}}
      };
    }else{status.textContent='Mobile QR connection is not enabled on this host. Browser-wallet play remains available.'}
  });
}
