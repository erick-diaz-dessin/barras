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

    // Encontrar múltiplos de 1/32
    let lower = Math.floor(rawResult * 32) / 32;
    let upper = Math.ceil(rawResult * 32) / 32;

    // Determinar el más cercano
    let closest = (rawResult - lower) < (upper - rawResult) ? lower : upper;

    // Aplicar la fórmula: másCercano * (barras + 1) + (espesor * barras)
    let finalValue = closest * (barras + 1) + (espesor * barras);

    // Calcular la diferencia con la distancia original
    let difference = finalValue - distancia;
    let formattedDifference = difference > 0 ? `-${Math.abs(difference).toFixed(5)}` : `${Math.abs(difference).toFixed(5)}`;

    // Calcular el número original de múltiplos de 1/32 (antes de modificarlo)
    let originalMultiplesOf32 = Math.round(Math.abs(difference) * 32);
    let parity = originalMultiplesOf32 % 2 === 0 ? "par" : "impar";

    let enMedio = 0;
    let primera, ultima;
    let updatedMultiplesOf32 = originalMultiplesOf32; // Guardamos la cantidad original

    // Caso especial: barras es par y múltiplos de 1/32 es impar
    if (barras % 2 === 0 && parity === "impar") {
        // enMedio = closest + (1 / 32); // Tomamos 1/32 para enMedio
        enMedio = distancia - finalValue < 0 ? closest - (1 / 32) : closest + (1 / 32);
        updatedMultiplesOf32 -= 1; // Restamos 1/32 de la diferencia total
    }

    let adjustment = (updatedMultiplesOf32 / 2) / 32; // Mitad de la diferencia restante

    if (distancia - finalValue < 0) {
        // Diferencia negativa: restar
        primera = closest - adjustment;
        ultima = closest - adjustment;
    } else {
        // Diferencia positiva: sumar
        primera = closest + adjustment;
        ultima = closest + adjustment;
    }

    // General sigue siendo igual al más cercano
    let general = closest;

    // Calcular la posición de la primera barra
    let posiciones = [];
    posiciones.push(primera + (espesor / 2));

    // Determinar qué barra está en medio (si es par, tomamos la de mayor índice)
    let barraEnMedioIndex = Math.ceil(barras / 2);
    // let barraEnMedioTexto = `La barra en medio es la Barra ${barraEnMedioIndex}`;

    // Calcular las posiciones de las siguientes barras
    for (let i = 1; i < barras; i++) {
        if (i === barraEnMedioIndex && enMedio !== 0) {
            // Si es la barra en medio y enMedio es distinto de cero, usar enMedio en lugar de general
            posiciones.push(posiciones[i - 1] + enMedio + espesor);
        } else {
            posiciones.push(posiciones[i - 1] + general + espesor);
        }
    }

    // Calcular la posición final (última barra + mitad del espesor + última)
    let finalPosition = posiciones[barras - 1] + (espesor / 2) + ultima;

    // Crear la tabla de posiciones de barras
    let barrasTable = `<table><tr><th>Barra</th><th>Posición</th></tr>`;
    for (let i = 0; i < posiciones.length; i++) {
        barrasTable += `<tr><td>Barra ${i + 1}</td><td>${posiciones[i].toFixed(5)}</td></tr>`;
    }
    // Agregar la fila final
    barrasTable += `<tr><td>Final</td><td>${finalPosition.toFixed(5)}</td></tr>`;
    barrasTable += `</table>`;

    document.getElementById("result").innerHTML = `

    ${barrasTable}

    <table>
        <tr><td>Primera</td><td>${primera.toFixed(5)}</td></tr>
        <tr><td>En medio</td><td>${enMedio.toFixed(5)}</td></tr>
        <tr><td>Última</td><td>${ultima.toFixed(5)}</td></tr>
        <tr><td>General</td><td>${general.toFixed(5)}</td></tr>
    </table>

    <table>
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
