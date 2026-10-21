'use strict';
// Nessun dato di questi moduli viene trasmesso o salvato.
const UM2026 = {
  bonusMamme(reddito, mesi) {
    if (!Number.isFinite(reddito) || reddito < 0) return {errore:'Inserisci il reddito da lavoro 2026, anche se pari a zero.'};
    if (reddito > 40000) return {importo:0,mesi:0,incerti:0,motivo:'Il reddito da lavoro indicato supera 40.000 €.'};
    let validi=0, incerti=0;
    for(const m of mesi) {
      if(m.figli==='no' || m.lavoro==='no') continue;
      if(m.figli==='?' || m.lavoro==='?') {incerti++;continue;}
      if(m.figli==='due' || (m.figli==='tre' && m.lavoro==='ammesso')) validi++;
    }
    return {importo:validi*60,mesi:validi,incerti};
  },
  affitto(reddito,canone,requisiti) {
    if (!Number.isFinite(reddito)||reddito<0||!Number.isFinite(canone)||canone<=0) return {errore:'Inserisci reddito individuale valido e canone annuo maggiore di zero.'};
    if(reddito>35000) return {importo:0,motivo:'Il reddito individuale indicato supera 35.000 €.'};
    if(requisiti.includes('no')) return {importo:0,motivo:'Almeno un requisito è stato indicato come non soddisfatto.'};
    if(requisiti.includes('?')) return {errore:'Verifica tutti i requisiti prima di stimare il contributo.'};
    return {importo:Math.min(canone*.5,6000)};
  },
  statoAffitto(now=new Date()) {
    const start=Date.parse('2026-10-07T12:00:00+02:00'),end=Date.parse('2026-10-28T12:00:00+01:00');
    return now.getTime()<start?'non_aperto':now.getTime()<end?'aperto':'chiuso';
  }
};
if(typeof module!=='undefined') module.exports=UM2026;
if(typeof document!=='undefined') {
  const money=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR'}).format(n);
  const numeric=id=>{const s=document.getElementById(id).value;return s.trim()===''?NaN:Number(s);};
  const months=['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];
  const mamma=document.getElementById('um-mamme-detail');
  if(mamma){
    mamma.className='um-update';
    mamma.innerHTML=`<h2>Quanto potrebbe valere il Bonus Mamme 2026?</h2><p>Completa questa verifica facoltativa dopo il questionario. La stima riguarda solo questo bonus, non la somma di tutti gli aiuti.</p><details><summary>Apri il dettaglio dei mesi e dei requisiti</summary><p>Per ciascun mese indica se ricorrono i requisiti: <strong>due figli, con il più piccolo sotto 10 anni</strong>, oppure <strong>almeno tre figli, con il più piccolo sotto 18 anni</strong>. Conta dal mese di nascita del secondo figlio e includi il mese del compleanno limite, secondo gli esempi INPS. Considera adozioni/affidamenti preadottivi e responsabilità genitoriale secondo la circolare.</p><p>Il lavoro ammesso comprende dipendenti pubbliche/private (escluse domestiche) e autonome nelle gestioni obbligatorie, Casse e Gestione Separata. Indica solo mesi o frazioni con attività utile; verifica sospensioni. Con almeno tre figli, anche un solo giorno a tempo indeterminato esclude il mese; l’apprendistato rientra nell’indeterminato. I mesi futuri sono una previsione da riconfermare.</p><label for="um-income">Somma dei redditi da lavoro 2026 (€), non ISEE</label><input type="number" id="um-income" min="0" step="0.01" inputmode="decimal"><p class="um-note">Usa il reddito rilevante secondo la circolare, inclusi redditi sostitutivi durante il rapporto e regimi agevolati; non sommare NASpI/DIS-COLL. Per le dipendenti è al netto dei contributi obbligatori trattenuti. Se incerto, verifica con il consulente.</p><div id="um-months"></div><button type="button" id="um-calc-mamme">Calcola la stima del bonus</button><output id="um-mamme-result" aria-live="polite">Completa i dati per ottenere una stima.</output><p><strong>Procedura verificata il 19 ottobre 2026:</strong> la circolare prevede pagamento unico a dicembre. Apertura delle domande da comunicare con successivo messaggio INPS; non applicare le scadenze 2025.</p><p><a href="https://www.inps.it/it/it/inps-comunica/atti/circolari-messaggi-e-normativa/dettaglio.circolari-e-messaggi.2026.10.circolare-numero-106-del-16-10-2026_16394.html" target="_blank" rel="noopener">Fonte: INPS, circolare 106 del 16 ottobre 2026</a>. I dati restano nel dispositivo e non vengono salvati.</p></details>`;
    document.getElementById('um-months').innerHTML=months.map((m,i)=>`<div class="um-month"><strong>${m}</strong><label for="um-kids-${i}">Requisito figli<select id="um-kids-${i}"><option value="?">Da verificare</option><option value="no">Non soddisfatto</option><option value="due">2 figli: requisito soddisfatto</option><option value="tre">3+ figli: requisito soddisfatto</option></select></label><label for="um-work-${i}">Lavoro nel mese<select id="um-work-${i}"><option value="?">Da verificare</option><option value="no">Nessuna attività utile / esclusa</option><option value="ammesso">Attività ammessa senza indeterminato</option><option value="indeterminato">Indeterminato anche parziale</option></select></label></div>`).join('');
    document.getElementById('um-calc-mamme').addEventListener('click',()=>{
      const r=UM2026.bonusMamme(numeric('um-income'),months.map((_,i)=>({figli:document.getElementById('um-kids-'+i).value,lavoro:document.getElementById('um-work-'+i).value})));
      document.getElementById('um-mamme-result').textContent=r.errore||r.motivo||(r.incerti?`Stima parziale: ${money(r.importo)} per ${r.mesi} mesi indicati come utili. Restano ${r.incerti} mesi da verificare; non è un risultato annuale completo.`:`Stima orientativa: ${money(r.importo)} per ${r.mesi} mesi indicati come utili. Massimo annuo 720 €. La verifica INPS resta necessaria.`);
    });
  }
  const affitto=document.getElementById('um-affitto-detail');
  if(affitto){
    const qs=[['separazione','Sono separato/a o divorziato/a e ho il provvedimento richiesto'],['casa','La casa familiare di proprietà mia, dell’altro genitore o dei figli conviventi è assegnata all’altro genitore'],['figli','Ho almeno un figlio a carico sotto i 21 anni alla data del 7 ottobre 2026'],['residenza','Sono residente in Italia e dispongo dei dati di residenza richiesti dal decreto'],['contratto','Il contratto di affitto è registrato e intestato a me'],['immobili','Non possiedo altri immobili residenziali nel Comune della casa familiare o nei Comuni limitrofi entro 50 km, salvo la casa familiare ammessa'],['cura','Sono in regola con gli obblighi di cura e mantenimento dei figli'],['sussidi','Non ricevo altri sussidi pubblici per analoghe finalità abitative'],['erp','Non sono assegnatario/a di un alloggio di edilizia residenziale pubblica']];
    affitto.className='um-update';
    affitto.innerHTML=`<h2>Verifica il sostegno affitto MIT 2026</h2><p>Per genitori separati o divorziati: 50% del canone annuo, fino a 6.000 €. Sono necessari tutti i requisiti e il collocamento utile in graduatoria; la stima non garantisce l’erogazione.</p><p id="um-affitto-status"></p><details><summary>Apri la verifica di requisiti e importo</summary><label for="um-affitto-income">Reddito individuale dell’ultima dichiarazione disponibile (€), non ISEE</label><input type="number" id="um-affitto-income" min="0" step="0.01" inputmode="decimal"><label for="um-affitto-canone">Canone annuo di locazione (€)</label><input type="number" id="um-affitto-canone" min="0.01" step="0.01" inputmode="decimal">${qs.map(([id,q])=>`<label for="um-${id}">${q}<select id="um-${id}"><option value="?">Da verificare</option><option value="si">Sì</option><option value="no">No</option></select></label>`).join('')}<button type="button" id="um-calc-affitto">Verifica la stima</button><output id="um-affitto-result" aria-live="polite">Completa tutti i requisiti per ottenere una stima.</output><p><a href="https://mit.gov.it/node/13118" target="_blank" rel="noopener">Requisiti, avviso e FAQ ufficiali MIT</a> · <a href="https://sostegnoabitativogenitoriseparati.mit.gov.it/" target="_blank" rel="noopener">Piattaforma di domanda MIT</a></p><p class="um-note">Fonte: decreto MIT-MEF 14 settembre 2026, GU 239 del 14 ottobre 2026; avviso del 7 ottobre. Verificato il 19 ottobre 2026. Non è una domanda INPS. Dati elaborati solo nel dispositivo, senza salvataggio.</p></details>`;
    const status=()=>UM2026.statoAffitto();
    const display={aperto:'Finestra indicata dal MIT: dal 7 ottobre alle ore 12 del 28 ottobre 2026.',chiuso:'La finestra del 2026 è scaduta il 28 ottobre 2026 alle ore 12. La stima sotto è solo informativa: verifica sul MIT eventuali nuovi avvisi.',non_aperto:'La finestra indicata dal MIT inizia il 7 ottobre 2026 alle ore 12.'};
    document.getElementById('um-affitto-status').textContent=display[status()];
    document.getElementById('um-calc-affitto').addEventListener('click',()=>{
      const r=UM2026.affitto(numeric('um-affitto-income'),numeric('um-affitto-canone'),qs.map(([id])=>document.getElementById('um-'+id).value));
      document.getElementById('um-affitto-result').textContent=r.errore||r.motivo||`Stima teorica: ${money(r.importo)} annui. È subordinata a verifica documentale, graduatoria e risorse disponibili.${status()==='chiuso'?' La finestra 2026 è scaduta: questa stima non permette di inviare una nuova domanda.':''}`;
    });
  }
}
