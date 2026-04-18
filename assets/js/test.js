
function runTest(){
  const questions = document.querySelectorAll('.question');
  let score = 0;
  let total = questions.length;
  questions.forEach((q, index) => {
    const correct = Number(q.dataset.answer);
    const checked = q.querySelector('input[type="radio"]:checked');
    if(checked && Number(checked.value) === correct){
      score += 1;
    }
  });

  const result = document.getElementById('result');
  let message = '';
  if(score === total){
    message = 'Ты прочитал(а) роман очень внимательно. Ты чувствуешь атмосферу «Сердца дракона» почти безошибочно.';
  }else if(score >= Math.ceil(total * 0.66)){
    message = 'Отличный результат. Ты хорошо запомнил(а) и сюжет, и настроение первых глав.';
  }else if(score >= Math.ceil(total * 0.4)){
    message = 'Хорошее начало. Ты уже чувствуешь мир романа, но стоит перечитать некоторые сцены ещё раз.';
  }else{
    message = 'Похоже, тебе стоит ещё раз пройтись по главам. В этом мире много тихих деталей, которые раскрываются не сразу.';
  }

  result.innerHTML = `<strong>Результат:</strong> ${score} из ${total}.<br>${message}`;
  result.hidden = false;
  result.scrollIntoView({behavior:'smooth', block:'nearest'});
}
