let posiciones = {
    izquierda: [],
    centro: [],
    derecha: []
}

let resultados = {
    izquierda: {},
    centro: {},
    derecha: {}
}

let distancia;
let barras;
let espesor;
let anguloInput;
let lado;
let espesorAjustado

function calculate() {

    // valor aobsoluto para evitar valores negativos
    distancia = Math.abs(parseFloat(document.getElementById("num1").value));
    barras = Math.abs(parseInt(document.getElementById("num2").value));
    espesor = Math.abs(parseFloat(document.getElementById("num3").value));
    anguloInput = Math.abs(document.getElementById("num4").value.trim());
    lado = document.querySelector('input[name="lado"]:checked');
    
    let angulo = anguloInput === "" ? 0 : parseFloat(anguloInput);

    if (isNaN(distancia) || isNaN(barras) || isNaN(espesor) || isNaN(angulo)) {
        document.getElementById("result").textContent = "Por favor, ingresa números válidos.";
        return;
    }

    espesorAjustado = espesor;
    if (angulo !== 0) {
        let radianes = angulo * (Math.PI / 180);
        espesorAjustado = espesor / Math.sin(radianes);
    }

    // calculo del espacio entre cada barra
    let espacioReal = (distancia - (barras * espesorAjustado)) / (barras + 1);

    fillTable(espacioReal, espesorAjustado);

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
        // Aplicar subrayado si el ajuste fue necesario
        let ajusteNecesario = posiciones[lado.value][i][5] !== posiciones[lado.value][i][6] ? `<u>${posiciones[lado.value][i][6]}</u>` : posiciones[lado.value][i][6];

        barrasTable += `<tr>
            <td>${posiciones[lado.value][i][0]}</td>
            <td class="limites-columna">${posiciones[lado.value][i][1].toFixed(3)}</td>
            <td class="limites-columna">${posiciones[lado.value][i][2].toFixed(3)}</td>
            <td class="limites-columna">${posiciones[lado.value][i][3].toFixed(3)}</td>
            <td class="limites-columna">${posiciones[lado.value][i][4].toFixed(3)}</td>
            <td class="limites-columna">${posiciones[lado.value][i][5]}</td>
            <td>${ajusteNecesario}</td>
        </tr>`;

    }

    barrasTable += `</table>`;

    // updateTable();

    document.getElementById("result").innerHTML = `
        <p>Espesor utilizado: ${espesorAjustado.toFixed(3)} pulgadas</p>
        <p>Espacio real calculado: ${espacioReal.toFixed(3)}</p>
        ${barrasTable}
        <p><strong>Posición final:</strong> ${resultados[lado.value].posicionFinal.toFixed(3)}</p>
        <p><strong>Diferencia con el valor ingresado:</strong> ${resultados[lado.value].diferencia.toFixed(3)}</p>
    `;

    document.getElementById("boton-ocultar").style.display = "block";
    updateCamera(distancia + 10);
    let posBarrasCad = [- (espesorAjustado / 2) - distancia / 2, 
        ...listaPosiciones(posiciones.centro), 
        resultados.centro.posicionFinal + (espesorAjustado / 2) - distancia / 2];
    iniciarThreeJS(posBarrasCad, espesorAjustado); // esto ya está disponible globalmente
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
    if (fraccion32 === 0) return `${entero}`;

    function mcd(a, b) {
        return b === 0 ? a : mcd(b, a % b);
    }

    let divisor = mcd(fraccion32, 32);
    let numerador = fraccion32 / divisor;
    let denominador = 32 / divisor;

    return `${entero} ${numerador}/${denominador}`;
}

function fillTable(espacio, espesor){

    for (let cadaLado in posiciones){
        posiciones[cadaLado] = new Array(barras); // reserva el tamaño
        // primeras barras
        posiciones[cadaLado][0] = ["Barra 1"]
        if(cadaLado === "izquierda") posiciones[cadaLado][0].push(espacio);
        if(cadaLado === "centro") posiciones[cadaLado][0].push(espacio + (espesor / 2));
        if(cadaLado === "derecha") posiciones[cadaLado][0].push(espacio + espesor);

        // numBarras intermedias
        for (let i = 1; i < barras; i++) {
            posiciones[cadaLado][i] = ["Barra " + (i + 1)]
            posiciones[cadaLado][i].push(posiciones[cadaLado][i - 1][1] + espacio + espesor);;
        }

        for (let i = 0; i < barras; i++) {
            let redondeos = redondeoFraccion32(posiciones[cadaLado][i][1]);
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

            posiciones[cadaLado][i].push(redondeos.inferior);
            posiciones[cadaLado][i].push(redondeos.superior);
            posiciones[cadaLado][i].push(redondeos.masCercano);
            posiciones[cadaLado][i].push(pulgadas);
            posiciones[cadaLado][i].push(repetido);

        }

        if(cadaLado === "izquierda") resultados[cadaLado].posicionFinal = posiciones[cadaLado][barras - 1][1] + espacio + espesor;
        if(cadaLado === "centro") resultados[cadaLado].posicionFinal = posiciones[cadaLado][barras - 1][1] + espacio + (espesor / 2);
        if(cadaLado === "derecha") resultados[cadaLado].posicionFinal = posiciones[cadaLado][barras - 1][1] + espacio;
        resultados[cadaLado].diferencia = resultados[cadaLado].posicionFinal - distancia;
        
    }
    
}

function updateTable(){

    let table = document.getElementById("barrasTable");
    lado = document.querySelector('input[name="lado"]:checked');

    for (let i = 0; i < barras; i++) {

        // Aplicar subrayado si el ajuste fue necesario
        let ajusteNecesario = posiciones[lado.value][i][5] !== posiciones[lado.value][i][6] ? `<u>${posiciones[lado.value][i][6]}</u>` : posiciones[lado.value][i][6];

        table.rows[i + 1].cells[0].innerHTML = posiciones[lado.value][i][0];
        table.rows[i + 1].cells[1].innerHTML = posiciones[lado.value][i][1].toFixed(3);
        table.rows[i + 1].cells[2].innerHTML = posiciones[lado.value][i][2].toFixed(3);
        table.rows[i + 1].cells[3].innerHTML = posiciones[lado.value][i][3].toFixed(3);
        table.rows[i + 1].cells[4].innerHTML = posiciones[lado.value][i][4].toFixed(3);
        table.rows[i + 1].cells[5].innerHTML = posiciones[lado.value][i][5];
        table.rows[i + 1].cells[6].innerHTML = ajusteNecesario;

    }
    dibujarTexto();

}

// Función para ocultar/mostrar las columnas de límites
function toggleLimites() {
    let columnas = document.querySelectorAll(".limites-columna");
    
    // Verificar si la primera columna está oculta (porque todas tienen el mismo estado)
    let estadoActual = getComputedStyle(columnas[0]).display; 
    let nuevoEstado = (estadoActual === "none") ? "table-cell" : "none";

    columnas.forEach(col => col.style.display = nuevoEstado);
}

function listaPosiciones(centro) {
  return centro.map(barra => {
    const valor = barra[barra.length - 1]; // último elemento, tipo string
    // Si ya es número, lo devolvemos directo
    if (typeof valor === 'number') return valor - distancia / 2;

    // Si es una fracción tipo "7 1/16" o "3 1/2"
    const partes = valor.split(' ');
    let pulgadas = 0;

    if (partes.length === 2) {
      pulgadas += parseInt(partes[0]); // parte entera
      const [num, den] = partes[1].split('/').map(Number);
      pulgadas += num / den;
    } else if (partes.length === 1 && partes[0].includes('/')) {
      const [num, den] = partes[0].split('/').map(Number);
      pulgadas += num / den;
    } else {
      pulgadas = parseFloat(valor); // en caso de que sea tipo "3.5"
    }

    return pulgadas - distancia / 2;
  });
}

function getPosiciones() {
  return Object.entries(posiciones).reduce((acc, [lado, datos]) => {
    acc[lado] = { pos: listaPosiciones(datos), text: [...datos] };
    return acc;
  }, {});
}

