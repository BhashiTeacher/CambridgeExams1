// seed.js — Pre-loads Test 6 so the system has data on first run.
// This runs once. After that, all data lives in localStorage.

(function seedIfEmpty() {
  const existing = JSON.parse(localStorage.getItem('cms_exams') || '[]');
  if (existing.find(e => e.id === 'exam_test6_seed')) return; // already seeded

  const test6 = {
    id: 'exam_test6_seed',
    title: 'Test 6 – Reading & Writing',
    subject: 'Reading',
    duration: 45,
    description: 'Cambridge A2 Key style reading and writing test.',
    sheetsUrl: '',
    published: true,
    updatedAt: new Date().toISOString(),
    questions: [
      {
        number: 1, part: 'Part 1',
        partInstruction: 'For each question, choose the correct answer.',
        question: 'Where might you see this?',
        options: [{letter:'A',text:'in a café'},{letter:'B',text:'in a library'},{letter:'C',text:'in a picnic area'}],
        answer: 'B',
        tableStyle: false,
        stimulus: { type:'sign', icon:'🚫🍦', body:"Please don't eat ice creams here. They aren't good for our books! Please finish them outside before you come in. Thanks." }
      },
      {
        number: 2, part: 'Part 1',
        partInstruction: 'For each question, choose the correct answer.',
        question: 'Speak to Mrs Thompson if',
        options: [{letter:'A',text:"you've got an extra key."},{letter:'B',text:'you have lost something.'},{letter:'C',text:'you know where the bag is.'}],
        answer: 'B',
        tableStyle: false,
        stimulus: { type:'notice', title:'FOUND', body:'One school bag<br>Inside: one key and a phone<br><br><strong>Contact Mrs Thompson</strong><br>if you think it might be yours.' }
      },
      {
        number: 3, part: 'Part 1',
        partInstruction: 'For each question, choose the correct answer.',
        question: 'Zeta has written to',
        options: [{letter:'A',text:'invite Linda to go and see a film.'},{letter:'B',text:"ask Linda what films she's interested in."},{letter:'C',text:'tell Linda where to meet Jim tomorrow.'}],
        answer: 'A',
        tableStyle: false,
        stimulus: { type:'phone', body:"Hi Linda, I have bought two tickets for the cinema tomorrow afternoon for me and Jim. But he can't come. Are you interested? <strong>Zeta</strong>" }
      },
      {
        number: 4, part: 'Part 1',
        partInstruction: 'For each question, choose the correct answer.',
        question: 'What has Tony just done?',
        options: [{letter:'A',text:'met Flora'},{letter:'B',text:'had a birthday'},{letter:'C',text:'done well in an exam'}],
        answer: 'C',
        tableStyle: false,
        stimulus: { type:'message', from:'Flora', to:'Tony', body:"Congratulations, Tony! I heard that you passed maths!<br>Have a great birthday.<br>And next time I write to you, you'll be 15!<br><em>Best wishes, Flora</em>" }
      },
      {
        number: 5, part: 'Part 1',
        partInstruction: 'For each question, choose the correct answer.',
        question: 'What does the sign mean?',
        options: [{letter:'A',text:'Please go to the science room now.'},{letter:'B',text:"You can't go out through this door."},{letter:'C',text:'The science laboratory is being used by other people today.'}],
        answer: 'B',
        tableStyle: false,
        stimulus: { type:'sign', title:'NO EXIT', body:"The door isn't working correctly.<br>Use door opposite to get to the science room." }
      },
      {
        number: 6, part: 'Part 1',
        partInstruction: 'For each question, choose the correct answer.',
        question: 'Tom is writing about',
        options: [{letter:'A',text:'a party that he had.'},{letter:'B',text:'a picture that he saw.'},{letter:'C',text:'some people that he has just met.'}],
        answer: 'A',
        tableStyle: false,
        stimulus: { type:'social', author:'Tom', body:"Thanks to all my guests! It's brilliant you could come. Hope you've made new friends. I'll add the pictures I took soon!" }
      },
      {
        number: 7, part: 'Part 2',
        partInstruction: 'For each question, choose the correct answer.',
        question: 'Which person has made new friends because of her hobby?',
        options: [{letter:'A',text:'Melissa'},{letter:'B',text:'Sharon'},{letter:'C',text:'Latifa'}],
        answer: 'A',
        tableStyle: true,
        passage: {
          title: 'Three teenagers describe their hobbies',
          people: [
            { name:'Melissa', subtitle:'Runner 🏃‍♀️', text:"I started running about a year ago. At first, I just ran 1 or 2 kilometres, but I now do about 10. My speed is improving too. I've joined a running club in the town centre. I didn't know any of the members before, but now most of them are my mates. My dad was a keen runner when he was younger – he was really fit, but he stopped when he hurt his leg. Actually, I need to order some new running shoes – just a simple pair. I don't think the expensive ones make you run faster!" },
            { name:'Sharon', subtitle:'Skateboarder 🛹', text:"I go skateboarding most evenings in the park. I suppose that's quite a lot, but the park is only a minute or two from our apartment, and I only stay there half an hour or so. Although I stay longer when my friends are there. Sometimes my cousin's there too. He's a beginner, and I'm teaching him a few moves. He's starting to get really good!" },
            { name:'Latifa', subtitle:'Rock Climber 🧗‍♀️', text:"Two of my best friends suggested I should start rock climbing, so now the three of us do it together. The mother of one of them takes us once or twice a month, but I'd like to do it every week. When I started, I didn't know you need to get so much stuff – and it isn't exactly cheap! I really love it. I don't think I'll ever get bored of climbing!" }
          ]
        }
      },
      { number:8,  part:'Part 2', partInstruction:'For each question, choose the correct answer.', question:'Which person does her hobby near her home?',                        options:[{letter:'A',text:'Melissa'},{letter:'B',text:'Sharon'},{letter:'C',text:'Latifa'}], answer:'B', tableStyle:true },
      { number:9,  part:'Part 2', partInstruction:'For each question, choose the correct answer.', question:'Which person says she is getting better at her hobby?',           options:[{letter:'A',text:'Melissa'},{letter:'B',text:'Sharon'},{letter:'C',text:'Latifa'}], answer:'A', tableStyle:true },
      { number:10, part:'Part 2', partInstruction:'For each question, choose the correct answer.', question:'Which person does her hobby with a family member?',                options:[{letter:'A',text:'Melissa'},{letter:'B',text:'Sharon'},{letter:'C',text:'Latifa'}], answer:'B', tableStyle:true },
      { number:11, part:'Part 2', partInstruction:'For each question, choose the correct answer.', question:'Which person wants to do her hobby more often?',                   options:[{letter:'A',text:'Melissa'},{letter:'B',text:'Sharon'},{letter:'C',text:'Latifa'}], answer:'C', tableStyle:true },
      { number:12, part:'Part 2', partInstruction:'For each question, choose the correct answer.', question:'Which person needs to buy something for her hobby?',               options:[{letter:'A',text:'Melissa'},{letter:'B',text:'Sharon'},{letter:'C',text:'Latifa'}], answer:'A', tableStyle:true },
      { number:13, part:'Part 2', partInstruction:'For each question, choose the correct answer.', question:'Which person says her hobby was more expensive than she thought?', options:[{letter:'A',text:'Melissa'},{letter:'B',text:'Sharon'},{letter:'C',text:'Latifa'}], answer:'C', tableStyle:true }
    ]
  };

  existing.push(test6);
  localStorage.setItem('cms_exams', JSON.stringify(existing));
  console.log('Seeded Test 6 exam data.');
})();
