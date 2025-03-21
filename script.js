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

    // Calcular el número de múltiplos de 1/32
    let multiplesOf32 = Math.round(Math.abs(difference) * 32);
    let parity = multiplesOf32 % 2 === 0 ? "par" : "impar";

    // Calcular Primera y Última
    let adjustment = multiplesOf32 / 2 / 32; // Mitad de la diferencia en múltiplos de 1/32

    let primera, ultima;
    if (distancia - finalValue < 0) {
        // Diferencia negativa: restar
        if (parity === "impar") {
            primera = closest - (Math.ceil(adjustment * 32) / 32);
            ultima = closest - (Math.floor(adjustment * 32) / 32);
        } else {
            primera = closest - adjustment;
            ultima = closest - adjustment;
        }
    } else {
        // Diferencia positiva: sumar
        if (parity === "impar") {
            primera = closest + (Math.ceil(adjustment * 32) / 32);
            ultima = closest + (Math.floor(adjustment * 32) / 32);
        } else {
            primera = closest + adjustment;
            ultima = closest + adjustment;
        }
    }

    // "En medio" siempre es 0
    let enMedio = 0;

    // "General" es igual al más cercano
    let general = closest;

    document.getElementById("result").innerHTML = `

    <table>
        <tr><td>Resultado exacto</td><td>${rawResult.toFixed(5)}</td></tr>
        <tr><td>Múltiplo inferior (1/32)</td><td>${lower.toFixed(5)}</td></tr>
        <tr><td>Múltiplo superior (1/32)</td><td>${upper.toFixed(5)}</td></tr>
        <tr><td>Más cercano</td><td>${closest.toFixed(5)}</td></tr>
        <tr><td>Resultado final con fórmula</td><td>${finalValue.toFixed(5)}</td></tr>
        <tr><td>Diferencia con distancia ingresada</td><td>${formattedDifference}</td></tr>
        <tr><td>Número de múltiplos de 1/32</td><td>${multiplesOf32}/32</td></tr>
        <tr><td>Paridad</td><td>${parity}</td></tr>
        
    </table>

    <table>
        <tr><td>Primera</td><td>${primera.toFixed(5)}</td></tr>
        <tr><td>En medio</td><td>${enMedio.toFixed(5)}</td></tr>
        <tr><td>Última</td><td>${ultima.toFixed(5)}</td></tr>
        <tr><td>General</td><td>${general.toFixed(5)}</td></tr>
    </table>
`;


}

