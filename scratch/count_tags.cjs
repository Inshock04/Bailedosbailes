const fs = require('fs');
const content = fs.readFileSync('src/components/TicketModal.tsx', 'utf8');
const lines = content.split('\n');
let divCount = 0;
let formCount = 0;
lines.forEach((line, i) => {
  const opensDiv = (line.match(/<div(\s|>)/g) || []).length;
  const closesDiv = (line.match(/<\/div>/g) || []).length;
  const opensForm = (line.match(/<form(\s|>)/g) || []).length;
  const closesForm = (line.match(/<\/form>/g) || []).length;
  
  if(opensDiv) divCount += opensDiv;
  if(closesDiv) divCount -= closesDiv;
  if(opensForm) formCount += opensForm;
  if(closesForm) formCount -= closesForm;
  
  if (i >= 180) {
    if (opensDiv || closesDiv || opensForm || closesForm) {
      console.log(`Line ${i+1}: divs=${divCount} forms=${formCount} | ${line.trim()}`);
    }
  }
});
