function calculate() {
    let distancia = parseFloat(document.getElementById("num1").value);
    let barras = parseInt(document.getElementById("num2").value);
    let espesor = parseFloat(document.getElementById("num3").value);
    let anguloInput = document.getElementById("num4").value.trim();

    let angulo = anguloInput === "" ? 0 : parseFloat(anguloInput);

    if (isNaN(distancia) || isNaN(barras) || isNaN(espesor) || isNaN(angulo)) {
        document.getElementById("result").textContent = "Por favor, ingresa números válidos.";
        return;
    }

    if (barras < 0) {
        document.getElementById("result").textContent = "El número de barras no puede ser negativo.";
        return;
    }

    let espesorAjustado = espesor;
    if (angulo !== 0) {
        let radianes = angulo * (Math.PI / 180);
        espesorAjustado = espesor / Math.sin(radianes);
    }

    let espacioReal = (distancia - (barras * espesorAjustado)) / (barras + 1);
    let posiciones = [];

    posiciones.push(espacioReal + (espesorAjustado / 2));
    for (let i = 1; i < barras; i++) {
        posiciones.push(posiciones[i - 1] + espacioReal + espesorAjustado);
    }

    let posicionFinal = posiciones[barras - 1] + espacioReal + (espesorAjustado / 2);
    let diferencia = posicionFinal - distancia;

    function redondeoFraccion32(valor) {
        let inferior = Math.floor(valor * 32) / 32;
        let superior = Math.ceil(valor * 32) / 32;
        let masCercano = (valor - inferior) < (superior - valor) ? inferior : superior;
        return { inferior, superior, masCercano };
    }

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
        let redondeos = redondeoFraccion32(posiciones[i]);
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

        // Aplicar subrayado si el ajuste fue necesario
        let ajusteNecesario = repetido !== pulgadas ? `<u>${repetido}</u>` : repetido;

        barrasTable += `<tr>
            <td>Barra ${i + 1}</td>
            <td class="limites-columna">${posiciones[i].toFixed(5)}</td>
            <td class="limites-columna">${redondeos.inferior.toFixed(5)}</td>
            <td class="limites-columna">${redondeos.superior.toFixed(5)}</td>
            <td class="limites-columna">${redondeos.masCercano.toFixed(5)}</td>
            <td class="limites-columna">${pulgadas}</td>
            <td>${ajusteNecesario}</td>
        </tr>`;
    }

    barrasTable += `</table>`;

    document.getElementById("result").innerHTML = `
        <p>Espesor utilizado: ${espesorAjustado.toFixed(5)} pulgadas</p>
        <p>Espacio real calculado: ${espacioReal.toFixed(5)}</p>
        ${barrasTable}
        <p><strong>Posición final:</strong> ${posicionFinal.toFixed(5)}</p>
        <p><strong>Diferencia con el valor ingresado:</strong> ${diferencia.toFixed(5)}</p>
    `;

    document.getElementById("boton-ocultar").style.display = "block";
}

// Función para ocultar/mostrar las columnas de límites
function toggleLimites() {
    let columnas = document.querySelectorAll(".limites-columna");
    
    // Verificar si la primera columna está oculta (porque todas tienen el mismo estado)
    let estadoActual = getComputedStyle(columnas[0]).display; 
    let nuevoEstado = (estadoActual === "none") ? "table-cell" : "none";

    columnas.forEach(col => col.style.display = nuevoEstado);
}
