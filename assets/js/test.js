
function runTest(){
  const questions = document.querySelectorAll('.question');
  let score = 0;
  questions.forEach(q=>{
    const checked = q.querySelector('input[type="radio"]:checked');
    if(checked && Number(checked.value) === Number(q.dataset.answer)) score++;
  });
  const total = questions.length;
  const result = document.getElementById('result');
  let text = '';
  if(score === total) text = 'Идеально. Ты очень внимательно прочитал(а) роман и уловил(а) и сюжет, и его романтическое напряжение.';
  else if(score >= Math.ceil(total * 0.7)) text = 'Очень хороший результат. Ты хорошо помнишь путь Натальи и Роберта.';
  else if(score >= Math.ceil(total * 0.4)) text = 'Неплохо. Ты уже чувствуешь мир романа, но некоторые детали можно перечитать.';
  else text = 'Похоже, тебе стоит ещё раз пройтись по главам. Здесь многое раскрывается в тихих сценах.';
  result.innerHTML = '<strong>Результат:</strong> ' + score + ' из ' + total + '.<br>' + text;
  result.hidden = false;
}
