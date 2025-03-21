function calculate() {
    let distancia = parseFloat(document.getElementById("num1").value);
    let barras = parseFloat(document.getElementById("num2").value);
    let espesor = parseFloat(document.getElementById("num3").value);

    if (isNaN(distancia) || isNaN(barras) || isNaN(espesor)) {
        document.getElementById("result").textContent = "Por favor, ingresa números válidos.";
        return;
    }

    if (barras < 0) {
        document.getElementById("result").textContent = "El número de barras no puede ser negativo.";
        return;
    }

    let rawResult = (distancia - (barras * espesor)) / (barras + 1);
    let lower = Math.floor(rawResult * 32) / 32;
    let upper = Math.ceil(rawResult * 32) / 32;
    let closest = (rawResult - lower) < (upper - rawResult) ? lower : upper;
    let finalValue = closest * (barras + 1) + (espesor * barras);

    let difference = finalValue - distancia;
    let formattedDifference = difference > 0 ? `-${Math.abs(difference).toFixed(5)}` : `${Math.abs(difference).toFixed(5)}`;

    let originalMultiplesOf32 = Math.round(Math.abs(difference) * 32);
    let parity = originalMultiplesOf32 % 2 === 0 ? "par" : "impar";

    let enMedio = 0;
    let primera, ultima;
    let updatedMultiplesOf32 = originalMultiplesOf32;

    if (barras % 2 === 0 && parity === "impar") {
        enMedio = distancia - finalValue < 0 ? closest - (1 / 32) : closest + (1 / 32);
        updatedMultiplesOf32 -= 1;
    }

    let adjustment = (updatedMultiplesOf32 / 2) / 32;
    if (distancia - finalValue < 0) {
        primera = closest - adjustment;
        ultima = closest - adjustment;
    } else {
        primera = closest + adjustment;
        ultima = closest + adjustment;
    }

    let general = closest;
    let posiciones = [];
    posiciones.push(primera + (espesor / 2));

    let barraEnMedioIndex = Math.ceil(barras / 2);

    for (let i = 1; i < barras; i++) {
        if (i === barraEnMedioIndex && enMedio !== 0) {
            posiciones.push(posiciones[i - 1] + enMedio + espesor);
        } else {
            posiciones.push(posiciones[i - 1] + general + espesor);
        }
    }

    let finalPosition = posiciones[barras - 1] + (espesor / 2) + ultima;

    function formatoFraccionPulgadas(valor) {
        let entero = Math.floor(valor);
        let fraccion = valor - entero;
        let fraccion32 = Math.round(fraccion * 32);
    
        if (fraccion32 === 0) {
            return { entero, numerador: 0, denominador: 1 }; // Retorna número entero sin fracción
        }
    
        function mcd(a, b) {
            return b === 0 ? a : mcd(b, a % b);
        }
    
        let divisor = mcd(fraccion32, 32);
        let numerador = fraccion32 / divisor;
        let denominador = 32 / divisor;
    
        return { entero, numerador, denominador };
    }
    
    
    let barrasTable = `<table border="1">
        <tr>
            <th>Barra</th>
            <th>Posición</th>
            <th>Pulgadas</th>
        </tr>`;

    for (let i = 0; i < posiciones.length; i++) {
        let inch = formatoFraccionPulgadas(posiciones[i]);
        if (inch.denominador === 32) inch = formatoFraccionPulgadas(posiciones[i] - 1/32)
        barrasTable += `<tr>
            <td>Barra ${i + 1}</td>
            <td>${posiciones[i].toFixed(5)}</td>
            <td>${inch.entero} ${inch.numerador}/${inch.denominador}</td>
        </tr>`;
    }

    let finalInch = formatoFraccionPulgadas(finalPosition);
    barrasTable += `<tr>
        <td>Final</td>
        <td>${finalPosition.toFixed(5)}</td>
        <td>${finalInch.entero} ${finalInch.numerador}/${finalInch.denominador}</td>
    </tr></table>`;

    document.getElementById("result").innerHTML = `
        ${barrasTable}
        <table border="1">
            <tr><td>Primera</td><td>${primera.toFixed(5)}</td></tr>
            <tr><td>En medio</td><td>${enMedio.toFixed(5)}</td></tr>
            <tr><td>Última</td><td>${ultima.toFixed(5)}</td></tr>
            <tr><td>General</td><td>${general.toFixed(5)}</td></tr>
        </table>
        <table border="1">
            <tr><td>Resultado exacto</td><td>${rawResult.toFixed(5)}</td></tr>
            <tr><td>Múltiplo inferior (1/32)</td><td>${lower.toFixed(5)}</td></tr>
            <tr><td>Múltiplo superior (1/32)</td><td>${upper.toFixed(5)}</td></tr>
            <tr><td>Más cercano</td><td>${closest.toFixed(5)}</td></tr>
            <tr><td>Resultado final con fórmula</td><td>${finalValue.toFixed(5)}</td></tr>
            <tr><td>Diferencia con distancia ingresada</td><td>${formattedDifference}</td></tr>
            <tr><td>Número original de múltiplos de 1/32</td><td>${originalMultiplesOf32}/32</td></tr>
            <tr><td>Paridad</td><td>${parity}</td></tr>
        </table>
    `;
}

