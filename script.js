let posicionesCen = [];
let posicionesIzq = [];
let posicionesDer = [];

let distancia;
let barras;
let espesor;
let anguloInput;

let posicionFinal = [];
let diferencia = [];

function calculate() {

    // valor aobsoluto para evitar valores negativos
    distancia = Math.abs(parseFloat(document.getElementById("num1").value));
    barras = Math.abs(parseInt(document.getElementById("num2").value));
    espesor = Math.abs(parseFloat(document.getElementById("num3").value));
    anguloInput = Math.abs(document.getElementById("num4").value.trim());
    
    let angulo = anguloInput === "" ? 0 : parseFloat(anguloInput);

    if (isNaN(distancia) || isNaN(barras) || isNaN(espesor) || isNaN(angulo)) {
        document.getElementById("result").textContent = "Por favor, ingresa números válidos.";
        return;
    }

    let espesorAjustado = espesor;
    if (angulo !== 0) {
        let radianes = angulo * (Math.PI / 180);
        espesorAjustado = espesor / Math.sin(radianes);
    }

    // calculo del espacio entre cada barra
    let espacioReal = (distancia - (barras * espesorAjustado)) / (barras + 1);
    
    // primeras barras

    // posicion centro
    posicionesCen[0] = ["Barra 1"]
    posicionesCen[0].push(espacioReal + (espesorAjustado / 2));

    // posicion izquierda
    posicionesIzq[0] = ["Barra 1"]
    posicionesIzq[0].push(espacioReal);

    // posicion derecha
    posicionesDer[0] = ["Barra 1"]
    posicionesDer[0].push(espacioReal + espesorAjustado);

    // barras intermedias
    for (let i = 1; i < barras; i++) {
        posicionesCen[i] = ["Barra " + (i + 1)]
        posicionesCen[i].push(posicionesCen[i - 1][1] + espacioReal + espesorAjustado);
        
        posicionesIzq[i] = ["Barra " + (i + 1)]
        posicionesIzq[i].push(posicionesIzq[i - 1][1] + espacioReal + espesorAjustado);

        posicionesDer[i] = ["Barra " + (i + 1)]
        posicionesDer[i].push(posicionesDer[i - 1][1] + espacioReal + espesorAjustado);
    }

    // barras finales
    posicionFinal[0] = posicionesCen[barras - 1][1] + espacioReal + (espesorAjustado / 2);
    posicionFinal.push(posicionesIzq[barras - 1][1] + espacioReal + espesorAjustado);
    posicionFinal.push(posicionesDer[barras - 1][1] + espacioReal);

    diferencia[0] = posicionFinal[0] - distancia;
    diferencia.push(posicionFinal[1] - distancia);
    diferencia.push(posicionFinal[2] - distancia);
    //let diferenciaIzq = posicionFinalIzq - distancia;

    // Creacion de la tabla
    let barrasTable = `<table border="1" id="barrasTable">
        <tr>
            <th>Barra</th>
            <th class="limites-columna">Posición</th>
            <th class="limites-columna">Inferior (1/32)</th>
            <th class="limites-columna">Superior (1/32)</th>
            <th class="limites-columna">Más cercano</th>
            <th class="limites-columna">Pulgadas</th>
            <th>Pos. Aj.</th>
        </tr>`;

    for (let i = 0; i < barras; i++) {
        let redondeos = redondeoFraccion32(posicionesCen[i][1]);
        let pulgadas = convertirAPulgadas(redondeos.masCercano);

        let partes;
        let denominador;
        let repetido;

        if (pulgadas.includes("/")) {
            partes = pulgadas.split(" ");
            denominador = partes[1].split("/")[1];
            repetido = denominador === "32" ? convertirAPulgadas(redondeos.masCercano - (1 / 32)) : pulgadas;
        } else {
            repetido = pulgadas;
        }

        posicionesCen[i].push(redondeos.inferior);
        posicionesCen[i].push(redondeos.superior);
        posicionesCen[i].push(redondeos.masCercano);
        posicionesCen[i].push(pulgadas);
        posicionesCen[i].push(repetido);

        // Aplicar subrayado si el ajuste fue necesario
        let ajusteNecesario = repetido !== pulgadas ? `<u>${repetido}</u>` : repetido;

        barrasTable += `<tr>
            <td>${posicionesCen[i][0]}</td>
            <td class="limites-columna">${posicionesCen[i][1].toFixed(5)}</td>
            <td class="limites-columna">${posicionesCen[i][2].toFixed(5)}</td>
            <td class="limites-columna">${posicionesCen[i][3].toFixed(5)}</td>
            <td class="limites-columna">${posicionesCen[i][4].toFixed(5)}</td>
            <td class="limites-columna">${posicionesCen[i][5]}</td>
            <td>${ajusteNecesario}</td>
        </tr>`;

    }

    barrasTable += `</table>`;

    for (let i = 0; i < barras; i++) {
        let redondeos = redondeoFraccion32(posicionesIzq[i][1]);
        let pulgadas = convertirAPulgadas(redondeos.masCercano);

        let partes;
        let denominador;
        let repetido;

        if (pulgadas.includes("/")) {
            partes = pulgadas.split(" ");
            denominador = partes[1].split("/")[1];
            repetido = denominador === "32" ? convertirAPulgadas(redondeos.masCercano - (1 / 32)) : pulgadas;
        } else {
            repetido = pulgadas;
        }

        posicionesIzq[i].push(redondeos.inferior);
        posicionesIzq[i].push(redondeos.superior);
        posicionesIzq[i].push(redondeos.masCercano);
        posicionesIzq[i].push(pulgadas);
        posicionesIzq[i].push(repetido);
    }

    for (let i = 0; i < barras; i++) {
        let redondeos = redondeoFraccion32(posicionesDer[i][1]);
        let pulgadas = convertirAPulgadas(redondeos.masCercano);

        let partes;
        let denominador;
        let repetido;

        if (pulgadas.includes("/")) {
            partes = pulgadas.split(" ");
            denominador = partes[1].split("/")[1];
            repetido = denominador === "32" ? convertirAPulgadas(redondeos.masCercano - (1 / 32)) : pulgadas;
        } else {
            repetido = pulgadas;
        }

        posicionesDer[i].push(redondeos.inferior);
        posicionesDer[i].push(redondeos.superior);
        posicionesDer[i].push(redondeos.masCercano);
        posicionesDer[i].push(pulgadas);
        posicionesDer[i].push(repetido);
    }

    document.getElementById("result").innerHTML = `
        <p>Espesor utilizado: ${espesorAjustado.toFixed(5)} pulgadas</p>
        <p>Espacio real calculado: ${espacioReal.toFixed(5)}</p>
        ${barrasTable}
        <p><strong>Posición final:</strong> ${posicionFinal[0].toFixed(5)}</p>
        <p><strong>Diferencia con el valor ingresado:</strong> ${diferencia[0].toFixed(5)}</p>
    `;

    document.getElementById("boton-ocultar").style.display = "block";
}

// Esta funcion toma una fraccion de pulgada en decimal y devuelve el valor inferior y superior
// mas cercanos multiplos de 1/32, asi como el valor mas cercano de estos dos con respecto al valor
// original. EN otras palabras, convierte una fraccion decimal en un valor racional con precicion 1/32.
function redondeoFraccion32(valor) {
    let inferior = Math.floor(valor * 32) / 32;
    let superior = Math.ceil(valor * 32) / 32;
    let masCercano = (valor - inferior) < (superior - valor) ? inferior : superior;
    return { inferior, superior, masCercano };
}

// Esta funcion simplifica un numero racional a su mimima expresion.
function convertirAPulgadas(valor) {
    let entero = Math.floor(valor);
    let fraccion = valor - entero;
    let fraccion32 = Math.round(fraccion * 32);
    if (fraccion32 === 0) return `${entero}"`;

    function mcd(a, b) {
        return b === 0 ? a : mcd(b, a % b);
    }

    let divisor = mcd(fraccion32, 32);
    let numerador = fraccion32 / divisor;
    let denominador = 32 / divisor;

    return `${entero} ${numerador}/${denominador}`;
}

// Función para ocultar/mostrar las columnas de límites
function toggleLimites() {
    let columnas = document.querySelectorAll(".limites-columna");
    
    // Verificar si la primera columna está oculta (porque todas tienen el mismo estado)
    let estadoActual = getComputedStyle(columnas[0]).display; 
    let nuevoEstado = (estadoActual === "none") ? "table-cell" : "none";

    columnas.forEach(col => col.style.display = nuevoEstado);
}

function updateTable(boton){
    let table = document.getElementById("barrasTable");
    let datos;
    switch(boton.dataset.lado){
        case "center":
            datos = posicionesCen;
        break;

        case "izquierda":
            datos = posicionesIzq;
        break;

        case "derecha":
            datos = posicionesDer;
        break;
    }

    for (let i = 0; i < barras; i++) {

        // Aplicar subrayado si el ajuste fue necesario
        let ajusteNecesario = datos[i][5] !== datos[i][6] ? `<u>${datos[i][6]}</u>` : datos[i][6];

        table.rows[i + 1].cells[0].innerHTML = datos[i][0];
        table.rows[i + 1].cells[1].innerHTML = datos[i][1].toFixed(5);
        table.rows[i + 1].cells[2].innerHTML = datos[i][2].toFixed(5);
        table.rows[i + 1].cells[3].innerHTML = datos[i][3].toFixed(5);
        table.rows[i + 1].cells[4].innerHTML = datos[i][4].toFixed(5);
        table.rows[i + 1].cells[5].innerHTML = datos[i][5];
        table.rows[i + 1].cells[6].innerHTML = ajusteNecesario;

    }
}