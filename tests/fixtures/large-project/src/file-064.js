// File 64
// TEMPLATE_ONLY_START
function templateOnlyFunction64() {
  console.log('This is template-only code');
  return 'template';
}
// TEMPLATE_ONLY_END

function productionFunction64() {
  return 'production-64';
}

// @template-only
const templateVar64 = 'should be removed';

module.exports = {
  productionFunction64
};
