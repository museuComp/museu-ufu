// Array de perguntas expandido
const questions = [
  // Somas
  { operation: 'add', num1: 9, num2: 5, questionText: "Quanto é 9 + 5?", correctAnswer: 14 },
  { operation: 'add', num1: 12, num2: 7, questionText: "Quanto é 12 + 7?", correctAnswer: 19 },
  // Subtrações
  { operation: 'subtract', num1: 15, num2: 8, questionText: "Quanto é 15 - 8?", correctAnswer: 7 },
  { operation: 'subtract', num1: 20, num2: 11, questionText: "Quanto é 20 - 11?", correctAnswer: 9 },
  // Multiplicações
  { operation: 'multiply', num1: 6, num2: 3, questionText: "Quanto é 6 x 3?", correctAnswer: 18 },
  { operation: 'multiply', num1: 7, num2: 4, questionText: "Quanto é 7 x 4?", correctAnswer: 28 },
  // Divisões
  { operation: 'divide', num1: 20, num2: 5, questionText: "Qual o quociente de 20 / 5?", correctAnswer: 4 },
  { operation: 'divide', num1: 18, num2: 4, questionText: "Qual o quociente de 18 / 4? (parte inteira)", correctAnswer: 4 },
];

// Elementos da Interface
const questionText = document.querySelector(".question");
const answersContainer = document.querySelector(".answers");
const spnQtd = document.querySelector(".spnQtd");
const feedbackDiv = document.querySelector(".feedback");
const nextBtn = document.getElementById("nextBtn");
const simulatorContainer = document.getElementById("simulator-container");
const simulationBox = document.getElementById("box");

const content = document.querySelector(".content");
const contentFinish = document.querySelector(".finish");
const textFinish = document.querySelector(".finish span");
const btnRestart = document.querySelector(".finish button");

let currentIndex = 0;
let questionsCorrect = 0;

function generateAnswers(correctAnswer) {
    let answers = [correctAnswer];
    while (answers.length < 3) {
        let wrongAnswer = correctAnswer + Math.floor(Math.random() * 5) + 1;
        if (!answers.includes(wrongAnswer)) {
            answers.push(wrongAnswer);
        }
    }
    return answers.sort(() => Math.random() - 0.5); // Embaralha as respostas
}

function loadQuestion() {
    simulatorContainer.style.display = "flex"; // Garante que a caixa de simulação esteja visível
    const item = questions[currentIndex];

    // Atualiza o conteúdo do quiz
    spnQtd.innerHTML = `${currentIndex + 1}/${questions.length}`;
    questionText.innerHTML = item.questionText;
    answersContainer.innerHTML = "";
    feedbackDiv.style.display = "none";
    nextBtn.style.display = "none";

    const answerOptions = generateAnswers(item.correctAnswer);
    answerOptions.forEach(option => {
        const button = document.createElement("button");
        button.textContent = option;
        button.onclick = (e) => handleAnswer(e, item);
        answersContainer.appendChild(button);
    });

    // MUDANÇA PRINCIPAL: A simulação é chamada AQUI, ao carregar a pergunta
    showUlaSimulation(item);
}

function handleAnswer(e, questionItem) {
    const selectedAnswer = e.target.textContent;
    const isCorrect = selectedAnswer == questionItem.correctAnswer;

    feedbackDiv.style.display = "block";
    if (isCorrect) {
        questionsCorrect++;
        feedbackDiv.textContent = "Você Acertou!";
        feedbackDiv.className = "feedback correct";
    } else {
        feedbackDiv.textContent = `Errado! A resposta correta é ${questionItem.correctAnswer}.`;
        feedbackDiv.className = "feedback incorrect";
    }

    Array.from(answersContainer.children).forEach(button => button.disabled = true);
    nextBtn.style.display = "block";
}

nextBtn.onclick = () => {
    if (currentIndex < questions.length - 1) {
        currentIndex++;
        loadQuestion();
    } else {
        finish();
    }
};

function finish() {
    textFinish.innerHTML = `Você acertou ${questionsCorrect} de ${questions.length}`;
    content.style.display = "none";
    contentFinish.style.display = "flex";
    simulatorContainer.style.display = "none"; // Esconde a simulação no final
}

btnRestart.onclick = () => {
    content.style.display = "flex";
    contentFinish.style.display = "none";
    currentIndex = 0;
    questionsCorrect = 0;
    loadQuestion();
};

function showUlaSimulation(questionItem) {
    switch (questionItem.operation) {
        case 'add':
            showAddition(questionItem.num1, questionItem.num2);
            break;
        case 'subtract':
            showSubtraction(questionItem.num1, questionItem.num2);
            break;
        case 'multiply':
            showMultiplication(questionItem.num1, questionItem.num2);
            break;
        case 'divide':
            showDivision(questionItem.num1, questionItem.num2);
            break;
    }
}

// ... (As funções toBinary, showAddition, showSubtraction, showMultiplication, showDivision continuam as mesmas da versão anterior)
function toBinary(dec, bits = 8) { return dec.toString(2).padStart(bits, '0'); }
function showAddition(num1_dec, num2_dec) { const num1_bin = toBinary(num1_dec); const num2_bin = toBinary(num2_dec); const result = toBinary(num1_dec + num2_dec); let html = `<pre>   ${num1_bin}  (${num1_dec})\n+  ${num2_bin}  (${num2_dec})\n---------------------\n   ${result}  (${num1_dec + num2_dec})</pre>`; simulationBox.innerHTML = html; }
function showSubtraction(num1_dec, num2_dec) { const bits = 8; const num1_bin = toBinary(num1_dec, bits); const num2_bin = toBinary(num2_dec, bits); let inverted_b = [...num2_bin].map(bit => (bit === '1' ? '0' : '1')).join(''); const twos_complement_b = toBinary(parseInt(inverted_b, 2) + 1, bits); const result_bin = toBinary(num1_dec - num2_dec, bits); let html = `<p>A ULA calcula A - B fazendo A + (Complemento de 2 de B).</p>`; html += `<pre>1. Pegue o segundo número: ${num2_bin} (${num2_dec})\n`; html += `2. Inverta os bits:       ${inverted_b}\n`; html += `3. Some 1 (Compl. de 2):  ${twos_complement_b} (-${num2_dec})\n\n`; html += `Agora, some A com o resultado:\n`; html += `   ${num1_bin} (${num1_dec})\n`; html += `+  ${twos_complement_b} (-${num2_dec})\n`; html += `---------------------\n`; html += `   ${result_bin} (${num1_dec - num2_dec})</pre>`; html += `<p>(Qualquer "vai um" final é descartado na subtração)</p>`; simulationBox.innerHTML = html; }
function showMultiplication(num1_dec, num2_dec) { let html = `<p>A multiplicação binária é uma série de deslocamentos e somas.</p><pre>`; let multiplicand = toBinary(num1_dec, 4); let multiplier = toBinary(num2_dec, 4); let product = 0; html += `Multiplicando: ${multiplicand} (${num1_dec})\n`; html += `Multiplicador:  ${multiplier} (${num2_dec})\n---------------------\n`; for (let i = 0; i < 4; i++) { const bit = multiplier[3 - i]; if (bit === '1') { product += parseInt(multiplicand, 2) << i; } } html += `O processo envolve somar o multiplicando (${toBinary(num1_dec, 4)}) a si mesmo, deslocado para a esquerda, para cada bit '1' do multiplicador.\n\n`; html += `Produto Final: ${toBinary(product, 8)} (${product})</pre>`; simulationBox.innerHTML = html; }
function showDivision(num1_dec, num2_dec) { let html = `<p>A divisão binária é similar à divisão longa decimal.</p><pre>`; if (num2_dec === 0) { html += "Divisão por zero não é permitida."; } else { const quotient = Math.floor(num1_dec / num2_dec); const remainder = num1_dec % num2_dec; html += `Dividendo: ${toBinary(num1_dec)} (${num1_dec})\n`; html += `Divisor:   ${toBinary(num2_dec)} (${num2_dec})\n`; html += `---------------------\n`; html += `A ULA faz subtrações sucessivas e deslocamentos.\n\n`; html += `Resultado:\n`; html += `Quociente: ${toBinary(quotient)} (${quotient})\n`; html += `Resto:     ${toBinary(remainder)} (${remainder})`; } html += `</pre>`; simulationBox.innerHTML = html; }

// Inicia o Quiz
loadQuestion();