import { Ip } from "./model.js";
const btnCalcular = document.getElementById('calcular');
const btnBuscar = document.getElementById('buscar');
const btnLimpiar = document.getElementById('limpiar');
const ip = document.getElementById('ip');
const mascara = document.getElementById('mascara');
const subredes = document.getElementById('subredes');
const contenido = document.getElementById('contenido');
const sprite = document.getElementById('espera');
const btnSubir = document.getElementById('subir');


window.addEventListener('scroll', (e) => {
    if(window.scrollY >= 2000){
        btnSubir.style.display = 'flex';
    }else{
        btnSubir.style.display = 'none';
    }
})

btnSubir.children[0].addEventListener('click', (e) => {
    window.scroll(0, 0);
})

ip.addEventListener('keydown', (e) => {
    if(isNaN(e.key) && e.key != '.' && e.key != "Backspace" && e.key != "ArrowLeft" && e.key != "ArrowRight" && e.key != "Tab"){
        e.preventDefault();
    }else{
        ip.classList.remove('border', 'border-danger', 'border-2');
        mascara.classList.remove('border', 'border-danger', 'border-2');
    }
})

mascara.addEventListener('keydown', (e) => {
    isNumber(mascara, e);
});

subredes.addEventListener('keydown', (e) => {
    isNumber(subredes, e);

});

subredes.addEventListener('focusout', (e) => {
    if(subredes.value != ''){
        btnCalcular.removeAttribute("disabled");
    }else{
        btnCalcular.setAttribute("disabled", "");
    }
});

mascara.addEventListener('focusout', (e) => {
    if(mascara.value != ''){
        btnBuscar.removeAttribute("disabled");
    }else{
        btnBuscar.setAttribute("disabled", "");
    }
});

btnBuscar.addEventListener('click', (e) => {
    const numMask = parseInt(mascara.value, 10);
    let red;

    e.preventDefault;

    let nodoError = document.getElementById('error');
        if (nodoError) {
            nodoError.remove();
        }
    
    if(contenido.children.length > 0){
        contenido.removeChild(contenido.children[0]);
    }

    if(mascara.value == ''){
        mascara.classList.add('border', 'border-danger', 'border-2');
        contenido.style.display = "none";
        return;
    }
    
    if(numMask > 32 || numMask < 8){
        error("ERROR en la mascara ", mascara.value);
        contenido.style.display = "none";
        return;
    }
    
    red = objetoIp(ip, numMask);

    if(red){
        sprite.remove();
        contenido.style.display = 'flex';

        contenido.appendChild(showBusqueda(red));
        contenido.addEventListener('load', () => {
        })

    }else{
        return;
    }


})

btnCalcular.addEventListener('click', (e) => {
    const valorSubredes = parseInt(subredes.value, 10);
    let red;
    
    e.preventDefault;

    if(contenido.children.length > 0){
        contenido.removeChild(contenido.children[0]);
    }

    if(ip.value == ''){
        ip.classList.add('border', 'border-danger', 'border-2');
        return;
    }

    red = objetoIp(ip, 0, valorSubredes);

    if(red){
        sprite.remove();

        contenido.appendChild(showSubredes(red));
        contenido.style.display = 'flex';    
    }else{return}
});

btnLimpiar.addEventListener('click', _ =>{
    ip.value = '';
    mascara.value = '';
    subredes.value = '';
    btnBuscar.setAttribute("disabled", "");
    btnCalcular.setAttribute("disabled", "");

    location.reload();
})

function isNumber(mascara, e){
    if(isNaN(e.key) && e.key != "Backspace" && e.key != "ArrowLeft" && e.key != "ArrowRight" && e.key != "Tab"){
        e.preventDefault();
    }else{
        mascara.classList.remove('border', 'border-danger', 'border-2');
    }
}

function isIp(valorIp){
    const regx = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (regx.test(valorIp)) {
        let nodoError = document.getElementById('error');
        if (nodoError) {
            nodoError.remove();
        }
        return true;
    }else{
        error("ERROR en la ip ", valorIp);
        return false;
    }
}

function objetoIp(ip, numMask, valorSubredes){
    let valorIp;

    if (isIp(ip.value)) {
        valorIp = ip.value.split('.');
        if(valorIp[0] == 127){
            error("Error en la ip, esta reservada para loopback ", ip.value);
            contenido.style.display = "none";
            return;
        }
        valorIp = valorIp.map(function(item){
            return Number(item);
        })

        return new Ip(valorIp, numMask, valorSubredes);
    }else{
        contenido.style.display = "none";
        document.getElementsByTagName("main")[0].appendChild(sprite);
    }
}

function error(msg, value){
    const formulario = document.getElementById('formulario');
    let nodoError = document.getElementById('error');
    const text = document.createTextNode(msg + value)

    if (nodoError) {
        nodoError.remove();
    }

    nodoError = document.createElement('p');
    nodoError.appendChild(text);
    nodoError.id = 'error';
    nodoError.classList.add('text-center');

    formulario.appendChild(nodoError);
}

function showSubredes(red){
    const div = document.createElement('div');
    let cont = 0;
    
    div.appendChild(infoRed(red));

    while (cont < red.subRedes.length) {
        div.appendChild(createTable(red.subRedes[cont], red, cont));
        cont++;
    }

    div.classList.add("w-100", "d-flex", "flex-column", "align-items-center");

    return div;
}

function showBusqueda(red){
    const div = document.createElement('div');
    div.classList.add("w-100", "d-flex", "flex-column", "align-items-center");
    
    div.appendChild(infoRed(red));
    div.appendChild(createTable(red.busqueda, red, red.numBusqueda-1));

    return div;
}

function createTable(subRed, red, cont){
    const resp = document.createElement('table');
    const thNet = document.createTextNode("Network");
    const thHm = document.createTextNode("HostMin");
    const thHM = document.createTextNode("HostMax");
    const thB = document.createTextNode("Broadcast");

    const network = document.createTextNode(`${subRed.network.join('.')}/${red.Cid}`);
    const hostMin = document.createTextNode(`${subRed.hostMin.join('.')}`);
    const hostMax = document.createTextNode(`${subRed.hostMax.join('.')}`);
    const broadcast = document.createTextNode(`${subRed.broadcast.join('.')}`);

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    const text = document.createTextNode(`Subred ${cont+1}`);

    resp.classList.add("table", "table-striped");
    
    th.classList.add("table-info", "text-center");
    th.setAttribute("colspan", '2');

    th.appendChild(text);
    tr.appendChild(th);
    thead.appendChild(tr);

    tbody.appendChild(createRow(thNet, network));
    tbody.appendChild(createRow(thHm, hostMin));
    tbody.appendChild(createRow(thHM, hostMax));
    tbody.appendChild(createRow(thB, broadcast));

    resp.appendChild(thead);
    resp.appendChild(tbody);    

    return resp;
}

function createRow(textTh, nodoText){
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    const td = document.createElement('td');

    th.classList.add("text-center", "w-50");
    td.classList.add("text-start", "w-50");

    th.appendChild(textTh);
    td.appendChild(nodoText);
    tr.appendChild(th);
    tr.appendChild(td);

    return tr;
}

function infoRed(red){
    const tableInf = document.createElement('table');
    const tbody = document.createElement('tbody');

    const datos = [
        {
            nombre: document.createTextNode("Ip"),
            textNodo: document.createTextNode(`${red.network.join('.')}`)
        },
        {
            nombre: document.createTextNode("Clase"),
            textNodo: document.createTextNode(`${red.clase}`) 
        },
        {
            nombre: document.createTextNode("Mascara"),
            textNodo: document.createTextNode(`${red.originalMask.join('.')}`)
        },
        {
            nombre: document.createTextNode("Nueva mascara"),
            textNodo: document.createTextNode(`${red.decimalMask.join('.')}/${red.Cid}`)
        },
        {
            nombre: document.createTextNode("Numero de hosts por subred"),
            textNodo: document.createTextNode(`${red.numHosts}`) 
        },
        {
            nombre: document.createTextNode("Numero de subredes"),
            textNodo: document.createTextNode(`${red.numSubRed}`) 
        }
    ];

    for(let i = 0; i <= 5; i++){
        tbody.appendChild(createRow(datos[i].nombre, datos[i].textNodo));
    }

    tableInf.classList.add("table", "table-striped", "table-warning");
    tableInf.appendChild(tbody);

    return tableInf;
}