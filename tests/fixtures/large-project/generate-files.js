// Script to generate 100+ test files for performance testing
const fs = require('fs').promises;
const path = require('path');

async function generateFiles() {
  const srcDir = path.join(__dirname, 'src');
  
  // Generate 120 JavaScript files
  for (let i = 0; i < 120; i++) {
    const fileName = `file-${String(i).padStart(3, '0')}.js`;
    const filePath = path.join(srcDir, fileName);
    
    const content = `// File ${i}
// TEMPLATE_ONLY_START
function templateOnlyFunction${i}() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction${i}() {
  return 'production-${i}';
}

// @template-only
const templateVar${i} = 'should be removed';

module.exports = {
  productionFunction${i}
};
`;
    
    await fs.writeFile(filePath, content, 'utf8');
  }
  
  console.log('Generated 120 test files in tests/fixtures/large-project/src/');
}

generateFiles().catch(console.error);

