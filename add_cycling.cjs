const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace(
  "else if (currentEquipment.includes('kettlebell')) exercises.push('Kettlebell Swing (壺鈴擺盪)');",
  "else if (currentEquipment.includes('kettlebell')) exercises.push('Kettlebell Swing (壺鈴擺盪)');\n            if (currentEquipment.includes('cycling')) exercises.push('Stationary Cycling (飛輪)');"
);
fs.writeFileSync('src/App.tsx', content);
console.log('Done');
