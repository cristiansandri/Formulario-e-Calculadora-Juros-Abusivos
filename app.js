// ==================== Enviar Evento ========================== //
function enviarEvento() {
    const selecaoDivida = document.getElementById('valor-divida').value;
    if (selecaoDivida === "abaixo-50mil") {
        fbq('trackCustom', 'Lead Não Qualificado', { valor: selecaoDivida });
        console.log("Evento: Lead Não Qualificado");
    } else if (selecaoDivida === "entre-50-350mil" || selecaoDivida === "acima-350mil") {
        fbq('track', 'Lead Qualificado', {
            content_category: 'Calculadora de Dívida',
            status: 'Qualificado'
        });
        console.log("Evento: Lead Qualificado");
    }
}

// ==================== Enviar Formulário ===================== //
async function enviarForm() {
    const form = document.getElementById('form-juros-abusivos');
    const formData = new FormData(form);
    const url = "https://script.google.com/macros/s/AKfycbyNZA-0vVlxPcnkdNfjLtgEXTCX7mamC2-BKfhyzT5MtsfAtg2vjLRJYpvTxhZdzaDT/exec"; // O URL do Apps Script 

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        });
        console.log("Dados enviados com sucesso!");
    } catch (error) {
        console.error("Erro ao enviar formulário:", error);
    }
}

// ========== Unificação das funções e Validação para abrir modal =========== //
function processarFormulario(botao) {
    const form = document.getElementById('form-juros-abusivos');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    enviarEvento();
    enviarForm();

    const modalId = botao.getAttribute('data-modal');
    const modal = document.getElementById(modalId);

    if (modal) {
        modal.showModal();
        document.body.classList.add('sem-scroll');
    }
}


// ==================== Fechar POPUP ==================== //
const closeButtons = document.querySelectorAll('.close-modal');
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        const modal = button.closest('dialog');
        if (modal) {
            modal.close();
            document.body.classList.remove('sem-scroll');
        };
    });
});

const modais = document.querySelectorAll('dialog');
modais.forEach(modal => {
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.close();
            document.body.classList.remove('sem-scroll');
        }
    });
});

// ================= Funcionalidades da Calculadora ================= //
function formatarInputMonetario(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor === '') {
        input.value = '';
        return;
    }
    while (valor.length < 3) {
        valor = '0' + valor;
    }
    valor = (parseFloat(valor) / 100).toFixed(2);
    valor = valor.replace('.', ',');
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');

    input.value = 'R$ ' + valor;
}

function formatarValor(valor) {
    if (isNaN(valor)) return 'R$ --';
    const numericValue = parseFloat(valor);
    if (isNaN(numericValue)) return 'R$ --';

    return numericValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calculateMonthlyRate(principal, payment, periods) {
    let lowRate = 0.0000001;
    let highRate = 5;
    let tolerance = 0.001;
    let maxIterations = 200;

    if (principal <= 0 || periods <= 0 || payment <= 0) return NaN;
    if (payment * periods < principal) return 0;
    for (let i = 0; i < maxIterations; i++) {
        let midRate = (lowRate + highRate) / 2;

        if (midRate < 1e-9) {
            let calculatedPV_at_zero = payment * periods;
            if (Math.abs(calculatedPV_at_zero - principal) < tolerance) {
                return 0;
            }
            if (calculatedPV_at_zero < principal) {
                lowRate = 1e-8;
            } else {
                lowRate = 1e-8;
            }
            continue;
        }

        let calculatedPV = payment * (1 - Math.pow(1 + midRate, -periods)) / midRate;

        if (Math.abs(calculatedPV - principal) < tolerance) {
            return midRate * 100;
        }

        if (calculatedPV < principal) {
            highRate = midRate;
        } else {
            lowRate = midRate;
        }
    }

    console.warn("O cálculo da taxa não convergiu dentro do número máximo de iterações.");
    return NaN;
}

function animateNumber(element, start, end, duration, formatter) {
    let startTime = null;

    function step(timestamp) {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const currentValue = start + (end - start) * progress;

        element.textContent = formatter(currentValue);

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            element.textContent = formatter(end);
        }
    }

    requestAnimationFrame(step);
}

function enviarWhatsApp() {
    const probabilidadeText = document.getElementById("probabilityText").innerText.trim();
    const valorContratadoText = document.querySelector(".box-valor-contratado .highlight").innerText;
    const totalPagoText = document.querySelector(".box-valor-total-pago .highlight").innerText;
    const jurosTotaisText = document.querySelector(".box-juros-totais .highlight").innerText;
    const taxaContratoText = document.querySelector(".box-taxa-contrato .highlight").innerText;
    const taxaBacenText = document.querySelector(".box-taxa-bacen .highlight").innerText;
    const diferencaText = document.querySelector(".box-percentual-diferenca .highlight").innerText;

    const mensagemWhatsApp = `Olá! Usei a Calculadora de Juros Abusivos e gostaria de uma análise do meu caso. Seguem os resultados:\n\n` +
        `Probabilidade de Abusividade: ${probabilidadeText}\n` +
        `Valor Contratado: ${valorContratadoText}\n` +
        `Total a Pagar: ${totalPagoText}\n` +
        `Total de Juros: ${jurosTotaisText}\n` +
        `Taxa do Contrato: ${taxaContratoText}\n` +
        `Taxa Média BACEN: ${taxaBacenText}\n` +
        `Diferença em relação à média: ${diferencaText}\n\n` +
        `Gostaria de discutir as possibilidades.`;
    const numeroTelefone = "5542991088896";
    const urlWhatsApp = `https://wa.me/${numeroTelefone}?text=${encodeURIComponent(mensagemWhatsApp)}`;

    window.open(urlWhatsApp, '_blank');
}


function calcularJuros() {
    const valorContratadoStr = document.getElementById('valorContratado').value;
    const numParcelas = parseInt(document.getElementById('numParcelas').value);
    const valorParcelaStr = document.getElementById('valorParcela').value;
    const tipoCliente = document.getElementById('tipoCliente').value;
    const resultadoDiv = document.getElementById('resultado');
    const valorContratado = parseFloat(valorContratadoStr.replace('R$', '').replace(/\./g, '').replace(',', '.'));
    const valorParcela = parseFloat(valorParcelaStr.replace('R$', '').replace(/\./g, '').replace(',', '.'));


    if (isNaN(valorContratado) || isNaN(numParcelas) || isNaN(valorParcela) || numParcelas <= 0 || valorContratado <= 0 || valorParcela <= 0) {
        resultadoDiv.innerHTML = "<p style='color: #C90F02; text-align: center; font-size: 18px; font-weight: bold;'>Por favor, insira valores válidos e maiores que zero.</p>";
        return;
    }

    resultadoDiv.innerHTML = '';


    const taxaContratadoMensal = calculateMonthlyRate(valorContratado, valorParcela, numParcelas);

    if (isNaN(taxaContratadoMensal)) {
        resultadoDiv.innerHTML = "<p style='color: red; text-align: center;'>Não foi possível calcular a taxa de juros com os valores informados. Verifique se os valores da parcela são suficientes para pagar o principal e os juros.</p>";
        return;
    }

    const taxaBacenMensal = tipoCliente === 'juridica' ? 1.5 : 2.35;


    const percentualDiferenca = ((taxaContratadoMensal - taxaBacenMensal) / taxaBacenMensal) * 100;

    let probabilityText = "";
    let descriptionMessage = "";
    let probabilityClass = "";

    const thresholdLow = 0;
    const thresholdMedium = 50;
    const thresholdHigh = 100;

    if (percentualDiferenca < thresholdLow) {
        probabilityText = "Taxa Possivelmente Abaixo da Média";
        descriptionMessage = `A taxa de juros do seu contrato (<b>${taxaContratadoMensal.toFixed(2)}% a.m.</b>) parece estar abaixo da taxa média do BACEN (<b>${taxaBacenMensal.toFixed(2)}% a.m.</b>) para operações de ${tipoCliente === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}.<br><br>A diferença é de <b>${percentualDiferenca.toFixed(2)}%</b> em relação à taxa média.`;
        probabilityClass = "empty";

    } else if (percentualDiferenca >= thresholdLow && percentualDiferenca < thresholdMedium) {
        probabilityText = "Pouca Probabilidade de Abusividade";
        descriptionMessage = `Sua taxa de juros (<b>${taxaContratadoMensal.toFixed(2)}% a.m.</b>) parece estar próxima da taxa média de mercado do BACEN <b> cerca de ${taxaBacenMensal.toFixed(2)}% a.m.</b> para operações de ${tipoCliente === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}.<br><br>A diferença é de <b>${percentualDiferenca.toFixed(2)}%</b> em relação à taxa média, o que pode indicar baixa probabilidade de ser considerada abusiva pela justiça (geralmente acima de 50% de diferença).`;
        probabilityClass = "baixa";

    } else if (percentualDiferenca >= thresholdMedium && percentualDiferenca < thresholdHigh) {
        probabilityText = "Média Probabilidade de Abusividade";
        descriptionMessage = `Sua taxa de juros (<b>${taxaContratadoMensal.toFixed(2)}% a.m.</b>) parece estar moderadamente acima da taxa média de mercado do BACEN cerca de <b>${taxaBacenMensal.toFixed(2)}% a.m.</b> para operações de ${tipoCliente === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}.<br><br>A diferença é de <b>${percentualDiferenca.toFixed(2)}%</b> em relação à taxa média, o que pode indicar uma média probabilidade de ser considerada abusiva pela justiça (geralmente acima de 50% de diferença).`;
        probabilityClass = "media";

    } else {
        probabilityText = "Alta Probabilidade de Abusividade";
        descriptionMessage = `Sua taxa de juros (<b>${taxaContratadoMensal.toFixed(2)}% a.m.</b>) parece estar significativamente acima da taxa média aprox. de mercado do BACEN cerca de <b>${taxaBacenMensal.toFixed(2)}% a.m.</b> para operações de ${tipoCliente === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}.<br><br>A diferença é de <b>${percentualDiferenca.toFixed(2)}%</b> em relação à taxa média aprox., o que pode indicar uma alta probabilidade de ser considerada abusiva pela justiça (geralmente acima de 50% de diferença).`;
        probabilityClass = "alta";
    }


    const valorTotalPago = valorParcela * numParcelas;
    const jurosTotais = valorTotalPago - valorContratado;

    const shouldBeRed = percentualDiferenca >= 25;

    const minPercentBar = 0;
    const maxPercentBar = 200;
    const percentRangeBar = maxPercentBar - minPercentBar;

    const clampedPercentDiffForBar = Math.max(minPercentBar, Math.min(maxPercentBar, percentualDiferenca));

    let progressBarWidth = ((clampedPercentDiffForBar - minPercentBar) / percentRangeBar) * 100;
    progressBarWidth = Math.max(0, progressBarWidth);

    const percentualCorLimitado = Math.max(0, Math.min(100, percentualDiferenca));
    const tomDeCor = 120 - (percentualCorLimitado * 1.2);
    const corFinal = `hsl(${tomDeCor}, 90%, 45%)`;

    const resultHTML = `
    <section class="result-section">
        <div class="progress-bar-section">
            <p class="probability-text ${probabilityClass}" id="probabilityText">${probabilityText}</p>
            <div class="progress-bar-container">
                <div class="progress-bar" id="progressBar" style="width: 0%; background-color: hsl(120, 90%, 45%);"></div>
                <span class="progress-text" id="progressText">${percentualDiferenca.toFixed(2)}%</span>
            </div>

            <div class="description-box">
                <p><strong>Entenda o resultado:</strong></p>
                <p id="descriptionMessage">${descriptionMessage}</p>
            </div>
        </div>

        
        <div class="flex-container" id="resultBoxes">
            <div class="box box-taxa-bacen">
                <span class="highlight" data-value="${taxaBacenMensal.toFixed(2)}" data-type="percent">${taxaBacenMensal.toFixed(2)}% a.m.</span>
                <p>Taxa média aprox. do BACEN para ${tipoCliente === 'juridica' ? 'PJ' : 'PF'}</p>
            </div>
            
            <div class="box box-taxa-contrato ${shouldBeRed ? 'red' : ''}">
                <span class="highlight" data-value="${taxaContratadoMensal.toFixed(2)}" data-type="percent">${taxaContratadoMensal.toFixed(2)}% a.m.</span>
                <p>Taxa de Juros do Contrato</p>
            </div>

            <div class="box box-percentual-diferenca ${shouldBeRed ? 'red' : ''}">
                <span class="highlight" data-value="${percentualDiferenca.toFixed(2)}" data-type="percent">${percentualDiferenca.toFixed(2)}%</span>
                <p>% acima/abaixo da taxa aprox. do BACEN</p>
            </div>

            <div class="box box-valor-contratado">
                <span class="highlight" data-value="${valorContratado}" data-type="currency">${formatarValor(valorContratado)}</span>
                <p>Valor Contratado</p>
            </div>

            <div class="box box-valor-total-pago ${shouldBeRed ? 'red' : ''}">
                <span class="highlight" data-value="${valorTotalPago}" data-type="currency">${formatarValor(valorTotalPago)}</span>
                <p>Total a pagar parcelado</p>
            </div>

            <div class="box box-juros-totais ${shouldBeRed ? 'red' : ''}">
                <span class="highlight" data-value="${jurosTotais}" data-type="currency">${formatarValor(jurosTotais)}</span>
                <p>Total líquido de juros a pagar</p>
            </div>
        </div>

        <a href="javascript:void(0);" onclick="enviarWhatsApp()" class="whatsapp-button">
                Reduza sua dívida! Fale conosco.</a>

    </section">
        `;

    resultadoDiv.innerHTML = resultHTML;
    document.getElementById('resultado').style.display = 'block';

    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        requestAnimationFrame(() => {
            setTimeout(() => {
                progressBar.style.width = `${progressBarWidth}%`;
                progressBar.style.backgroundColor = corFinal;
            }, 50);
        });
    }

    const highlightSpans = resultadoDiv.querySelectorAll('.highlight');
    const animationDuration = 1500;

    highlightSpans.forEach(span => {
        const targetValue = parseFloat(span.dataset.value);
        const dataType = span.dataset.type;
        const startValue = 0;

        let formatter;
        if (dataType === 'currency') {
            formatter = formatarValor;
        } else if (dataType === 'percent') {
            formatter = (value) => `${value.toFixed(2)}%${span.textContent.includes('a.m.') ? ' a.m.' : ''}`;
        } else {
            formatter = (value) => value.toFixed(2);
        }

        if (!isNaN(targetValue)) {
            span.textContent = formatter(startValue);
            animateNumber(span, startValue, targetValue, animationDuration, formatter);
        } else {
            span.textContent = formatter(targetValue);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('resultado').innerHTML = '';
});